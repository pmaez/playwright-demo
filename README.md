# Playwright Automation Template

A template end-to-end test automation framework built with [Playwright](https://playwright.dev). It ships a Page Object Model, composable fixtures, per-environment configuration, a tagged test suite, a Docker image, a Helm chart for Kubernetes, and CI workflows — all ready to point at your own application.

The bundled `example` domain runs against the public [TodoMVC demo](https://demo.playwright.dev/todomvc) so the framework works out of the box. Replace it with your own domain by following the same pattern (see [Extending this template](#extending-this-template)).

**Full reference:** [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) covers architecture diagrams, versions, where files and results are stored, and how to install, start, run, and shut down everything.

## Requirements

- Node.js and npm, for running tests locally
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), optional, for [running in Docker](#running-in-docker)
- Kubernetes and [Helm](https://helm.sh), optional, for [running on Kubernetes](#running-on-kubernetes-helm). Docker Desktop's built-in cluster works locally.

## Installation

```bash
npm install
```

Then download the browsers (Chromium, Firefox, WebKit) Playwright uses for local runs:

```bash
npx playwright install
```

Docker, Kubernetes and CI don't need this step: they use the official Playwright image, which already includes the browsers.

## Running tests

```bash
# Run the full suite (Chromium only, default)
npm test

# Run across Chromium, Firefox, and WebKit
npm run test:all-browsers

# Open Playwright's UI mode
npm run test:ui

# Run headed (visible browser)
npm run test:headed

# Run only smoke-tagged tests
npm run test:smoke

# Run only functional-tagged tests
npm run test:functional

# Run tests matching an arbitrary tag
npm run test:tag -- @example

# Run TypeScript validation
npm run typecheck

# View the HTML report from the last run
npm run test:report
```

## Framework runner

`runner/execution.js` wraps `playwright test` with a friendlier CLI for selecting environment, browser, and tags together:

```bash
npm run runner -- --env demo --tags smoke --browser chromium
```

Options:

| Flag        | Values                          | Default |
| ----------- | -------------------------------- | ------- |
| `--env`     | `demo`, `dev`, `qa`, `uat`        | `demo`  |
| `--browser` | `chromium`, `firefox`, `webkit`   | `chromium` |
| `--tags`    | comma-separated tag list          | (none)  |
| `--headed`  | run headed                        | off     |
| `--ui`      | open Playwright UI mode           | off     |

Multiple tags are combined with AND semantics — `--tags smoke,example` runs only tests carrying both `@smoke` and `@example`.

## Running in Docker

The `Dockerfile` builds on the official `mcr.microsoft.com/playwright` image, which bundles all three browsers and their OS dependencies. Keep its tag in sync with the `@playwright/test` version in `package-lock.json`.

```bash
# Build the image (tagged playwright-tests:local)
npm run docker:build

# Run the full cross-browser suite
npm run docker:test

# Anything after `--` is passed to `playwright test`
npm run docker:test -- --project chromium --grep @smoke

# Pick the environment / base URL via the usual variables
TEST_ENV=qa npm run docker:test
```

The image's entrypoint is `playwright test`, so with plain `docker run` the arguments after the image name go straight to Playwright:

```bash
docker run --rm --ipc=host -e TEST_ENV=demo playwright-tests:local --project firefox
```

Inside the container, `CI=true` is set (retries, a single worker, `list` output in the logs) and `RESULTS_DIR=/results` sends the HTML report and `test-results/` there. `npm run docker:test` mounts `./docker-results` at `/results`, so open `docker-results/playwright-report/index.html` after a run. Tests run as the image's non-root `pwuser` (uid 1001). On a Linux host where your uid differs, make `docker-results/` writable for that user first (e.g. `chmod 777 docker-results`).

`--ipc=host` gives Chromium enough shared memory. Without it, large pages can crash the browser.

## Running on Kubernetes (Helm)

`helm/playwright-tests` runs the same image as a Kubernetes `Job`. Every `helm install` / `helm upgrade` starts a new run named `<release>-playwright-tests-<revision>`. The pod exits with Playwright's exit code, so the Job ends `Complete` or `Failed`.

One-time local setup on a Mac:

1. In Docker Desktop, open **Kubernetes** → **Create cluster** → choose **Kubeadm** → **Create**. With Kubeadm the cluster can use images you build locally, so no registry is needed.
2. Install Helm:

   ```bash
   brew install helm
   ```

3. Check the cluster is ready:

   ```bash
   kubectl config use-context docker-desktop && kubectl get nodes
   ```

Then build the image and run the suite:

```bash
# Local cluster (Docker Desktop's Kubernetes uses your local images directly;
# for kind, load the image first: kind load docker-image playwright-tests:local)
npm run docker:build

helm install e2e helm/playwright-tests \
  --set tests.env=demo \
  --set 'tests.projects={chromium}' \
  --set tests.grep=@smoke

kubectl logs -f job/e2e-playwright-tests-1

# Run again with the same settings
helm upgrade e2e helm/playwright-tests --reuse-values
```

For a real cluster, push the image to a registry the cluster can pull from and set `image.repository` / `image.tag` (and `imagePullSecrets` if it's private).

Key values (see `helm/playwright-tests/values.yaml` for all of them):

| Value | Purpose | Default |
| ----- | ------- | ------- |
| `tests.env` | `TEST_ENV` (`demo`, `dev`, `qa`, `uat`) | `demo` |
| `tests.baseURL` | `BASE_URL` override | (none) |
| `tests.projects` | Browsers to run (`--project`) | all |
| `tests.grep` / `tests.grepInvert` | Tag filters (`--grep` / `--grep-invert`) | (none) |
| `tests.extraArgs` | Any other `playwright test` flags | `[]` |
| `envFrom` / `extraEnv` | Inject app credentials from Secrets, or other variables | `[]` |
| `cronJob.enabled` / `cronJob.schedule` | Scheduled runs | off / `0 6 * * *` |
| `persistence.enabled` | Keep the HTML report and traces on a PVC | off |
| `reportServer.enabled` | Serve the latest report from the PVC via nginx | off |

To browse reports from the cluster, enable both `persistence` and `reportServer`. Then run `kubectl port-forward svc/<release>-playwright-tests-report 9323:80` and open `http://localhost:9323/playwright-report/`.

To change settings on a re-run, add `--set` flags to `helm upgrade ... --reuse-values`. Use `--set 'tests.projects={}'` to go back to all browsers: setting a value to `null` doesn't clear it when values are reused.

Shutting down:

```bash
helm uninstall e2e                                # removes Jobs, CronJob and report server
kubectl delete pvc e2e-playwright-tests-results   # saved results (kept on uninstall on purpose)
docker desktop stop                               # stops Docker and Kubernetes; nothing is deleted
```

Start again later with `docker desktop start`. Kubernetes starts by itself as long as it's still switched on in Docker Desktop, and Helm releases and saved results survive the restart. If Kubernetes was switched off in Docker Desktop (the Kubernetes page shows **Create cluster**), create it again with **Kubeadm**: the existing cluster and its data come back. Only **Reset cluster** wipes them.

## Environments

Environment configuration lives in `config/environments.ts` and is selected via the `TEST_ENV` variable (defaults to `demo`):

```bash
TEST_ENV=qa npm test
```

`demo` points at the live TodoMVC app so the suite runs out of the box. `dev`, `qa`, and `uat` are placeholders (`https://{env}.example.com`) — swap in your application's real per-environment URLs.

The base URL can also be overridden directly with `BASE_URL`, which takes precedence over the environment's configured URL:

```bash
BASE_URL=https://example.com npm test
```

## Tagging conventions

Tests are tagged along three axes so subsets can be run independently. See `tests/support/tags.md` for the full reference.

- **Environment** — `@demo_env`, `@dev_env`, `@qa_env`, `@uat_env`
- **Suite** — `@smoke`, `@functional`
- **Domain** — project-specific (e.g. `@example`, `@add`, `@delete`); define your own per feature/module

Run any subset directly with Playwright's `--grep`:

```bash
npx playwright test --grep @smoke
```

## Continuous integration

`.github/workflows/playwright.yml` runs on GitHub Actions:

- **Pull requests** run `@smoke`-tagged tests only (Chromium), for fast feedback.
- **Pushes to `master`/`dev`** and manual runs (`workflow_dispatch`) run the full cross-browser suite.
- Manual runs let you pick the `TEST_ENV` (`demo`, `dev`, `qa`, `uat`) from a dropdown.
- The job runs inside the official `mcr.microsoft.com/playwright` image, which already contains the browsers and their system libraries, so nothing is downloaded or `apt`-installed at run time.
- When upgrading Playwright, bump the image tag in both `.github/workflows/playwright.yml` and the `Dockerfile` to match `@playwright/test` in `package-lock.json`. The workflow's first step fails if any of the three differ.
- The HTML report and `test-results/` (traces on retry) are uploaded as workflow artifacts on every run.

`.github/workflows/container.yml` runs when the `Dockerfile`, Helm chart, dependencies, or Playwright config change. It builds the image, runs the smoke tests inside it, lints the chart, then installs the chart on a throwaway [kind](https://kind.sigs.k8s.io) cluster and checks that the test Job and report server work.

## Project structure

```
.github/
  workflows/
    playwright.yml       # CI workflow (see Continuous integration above)
    container.yml        # Docker image + Helm chart checks
config/
  environments.ts       # Per-environment base URLs and tags
docs/
  PROJECT_GUIDE.md       # Full reference: architecture, versions, install/run/shutdown
helm/
  playwright-tests/      # Helm chart: test Job, optional CronJob, PVC, report server
Dockerfile               # Test-runner image (entrypoint: playwright test)
runner/
  execution.js           # CLI wrapper around `playwright test`
specs/
  example.plan.md         # Test plan the example specs are written against
tests/
  fixtures.ts              # Custom test/page fixtures
  pages/
    example-page.ts           # Page Object for the example domain
  flows/
    example-flow.ts            # Multi-step actions built on the page object
  data/
    example-data.ts              # Shared test data
  functional/
    example/                      # Functional specs (add/delete)
  _seed/
    seed.spec.ts                    # Documents the fresh starting state
  support/
    tags.md                          # Tag vocabulary reference
```

## Test plan

`specs/example.plan.md` documents the scenarios the example specs implement, including setup steps and expected outcomes. Each spec file references its source plan and seed via header comments.

## Extending this template

To add a new domain (e.g. `cart`), mirror the `example` structure:

1. **Page object** — `tests/pages/cart-page.ts`, a class wrapping locators and low-level actions for one page/component.
2. **Flow** (optional) — `tests/flows/cart-flow.ts`, multi-step actions composed from one or more page objects.
3. **Test data** — `tests/data/cart-data.ts`, shared fixtures/constants for the domain.
4. **Fixtures** — register the page object (and flow) in `tests/fixtures.ts` so specs can request them by name.
5. **Plan** — `specs/cart.plan.md`, the scenarios and expected outcomes each spec implements.
6. **Specs** — `tests/functional/cart/*.spec.ts`, referencing the plan and seed via header comments (`// spec: ...`, `// seed: ...`) and tagged per the conventions in `tests/support/tags.md`.

You can run the `example` domain and a new domain side by side — nothing in the framework layer (fixtures composition, environments, runner, tagging, CI) is domain-specific. Remove the `example` files once you no longer need them as a reference.

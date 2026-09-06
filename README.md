# Playwright Automation Template

A template end-to-end test automation framework built with [Playwright](https://playwright.dev). It ships a Page Object Model, composable fixtures, per-environment configuration, a tagged test suite, and a CI workflow — all ready to point at your own application.

The bundled `example` domain runs against the public [TodoMVC demo](https://demo.playwright.dev/todomvc) so the framework works out of the box. Replace it with your own domain by following the same pattern (see [Extending this template](#extending-this-template)).

## Requirements

- Node.js
- npm

## Installation

```bash
npm install
```

Playwright browser binaries are installed automatically as part of `@playwright/test`. If you need to (re)install them manually:

```bash
npx playwright install
```

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
- Playwright browsers are cached by version; the HTML report and `test-results/` (traces on retry) are uploaded as workflow artifacts on every run.

## Project structure

```
.github/
  workflows/
    playwright.yml       # CI workflow (see Continuous integration above)
config/
  environments.ts       # Per-environment base URLs and tags
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

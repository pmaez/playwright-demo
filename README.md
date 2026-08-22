# Playwright Demo

Automated end-to-end test suite for the TodoMVC demo application, built with [Playwright](https://playwright.dev). It covers the add-todo and delete-todo flows (single and multiple item variants) using a Page Object Model, composable fixtures, and a tagged test suite for selective runs.

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
npm run test:tag -- @todo

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

Multiple tags are combined with AND semantics — `--tags smoke,todo` runs only tests carrying both `@smoke` and `@todo`.

## Environments

Environment configuration lives in `config/environments.ts` and is selected via the `TEST_ENV` variable (defaults to `demo`):

```bash
TEST_ENV=qa npm test
```

The base URL can also be overridden directly with `BASE_URL`, which takes precedence over the environment's configured URL:

```bash
BASE_URL=https://example.com npm test
```

## Tagging conventions

Tests are tagged along three axes so subsets can be run independently. See `tests/support/tags.md` for the full reference.

- **Environment** — `@demo_env`, `@dev_env`, `@qa_env`, `@uat_env`
- **Suite** — `@smoke`, `@functional`
- **Domain** — `@todo`, `@add`, `@delete`, `@single`, `@multiple`, `@bug`

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
  todo.plan.md            # Test plan the specs are written against
tests/
  fixtures.ts              # Custom test/page fixtures
  pages/
    todo-page.ts             # Page Object for the TodoMVC page
  flows/
    todo-flow.ts              # Multi-step actions built on the page object
  data/
    todo-data.ts               # Shared test data
  functional/
    todo/                       # Functional specs (add/delete)
  _seed/
    seed.spec.ts                # Documents the fresh starting state
  support/
    tags.md                      # Tag vocabulary reference
```

## Test plan

`specs/todo.plan.md` documents the scenarios each spec file implements, including setup steps and expected outcomes. Each spec file references its source plan and seed via header comments.

---
name: playwright-test-patterns
description: Apply when writing, refactoring, or reviewing Playwright test code in this repo — introducing or updating Page Objects, composing fixtures, parameterizing/data-driving tests, tagging tests for selective runs, or cleaning up duplicated locators across specs. Complements playwright-cli's plan/generate/heal workflow (which produces the raw test code); this skill governs how that code should be structured and organized once it exists or grows.
---

# Playwright test automation patterns

Structural conventions for Playwright test code in this repo: Page Objects, fixture
composition, data-driven tests, and tags. Use alongside the `playwright-cli` skill —
that skill generates and heals tests; this one shapes how the resulting code is
organized as the suite grows.

## Page Object Model

Introduce a Page Object once locators for the same page/component are duplicated
across **two or more** spec files, or a page has enough interactive surface that
inlining every locator makes specs hard to read. Don't create one for a single
scenario that only touches a page once — that's premature abstraction.

- One class per page or reusable component, under `tests/pages/`.
- Constructor takes the Playwright `Page` and stores **locators** as readonly
  fields — resolved once, not re-queried string selectors.
- Methods are **actions** the user could take, named at the user's level
  (`addTodo(text)`, not `fillAndPressEnter(text)`). Each method performs the
  interaction and returns `void`/`Promise<void>`, or a value the test needs to
  assert on (e.g. `itemsLeftText()`).
- Assertions stay in the **test**, not the Page Object — the object exposes
  locators/state, the test decides what "correct" means with `expect`.

### Locator preference: `getByRole` first

Resolve every locator with the strictest option that actually matches an
accessible role, in this order:

1. `getByRole(role, { name })` — the element has a real ARIA role and a stable
   accessible name (buttons, links, checkboxes, textboxes, headings).
2. `getByLabel` / `getByPlaceholder` — form controls named by a label or
   placeholder rather than an ARIA role lookup.
3. `getByTestId` — **only** when the element has no mapped ARIA role (a bare
   `<label>`/`<span>` with no `for`/wrapped control has none) or its accessible
   name isn't unique per instance (e.g. every row's delete button is named
   "Delete" — a `data-testid` scoped to the row is more reliable than
   `getByRole('button', { name: 'Delete' }).nth(n)`).
4. CSS/XPath — avoid; only as a last resort with a comment explaining why
   nothing above works.

Don't assume `data-testid` is available or force a role where none exists —
check the actual DOM/accessibility tree (`playwright-cli snapshot`, or
`page.locator(...).ariaSnapshot()`) rather than guessing.

```ts
// tests/pages/example-page.ts
import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  readonly newTodoInput: Locator;
  readonly todoTitles: Locator;
  readonly itemsLeftCount: Locator;

  constructor(private readonly page: Page) {
    // Has a role + accessible name -> getByRole.
    this.newTodoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    // <label data-testid="todo-title"> is unassociated with any control, so it
    // has no ARIA role to select by -> getByTestId is correct here, not a fallback.
    this.todoTitles = page.getByTestId('todo-title');
    // <span data-testid="todo-count"> is plain text content, same reasoning.
    this.itemsLeftCount = page.getByTestId('todo-count');
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }
}
```

```ts
// tests/functional/example/should-add-item.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Add item', () => {
  test('should add single item', async ({ examplePage }) => {
    await examplePage.addTodo('Buy milk');

    await expect(examplePage.todoTitles).toHaveText('Buy milk');
    await expect(examplePage.newTodoInput).toBeEmpty();
    await expect(examplePage.itemsLeftCount).toHaveText('1 item left');
  });
});
```

## Fixture composition

Extend the base fixture (`tests/fixtures.ts`) to hand tests ready-to-use Page
Objects instead of a raw `page`, keeping navigation/setup in one place:

```ts
// tests/fixtures.ts
import { test as baseTest } from '@playwright/test';
import { ExamplePage } from './pages/example-page';
export { expect } from '@playwright/test';

export const test = baseTest.extend<{ examplePage: ExamplePage }>({
  page: async ({ page }, use) => {
    await page.goto('https://demo.playwright.dev/todomvc');
    await use(page);
  },
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },
});
```

- Test-scoped fixtures (default) for anything tied to one test's page state.
- Worker-scoped fixtures (`{ scope: 'worker' }`) only for expensive setup safely
  shared across tests in the same worker (e.g. an authenticated API client) —
  never for anything that holds page/UI state, since workers run tests serially
  but reuse the fixture across them.
- Keep the seed test (`tests/_seed/seed.spec.ts`) as the one place that documents
  the fresh starting state; fixtures should reproduce exactly what it does.

## Data-driven tests

Playwright has no built-in `test.each`. Loop over a data array and call `test()`
per case, with the case value baked into the title so failures are attributable:

```ts
const cases = [
  { input: 'Buy milk', expectedCount: '1 item left' },
  { input: '   Buy milk   ', expectedCount: '1 item left' }, // trims whitespace
];

for (const { input, expectedCount } of cases) {
  test(`should add item "${input.trim()}"`, async ({ examplePage }) => {
    await examplePage.addTodo(input);
    await expect(examplePage.itemsLeftCount).toHaveText(expectedCount);
  });
}
```

- Put the loop inside (or replacing) a `test.describe` block, not across files —
  keeps one spec file per scenario group, matching the existing plan/generate
  convention.
- Use this for boundary/validation variants of a scenario already in the spec
  (`specs/*.plan.md`), not as a substitute for writing distinct scenarios for
  distinct behaviors.

## Tags

Tag tests to allow selective runs (smoke vs full regression, slow vs fast) using
Playwright's native tag option — don't encode tags into titles as free text:

```ts
test.describe('Add item', { tag: '@add' }, () => {
  test('should add single item', { tag: '@single' }, async ({ examplePage }) => { ... });
});
```

Run a subset with `npx playwright test --grep @add` or exclude with
`--grep-invert @slow`. A test can carry more than one tag (one from the describe,
one from the test) — `--grep @single` then matches it regardless of which
operation group it's in. Keep the tag vocabulary small and documented, add new
tags deliberately, not per test file.

### Tag vocabulary in this repo

- Operation, on `test.describe`: `@add`, `@delete`.
- Cardinality, on `test`: `@single`, `@multiple`.

`npx playwright test --grep @delete` runs every delete scenario regardless of
cardinality; `--grep @single` runs every single-item scenario regardless of
operation. Extend this table (don't invent ad hoc tags per spec) when a new
operation or cardinality is added.

## Keep in place from the existing conventions

- One test per file, file path/describe/test name taken verbatim from the spec.
- `// spec:` / `// seed:` header comments linking a spec file back to its plan.
- Scenario independence: every test starts fresh from the seed, no chaining.
- Semantic locators, `getByRole` preferred, `getByTestId` only where no ARIA
  role applies — over CSS/XPath.

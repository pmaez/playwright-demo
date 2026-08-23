import { test as baseTest } from '@playwright/test';
import { ExamplePage } from './pages/example-page';
import { ExampleFlow } from './flows/example-flow';
import { getTestEnvironment, TestEnvironment } from '../config/environments';
export { expect } from '@playwright/test';

type Fixtures = {
  testEnvironment: TestEnvironment;
  examplePage: ExamplePage;
  exampleFlow: ExampleFlow;
};

export const test = baseTest.extend<Fixtures>({
  testEnvironment: async ({}, use) => {
    await use(getTestEnvironment());
  },
  page: async ({ page }, use) => {
    await page.goto('/todomvc');
    await use(page);
  },
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },
  exampleFlow: async ({ examplePage }, use) => {
    await use(new ExampleFlow(examplePage));
  },
});

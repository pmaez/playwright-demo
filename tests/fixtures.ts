import { test as baseTest } from '@playwright/test';
import { TodoPage } from './pages/todo-page';
import { TodoFlow } from './flows/todo-flow';
import { getTestEnvironment, TestEnvironment } from '../config/environments';
export { expect } from '@playwright/test';

type Fixtures = {
  testEnvironment: TestEnvironment;
  todoPage: TodoPage;
  todoFlow: TodoFlow;
};

export const test = baseTest.extend<Fixtures>({
  testEnvironment: async ({}, use) => {
    await use(getTestEnvironment());
  },
  page: async ({ page }, use) => {
    await page.goto('/todomvc');
    await use(page);
  },
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
  todoFlow: async ({ todoPage }, use) => {
    await use(new TodoFlow(todoPage));
  },
});

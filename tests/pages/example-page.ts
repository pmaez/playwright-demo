import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  readonly newTodoInput: Locator;
  readonly todoTitles: Locator;
  readonly itemsLeftCount: Locator;

  constructor(private readonly page: Page) {
    this.newTodoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    this.todoTitles = page.getByTestId('todo-title');
    this.itemsLeftCount = page.getByTestId('todo-count');
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async deleteTodo(text: string) {
    // "Delete" is not a unique accessible name across rows, so scope by the
    // row's testid first, then resolve the button within it by role.
    const row = this.page.getByTestId('todo-item').filter({ hasText: text });
    // The delete button is display:none until the row is hovered.
    await row.hover();
    await row.getByRole('button', { name: 'Delete' }).click();
  }
}

import { ExamplePage } from '../pages/example-page';

export class ExampleFlow {
  constructor(private readonly examplePage: ExamplePage) {}

  async createTodos(items: string[]) {
    for (const item of items) {
      await this.examplePage.addTodo(item);
    }
  }

  async deleteTodos(items: string[]) {
    for (const item of items) {
      await this.examplePage.deleteTodo(item);
    }
  }
}

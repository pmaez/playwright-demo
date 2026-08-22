import { TodoPage } from '../pages/todo-page';

export class TodoFlow {
  constructor(private readonly todoPage: TodoPage) {}

  async createTodos(items: string[]) {
    for (const item of items) {
      await this.todoPage.addTodo(item);
    }
  }

  async deleteTodos(items: string[]) {
    for (const item of items) {
      await this.todoPage.deleteTodo(item);
    }
  }
}

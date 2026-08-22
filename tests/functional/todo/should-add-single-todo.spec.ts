// spec: specs/todo.plan.md
// seed: tests/_seed/seed.spec.ts
import { test, expect } from '../../fixtures';
import { todoItems } from '../../data/todo-data';

test.describe('Add todo', { tag: ['@demo_env', '@smoke', '@functional', '@todo', '@add'] }, () => {
  test('should add single todo', { tag: ['@single'] }, async ({ todoPage }) => {
    // 1. Type "Buy milk" into the "What needs to be done?" input and press Enter.
    await todoPage.addTodo(todoItems.buyMilk);

    await expect(todoPage.todoTitles).toHaveText(todoItems.buyMilk);
    await expect(todoPage.newTodoInput).toBeEmpty();
    await expect(todoPage.itemsLeftCount).toHaveText('1 item left');
  });
});

// spec: specs/todo.plan.md
// seed: tests/_seed/seed.spec.ts
import { test, expect } from '../../fixtures';
import { todoItems } from '../../data/todo-data';

test.describe('Add todo', { tag: ['@demo_env', '@functional', '@todo', '@add'] }, () => {
  test('should add multiple todos', { tag: ['@multiple'] }, async ({ todoPage }) => {
    // 1. Type "Buy milk" into the input and press Enter.
    await todoPage.addTodo(todoItems.buyMilk);

    await expect(todoPage.itemsLeftCount).toHaveText('1 item left');

    // 2. Type "Walk the dog" into the input and press Enter.
    await todoPage.addTodo(todoItems.walkDog);

    await expect(todoPage.todoTitles).toHaveText([todoItems.buyMilk, todoItems.walkDog]);
    await expect(todoPage.itemsLeftCount).toHaveText('2 items left');
  });
});

// spec: specs/todo.plan.md
// seed: tests/_seed/seed.spec.ts
import { test, expect } from '../../fixtures';
import { todoItems } from '../../data/todo-data';

test.describe('Delete todo', { tag: ['@demo_env', '@functional', '@todo', '@delete'] }, () => {
  test('should delete multiple todos', { tag: ['@multiple'] }, async ({ todoFlow, todoPage }) => {
    // 1. Add "Buy milk", "Walk the dog", and "Clean the house" as initial test data.
    await todoFlow.createTodos([todoItems.buyMilk, todoItems.walkDog, todoItems.cleanHouse]);

    // 2. Hover the "Buy milk" item and click its delete ("x") button.
    await todoPage.deleteTodo(todoItems.buyMilk);

    await expect(todoPage.itemsLeftCount).toHaveText('2 items left');

    // 3. Hover the "Walk the dog" item and click its delete ("x") button.
    await todoPage.deleteTodo(todoItems.walkDog);

    await expect(todoPage.todoTitles).toHaveText([todoItems.cleanHouse]);
    await expect(todoPage.itemsLeftCount).toHaveText('1 item left');
  });
});

// spec: specs/todo.plan.md
// seed: tests/_seed/seed.spec.ts
import { test, expect } from '../../fixtures';
import { todoItems } from '../../data/todo-data';

test.describe('Delete todo', { tag: ['@demo_env', '@smoke', '@functional', '@todo', '@delete'] }, () => {
  test('should delete single todo', { tag: ['@single'] }, async ({ todoFlow, todoPage }) => {
    // 1. Add "Buy milk" and "Walk the dog" as initial test data.
    await todoFlow.createTodos([todoItems.buyMilk, todoItems.walkDog]);

    // 2. Hover the "Buy milk" item and click its delete ("x") button.
    await todoPage.deleteTodo(todoItems.buyMilk);

    await expect(todoPage.todoTitles).toHaveText([todoItems.walkDog]);
    await expect(todoPage.itemsLeftCount).toHaveText('1 item left');
  });
});

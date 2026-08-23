// spec: specs/example.plan.md
// seed: tests/_seed/seed.spec.ts
import { test, expect } from '../../fixtures';
import { exampleItems } from '../../data/example-data';

test.describe('Add item', { tag: ['@demo_env', '@smoke', '@functional', '@example', '@add'] }, () => {
  test('should add single item', { tag: ['@single'] }, async ({ examplePage }) => {
    // 1. Type "Buy milk" into the "What needs to be done?" input and press Enter.
    await examplePage.addTodo(exampleItems.buyMilk);

    await expect(examplePage.todoTitles).toHaveText(exampleItems.buyMilk);
    await expect(examplePage.newTodoInput).toBeEmpty();
    await expect(examplePage.itemsLeftCount).toHaveText('1 item left');
  });
});

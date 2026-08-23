// spec: specs/example.plan.md
// seed: tests/_seed/seed.spec.ts
import { test, expect } from '../../fixtures';
import { exampleItems } from '../../data/example-data';

test.describe('Delete items', { tag: ['@demo_env', '@functional', '@example', '@delete'] }, () => {
  test('should delete multiple items', { tag: ['@multiple'] }, async ({ exampleFlow, examplePage }) => {
    // 1. Add "Buy milk", "Walk the dog", and "Clean the house" as initial test data.
    await exampleFlow.createTodos([exampleItems.buyMilk, exampleItems.walkDog, exampleItems.cleanHouse]);

    // 2. Hover the "Buy milk" item and click its delete ("x") button.
    await examplePage.deleteTodo(exampleItems.buyMilk);

    await expect(examplePage.itemsLeftCount).toHaveText('2 items left');

    // 3. Hover the "Walk the dog" item and click its delete ("x") button.
    await examplePage.deleteTodo(exampleItems.walkDog);

    await expect(examplePage.todoTitles).toHaveText([exampleItems.cleanHouse]);
    await expect(examplePage.itemsLeftCount).toHaveText('1 item left');
  });
});

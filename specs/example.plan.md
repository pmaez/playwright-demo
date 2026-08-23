# Example Test Plan

## Application Overview

This example targets the TodoMVC demo app (https://demo.playwright.dev/todomvc) purely as a live, working reference. It demonstrates the framework's pattern — page object, flow, test data, fixtures, tags, and a spec/seed/plan trail — end to end. Replace this domain with your own application by following the same shape (see "Extending this template" in the README).

## Test Scenarios

### 1. Add item

**Seed:** `tests/_seed/seed.spec.ts`

#### 1.1. should-add-item

**File:** `tests/functional/example/should-add-item.spec.ts`

**Steps:**
  1. Type "Buy milk" into the "What needs to be done?" input and press Enter.
    - expect: the list contains an item with text "Buy milk"
    - expect: the input is cleared
    - expect: the items-left counter shows "1 item left"

### 2. Delete items

**Seed:** `tests/_seed/seed.spec.ts`

#### 2.1. should-delete-items

**File:** `tests/functional/example/should-delete-items.spec.ts`

**Steps:**
  1. Add "Buy milk", "Walk the dog", and "Clean the house" as initial test data (own setup, not the seed) — demonstrates flow composition (`exampleFlow.createTodos`).
  2. Hover the "Buy milk" item and click its delete ("×") button.
    - expect: the items-left counter shows "2 items left"
  3. Hover the "Walk the dog" item and click its delete ("×") button.
    - expect: the list contains only "Clean the house"
    - expect: the items-left counter shows "1 item left"

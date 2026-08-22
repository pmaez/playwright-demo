# Todo Test Plan

## Application Overview

The TodoMVC demo app (https://demo.playwright.dev/todomvc) lets a user manage a list of todo items: add new items via a text input, toggle completion, edit, delete, and filter by All/Active/Completed. This plan covers the "add todo" and "delete todo" flows.

## Test Scenarios

### 1. Add todo

**Seed:** `tests/seed.spec.ts`

#### 1.1. should-add-single-todo

**File:** `tests/functional/todo/should-add-single-todo.spec.ts`

**Steps:**
  1. Type "Buy milk" into the "What needs to be done?" input and press Enter.
    - expect: the todo list contains an item with text "Buy milk"
    - expect: the input is cleared
    - expect: the items-left counter shows "1 item left"

#### 1.2. should-add-multiple-todos

**File:** `tests/functional/todo/should-add-multiple-todos.spec.ts`

**Steps:**
  1. Type "Buy milk" into the input and press Enter.
    - expect: the items-left counter shows "1 item left"
  2. Type "Walk the dog" into the input and press Enter.
    - expect: the todo list contains items with text "Buy milk" and "Walk the dog", in that order
    - expect: the items-left counter shows "2 items left" (pluralized)

### 2. Delete todo

**Seed:** `tests/seed.spec.ts`

#### 2.1. should-delete-single-todo

**File:** `tests/functional/todo/should-delete-single-todo.spec.ts`

**Steps:**
  1. Add "Buy milk" and "Walk the dog" as initial test data (own setup, not the seed).
  2. Hover the "Buy milk" item and click its delete ("×") button.
    - expect: the todo list contains only "Walk the dog"
    - expect: the items-left counter shows "1 item left"

#### 2.2. should-delete-multiple-todos

**File:** `tests/functional/todo/should-delete-multiple-todos.spec.ts`

**Steps:**
  1. Add "Buy milk", "Walk the dog", and "Clean the house" as initial test data (own setup, not the seed).
  2. Hover the "Buy milk" item and click its delete ("×") button.
    - expect: the items-left counter shows "2 items left"
  3. Hover the "Walk the dog" item and click its delete ("×") button.
    - expect: the todo list contains only "Clean the house"
    - expect: the items-left counter shows "1 item left"

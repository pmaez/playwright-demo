---
name: clean-architecture-tdd
description: Apply when writing or extending non-trivial application/library code in ANY language — new modules, services, classes, or features with real business logic. Enforces test-first development (TDD), inversion of control via constructor-injected interfaces/abstract classes, hand-written test doubles instead of mocking frameworks, and design patterns chosen to fit the problem (not applied by default). Skip for one-off scripts, throwaway glue code, config files, trivial CRUD with no logic, or pure Playwright test specs (page objects there follow playwright-cli conventions, not this skill).
---

# Clean architecture + TDD

Guidance for writing testable, loosely-coupled code. This is a discipline to apply
when it earns its keep — see "When to skip" before reaching for any of this.

## Workflow: test-first, always

1. **Write a failing test first** that describes the behavior you're about to add,
   in the project's existing test framework and file conventions.
2. **Run it and confirm it fails** for the expected reason (not a typo or import error).
3. **Write the minimum code** to make it pass.
4. **Refactor** — remove duplication, improve names, extract abstractions — with the
   test green throughout.
5. Repeat per behavior. Don't write a batch of implementation and backfill tests after.

If the user's request doesn't leave room to show a failing-test step (e.g. a tiny
edit to already-covered code), still add or extend a test alongside the change,
just without narrating the red step.

## Inversion of control / dependency injection

- **Depend on abstractions, not concretions**, at every boundary that crosses into
  I/O, external services, the filesystem, network, system clock, or randomness.
  Define an interface (or abstract class / protocol, per the language) that
  expresses what the consumer needs, not what the implementation happens to offer.
- **Inject via the constructor.** No service locators, no reaching for globals or
  singletons inside a class to fetch a dependency, no DI container/framework unless
  the project already has one wired in — plain constructor parameters are enough.
- **Wire concrete implementations at the composition root** — the entry point
  (`main`, `index`, app bootstrap, test setup) — not scattered through business logic.
- Business/domain logic should be framework-agnostic and importable without pulling
  in a database driver, HTTP client, or UI layer.

```
// Shape, adapted to the target language's idioms:
interface Clock { now(): Date }
interface OrderRepository { save(order: Order): Promise<void> }

class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly clock: Clock,
  ) {}

  placeOrder(items: Item[]): Promise<Order> {
    const order = new Order(items, this.clock.now())
    return this.repo.save(order).then(() => order)
  }
}
```

## Test doubles

- Prefer **hand-written fakes/stubs** over a mocking framework unless the project
  already depends on one (check `package.json`/`requirements.txt`/etc. first —
  match what's there rather than introducing a new library).
- A fake should be the simplest working in-memory implementation of the interface
  (e.g. an `InMemoryOrderRepository` backed by an array/map) — prefer this over a
  stub that just records calls, when the interface has more than one method that
  needs to cooperate.
- Only stub/mock exact interactions (call count, arguments) when the test is
  specifically about that interaction, not as a default style.
- Never mock the type under test — only its injected dependencies.

## Design patterns — apply because the problem calls for it

Reach for a pattern when it removes real duplication or a real coupling problem
you can point to, not by default:

- **Strategy** — interchangeable algorithms/policies selected at runtime.
- **Factory** — construction logic that varies by input or config.
- **Repository** — persistence abstracted behind a domain-shaped interface.
- **Adapter** — isolate a third-party/external API behind your own interface.
- **Decorator** — layer cross-cutting behavior (logging, retry, caching) without
  modifying the wrapped implementation.
- **Observer/pub-sub** — decouple producers from consumers of an event.

SOLID as a checklist for review, especially single-responsibility and
dependency-inversion — not something to narrate while writing.

## When to skip all of this

- One-off scripts, migration/throwaway utilities, exploratory spikes.
- Config files, trivial data classes/DTOs, straight pass-through CRUD with no logic.
- Playwright test specs and page objects in this repo — those follow the
  `playwright-cli` skill's conventions, not this one.
- Any case where introducing an interface would have exactly one implementation
  forever and exists only "for testability" of something that isn't actually
  hard to test concretely (e.g. pure functions need no DI at all).

Don't add an interface, factory, or test double for something that isn't a real
seam. A pure function with no I/O is already testable — leave it a function.

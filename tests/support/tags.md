# Tag Conventions

Use tags to describe where a test runs, what suite it belongs to, and what behavior it covers.

## Environment

- `@demo_env`
- `@dev_env`
- `@qa_env`
- `@uat_env`

## Suite

- `@smoke`
- `@functional`

## Domain

Domain tags are project-specific — define your own per feature/module (e.g. `@cart`, `@login`, `@checkout`). The bundled example uses:

- `@example`
- `@add`
- `@delete`
- `@single`
- `@multiple`

Run tagged tests with Playwright directly:

```bash
npm run test:tag -- @smoke
```

Or use the framework runner:

```bash
npm run runner -- --env demo --tags smoke --browser chromium
```

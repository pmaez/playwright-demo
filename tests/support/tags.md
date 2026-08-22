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

- `@todo`
- `@add`
- `@delete`
- `@single`
- `@multiple`
- `@bug`

Run tagged tests with Playwright directly:

```bash
npm run test:tag -- @smoke
```

Or use the framework runner:

```bash
npm run runner -- --env demo --tags smoke --browser chromium
```

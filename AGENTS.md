# Repository Guidelines

## Project Structure & Module Organization

The application starts in `src/index.ts`; Express configuration lives in `src/app.ts`. API code is organized by responsibility:

- `src/routes/v1/` defines versioned public, auth, and admin routes.
- `src/controllers/` handles HTTP concerns; `src/services/` contains domain logic.
- `src/dtos/`, `src/types/`, and `src/validations/` define response shapes, types, and request validation.
- `src/middlewares/`, `src/config/`, `src/lib/`, and `src/utils/` provide shared infrastructure.
- `prisma/` contains the schema, migrations, and seed data; `scripts/` contains operations scripts.
- Runtime uploads and generated output belong in `uploads/` and `dist/`; do not commit them.

## Build, Test, and Development Commands

Use pnpm (`pnpm@10.8.0` is declared in `package.json`):

- `pnpm install` — install dependencies from the lockfile.
- `pnpm dev` — run the TypeScript server with nodemon.
- `pnpm build` — compile TypeScript to `dist/`.
- `pnpm start` — run the compiled server.
- `pnpm test` — run Jest tests.
- `pnpm seed` — execute `prisma/seed.ts` against the configured database.
- `pnpm dev:up` / `pnpm dev:down` — toggle development maintenance mode.

Copy `.env.example` to `.env` and provide database, token, CORS, and provider settings before running locally.

## Coding Style & Naming Conventions

Write strict TypeScript with two-space indentation, semicolons, and double-quoted imports. Use camelCase for variables/functions, PascalCase for classes/types, and suffixes such as `.controller.ts`, `.service.ts`, `.validation.ts`, and `.dto.ts`. Keep route wiring, HTTP translation, and business logic in their respective layers. No formatter or linter is configured; preserve nearby style and run `pnpm build` for type checks.

## Testing Guidelines

Jest, `ts-jest`, and `supertest` are available, with `pnpm test` as the standard entry point. Add `*.test.ts` or `*.spec.ts` tests for validation, authorization, services, and API responses/errors. Keep tests isolated from production data and external services.

## Commit & Pull Request Guidelines

Recent commits use Conventional Commit-style prefixes such as `feat(wishlist): ...` and `refactor(product): ...`. Use an imperative, focused subject with an optional scope. Pull requests should explain the change, list verification commands, identify migrations or environment changes, and include API examples or screenshots when relevant. Call out required seed or deployment steps.

## Security & Configuration Tips

Never commit `.env`, credentials, token secrets, database URLs, logs, or uploaded files. Document new settings in `.env.example`. Validate and sanitize input, preserve auth/permission middleware on protected routes, and review Prisma migrations before applying them to shared environments.

# Contributing to DevTools Hub

Thank you for contributing to DevTools Hub!

## Development Setup
1. Install Node.js 22+ and `pnpm`.
2. Copy `.env.example` to `.env` and start PostgreSQL (`docker compose up -d`).
3. Run `pnpm install && pnpm db:generate && pnpm db:push && pnpm db:seed`.
4. Start the dev server with `pnpm dev`.

## Adding a New Tool
1. Implement pure transformation logic in `src/features/<category>/logic.ts` with unit tests in `tests/unit/`.
2. Create the React workspace component in `src/features/<category>/components/`.
3. Register the tool metadata in `src/lib/tool-registry/tools.ts`.
4. Map `componentKey` in `src/components/tools/ToolRenderer.tsx`.

## Verification Before PR
Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

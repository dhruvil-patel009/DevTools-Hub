# DevTools Hub

> **Everything developers need. One workspace.**

DevTools Hub is a full-stack, privacy-first developer utility platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Auth.js. It provides **50 developer tools** across 8 categories, executing core utilities locally in the browser while offering optional cloud persistence, an admin management console, and optional Gemini AI assistance.

## Key Features

- **50 Developer Utilities across 8 Categories**:
  - **JSON Tools (8)**: Formatter, Validator, Minifier, Diff Viewer, Tree Viewer, JSON-to-TypeScript, Schema Validator, JSONPath Tester.
  - **Code Tools (8)**: HTML, CSS, JavaScript, TypeScript, and SQL Formatters, Code Diff Checker, Code Screenshot Generator, Sandboxed HTML/CSS/JS Playground.
  - **Data Converters (8)**: JSON ↔ CSV (with formula-injection protection), JSON ↔ YAML, JSON ↔ XML (XXE-disabled), Base64 (UTF-8 & URL-safe), URL Encode/Decode.
  - **CSS & Design (8)**: Gradient Generator, Box Shadow, Border Radius, Color Converter, Palette Generator, WCAG Contrast Checker, Flexbox & Grid Playgrounds.
  - **Generators (6)**: Cryptographic UUID v4, Secure Password Generator, SHA Hash Generator, Lorem Ipsum, QR Code, Unix Timestamp Converter.
  - **Text & Utilities (6)**: Worker-isolated Regex Tester (ReDoS-safe), DOMPurify-sanitized Markdown Editor, Case Converter, Word/Byte Counter, Text Diff, Local JWT Decoder.
  - **API Tools (3)**: Browser HTTP Request Tester (+ cURL export), Status Code Reference, Header Inspector.
  - **AI Tools (3, Optional)**: AI Code Explainer, Reviewer, and Documentation Generator via Gemini API with explicit user consent and daily quotas.
- **Privacy by Design**: Client-side processing for all 47 core tools; passwords, JWTs, and sensitive headers are never logged or stored.
- **Accounts & Admin Panel**: Auth.js authentication, `/dashboard` for snippets/collections/favorites/export, and `/admin` for tool toggles, user management, feedback triage, feature flags, and audit logs.

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Lucide Icons, Monaco Editor (lazy-loaded), Zustand, TanStack Query, Zod, Sonner, cmdk.
- **Backend & Data**: Next.js Route Handlers (`/api/v1/*`), Prisma ORM, PostgreSQL, Auth.js v5, optional Upstash Redis rate limiting, optional Google Gemini API.
- **Testing & CI**: Vitest, React Testing Library, Playwright, ESLint, Prettier, GitHub Actions, Docker.

## Local Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Start PostgreSQL (optional if using external DB)
docker compose up -d

# 4. Generate Prisma client, push schema, and seed 8 categories + 50 tools
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Start development server
pnpm dev
```

## Test & Verification Commands

```bash
pnpm typecheck   # TypeScript strict check
pnpm lint        # ESLint
pnpm test        # Vitest unit & security suites
pnpm test:e2e    # Playwright E2E tests
pnpm build       # Production Next.js build
```

## Security & Privacy Design

- XXE & Billion Laughs prevention in XML parsing (`processEntities: false` + `DOCTYPE`/`ENTITY` rejection).
- Formula-injection protection (`CWE-1236`) in CSV exports.
- DOMPurify sanitization on rendered Markdown.
- Sandboxed `iframe` (`sandbox="allow-scripts"`) with restrictive CSP for the HTML/CSS/JS Playground.
- Web Worker isolation + 1500ms timeout termination for Regex testing.
- Server-side RBAC (`USER`, `ADMIN`, `SUPER_ADMIN`) with audit logging and secret redaction.

## Known Limitations

- PostgreSQL is required for user accounts, saved snippets, API collections, and the `/admin` dashboard; client-side tools work without a database.
- AI tools require `GEMINI_API_KEY` and user authentication.
- Live demo URL and production Lighthouse screenshots are pending deployment.

# Security Report — DevTools Hub

## Implemented Security Controls
- **Client-Side Privacy**: 47 non-AI tools run locally in the browser; passwords, JWTs, and hashes are never transmitted or persisted.
- **XXE Prevention**: `xmlToJson` disables entity processing (`processEntities: false`) and explicitly rejects `<!DOCTYPE` and `<!ENTITY` declarations.
- **CSV Formula-Injection Protection**: `sanitizeCsvCell` prefixes leading `=`, `+`, `-`, `@`, `\t`, `\r` characters (`CWE-1236`).
- **XSS & Sandbox Isolation**: Markdown preview is sanitized via `DOMPurify` (forbidding `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`); HTML/CSS/JS Playground runs inside `<iframe sandbox="allow-scripts">` with a restrictive CSP meta tag.
- **ReDoS Protection**: Regex Tester executes in an isolated Web Worker with a 1500ms timeout that terminates hung workers.
- **Authentication & RBAC**: Auth.js v5 with `bcryptjs`, HTTP-only cookies, server-side `requireAuth`, `requireAdmin`, `requireSuperAdmin`, and `isLastActiveSuperAdmin` guard.
- **Secret Redaction & Audit Logging**: `sanitizeHeaders` and `sanitizeMetadata` redact Authorization headers, Bearer tokens, JWTs, API keys, and passwords before saving or logging.
- **Security Headers**: `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy` configured in `next.config.ts`.

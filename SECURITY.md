# Security Policy

## Supported Versions

The latest `main` branch of DevTools Hub is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in DevTools Hub, please do **not** open a public GitHub issue.

Instead, please report it responsibly by contacting the maintainers privately with:
- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof-of-concept.
- Any suggested remediation if known.

## Security Architecture Highlights

- Client-side execution for formatting, conversion, hashing, password generation, and JWT decoding.
- Sandboxed iframe with restrictive CSP for the HTML/CSS/JS Playground.
- Isolated Web Worker with execution bounds for Regex testing.
- XXE-disabled XML parsing, safe YAML parsing, and CSV formula-injection protection.
- Strict SSRF protections on any server-side HTTP proxy.
- Server-side Auth.js sessions, role-based access control, and resource ownership checks.
- No raw tool inputs, passwords, JWTs, or authorization headers are logged or persisted in analytics.

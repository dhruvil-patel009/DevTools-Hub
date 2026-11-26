# Project Case Study — DevTools Hub

## Overview
DevTools Hub was architected to solve tool fragmentation and privacy risks in everyday software engineering workflows by unifying 50 developer utilities into a single Next.js App Router workspace.

## Key Engineering Decisions
1. **Centralized Trusted Tool Registry**: Separating tool metadata (`src/lib/tool-registry/tools.ts`) from dynamic React rendering (`ToolRenderer.tsx`) allows the `/admin` panel to toggle availability, featured status, and SEO fields in PostgreSQL without ever executing database-stored code.
2. **Client-First Security Boundaries**: Sensitive operations (passwords, hashing, JWT decoding, formatting, regex matching) never touch the server.
3. **Graceful Degradation**: The platform runs all 47 core tools even when PostgreSQL, Redis, or Gemini AI credentials are unconfigured.

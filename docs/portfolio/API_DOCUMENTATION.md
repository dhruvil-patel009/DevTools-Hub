# API Documentation — DevTools Hub

An OpenAPI 3.1 specification is served dynamically at `/api/openapi`.

## Standard Response Envelope
- **Success**: `{ "success": true, "data": ..., "pagination"?: { "page", "limit", "total", "totalPages" } }`
- **Error**: `{ "success": false, "error": { "code": "...", "message": "...", "requestId": "..." } }`

## Endpoint Groups
- **Public**: `/api/health`, `/api/v1/tools`, `/api/v1/tools/[slug]`, `/api/v1/categories`, `/api/v1/search`, `/api/v1/announcements`, `/api/v1/feedback`, `/api/v1/analytics/*`
- **User (Authenticated)**: `/api/v1/user/{profile,preferences,favorites,history,snippets,collections,export,account}`
- **AI (Authenticated + Consent + Quota)**: `/api/v1/ai/{explain,review,documentation,usage}`
- **Admin (ADMIN / SUPER_ADMIN)**: `/api/v1/admin/{dashboard,users,tools,categories,analytics,audit-logs,feedback,settings,feature-flags}`

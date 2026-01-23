# PRD: Web Frontend for HelpDesk

## Introduction/Overview

The existing HelpDesk project provides a complete backend API but lacks a web frontend. This PRD defines the addition of a browser-based UI that uses the current REST API, Firebase authentication, and existing deployment patterns. The goal is to deliver a minimal but complete web app for customers, agents, and admins without changing backend behavior.

Project type: brownfield (additive, integrate with existing backend).

## Goals

- Provide a usable web UI for core ticket workflows (create, view, update, comment, attach files).
- Support role-based experiences for customer, agent, and admin users.
- Use existing API endpoints and authentication (Firebase JWT) without backend changes.
- Deploy the frontend alongside existing Firebase Hosting/Cloud Run setup with production-ready configuration.
- Keep backend compatibility and existing tests unaffected.

## Clarifying Questions (Answered with Defaults)

1. Scope of change: **A. New feature (additive, no changes to existing code)**.
2. Areas touched: **B. Existing API endpoints**, **C. New UI components**, **D. Shared config/docs**.
3. Backward compatibility: **A. Must be fully backward compatible**.
4. Integration approach: **A. Follow existing patterns exactly** (new UI only; no backend refactors).
5. Testing expectation: **A. Add tests for new code only** (existing backend tests still pass).

## Integration Points

### Existing Components to Modify
- `firebase.json` - update Hosting config to serve the SPA build and proxy `/api/**` to the existing backend service.
- `.env.example` - include frontend origin in `CORS_ORIGIN` defaults (e.g., `http://localhost:5173`).
- `README.md` - add frontend setup/run instructions and URLs.
- `docs/deployment/firebase-deployment.md` - add frontend build/deploy notes.

### Existing Components to Reuse
- `docs/api/openapi.yaml` - source of truth for API endpoints and payloads.
- `src/shared/middleware/auth.middleware.ts` - requires `Authorization: Bearer <token>` from Firebase Auth.
- `src/api/controllers/*` - existing ticket, comment, attachment, user, SLA rule, and audit log APIs.

### New Files to Create
- `web/` (new frontend workspace)
  - `web/package.json`, `web/vite.config.ts`, `web/tsconfig.json`
  - `web/src/main.tsx`, `web/src/App.tsx`
  - `web/src/pages/*` (Tickets, TicketDetail, Admin, etc.)
  - `web/src/components/*` (shared UI components)
  - `web/src/api/*` (API client, types)
  - `web/src/auth/*` (Firebase Auth integration)
  - `web/.env.example` (Vite envs)

### Database Changes
- None.

## Compatibility

### Backward Compatibility
- No changes to API shapes, auth, or database.
- Existing backend functionality and tests continue to work.

### Migration Requirements
- Update Firebase Hosting config to serve the frontend build output.
- Update `CORS_ORIGIN` to allow the frontend origin(s).
- No data migrations required.

### Deprecations
- None.

## User Stories

### US-001: Frontend scaffold and build pipeline
**Description:** As a developer, I want a frontend project scaffold so the UI can be built and served.

**Acceptance Criteria:**
- [ ] Create `web/` frontend workspace with Vite + React + TypeScript.
- [ ] `web` has scripts for dev, build, preview, and test (if added).
- [ ] Build output is placed in `web/dist`.
- [ ] Existing backend tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Adds: `web/` workspace and build pipeline

### US-002: Firebase Auth integration (web)
**Description:** As a user, I want to sign in with Firebase Auth so the UI can call protected APIs.

**Acceptance Criteria:**
- [ ] Configure Firebase Web SDK in `web/src/auth`.
- [ ] Users can sign in/out and refresh tokens.
- [ ] Auth state is available app-wide for role-based routing.
- [ ] Tokens are attached to API requests as `Authorization: Bearer <token>`.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: `src/shared/middleware/auth.middleware.ts` expectations for Bearer tokens
- Adds: `web/src/auth/*`

### US-003: API client and error handling
**Description:** As a developer, I want a typed API client so UI calls are consistent with existing endpoints.

**Acceptance Criteria:**
- [ ] API base URL is configurable via `VITE_API_BASE_URL`.
- [ ] Client handles backend error format `{ code, message, details }` and surfaces user-friendly messages.
- [ ] Client supports pagination, filtering, and file upload (`multipart/form-data`, field name `file`).
- [ ] Typecheck passes.

**Integration Notes:**
- Uses: `docs/api/openapi.yaml` for schemas/endpoints
- Adds: `web/src/api/*`

### US-004: App shell, navigation, and role-based routing
**Description:** As a user, I want navigation and role-based access so I only see pages I can use.

**Acceptance Criteria:**
- [ ] Layout includes global header, navigation, and user menu.
- [ ] Routes are gated by role (customer, agent, admin).
- [ ] Unauthorized routes show a clear access denied state.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: user role from `/api/v1/users/me` (existing endpoint) or Firebase claims
- Adds: `web/src/pages/*`, `web/src/components/*`

### US-005: Ticket list with filters and sorting
**Description:** As a user, I want to view and filter tickets so I can manage workload.

**Acceptance Criteria:**
- [ ] List tickets using `GET /api/v1/tickets` with pagination.
- [ ] Filters for status, priority, assignee (agent/admin), and tags.
- [ ] Sorting by createdAt/updatedAt/priority matches API support.
- [ ] Empty-state messaging when no tickets match.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: `docs/api/openapi.yaml` tickets list parameters
- Adds: `web/src/pages/Tickets*`

### US-006: Ticket detail and comments timeline
**Description:** As a user, I want to view ticket details and comments so I can understand history.

**Acceptance Criteria:**
- [ ] Detail page loads `GET /api/v1/tickets/:id`.
- [ ] Comments load via `GET /api/v1/tickets/:id/comments` with pagination.
- [ ] Public/private comment visibility matches role rules.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: `GET /api/v1/tickets/:id/comments` and comment visibility rules
- Adds: `web/src/pages/TicketDetail*`

### US-007: Create ticket (customer/agent)
**Description:** As a user, I want to create a ticket so I can request support.

**Acceptance Criteria:**
- [ ] Create form posts to `POST /api/v1/tickets`.
- [ ] Validates subject (1-255 chars) and description (1+ chars) before submit.
- [ ] Supports priority and tags inputs.
- [ ] Successful create navigates to the new ticket detail.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: `CreateTicketRequest` schema in `docs/api/openapi.yaml`
- Adds: `web/src/pages/CreateTicket*`

### US-008: Agent/admin ticket updates
**Description:** As an agent/admin, I want to update status, priority, and assignee so I can manage tickets.

**Acceptance Criteria:**
- [ ] Update status/priority/tags via `PATCH /api/v1/tickets/:id`.
- [ ] Assign ticket via `PATCH /api/v1/tickets/:id/assign`.
- [ ] UI prevents invalid status transitions (match backend rules).
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: ticket update/assign endpoints
- Adds: `web/src/components/TicketActions*`

### US-009: Commenting and internal notes
**Description:** As a user, I want to add comments (and internal notes as agent/admin) so communication is tracked.

**Acceptance Criteria:**
- [ ] Add comment via `POST /api/v1/tickets/:id/comments`.
- [ ] Agents/admins can choose public vs internal; customers always public.
- [ ] Comment list updates after posting (no full page refresh).
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: comment endpoints and role visibility rules
- Adds: `web/src/components/CommentComposer*`

### US-010: Attachments upload
**Description:** As a user, I want to upload attachments so I can share files with support.

**Acceptance Criteria:**
- [ ] Upload to `POST /api/v1/tickets/:id/attachments` with `file` field.
- [ ] Enforce 10MB file size limit and show errors from API.
- [ ] Uploaded files appear in the ticket timeline with download links.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: attachment upload endpoint
- Adds: `web/src/components/AttachmentUploader*`

### US-011: Admin user management
**Description:** As an admin, I want to manage users so I can onboard agents/customers.

**Acceptance Criteria:**
- [ ] List users via `GET /api/v1/users` with role filter.
- [ ] Create users via `POST /api/v1/users`.
- [ ] UI surfaces validation errors (email/role) from API.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: `GET /api/v1/users` and `POST /api/v1/users`
- Adds: `web/src/pages/AdminUsers*`

### US-012: Admin SLA rules and audit logs
**Description:** As an admin, I want to manage SLA rules and view audit logs.

**Acceptance Criteria:**
- [ ] SLA rule CRUD via `/api/v1/admin/sla-rules` endpoints.
- [ ] Audit log list via `GET /api/v1/admin/audit-logs` with filters.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

**Integration Notes:**
- Uses: admin endpoints in `src/api/routes/admin/*`
- Adds: `web/src/pages/AdminSla*`, `web/src/pages/AdminAudit*`

### US-013: Hosting and deployment integration
**Description:** As a developer, I want frontend hosting configured so the UI is available in production.

**Acceptance Criteria:**
- [ ] `firebase.json` serves the SPA build from `web/dist` (or equivalent).
- [ ] `/api/**` requests are proxied to the existing backend service.
- [ ] `CORS_ORIGIN` includes frontend domains (dev and prod).
- [ ] Existing backend tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `firebase.json`, `.env.example`, `docs/deployment/firebase-deployment.md`

## Functional Requirements

- FR-1: The web UI must authenticate via Firebase Auth and use JWTs for API calls.
- FR-2: The UI must support the full ticket lifecycle: create, view, update, comment, attach files.
- FR-3: Role-based access must limit pages/actions for customer, agent, admin.
- FR-4: Ticket list must support status, priority, assignee, requester, and tag filters.
- FR-5: Ticket detail must show metadata, SLA timers, and comment timeline.
- FR-6: Comment visibility must follow backend rules (customers see only public).
- FR-7: Attachment uploads must use multipart/form-data with API limits enforced.
- FR-8: Admin UI must allow user creation and list users by role.
- FR-9: Admin UI must allow SLA rule management and audit log viewing.
- FR-10: Frontend must be deployable via Firebase Hosting with `/api` proxy to backend.

## Non-Goals (Out of Scope)

- Mobile apps (iOS/Android) or native desktop clients.
- Realtime push updates (WebSockets) beyond current REST API.
- New backend endpoints or schema changes.
- Custom theming, white-labeling, or advanced analytics dashboards.

## Technical Considerations

- Frontend stack: Vite + React + TypeScript.
- Add Firebase Web SDK for authentication.
- Environment variables (frontend):
  - `VITE_API_BASE_URL` (default `http://localhost:3000/api/v1`)
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.
- Update `CORS_ORIGIN` to include `http://localhost:5173` and production UI domain.
- Hosting: Firebase Hosting should serve the SPA build and proxy `/api/**` to Cloud Run service `helpdesk-api` (per current `firebase.json`).
- Ensure error handling aligns with backend `{ code, message, details }` schema.
- Consider adding CSP adjustments if the UI introduces new asset domains.

## Success Metrics

- Users can create and resolve a ticket end-to-end in under 3 minutes.
- 0 backend API changes required to support the UI.
- No regression in existing backend tests.
- Frontend page load under 2s on a typical broadband connection.

## Open Questions

- What is the production domain for the frontend (needed for CORS and Firebase Hosting)?
- Do we need SSO or only Firebase email/password/OAuth providers?
- Should the UI include SLA breach indicators on ticket lists by default?
- What is the desired visual brand (colors/logo) for the UI?

# PRD: Comprehensive Application Logging

## Introduction/Overview

Enhance the existing HelpDesk API logging to provide comprehensive, structured, and consistent logs across all layers (request lifecycle, middleware, controllers, services/adapters, background jobs, and startup/shutdown). The goal is to make end-to-end flow tracing clear (info/debug), highlight warnings, and capture errors with consistent context while preserving existing patterns that use the shared Winston logger.

## Goals

- Provide consistent, structured logs for key application flows and errors across API, jobs, and shared services.
- Improve traceability of requests and background jobs with correlation identifiers.
- Standardize log levels (debug/info/warn/error) and message structure to reduce noise and aid analysis.
- Ensure logging can be tuned via environment configuration without code changes.
- Maintain backward compatibility and minimal disruption to existing behavior.

## Clarifying Decisions (Defaults)

- Scope: Enhancement to existing logging (no refactors beyond logging behavior).
- Areas touched: API endpoints, shared middleware/utilities, background jobs, adapters (DB/storage/notifications), and startup/shutdown flow.
- Backward compatibility: Fully backward compatible; no API contract changes.
- Integration approach: Follow existing logging patterns (Winston logger and middleware).
- Testing: Update existing tests as needed and add tests for new logging helpers where applicable.

## Integration Points

### Existing Components to Modify
- `src/shared/utils/logger.ts` - Extend logger configuration (levels, formats, default metadata).
- `src/shared/middleware/requestLogger.middleware.ts` - Add correlation ID and richer request/response logging.
- `src/shared/middleware/errorHandler.ts` - Ensure consistent error log structure with request context.
- `src/index.ts` - Log startup/shutdown lifecycle events and include configuration summary using logger.
- `src/shared/middleware/auth.middleware.ts` - Expand auth success/failure logging with correlation data.
- `src/shared/middleware/rbac.middleware.ts` - Log authorization results consistently with request context.
- `src/shared/validation/middleware.ts` - Ensure validation warnings include request and validation metadata.
- `src/shared/database/adapters/FirestoreAdapter.ts` and `src/shared/database/adapters/firestore/FirestoreAdapter.ts` - Standardize DB connection/health logs.
- `src/shared/storage/adapters/FirebaseStorageAdapter.ts` - Standardize storage logs and include request context where applicable.
- `src/shared/notifications/providers/SMTPProvider.ts` - Standardize notification logs with message identifiers and outcomes.
- `src/shared/events/NotificationHandlers.ts` - Improve flow logging of event handling success/failure.
- `src/jobs/sla-monitoring.job.ts` - Add run-level correlation and structured logs for job flow.
- API controllers (e.g. `src/api/controllers/**`) - Ensure consistent success, warning, and error log structure per action.

### Existing Components to Reuse
- `src/shared/utils/logger.ts` - Existing Winston logger instance.
- `src/shared/middleware/requestLogger.middleware.ts` - Existing request logging entry/exit middleware.

### New Files to Create
- `src/shared/middleware/correlationId.middleware.ts` - Assign and propagate correlation/request IDs (if no existing implementation).
- `src/shared/utils/logContext.ts` - Helper to build standard log context (request/job metadata).
- `src/shared/types/logging.ts` - Shared types for log context structures.

### Database Changes
- None.

## Compatibility

### Backward Compatibility
- All existing API routes and middleware continue to operate without interface changes.
- Logging behavior is enhanced but does not alter request/response payloads.
- New context fields are additive and optional.

### Migration Requirements
- None.

### Deprecations
- None.

## User Stories

### US-001: Standardize logger configuration
**Description:** As a developer, I want a consistent logger configuration so logs are structured and searchable across environments.

**Acceptance Criteria:**
- [ ] Logger supports configurable log level via `LOG_LEVEL`.
- [ ] Logs include consistent base metadata (service, environment).
- [ ] Log format uses JSON in non-development environments and human-readable in development.
- [ ] Typecheck passes.
- [ ] Existing tests still pass.

**Integration Notes:**
- Modifies: `src/shared/utils/logger.ts`
- Uses: `src/shared/config/env.config.ts`

### US-002: Add request correlation IDs
**Description:** As a developer, I want each request to have a correlation ID so I can trace logs for a single request end-to-end.

**Acceptance Criteria:**
- [ ] Each incoming request gets a correlation ID (uses existing header if present, otherwise generates one).
- [ ] Correlation ID is included in all request lifecycle logs.
- [ ] Correlation ID is returned in response headers (e.g. `X-Request-Id`).
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Adds: `src/shared/middleware/correlationId.middleware.ts`
- Modifies: `src/shared/middleware/requestLogger.middleware.ts`
- Modifies: `src/index.ts`

### US-003: Enrich request logging
**Description:** As an operator, I want request start/end logs with consistent context so I can diagnose performance issues and errors.

**Acceptance Criteria:**
- [ ] Request start log includes method, path, IP, user agent, and correlation ID.
- [ ] Request completion log includes status code, duration, response size (if available), and correlation ID.
- [ ] Warning level is used for 4xx responses; error level for 5xx responses.
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `src/shared/middleware/requestLogger.middleware.ts`
- Uses: `src/shared/utils/logContext.ts`

### US-004: Standardize error logging
**Description:** As a developer, I want consistent error logs so failures are easy to triage across layers.

**Acceptance Criteria:**
- [ ] Error logs include correlation ID and request metadata when applicable.
- [ ] AppError logs include error code and details.
- [ ] Unknown errors log stack traces.
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `src/shared/middleware/errorHandler.ts`
- Uses: `src/shared/utils/logContext.ts`

### US-005: Improve auth and RBAC logging
**Description:** As a developer, I want authentication and authorization logs to be consistent and structured to diagnose access issues.

**Acceptance Criteria:**
- [ ] Auth success logs include user id, role, and correlation ID.
- [ ] Auth failures log reason and request metadata at warn level.
- [ ] RBAC failures log required roles and request metadata at warn level.
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `src/shared/middleware/auth.middleware.ts`
- Modifies: `src/shared/middleware/rbac.middleware.ts`

### US-006: Standardize adapter/service logging
**Description:** As a developer, I want storage, database, and notification adapters to log consistent success and failure messages.

**Acceptance Criteria:**
- [ ] Firestore connection, health, and disconnect logs use consistent structure.
- [ ] Storage upload/download/delete logs include object identifiers and outcome.
- [ ] SMTP provider logs include message identifiers and retry attempts.
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `src/shared/database/adapters/FirestoreAdapter.ts`
- Modifies: `src/shared/database/adapters/firestore/FirestoreAdapter.ts`
- Modifies: `src/shared/storage/adapters/FirebaseStorageAdapter.ts`
- Modifies: `src/shared/notifications/providers/SMTPProvider.ts`

### US-007: Improve background job logging
**Description:** As an operator, I want background job logs to clearly show job lifecycle and errors.

**Acceptance Criteria:**
- [ ] Each job run logs start/end with a run ID and duration.
- [ ] Warnings are logged for recoverable issues (e.g., missing SLA timers).
- [ ] Errors include contextual ticket/job data.
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `src/jobs/sla-monitoring.job.ts`

### US-008: Standardize controller logging
**Description:** As a developer, I want API controllers to log consistent success/warn/error entries for key actions.

**Acceptance Criteria:**
- [ ] Each controller action logs a success message with relevant identifiers.
- [ ] Warnings are used for invalid input or user-caused issues; errors for server failures.
- [ ] Logs include correlation ID and user context when available.
- [ ] Existing tests still pass.
- [ ] Typecheck passes.

**Integration Notes:**
- Modifies: `src/api/controllers/**`
- Uses: `src/shared/utils/logContext.ts`

## Functional Requirements

1. Logging levels must be consistent across layers: debug (fine-grained), info (normal flow), warn (client/expected issues), error (server/unexpected).
2. All request logs must include correlation IDs and key request metadata.
3. Errors must include error codes (when present), stack traces (for unexpected errors), and correlation IDs.
4. Background jobs must log run-level lifecycle with run IDs and durations.
5. Logging must be configurable via environment without code changes.
6. No sensitive data (tokens, passwords, raw email bodies) should be logged.

## Non-Goals (Out of Scope)

- Building a centralized log storage or dashboard.
- Adding distributed tracing systems (e.g., OpenTelemetry) in this iteration.
- Changing API response formats for clients.
- Full audit logging beyond current audit log routes.

## Technical Considerations

- Use existing Winston logger; avoid introducing new logging dependencies.
- Add lightweight helpers for log context to avoid repetitive inline objects.
- Ensure request correlation IDs are propagated through middleware and can be reused by controllers.
- Verify logging does not expose sensitive data (authorization headers, tokens, passwords).
- Ensure logging in production remains JSON-formatted for external log collectors.

## Success Metrics

- 100% of API requests include correlation ID in start/end logs.
- Error logs include consistent context fields (request ID, route, error code).
- Reduced mean time to diagnose issues reported by QA/ops.
- No regressions in response latency attributable to logging.

## Open Questions

- Should correlation IDs be included in all downstream calls (e.g., Firestore adapter logs) via explicit context propagation?
- Is there a preferred header name for correlation IDs (`X-Request-Id` vs `X-Correlation-Id`)?
- Should debug logs be enabled by default in staging?

---

## Checklist

- [x] Reviewed existing codebase context
- [x] Asked integration-focused questions (answered with defaults)
- [x] Documented Integration Points section
- [x] Documented Compatibility considerations
- [x] Stories reference specific files to modify
- [x] Stories include "Existing tests still pass" where applicable
- [x] Follows existing patterns (or documents deviations)
- [x] Non-goals prevent scope creep
- [x] No hardcoded secrets
- [x] Saved to `tasks/prd-draft.md`

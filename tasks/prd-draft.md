# PRD: Help Desk / Ticketing System

## Introduction

A cloud-agnostic, enterprise-ready customer support and ticketing platform inspired by Zendesk's core capabilities. The system will enable organizations to manage customer support requests through a structured ticketing workflow, supporting ticket creation, assignment, tracking, SLA management, and multi-party communication between customers and support agents.

**Initial Deployment:** Firebase (GCP)  
**Future Portability:** SAP BTP (Cloud Foundry / Kyma)

The architecture prioritizes modularity, standards compliance, and cloud portability to ensure seamless migration between platforms without core business logic changes.

## Goals

- Provide complete ticket lifecycle management (create, assign, track, resolve, close)
- Enable efficient customer-agent communication with threaded conversations
- Implement role-based access control for customers, agents, and administrators
- Track and enforce SLA compliance for response and resolution times
- Support multi-tenant architecture for organizational isolation
- Maintain cloud-agnostic design for future platform portability
- Deliver RESTful API with OpenAPI documentation
- Ensure sub-500ms response times for core operations
- Achieve 99.9% uptime for production deployments

## Technology Stack

**Runtime & Framework:**
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js (mature ecosystem, wide SAP BTP compatibility)
- **Language:** TypeScript (strict mode)

**Database:**
- **Primary (Firebase):** Firestore
- **Abstraction Layer:** Repository pattern with interface-based data access
- **Future Targets:** SAP HANA Cloud, PostgreSQL

**Authentication & Authorization:**
- **Initial:** Firebase Authentication (email/password, OAuth providers)
- **Token Format:** JWT (compatible with SAP XSUAA migration)
- **Authorization:** Custom RBAC middleware

**File Storage:**
- **Initial:** Firebase Storage
- **Abstraction:** Storage provider interface
- **Future:** SAP Document Management Service, AWS S3

**Notifications:**
- **Abstraction:** Notification provider interface
- **Initial:** SMTP/SendGrid
- **Future:** SAP Notification Service

**Events & Messaging:**
- **Pattern:** Domain events with pub/sub abstraction
- **Initial:** Firebase Pub/Sub or in-process event emitter
- **Future:** SAP Event Mesh

**API Documentation:**
- **OpenAPI 3.0** specification
- **Swagger UI** for interactive documentation

**Testing:**
- **Framework:** Jest
- **Integration Tests:** Supertest
- **Coverage Target:** 80%+

**Deployment:**
- **Initial:** Firebase Cloud Functions or Cloud Run
- **Frontend:** Firebase Hosting
- **Future:** Cloud Foundry (Node.js buildpack) or Kyma (containerized)

**Rationale:** Express.js provides a stable, well-documented foundation with extensive middleware ecosystem. TypeScript ensures type safety across the stack. The repository pattern and interface-based abstractions enable database portability. JWT-based authentication aligns with both Firebase Auth and SAP XSUAA, minimizing migration friction.

## Project Structure

```
helpdesk-system/
├── src/
│   ├── api/                    # API layer (routes, controllers)
│   │   ├── routes/
│   │   │   ├── tickets.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── comments.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── controllers/
│   │   │   ├── tickets.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rbac.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── validators/
│   │       ├── ticket.validators.ts
│   │       └── user.validators.ts
│   ├── domain/                 # Business logic (services, models)
│   │   ├── services/
│   │   │   ├── ticket.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── sla.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── audit.service.ts
│   │   ├── models/
│   │   │   ├── ticket.model.ts
│   │   │   ├── comment.model.ts
│   │   │   ├── user.model.ts
│   │   │   └── sla-rule.model.ts
│   │   └── events/
│   │       ├── ticket.events.ts
│   │       └── event-emitter.ts
│   ├── infrastructure/         # Data access & external services
│   │   ├── database/
│   │   │   ├── repositories/
│   │   │   │   ├── ticket.repository.ts
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── comment.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── repository.interface.ts
│   │   │   │   └── database.interface.ts
│   │   │   └── firestore/
│   │   │       ├── firestore.adapter.ts
│   │   │       └── firestore.config.ts
│   │   ├── storage/
│   │   │   ├── storage.interface.ts
│   │   │   └── firebase-storage.adapter.ts
│   │   ├── notifications/
│   │   │   ├── notification.interface.ts
│   │   │   └── smtp.adapter.ts
│   │   └── events/
│   │       ├── event-bus.interface.ts
│   │       └── pubsub.adapter.ts
│   ├── shared/                 # Shared utilities
│   │   ├── types/
│   │   │   ├── enums.ts
│   │   │   └── interfaces.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   └── date-utils.ts
│   │   ├── config/
│   │   │   ├── env.config.ts
│   │   │   └── app.config.ts
│   │   └── errors/
│   │       ├── app-error.ts
│   │       └── error-codes.ts
│   └── index.ts                # Application entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── helpers/
├── docs/
│   ├── api/
│   │   └── openapi.yaml
│   ├── architecture/
│   │   ├── cloud-portability.md
│   │   └── sap-migration-guide.md
│   └── deployment/
│       ├── firebase-deployment.md
│       └── local-development.md
├── scripts/
│   ├── deploy-firebase.sh
│   └── seed-data.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## User Stories

### Foundation & Setup

#### US-001: Project Scaffolding
**Description:** As a developer, I need the project initialized with TypeScript, Express.js, and essential tooling.

**Acceptance Criteria:**
- [ ] Initialize npm project with TypeScript 5.x
- [ ] Install Express.js, cors, helmet, express-rate-limit
- [ ] Configure tsconfig.json with strict mode, ES2022 target
- [ ] Set up ESLint and Prettier
- [ ] Create basic Express server in src/index.ts
- [ ] Add scripts: dev (tsx watch), build (tsc), start, test, lint
- [ ] Server starts on configurable port (default 3000)
- [ ] Health check endpoint GET /health returns 200
- [ ] Typecheck passes with zero errors
- [ ] Linting passes with zero warnings

#### US-002: Environment Configuration
**Description:** As a developer, I need environment-based configuration management.

**Acceptance Criteria:**
- [ ] Install dotenv package
- [ ] Create .env.example with all required variables
- [ ] Create src/shared/config/env.config.ts with validation
- [ ] Support NODE_ENV (development, staging, production)
- [ ] Validate required env vars on startup
- [ ] Log configuration (excluding secrets) on startup
- [ ] Typecheck passes

#### US-003: Database Abstraction Layer
**Description:** As a developer, I need a repository pattern for database operations to enable future portability.

**Acceptance Criteria:**
- [ ] Define IRepository<T> interface with CRUD methods
- [ ] Define IDatabaseAdapter interface
- [ ] Create base Repository<T> abstract class
- [ ] Implement FirestoreAdapter with connection pooling
- [ ] Add transaction support interface
- [ ] Add query builder interface for filtering/sorting
- [ ] Connection established successfully on startup
- [ ] Typecheck passes
- [ ] Unit tests for repository base class pass

#### US-004: Logging & Error Handling
**Description:** As a developer, I need centralized logging and error handling.

**Acceptance Criteria:**
- [ ] Install Winston or Pino for structured logging
- [ ] Create logger utility with levels (debug, info, warn, error)
- [ ] Create AppError base class with error codes
- [ ] Create error handler middleware
- [ ] Log format includes: timestamp, level, message, context
- [ ] Errors return consistent JSON format: { code, message, details? }
- [ ] Error logs include stack traces in development
- [ ] Typecheck passes
- [ ] Unit tests pass

### Core Data Models

#### US-005: Ticket Model & Repository
**Description:** As a developer, I need the Ticket data model and repository implementation.

**Acceptance Criteria:**
- [ ] Create Ticket interface with all fields (id, organizationId, requesterId, assigneeId, status, priority, subject, description, tags, createdAt, updatedAt, slaTimers)
- [ ] Implement TicketRepository extending Repository<Ticket>
- [ ] Add methods: create, findById, findByOrganization, update, delete
- [ ] Add filtering support (status, priority, assigneeId)
- [ ] Add pagination support (limit, offset)
- [ ] Validate status enum transitions
- [ ] Validate priority enum values
- [ ] Add indexes for organizationId, status, createdAt
- [ ] Typecheck passes
- [ ] Unit tests with mocked database pass

#### US-006: User Model & Repository
**Description:** As a developer, I need the User data model and repository implementation.

**Acceptance Criteria:**
- [ ] Create User interface (id, role, organizationId, email, displayName, createdAt, updatedAt)
- [ ] Create UserRole enum: customer, agent, admin
- [ ] Implement UserRepository extending Repository<User>
- [ ] Add methods: create, findById, findByEmail, findByOrganization, update
- [ ] Add role-based querying
- [ ] Enforce unique email per organization
- [ ] Add index on email and organizationId
- [ ] Typecheck passes
- [ ] Unit tests pass

#### US-007: Comment Model & Repository
**Description:** As a developer, I need the Comment data model for ticket conversations.

**Acceptance Criteria:**
- [ ] Create Comment interface (id, ticketId, authorId, isPublic, body, attachments, createdAt)
- [ ] Implement CommentRepository extending Repository<Comment>
- [ ] Add methods: create, findByTicket, findById
- [ ] Add filtering by isPublic flag
- [ ] Add sorting by createdAt (ascending)
- [ ] Add index on ticketId and createdAt
- [ ] Typecheck passes
- [ ] Unit tests pass

#### US-008: SLA Rule Model
**Description:** As a developer, I need the SLA Rule data model for tracking service level agreements.

**Acceptance Criteria:**
- [ ] Create SLARule interface (id, organizationId, priority, firstResponseMinutes, resolutionMinutes, createdAt)
- [ ] Create SLATimer interface (firstResponseAt, firstResponseDue, resolvedAt, resolutionDue, breached)
- [ ] Implement SLARuleRepository
- [ ] Add methods: create, findByOrganizationAndPriority, update
- [ ] Support default rules per organization
- [ ] Typecheck passes
- [ ] Unit tests pass

### Authentication & Authorization

#### US-009: Authentication Middleware
**Description:** As a developer, I need JWT-based authentication middleware.

**Acceptance Criteria:**
- [ ] Install Firebase Admin SDK
- [ ] Create auth middleware to verify Firebase JWT tokens
- [ ] Extract user claims (userId, email, role, organizationId)
- [ ] Attach user context to request object
- [ ] Return 401 for missing/invalid tokens
- [ ] Support Bearer token format
- [ ] Cache user lookups (5-minute TTL)
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-010: RBAC Middleware
**Description:** As a developer, I need role-based access control middleware.

**Acceptance Criteria:**
- [ ] Create requireRole(...roles) middleware factory
- [ ] Check user role from authenticated request
- [ ] Return 403 for insufficient permissions
- [ ] Support multiple role requirements (OR logic)
- [ ] Log authorization failures
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-011: Organization Isolation Middleware
**Description:** As a developer, I need middleware to enforce multi-tenant data isolation.

**Acceptance Criteria:**
- [ ] Create organizationIsolation middleware
- [ ] Validate organizationId in request matches authenticated user
- [ ] Apply to all ticket/comment/user routes
- [ ] Return 403 for organization mismatches
- [ ] Support admin override capability
- [ ] Typecheck passes
- [ ] Integration tests pass

### API Endpoints - Tickets

#### US-012: Create Ticket Endpoint
**Description:** As an end user or agent, I want to create new support tickets via POST /api/v1/tickets.

**Acceptance Criteria:**
- [ ] POST /api/v1/tickets accepts: { subject, description, priority?, tags? }
- [ ] Authenticate request (require customer or agent role)
- [ ] Validate subject (required, 1-200 chars)
- [ ] Validate description (required, 1-5000 chars)
- [ ] Validate priority enum or default to 'medium'
- [ ] Set requesterId from authenticated user
- [ ] Set status to 'new'
- [ ] Initialize SLA timers based on priority
- [ ] Emit 'ticket.created' event
- [ ] Return 201 with created ticket JSON
- [ ] Return 400 for validation errors
- [ ] Return 401 for unauthenticated requests
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-013: List Tickets Endpoint
**Description:** As an agent or customer, I want to view tickets via GET /api/v1/tickets.

**Acceptance Criteria:**
- [ ] GET /api/v1/tickets returns paginated ticket list
- [ ] Filter by organizationId automatically (isolation)
- [ ] Support ?status= filter (comma-separated)
- [ ] Support ?priority= filter
- [ ] Support ?assigneeId= filter
- [ ] Support ?requesterId= filter
- [ ] Support ?tags= filter (comma-separated, OR logic)
- [ ] Support ?page= and ?limit= for pagination (default limit 50, max 100)
- [ ] Support ?sortBy= (createdAt, updatedAt, priority) and ?order= (asc, desc)
- [ ] Customers see only their own tickets
- [ ] Agents/admins see all organization tickets
- [ ] Return 200 with { tickets: [], total: number, page: number, limit: number }
- [ ] Return empty array when no tickets
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-014: Get Ticket by ID Endpoint
**Description:** As a user, I want to view ticket details via GET /api/v1/tickets/:id.

**Acceptance Criteria:**
- [ ] GET /api/v1/tickets/:id returns full ticket details
- [ ] Validate ticket belongs to user's organization
- [ ] Customers can only view their own tickets
- [ ] Agents/admins can view all organization tickets
- [ ] Return 200 with ticket JSON
- [ ] Return 404 for non-existent tickets
- [ ] Return 403 for unauthorized access
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-015: Update Ticket Endpoint
**Description:** As an agent or admin, I want to update tickets via PATCH /api/v1/tickets/:id.

**Acceptance Criteria:**
- [ ] PATCH /api/v1/tickets/:id accepts: { status?, priority?, assigneeId?, tags? }
- [ ] Require agent or admin role
- [ ] Validate ticket exists and belongs to organization
- [ ] Validate status transitions (new → open → pending/on-hold → resolved → closed)
- [ ] Validate assigneeId exists and is an agent
- [ ] Update SLA timers on status change
- [ ] Emit 'ticket.updated' event with changes
- [ ] Create audit log entry
- [ ] Return 200 with updated ticket
- [ ] Return 400 for invalid transitions
- [ ] Return 403 for customers attempting updates
- [ ] Return 404 for non-existent tickets
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-016: Assign Ticket Endpoint
**Description:** As an agent or admin, I want to assign tickets via PATCH /api/v1/tickets/:id/assign.

**Acceptance Criteria:**
- [ ] PATCH /api/v1/tickets/:id/assign accepts: { assigneeId }
- [ ] Require agent or admin role
- [ ] Validate assigneeId is a valid agent in organization
- [ ] Update ticket assigneeId
- [ ] If status is 'new', change to 'open'
- [ ] Emit 'ticket.assigned' event
- [ ] Send notification to assigned agent
- [ ] Return 200 with updated ticket
- [ ] Return 400 for invalid assigneeId
- [ ] Typecheck passes
- [ ] Integration tests pass

### API Endpoints - Comments

#### US-017: Add Comment Endpoint
**Description:** As a user, I want to add comments to tickets via POST /api/v1/tickets/:id/comments.

**Acceptance Criteria:**
- [ ] POST /api/v1/tickets/:id/comments accepts: { body, isPublic?, attachments? }
- [ ] Validate ticket exists and user has access
- [ ] Validate body (required, 1-10000 chars)
- [ ] Default isPublic to true for customers, false for agents
- [ ] Agents can explicitly set isPublic
- [ ] Set authorId from authenticated user
- [ ] Store attachments if provided (validate file types/sizes)
- [ ] If author is agent and isPublic, update ticket firstResponseAt if null
- [ ] Emit 'comment.added' event
- [ ] Send notification to relevant parties
- [ ] Return 201 with created comment
- [ ] Return 400 for validation errors
- [ ] Return 403 for unauthorized access
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-018: List Comments Endpoint
**Description:** As a user, I want to view ticket comments via GET /api/v1/tickets/:id/comments.

**Acceptance Criteria:**
- [ ] GET /api/v1/tickets/:id/comments returns all comments for ticket
- [ ] Validate user has access to ticket
- [ ] Customers only see public comments
- [ ] Agents/admins see all comments
- [ ] Sort by createdAt ascending (threaded conversation)
- [ ] Include author details (displayName, role)
- [ ] Support pagination (?page=, ?limit=)
- [ ] Return 200 with comments array
- [ ] Return 403 for unauthorized access
- [ ] Typecheck passes
- [ ] Integration tests pass

### API Endpoints - Users

#### US-019: Create User Endpoint
**Description:** As an admin, I want to create users via POST /api/v1/users.

**Acceptance Criteria:**
- [ ] POST /api/v1/users accepts: { email, displayName, role }
- [ ] Require admin role
- [ ] Validate email format
- [ ] Validate email unique within organization
- [ ] Validate role enum
- [ ] Create user in Firebase Auth
- [ ] Create user record in database with organizationId
- [ ] Return 201 with created user (exclude password)
- [ ] Return 400 for validation errors
- [ ] Return 409 for duplicate email
- [ ] Return 403 for non-admin users
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-020: List Users Endpoint
**Description:** As an admin, I want to view organization users via GET /api/v1/users.

**Acceptance Criteria:**
- [ ] GET /api/v1/users returns users in organization
- [ ] Require admin role
- [ ] Support ?role= filter
- [ ] Support pagination
- [ ] Return 200 with users array
- [ ] Exclude sensitive fields (password hashes)
- [ ] Return 403 for non-admin users
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-021: Get Current User Endpoint
**Description:** As a user, I want to view my profile via GET /api/v1/users/me.

**Acceptance Criteria:**
- [ ] GET /api/v1/users/me returns authenticated user's profile
- [ ] Require authentication
- [ ] Return user details including role, organizationId
- [ ] Return 200 with user JSON
- [ ] Return 401 for unauthenticated requests
- [ ] Typecheck passes
- [ ] Integration tests pass

### Business Logic - SLA Management

#### US-022: SLA Service Implementation
**Description:** As a developer, I need a service to calculate and track SLA timers.

**Acceptance Criteria:**
- [ ] Create SLAService with methods: calculateTimers, checkBreach, getBreachedTickets
- [ ] calculateTimers accepts ticket and returns SLATimer
- [ ] Load SLA rules for organization and priority
- [ ] Calculate firstResponseDue = createdAt + firstResponseMinutes
- [ ] Calculate resolutionDue = createdAt + resolutionMinutes
- [ ] checkBreach identifies if current time exceeds due time
- [ ] Update ticket.slaTimers.breached flag
- [ ] Emit 'sla.breached' event when breach detected
- [ ] Handle business hours (optional v1, default to 24/7)
- [ ] Typecheck passes
- [ ] Unit tests with mocked repository pass

#### US-023: SLA Monitoring Background Job
**Description:** As a system, I need to periodically check for SLA breaches.

**Acceptance Criteria:**
- [ ] Create scheduled job (Cloud Scheduler or Firebase Functions cron)
- [ ] Run every 5 minutes
- [ ] Query tickets with status in (new, open, pending)
- [ ] Check SLA timers for each ticket
- [ ] Update breached flag if overdue
- [ ] Emit events for newly breached tickets
- [ ] Log job execution results
- [ ] Handle errors gracefully (retry logic)
- [ ] Typecheck passes
- [ ] Integration tests with test scheduler pass

### Business Logic - Notifications

#### US-024: Notification Service Implementation
**Description:** As a developer, I need a notification service abstraction.

**Acceptance Criteria:**
- [ ] Create INotificationProvider interface: sendEmail(to, subject, body)
- [ ] Create NotificationService using provider
- [ ] Implement SMTPProvider or SendGridAdapter
- [ ] Support HTML and plain text emails
- [ ] Load notification templates (ticket created, replied, resolved)
- [ ] Queue notifications asynchronously (pub/sub or task queue)
- [ ] Retry failed sends (exponential backoff)
- [ ] Log notification delivery status
- [ ] Typecheck passes
- [ ] Unit tests with mocked provider pass

#### US-025: Event-Driven Notification Handlers
**Description:** As a system, I want to send notifications when ticket events occur.

**Acceptance Criteria:**
- [ ] Listen for 'ticket.created' event
- [ ] Send email to requester confirming ticket creation
- [ ] Listen for 'comment.added' event
- [ ] Send email to requester when agent replies (isPublic)
- [ ] Send email to assignee when internal note added
- [ ] Listen for 'ticket.updated' event
- [ ] Send email when status changes to 'resolved'
- [ ] Include ticket ID, subject, and relevant details in emails
- [ ] Respect user notification preferences (future: stored in DB)
- [ ] Typecheck passes
- [ ] Integration tests with mocked email provider pass

### API Endpoints - Admin

#### US-026: Create SLA Rule Endpoint
**Description:** As an admin, I want to configure SLA rules via POST /api/v1/admin/sla-rules.

**Acceptance Criteria:**
- [ ] POST /api/v1/admin/sla-rules accepts: { priority, firstResponseMinutes, resolutionMinutes }
- [ ] Require admin role
- [ ] Validate priority enum
- [ ] Validate time values are positive integers
- [ ] Create or update rule for organization and priority
- [ ] Return 201 with created rule
- [ ] Return 400 for validation errors
- [ ] Return 403 for non-admin users
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-027: List SLA Rules Endpoint
**Description:** As an admin, I want to view SLA rules via GET /api/v1/admin/sla-rules.

**Acceptance Criteria:**
- [ ] GET /api/v1/admin/sla-rules returns all rules for organization
- [ ] Require admin role
- [ ] Return rules sorted by priority
- [ ] Return 200 with rules array
- [ ] Return 403 for non-admin users
- [ ] Typecheck passes
- [ ] Integration tests pass

#### US-028: Audit Log Endpoint
**Description:** As an admin, I want to view audit logs via GET /api/v1/admin/audit-logs.

**Acceptance Criteria:**
- [ ] GET /api/v1/admin/audit-logs returns audit trail
- [ ] Require admin role
- [ ] Support filtering by ?ticketId=, ?userId=, ?action=
- [ ] Support date range filters (?startDate=, ?endDate=)
- [ ] Support pagination
- [ ] Return logs with: timestamp, userId, action, resourceType, resourceId, changes
- [ ] Sort by timestamp descending
- [ ] Return 200 with logs array
- [ ] Return 403 for non-admin users
- [ ] Typecheck passes
- [ ] Integration tests pass

### Storage & Attachments

#### US-029: File Upload Service
**Description:** As a developer, I need a file storage abstraction for attachments.

**Acceptance Criteria:**
- [ ] Create IStorageProvider interface: upload(file, path), download(path), delete(path), getSignedUrl(path)
- [ ] Implement FirebaseStorageAdapter
- [ ] Support file types: images (jpg, png, gif), documents (pdf, txt, docx), archives (zip)
- [ ] Validate file size (max 10MB per file)
- [ ] Generate unique file names (UUID + extension)
- [ ] Store in organization-scoped paths: uploads/{organizationId}/{ticketId}/{filename}
- [ ] Return secure signed URLs for downloads
- [ ] Typecheck passes
- [ ] Unit tests with mocked storage pass

#### US-030: Upload Attachment Endpoint
**Description:** As a user, I want to upload files via POST /api/v1/tickets/:id/attachments.

**Acceptance Criteria:**
- [ ] POST /api/v1/tickets/:id/attachments accepts multipart/form-data
- [ ] Validate ticket exists and user has access
- [ ] Validate file type against whitelist
- [ ] Validate file size (max 10MB)
- [ ] Upload to storage provider
- [ ] Store attachment metadata in comment or ticket
- [ ] Return 201 with attachment metadata (id, filename, url, size)
- [ ] Return 400 for invalid file type/size
- [ ] Return 403 for unauthorized access
- [ ] Typecheck passes
- [ ] Integration tests pass

### Testing & Quality

#### US-031: Unit Test Coverage
**Description:** As a developer, I need comprehensive unit tests for business logic.

**Acceptance Criteria:**
- [ ] Test all service methods (TicketService, UserService, SLAService)
- [ ] Mock repositories and external dependencies
- [ ] Test edge cases (null values, empty arrays, boundary conditions)
- [ ] Test error scenarios (not found, validation failures)
- [ ] Achieve 80%+ code coverage
- [ ] All tests pass
- [ ] Test execution time under 30 seconds

#### US-032: Integration Test Suite
**Description:** As a developer, I need integration tests for API endpoints.

**Acceptance Criteria:**
- [ ] Test all ticket endpoints with Supertest
- [ ] Test authentication flows (valid/invalid tokens)
- [ ] Test authorization (role-based access)
- [ ] Test multi-tenant isolation
- [ ] Test validation errors
- [ ] Use test database (Firestore emulator)
- [ ] Seed test data before each suite
- [ ] Clean up test data after each suite
- [ ] All tests pass
- [ ] Test execution time under 2 minutes

#### US-033: API Documentation
**Description:** As a developer, I need comprehensive API documentation.

**Acceptance Criteria:**
- [ ] Create OpenAPI 3.0 specification in docs/api/openapi.yaml
- [ ] Document all endpoints with descriptions
- [ ] Document request schemas with examples
- [ ] Document response schemas with status codes
- [ ] Document authentication requirements
- [ ] Document error response formats
- [ ] Integrate Swagger UI at /api-docs endpoint
- [ ] Keep spec in sync with implementation
- [ ] Validation passes (swagger-cli validate)

### Security Hardening

#### US-034: Input Validation & Sanitization
**Description:** As a developer, I need robust input validation to prevent injection attacks.

**Acceptance Criteria:**
- [ ] Install Joi or Zod validation library
- [ ] Create validation schemas for all endpoints
- [ ] Sanitize string inputs (trim, escape HTML)
- [ ] Validate email formats
- [ ] Validate URL formats for attachments
- [ ] Reject requests with invalid payloads (400 errors)
- [ ] Log validation failures
- [ ] Typecheck passes
- [ ] Security tests pass (SQL injection, XSS attempts)

#### US-035: Rate Limiting
**Description:** As a developer, I need rate limiting to prevent abuse.

**Acceptance Criteria:**
- [ ] Install express-rate-limit middleware
- [ ] Apply global rate limit: 100 requests per 15 minutes per IP
- [ ] Apply stricter limits on auth endpoints: 5 requests per 15 minutes
- [ ] Apply per-user limits: 1000 requests per hour per user
- [ ] Return 429 with Retry-After header when exceeded
- [ ] Use Redis for distributed rate limiting (optional v1, in-memory acceptable)
- [ ] Typecheck passes
- [ ] Integration tests verify limits enforced

#### US-036: Security Headers & CORS
**Description:** As a developer, I need security headers and CORS configuration.

**Acceptance Criteria:**
- [ ] Install helmet middleware
- [ ] Enable HSTS (Strict-Transport-Security)
- [ ] Set X-Content-Type-Options: nosniff
- [ ] Set X-Frame-Options: DENY
- [ ] Set CSP header (Content-Security-Policy)
- [ ] Configure CORS with allowed origins from config
- [ ] Restrict CORS to authenticated requests
- [ ] Typecheck passes
- [ ] Security audit passes (npm audit)

### Deployment & DevOps

#### US-037: Firebase Deployment Configuration
**Description:** As a developer, I need deployment configuration for Firebase.

**Acceptance Criteria:**
- [ ] Create firebase.json with hosting and functions config
- [ ] Configure Cloud Functions or Cloud Run for API
- [ ] Set environment variables via .env (local) and Firebase config (production)
- [ ] Configure Firestore indexes in firestore.indexes.json
- [ ] Configure Firestore security rules in firestore.rules
- [ ] Create deployment script scripts/deploy-firebase.sh
- [ ] Document deployment steps in docs/deployment/firebase-deployment.md
- [ ] Test deployment to staging environment
- [ ] Successful deployment with zero downtime

#### US-038: Local Development Setup
**Description:** As a developer, I need local development environment instructions.

**Acceptance Criteria:**
- [ ] Create comprehensive README.md with quick start
- [ ] Document prerequisites (Node.js 20, Firebase CLI)
- [ ] Document installation steps (npm install, env setup)
- [ ] Document running locally (npm run dev)
- [ ] Document running with Firebase emulators
- [ ] Document testing (npm test)
- [ ] Document linting (npm run lint)
- [ ] Create .env.example with all variables
- [ ] Successful setup by new developer in under 15 minutes

#### US-039: Monitoring & Logging
**Description:** As a developer, I need production monitoring and logging.

**Acceptance Criteria:**
- [ ] Configure structured JSON logging
- [ ] Log levels: debug (dev only), info, warn, error
- [ ] Log all API requests (method, path, status, duration)
- [ ] Log authentication failures
- [ ] Log authorization failures
- [ ] Log SLA breaches
- [ ] Log notification delivery status
- [ ] Integrate with Firebase Logging or GCP Cloud Logging
- [ ] Create dashboard with key metrics (future: tickets created, avg response time, SLA compliance)
- [ ] Logs queryable in production

### Documentation

#### US-040: SAP BTP Migration Guide
**Description:** As a developer, I need documentation for migrating to SAP BTP.

**Acceptance Criteria:**
- [ ] Create docs/architecture/sap-migration-guide.md
- [ ] Document Firebase → SAP service mappings
- [ ] Document authentication migration (Firebase Auth → XSUAA)
- [ ] Document database migration (Firestore → HANA Cloud)
- [ ] Document storage migration (Firebase Storage → Document Management)
- [ ] Document event migration (Pub/Sub → Event Mesh)
- [ ] Document deployment steps (Cloud Foundry manifest.yml)
- [ ] Document environment variable mappings
- [ ] Include code examples for adapter implementations
- [ ] Peer review by architect

#### US-041: Architecture Documentation
**Description:** As a developer, I need architecture documentation explaining design decisions.

**Acceptance Criteria:**
- [ ] Create docs/architecture/cloud-portability.md
- [ ] Document layered architecture (API, Domain, Infrastructure)
- [ ] Document repository pattern and abstractions
- [ ] Document event-driven architecture
- [ ] Document multi-tenancy design
- [ ] Document SLA calculation logic
- [ ] Include architecture diagrams (C4 model or similar)
- [ ] Document technology choices and rationale
- [ ] Document security architecture
- [ ] Peer review by architect

## Functional Requirements

**Ticket Management:**
- FR-1: System must support ticket lifecycle: new → open → pending/on-hold → resolved → closed
- FR-2: System must prevent invalid status transitions (e.g., new → closed without intermediate states)
- FR-3: System must support priority levels: low, medium, high, urgent
- FR-4: System must support tagging for categorization and routing
- FR-5: System must track ticket creation, last update, and resolution timestamps

**User & Access Control:**
- FR-6: System must support three user roles: customer, agent, admin
- FR-7: Customers must only access their own tickets
- FR-8: Agents must access all tickets within their organization
- FR-9: Admins must manage users, SLA rules, and view audit logs
- FR-10: System must enforce multi-tenant isolation by organizationId

**Comments & Communication:**
- FR-11: System must support threaded conversations per ticket
- FR-12: System must distinguish public replies (customer-visible) from private internal notes
- FR-13: System must support file attachments with validation (type, size)
- FR-14: System must support basic Markdown formatting in comments

**SLA Management:**
- FR-15: System must track first response time SLA per ticket
- FR-16: System must track resolution time SLA per ticket
- FR-17: System must flag tickets when SLA is breached
- FR-18: System must support configurable SLA rules per organization and priority
- FR-19: System must calculate SLA timers based on ticket creation time and priority

**Notifications:**
- FR-20: System must send email notification when ticket is created
- FR-21: System must send email notification when agent replies publicly
- FR-22: System must send email notification when ticket is resolved
- FR-23: System must send email notification to agent when ticket is assigned

**API & Integration:**
- FR-24: All API responses must return JSON
- FR-25: All timestamps must use ISO 8601 format
- FR-26: API must support pagination with configurable limits
- FR-27: API must support filtering and sorting for list endpoints
- FR-28: API must return consistent error format: { code, message, details? }

**Security:**
- FR-29: System must authenticate all requests via JWT tokens
- FR-30: System must validate all inputs and reject malformed requests
- FR-31: System must apply rate limiting per IP and per user
- FR-32: System must create audit logs for ticket state changes
- FR-33: System must sanitize user inputs to prevent XSS attacks

**Cloud Portability:**
- FR-34: Business logic must be independent of cloud provider services
- FR-35: Database access must use repository pattern with interfaces
- FR-36: External services must use adapter pattern
- FR-37: Configuration must be environment-driven (no hardcoded values)

## Non-Goals (v1)

**Explicitly out of scope for initial release:**

- AI-powered ticket routing or categorization
- Natural language processing for intent detection
- Omnichannel support (chat, WhatsApp, voice, social media)
- Knowledge base or self-service help center
- Customer satisfaction surveys (CSAT/NPS)
- Advanced reporting dashboards or analytics
- Real-time chat or live agent features
- Mobile native applications (iOS/Android)
- Integration with third-party tools (Slack, Jira, Salesforce)
- Automated ticket escalation workflows
- Business hours configuration for SLA (assume 24/7)
- Custom fields or dynamic forms
- Ticket merging or splitting
- Macros or canned responses
- Multi-language support (English only v1)
- Advanced search (full-text, fuzzy matching)
- Webhooks for external integrations
- SSO beyond OAuth providers (no SAML v1)

## Technical Considerations

**Performance:**
- Target API response time: <500ms for 95th percentile
- Database queries must use indexes for filtering
- Implement connection pooling for database
- Use caching for frequently accessed data (user profiles, SLA rules)
- Optimize for read-heavy workload (tickets viewed more than updated)

**Scalability:**
- Design for horizontal scaling (stateless services)
- Use pagination to limit result set sizes
- Implement background jobs for async tasks (SLA monitoring, notifications)
- Use pub/sub or queues for event processing
- Plan for 10,000 tickets per organization initially

**Security:**
- Follow OWASP Top 10 best practices
- Encrypt data in transit (HTTPS/TLS)
- Encrypt sensitive data at rest (database-level encryption)
- Use principle of least privilege for service accounts
- Regular dependency updates and security audits
- Implement CSRF protection for state-changing operations

**Reliability:**
- Target 99.9% uptime
- Implement graceful error handling
- Use circuit breaker pattern for external service calls
- Implement retry logic with exponential backoff
- Monitor error rates and set up alerts

**Maintainability:**
- Follow TypeScript strict mode
- Enforce code linting and formatting
- Maintain 80%+ test coverage
- Use dependency injection for testability
- Document all public APIs
- Use semantic versioning

**Cloud Portability:**
- Minimize Firebase-specific code to infrastructure layer
- Use standard protocols (REST, JWT, SMTP)
- Document migration paths for all cloud services
- Test with multiple database backends when possible
- Keep OpenAPI spec as single source of truth

**Testing Strategy:**
- Unit tests for all business logic (services, models)
- Integration tests for all API endpoints
- Use Firebase emulators for local testing
- Mock external dependencies (email, storage)
- Automated CI/CD pipeline with test gates
- Load testing for performance validation

## Success Metrics

**Functional Success:**
- All user stories completed and acceptance criteria met
- Zero critical bugs in production after 30 days
- API documentation 100% complete and accurate
- Test coverage ≥80% across codebase

**Performance Success:**
- 95th percentile API response time <500ms
- Ticket creation completes in <200ms
- Database queries execute in <100ms
- Zero timeout errors in production

**Quality Success:**
- TypeScript compilation with zero errors
- Linting with zero warnings
- All integration tests pass
- Security audit passes with no high/critical issues

**Operational Success:**
- Successful deployment to Firebase without downtime
- Local development setup completes in <15 minutes
- API uptime ≥99.9% in first 30 days
- SLA monitoring job runs every 5 minutes with <1% failure rate

**Migration Readiness:**
- SAP BTP migration guide complete and reviewed
- All abstractions tested with mock implementations
- Zero hardcoded Firebase dependencies in business logic
- Architecture documentation peer-reviewed and approved

## Open Questions

1. **Business Hours for SLA:** Should v1 support business hours (9-5 Mon-Fri) or assume 24/7? 
   - **Default:** Assume 24/7 for v1 simplicity, add business hours in v2

2. **Attachment Storage Limits:** What is the total storage limit per organization?
   - **Default:** 10GB per organization for v1

3. **Email Template Customization:** Should admins customize email templates in v1?
   - **Default:** No, use standard templates in v1, add customization in v2

4. **Ticket Number Format:** Should tickets use incremental IDs (TICKET-001) or UUIDs?
   - **Default:** Use UUID for global uniqueness, display incremental IDs per organization

5. **SLA Breach Actions:** Should the system auto-escalate or just flag when SLA is breached?
   - **Default:** Just flag and emit event in v1, implement escalation workflows in v2

6. **User Invitation Flow:** How should new users be invited? Email invite vs admin creates account?
   - **Default:** Admin creates account with email, user receives welcome email with password reset link

7. **Ticket Assignment Rules:** Should v1 support auto-assignment or round-robin?
   - **Default:** Manual assignment only in v1, add auto-assignment in v2

8. **API Versioning Strategy:** How should API versions be managed (URL prefix vs header)?
   - **Default:** URL prefix (/api/v1/) for simplicity

9. **Soft Delete vs Hard Delete:** Should tickets be soft-deleted (flagged) or hard-deleted?
   - **Default:** Soft delete (add deletedAt field) for audit trail

10. **Maximum Ticket Age:** Should resolved/closed tickets be archived after a period?
    - **Default:** No automatic archival in v1, all tickets remain accessible

---

**PRD Version:** 1.0  
**Created:** 2026-01-20  
**Last Updated:** 2026-01-20  
**Status:** Draft  
**Prepared By:** Agent Ralph  
**Target Start:** TBD  
**Estimated Duration:** 8-12 weeks for v1 MVP

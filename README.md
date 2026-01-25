# HelpDesk

Cloud-agnostic enterprise-ready customer support and ticketing platform.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local Development](#local-development)
- [Frontend Development](#frontend-development)
- [Firebase Emulators](#firebase-emulators)
- [Testing](#testing)
- [Available Commands](#available-commands)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Authentication & Authorization](#authentication--authorization)
- [Background Jobs](#background-jobs)
- [Deployment](#deployment)

## Features

- Multi-tenant ticket management with organization isolation
- Role-based access control (Admin, Agent, Customer)
- Self-service user registration with email/password
- Ticket creation with subject, description, priority, and tags
- Ticket list with filtering and sorting capabilities
- Ticket detail view with comments and SLA tracking
- SLA monitoring and breach detection
- Real-time comment system
- Notification service with email templates
- Database abstraction layer (Firestore, extensible to other databases)
- JWT-based authentication
- Comprehensive OpenAPI documentation
- Audit logging for compliance

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20 or higher**: [Download here](https://nodejs.org/)
- **npm**: Comes with Node.js
- **Firebase CLI**: Install globally
  ```bash
  npm install -g firebase-tools
  ```
- **Git**: For version control

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd helpdesk
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in the required values (see [Environment Variables](#environment-variables)).

4. **Firebase Setup** (required for database):
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Generate a service account key:
     - Go to Project Settings → Service Accounts
     - Click "Generate New Private Key"
     - Save the JSON file securely in your project directory
   - Update `.env` with your Firebase project ID and service account path

5. **Seed Initial Admin User** (optional but recommended):
   ```bash
   npm run seed:admin
   ```
   
   This creates an admin user:
   - Email: `moty.moshin@gmail.com`
   - Password: `12345678`
   - Role: `admin`

## Local Development

### Quick Start

```bash
npm run dev
```

The server will start on port 3000 (or the port specified in your `.env` file).

You should see:
```
[INFO]: Starting HelpDesk application...
[INFO]: Configuration loaded:
[INFO]:   - Environment: development
[INFO]:   - Port: 3000
[INFO]:   - CORS Origin: http://localhost:3000
[INFO]: Firestore connection established
[INFO]: Server ready on port 3000
```

### Development Features

- **Hot Reload**: The dev server uses `tsx watch` for automatic reloading on file changes
- **Type Checking**: TypeScript errors are shown in real-time
- **Logging**: Debug-level logs are enabled in development mode

### Accessing the Application

- **API Base URL**: `http://localhost:3000/api/v1`
- **Health Check**: `http://localhost:3000/health`
- **API Documentation**: `http://localhost:3000/api-docs` (Swagger UI)

## Frontend Development

The frontend is a React + TypeScript application built with Vite, located in the `web/` directory.

### Quick Start

```bash
cd web
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` with proxy to the backend API.

### Frontend Structure

```
web/
├── src/
│   ├── contexts/       # React contexts (Auth)
│   ├── pages/          # Page components (Login, Register, Home)
│   ├── firebase.ts     # Firebase client config
│   ├── App.tsx         # Main app component with routing
│   └── main.tsx        # Application entry point
├── vite.config.ts      # Vite configuration
└── package.json
```

### Frontend Environment Variables

Create `web/.env` with:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

### Features

- **User Registration**: Self-service signup at `/register`
- **Login/Logout**: Authentication with Firebase Auth
- **Protected Routes**: Redirect to login if not authenticated
- **Error Handling**: Display API validation errors in UI

## Firebase Emulators

For local development without connecting to production Firebase, use the Firebase Emulator Suite:

### Setup Emulators

1. **Initialize emulators** (if not already done):
   ```bash
   firebase init emulators
   ```
   
   Select:
   - Authentication Emulator
   - Firestore Emulator
   - Storage Emulator (optional)

2. **Start emulators**:
   ```bash
   firebase emulators:start
   ```

3. **Update your `.env`** to use emulator:
   ```env
   FIRESTORE_EMULATOR_HOST=localhost:8080
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

### Emulator UI

Access the Firebase Emulator UI at `http://localhost:4000` to:
- View Firestore data
- Inspect authentication users
- Test security rules
- View logs

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Test Coverage

```bash
npm run test:coverage
```

Tests are written using Vitest and cover:
- Database adapters (Firestore)
- Repository implementations
- Service layer logic
- API endpoints
- Middleware functions

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Run tests with UI |
| `npm run seed:admin` | Seed initial admin user (moty.moshin@gmail.com / 12345678) |

## API Documentation

### Swagger UI

Interactive API documentation is available at `http://localhost:3000/api-docs` when the server is running.

The OpenAPI 3.0 specification is located at `docs/api/openapi.yaml`.

### API Endpoints

| Method | Path                          | Description                                    | Auth |
|--------|-------------------------------|------------------------------------------------|------|
| GET    | /health                       | Health check                                   | No   |
| GET    | /api-docs                     | Swagger UI documentation                       | No   |
| POST   | /api/v1/auth/register         | Register new user (self-service)               | No   |
| POST   | /api/v1/tickets               | Create a new ticket                            | Yes  |
| GET    | /api/v1/tickets               | List tickets with filters                      | Yes  |
| GET    | /api/v1/tickets/:id           | Get ticket by ID                               | Yes  |
| PATCH  | /api/v1/tickets/:id           | Update ticket (agent/admin)                    | Yes  |
| PATCH  | /api/v1/tickets/:id/assign    | Assign ticket to agent (agent/admin)           | Yes  |
| POST   | /api/v1/tickets/:id/comments  | Add comment to ticket                          | Yes  |
| GET    | /api/v1/tickets/:id/comments  | List comments for ticket                       | Yes  |
| POST   | /api/v1/tickets/:id/attachments | Upload file attachment                       | Yes  |
| POST   | /api/v1/users                 | Create a new user (admin)                      | Yes  |
| GET    | /api/v1/users                 | List users in organization (admin)             | Yes  |
| GET    | /api/v1/users/me              | Get current authenticated user                 | Yes  |
| POST   | /api/v1/admin/sla-rules       | Create SLA rule (admin)                        | Yes  |
| GET    | /api/v1/admin/sla-rules       | List SLA rules (admin)                         | Yes  |
| GET    | /api/v1/admin/sla-rules/:id   | Get SLA rule by ID (admin)                     | Yes  |
| PATCH  | /api/v1/admin/sla-rules/:id   | Update SLA rule (admin)                        | Yes  |
| DELETE | /api/v1/admin/sla-rules/:id   | Delete SLA rule (admin)                        | Yes  |
| GET    | /api/v1/admin/audit-logs      | List audit logs with filters (admin)           | Yes  |

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

### Required Variables

```env
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database - Firestore
DB_TYPE=firestore
FIRESTORE_PROJECT_ID=your-firebase-project-id
FIRESTORE_DATABASE_ID=(default)
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# CORS - Comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# User Registration
DEFAULT_ORGANIZATION_ID=org-default

# Email/SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@helpdesk.com
```

### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, staging, production) | `development` |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `FIRESTORE_PROJECT_ID` | Firebase project ID | `my-helpdesk-123` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account JSON | `./serviceAccountKey.json` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket for attachments | `my-helpdesk-123.appspot.com` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `DEFAULT_ORGANIZATION_ID` | Default organization for self-registered users | `org-default` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | `user@gmail.com` |
| `SMTP_PASSWORD` | SMTP password or app password | `****` |
| `SMTP_FROM` | Default sender email address | `noreply@helpdesk.com` |

### Firebase Emulator Variables

When using Firebase emulators, add:

```env
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### Security Notes

- **Never commit `.env` files** to version control
- Keep `.env.example` updated with new variables (without sensitive values)
- Use different credentials for development, staging, and production
- For production, use environment variables from your hosting platform (Firebase Functions config, Cloud Run secrets, etc.)


## Database Configuration

### Firestore Setup

The application uses Firebase Admin SDK for Firestore integration:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely
3. Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` to the path of your service account JSON file
4. Alternatively, for Cloud Functions/Firebase environments, omit `FIREBASE_SERVICE_ACCOUNT_PATH` to use default credentials

The `FirestoreAdapter` implements the `IDatabaseAdapter` interface with connection pooling:
- Automatically reuses existing Firebase app instances
- Supports service account authentication or default credentials
- Provides health checks and transaction support

## Database Repository Pattern

The application uses the Repository pattern for database abstraction, allowing for database-agnostic code.

### Interfaces

- `IRepository<T>` - Generic CRUD interface (create, findById, findAll, update, delete, findOne, count)
- `IDatabaseAdapter` - Database connection interface (connect, disconnect, healthCheck, getCollection, transaction)
- `IQueryBuilder<T>` - Query builder for filtering and sorting
- `ITransaction` - Transaction interface for atomic operations

### Usage

```typescript
import { Repository, FirestoreAdapter } from './shared/database/index.js';

// Initialize the database adapter
const dbAdapter = new FirestoreAdapter();
await dbAdapter.connect();

class TicketRepository extends Repository<Ticket> {
  protected toDomain(doc: any): Ticket {
    // Transform database document to domain model
  }
  
  protected toDatabase(entity: Partial<Ticket>): any {
    // Transform domain model to database document
  }
}

// Create repository instance
const ticketRepo = new TicketRepository(dbAdapter, 'tickets');
```

## Logging & Error Handling

The application uses Winston for structured, configurable logging with the following features:

### Configuration
- **LOG_LEVEL environment variable**: Controls logging level (debug, info, warn, error)
- **Environment-aware formatting**: JSON format for production/non-development environments, human-readable format for development
- **Base metadata**: All logs include service name and environment information
- **Lifecycle logging**: Application startup and shutdown events are logged with configuration summary

### Log Levels
- `debug` - Development debugging information
- `info` - General informational messages, startup/shutdown events
- `warn` - Warning messages
- `error` - Error messages with stack traces (in development)

### Startup Logging
The application logs startup events with configuration summary (non-sensitive information):
```json
{
  "message": "Application starting up",
  "config": {
    "nodeEnv": "development",
    "logLevel": "info",
    "port": 3000,
    "dbType": "firestore",
    "service": "helpdesk-api"
  }
}
```

### Request Correlation
Each request is assigned a unique correlation ID to enable end-to-end tracing:

- **X-Request-Id header**: Clients can provide their own correlation ID via the `X-Request-Id` header
- **Auto-generation**: If no header is provided, a UUID is automatically generated
- **Response header**: The correlation ID is returned in the `X-Request-Id` response header
- **Request logging**: All request start/end logs include the correlation ID for traceability

Example request/response flow:
```bash
# Request with correlation ID
curl -H "X-Request-Id: my-custom-id-123" http://localhost:3000/api/v1/tickets

# Response includes the same correlation ID
HTTP/1.1 200 OK
X-Request-Id: my-custom-id-123
```

### Enhanced Request Logging
The application provides comprehensive request logging with structured metadata:

**Request Start Logs** (`info` level):
- HTTP method, path, IP address, user agent
- Unique correlation ID for end-to-end tracing
- Consistent structured format for search and analysis

**Request Completion Logs** (variable level):
- All request start metadata plus status code, duration
- Response size when available (from Content-Length header)
- Smart log levels: `info` for 2xx/3xx, `warn` for 4xx, `error` for 5xx

**Shared Log Context**:
- Reusable helper functions (`createRequestLogContext`, `createRequestCompletionLogContext`)
- Consistent metadata structure across all request logs
- Type-safe interfaces (`RequestLogContext`, `RequestCompletionLogContext`)

Example log output:
```json
{
  "level": "info",
  "message": "Incoming request",
  "method": "GET",
  "path": "/api/v1/tickets",
  "ip": "::1",
  "userAgent": "curl/7.68.0",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
{
  "level": "info",
  "message": "Request completed",
  "method": "GET",
  "path": "/api/v1/tickets",
  "ip": "::1",
  "userAgent": "curl/7.68.0",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "statusCode": 200,
  "duration": "45ms",
  "responseSize": 1234
}
```

### Standardized Error Logging
The application provides comprehensive error logging with structured metadata for consistent error tracking:

**Error Handler Logging**:
- **AppError instances**: Logs include error code, details, and request metadata when available
- **Unknown errors**: Include full stack traces and request metadata for debugging
- **Context awareness**: All error logs include correlation ID and request information for traceability

**Validation Middleware Logging**:
- **Warning-level logs**: Validation failures are logged as warnings (user-caused, not server failures)
- **Structured validation details**: Include specific validation errors and attempted input values
- **Request metadata**: All validation logs include correlation ID, path, method for context

**Error Log Context Types**:
- `ErrorLogContext`: Extends request context with error code, details, and stack trace
- `ValidationErrorLogContext`: Extends request context with validation failure details
- Helper functions: `createErrorLogContext`, `createValidationErrorLogContext`

Example error logging output:
```json
{
  "level": "error",
  "message": "AppError: Invalid email format",
  "method": "POST",
  "path": "/api/v1/auth/register",
  "ip": "::1",
  "userAgent": "curl/7.68.0",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "VALIDATION_ERROR",
  "errorDetails": { "field": "email", "value": "invalid-email" }
}
```

**Validation Middleware Usage**:
```typescript
import { validateBody, validateQuery, validateParams } from '../shared/middleware/validation.middleware.js';
import { createUserSchema, paginationSchema } from '../shared/validation/schemas.js';

// Validate request body against Zod schema
app.post('/users', validateBody(createUserSchema), controller);

// Validate query parameters
app.get('/users', validateQuery(paginationSchema), controller);

// Validate path parameters
app.get('/users/:id', validateParams(userParamsSchema), controller);
```

### Authentication and Authorization Logging
The application provides comprehensive logging for authentication and authorization events with structured metadata:

**Authentication Success Logging** (`info` level):
- User ID, email, and role information
- Request metadata including correlation ID for traceability
- Structured context for consistent search and monitoring

**Authentication Failure Logging** (`warn` level):
- Failure reason with request metadata
- Correlation ID and request details for debugging
- Consistent structure for security monitoring

**Authorization (RBAC) Success Logging** (`info` level):
- User role and required roles for the endpoint
- Request metadata for audit trail
- Successful access attempts with full context

**Authorization (RBAC) Failure Logging** (`warn` level):
- User role, required roles, and request metadata
- Detailed context for security audit and troubleshooting
- Clear indication of insufficient permissions

**Auth Log Context Types**:
- `AuthSuccessLogContext`: User authentication success with user details
- `AuthFailureLogContext`: Authentication failure with reason
- `RbacSuccessLogContext`: Authorization success with role information
- `RbacFailureLogContext`: Authorization failure with role mismatch details
- Helper functions: `createAuthSuccessLogContext`, `createAuthFailureLogContext`, `createRbacSuccessLogContext`, `createRbacFailureLogContext`

Example authentication and authorization logging:
```json
{
  "level": "info",
  "message": "User authentication successful",
  "method": "GET",
  "path": "/api/v1/tickets",
  "ip": "::1",
  "userAgent": "curl/7.68.0",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "email": "user@example.com",
  "role": "agent"
}
{
  "level": "warn",
  "message": "Authorization failed: insufficient permissions",
  "method": "DELETE",
  "path": "/api/v1/admin/users",
  "ip": "::1",
  "userAgent": "curl/7.68.0",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "userRole": "agent",
  "requiredRoles": ["admin"]
}
```

### Firestore Adapter Logging
The application provides structured logging for Firestore database operations with consistent metadata:

**Connection Logging** (`info` level for success, `error` level for failures):
- Successful connections log operation name and outcome
- Failed connections include error messages and details
- Structured context for database health monitoring

**Health Check Logging** (`info` level for success, `error` level for failures):
- Regular health check results with operation outcome
- Connection status and connectivity test results
- Detailed error information when health checks fail

**Disconnect Logging** (`info` level for success, `error` level for failures):
- Clean disconnection events with operation outcome
- Failed disconnection attempts with error details
- Consistent structure for database lifecycle tracking

**Firestore Log Context Type**:
- `FirestoreLogContext`: Includes operation name, outcome (success/failure), error message, and additional details
- Helper function: `createFirestoreLogContext` for consistent database operation logging

Example Firestore adapter logging:
```json
{
  "level": "info",
  "message": "Firestore connection established",
  "operation": "connect",
  "outcome": "success"
}
{
  "level": "info",
  "message": "Firestore health check passed",
  "operation": "health_check",
  "outcome": "success"
}
{
  "level": "error",
  "message": "Firestore health check failed",
  "operation": "health_check",
  "outcome": "failure",
  "error": "Connection timeout",
  "details": { "error": "..." }
}
```

### Shutdown Handling
The application includes graceful shutdown handling for:
- SIGTERM signals
- SIGINT signals (Ctrl+C)
- Uncaught exceptions
- Unhandled promise rejections

All errors return a consistent JSON format:
```json
{
  "code": "ERROR_CODE",
  "message": "Error message",
  "details": {}
}
```

## Notification Service

The application includes a notification service for sending emails with support for both HTML and plain text.

### Features

- Provider-based abstraction (`INotificationProvider` interface)
- Pre-built email templates for common scenarios:
  - Ticket Created
  - Ticket Replied
  - Ticket Resolved
- Support for HTML and plain text emails

### Usage

```typescript
import { NotificationService } from './shared/notifications/NotificationService.js';
import { INotificationProvider } from './shared/notifications/interfaces/INotificationProvider.js';

// Initialize with a provider (e.g., SMTP/SendGrid)
const provider: INotificationProvider = /* your provider */;
const notificationService = new NotificationService(provider);

// Send a custom email
await notificationService.sendEmail(
  'user@example.com',
  'Subject',
  '<p>HTML body</p>',
  true
);

// Use built-in templates
await notificationService.sendTicketCreatedEmail(
  'agent@example.com',
  'TICKET-123',
  'Login issue',
  'John Doe'
);
```

## Authentication & Authorization

### Authentication

The application uses Firebase Admin SDK for JWT-based authentication.

### Setup

1. Install Firebase Admin SDK (already included)
2. Initialize Firebase in your application (automatically handled)
3. Set up Firebase Authentication in your Firebase project

### Using Auth Middleware

Protect routes with the `authMiddleware`:

```typescript
import { authMiddleware } from './shared/middleware/auth.middleware.js';

app.get('/protected', authMiddleware, (req, res) => {
  // req.user contains authenticated user context
  const { userId, email, role, organizationId } = req.user;
  res.json({ message: 'Authenticated!' });
});
```

The middleware:
- Verifies Firebase JWT tokens in the `Authorization: Bearer <token>` header
- Extracts user claims (userId, email, role, organizationId)
- Attaches user context to `req.user`
- Returns 401 for missing/invalid tokens

## Authorization (RBAC)

The application supports role-based access control (RBAC) using the `requireRole` middleware factory.

### Using RBAC Middleware

Restrict routes to specific user roles:

```typescript
import { authMiddleware, requireRole } from './shared/middleware/index.js';
import { UserRole } from './domain/models/User.js';

// Single role requirement
app.get('/admin', authMiddleware, requireRole(UserRole.ADMIN), handler);

// Multiple roles (OR logic - user needs at least one role)
app.post('/tickets', 
  authMiddleware, 
  requireRole(UserRole.AGENT, UserRole.ADMIN), 
  handler
);
```

The middleware:
- Checks if authenticated user has one of the required roles
- Returns 403 for insufficient permissions
- Logs authorization failures for security auditing
- Supports multiple role requirements with OR logic

## Deployment

### Firebase

See [Firebase Deployment Guide](docs/deployment/firebase-deployment.md) for detailed instructions on deploying to Firebase.

Quick deployment:
```bash
./scripts/deploy-firebase.sh
```

### Other Platforms

The application is cloud-agnostic and can be deployed to:
- **AWS**: Lambda + API Gateway or ECS
- **Google Cloud**: Cloud Run or App Engine
- **Azure**: App Service or Container Instances
- **SAP BTP**: Cloud Foundry (see migration guide when available)

See the deployment documentation in `docs/deployment/` for platform-specific guides.


## Background Jobs

### SLA Monitoring Job

The application includes an automated SLA monitoring job that periodically checks for SLA breaches:

**Schedule**: Runs every 5 minutes

**Functionality**:
- Queries all tickets with status NEW, OPEN, or PENDING
- Checks SLA timers using the SLAService
- Updates the `breached` flag when SLA violations are detected
- Logs all breach events with ticket details for tracking
- Handles errors gracefully with retry on next cycle

**Logging**:
- Execution start/completion with duration
- Number of tickets checked and breaches detected
- Individual breach warnings with ticket context
- Error summary for failed ticket checks

The job is automatically started when the application server starts and requires no manual configuration.


## Domain Models

### Ticket
Represents a customer support ticket with the following properties:
- Status tracking (NEW, OPEN, PENDING, RESOLVED, CLOSED)
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- SLA timer tracking
- Organization and user associations

### User
Represents a user in the system with roles:
- CUSTOMER - Can create and view their tickets
- AGENT - Can respond to and manage tickets
- ADMIN - Full system access

### Comment
Represents a comment/conversation on a ticket:
- Public/private visibility control
- Author tracking
- Optional file attachments
- Timestamp-based ordering

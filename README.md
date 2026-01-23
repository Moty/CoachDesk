# HelpDesk

Cloud-agnostic enterprise-ready customer support and ticketing platform.

## Features

- Multi-tenant ticket management with organization isolation
- Role-based access control (Admin, Agent, Customer)
- SLA monitoring and breach detection
- Real-time comment system
- Notification service with email templates
- Database abstraction layer (Firestore, extensible to other databases)
- JWT-based authentication

## Quick Start

```bash
npm install
npm run dev
```

The server will start on port 3000 by default (configurable via `PORT` environment variable).

## Available Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

## API Endpoints

| Method | Path                          | Description                                    |
|--------|-------------------------------|------------------------------------------------|
| GET    | /health                       | Health check                                   |
| POST   | /api/v1/tickets               | Create a new ticket (requires auth)            |
| GET    | /api/v1/tickets               | List tickets with pagination (requires auth)   |
| GET    | /api/v1/tickets/:id           | Get ticket by ID (requires auth)               |
| PATCH  | /api/v1/tickets/:id           | Update ticket (requires agent/admin role)      |
| PATCH  | /api/v1/tickets/:id/assign    | Assign ticket to agent (requires agent/admin)  |
| POST   | /api/v1/tickets/:id/comments  | Add comment to ticket (requires auth)          |
| GET    | /api/v1/tickets/:id/comments  | List comments for ticket (requires auth)       |
| POST   | /api/v1/users                 | Create a new user (requires admin role)        |
| GET    | /api/v1/users                 | List users in organization (requires admin)    |
| GET    | /api/v1/admin/audit-logs      | List audit logs with filters (requires admin)  |

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DB_TYPE=firestore
FIRESTORE_PROJECT_ID=your-project-id
FIRESTORE_DATABASE_ID=(default)
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json

# CORS
CORS_ORIGIN=http://localhost:3000

# Email/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@coachdesk.com
```

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

The application uses Winston for structured logging with the following levels:
- `debug` - Development debugging information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages with stack traces (in development)

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

## Authentication

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

# Cloud Portability Architecture

## Overview

The HelpDesk application is designed with cloud portability as a core principle. This document explains the architectural patterns and design decisions that enable deployment across multiple cloud platforms (Firebase/GCP, SAP BTP, AWS, Azure) with minimal code changes.

## Table of Contents

- [Architecture Layers](#architecture-layers)
- [Repository Pattern](#repository-pattern)
- [Event-Driven Architecture](#event-driven-architecture)
- [Multi-Tenancy Design](#multi-tenancy-design)
- [SLA Calculation Logic](#sla-calculation-logic)
- [Technology Choices](#technology-choices)
- [Security Architecture](#security-architecture)
- [Design Principles](#design-principles)

## Architecture Layers

The application follows a clean architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                  API Layer                      │
│  (Routes, Controllers, Middleware)              │
│  - Express.js routing                           │
│  - Request validation                           │
│  - Response formatting                          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                Domain Layer                     │
│  (Business Logic, Services, Models)             │
│  - Ticket lifecycle management                  │
│  - SLA calculation                              │
│  - Comment handling                             │
│  - Audit logging                                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│             Infrastructure Layer                │
│  (Database, Storage, External Services)         │
│  - Repository implementations                   │
│  - Database adapters (Firestore, HANA)          │
│  - Storage adapters (Firebase, SDM)             │
│  - Notification providers (SMTP, SendGrid)      │
└─────────────────────────────────────────────────┘
```

### Layer Responsibilities

**API Layer:**
- HTTP request handling
- Input validation
- Authentication/authorization enforcement
- Response formatting
- Error handling
- Rate limiting

**Domain Layer:**
- Business rules and logic
- Data validation
- State transitions (ticket status)
- SLA calculations
- Audit trail generation
- Cloud-agnostic code

**Infrastructure Layer:**
- Database operations
- File storage
- Email delivery
- External API integrations
- Cloud-specific implementations

### Dependency Rule

Dependencies flow inward: API → Domain → Infrastructure adapters (via interfaces)

- API Layer depends on Domain Layer
- Domain Layer defines interfaces (no dependencies on Infrastructure)
- Infrastructure Layer implements interfaces defined by Domain Layer

This enables:
- **Testability**: Mock infrastructure in tests
- **Portability**: Swap infrastructure without changing business logic
- **Maintainability**: Changes isolated to specific layers

## Repository Pattern

The application uses the Repository Pattern to abstract database operations.

### Interface Definition

```typescript
// src/shared/database/interfaces/IRepository.ts
export interface IRepository<T> {
  create(entity: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: QueryFilters): Promise<T[]>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findOne(filters: QueryFilters): Promise<T | null>;
  count(filters?: QueryFilters): Promise<number>;
}
```

### Database Adapter Interface

```typescript
// src/shared/database/interfaces/IDatabaseAdapter.ts
export interface IDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
  getCollection(name: string): any;
  transaction<T>(callback: (context: ITransaction) => Promise<T>): Promise<T>;
}
```

### Implementation Examples

**Firestore Implementation:**
```typescript
export class FirestoreAdapter implements IDatabaseAdapter {
  private db: Firestore | null = null;
  
  async connect(): Promise<void> {
    // Firebase-specific connection logic
  }
  
  getCollection(name: string): CollectionReference {
    return this.db!.collection(name);
  }
}
```

**HANA Implementation (Future):**
```typescript
export class HANAAdapter implements IDatabaseAdapter {
  private connection: hana.Connection | null = null;
  
  async connect(): Promise<void> {
    // HANA-specific connection logic
  }
  
  getCollection(name: string): HANACollection {
    return new HANACollection(this.connection!, name);
  }
}
```

### Benefits

- **Cloud Agnostic**: Business logic unaware of database technology
- **Swappable**: Replace database by implementing interface
- **Testable**: Mock repositories in unit tests
- **Consistent API**: Same methods regardless of backend

## Event-Driven Architecture

The application uses an event-driven approach for asynchronous operations and cross-cutting concerns.

### Audit Logging

Every write operation generates an audit event:

```typescript
// After ticket creation
await auditLogService.log({
  organizationId: ticket.organizationId,
  userId: req.user.userId,
  action: 'ticket.created',
  resourceType: 'ticket',
  resourceId: ticket.id,
  changes: { status: 'new' },
});
```

### SLA Monitoring Job

Background job runs every 5 minutes to check SLA compliance:

```typescript
export class SLAMonitoringJob {
  start() {
    setInterval(async () => {
      await this.checkSLABreaches();
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  private async checkSLABreaches() {
    // Query active tickets
    // Check SLA timers
    // Update breach flags
    // Log violations
  }
}
```

### Event Bus (Future Enhancement)

For multi-instance deployments, replace in-memory events with message queue:

**Firebase:** Cloud Pub/Sub
**SAP BTP:** Event Mesh
**AWS:** SQS/SNS
**Azure:** Service Bus

```typescript
// Publish event
await eventBus.publish('ticket.created', {
  ticketId: ticket.id,
  organizationId: ticket.organizationId,
});

// Subscribe to events
eventBus.subscribe('ticket.created', async (event) => {
  await notificationService.notifyAgents(event);
});
```

## Multi-Tenancy Design

The application supports multiple organizations (tenants) in a shared infrastructure.

### Organization Isolation

**Database Level:**
- All queries filtered by `organizationId`
- Composite indexes include `organizationId`
- Security rules enforce organization boundaries

**API Level:**
- Authenticated users belong to one organization
- Middleware extracts `organizationId` from JWT
- Queries automatically scoped to user's organization

**Example:**
```typescript
// Middleware extracts organization from token
req.user = {
  userId: '...',
  email: '...',
  organizationId: 'org_123',  // Extracted from JWT
  role: 'agent'
};

// Repository automatically filters by organization
const tickets = await ticketRepo.findAll({
  organizationId: req.user.organizationId,
  status: 'open'
});
```

### Firestore Security Rules

```javascript
match /tickets/{ticketId} {
  allow read, write: if request.auth != null 
    && belongsToOrganization(resource.data.organizationId);
}

function belongsToOrganization(orgId) {
  return getOrganizationId() == orgId;
}
```

### Benefits

- **Data Isolation**: Organizations cannot access each other's data
- **Resource Efficiency**: Shared infrastructure reduces costs
- **Scalability**: Add tenants without infrastructure changes
- **Compliance**: Clear data boundaries for regulations

## SLA Calculation Logic

SLA (Service Level Agreement) tracking is a core feature.

### SLA Timer Structure

```typescript
export interface SLATimer {
  firstResponseAt?: Date;      // When first response was provided
  firstResponseDue?: Date;      // Deadline for first response
  resolvedAt?: Date;            // When ticket was resolved
  resolutionDue?: Date;         // Deadline for resolution
  breached: boolean;            // Whether any SLA was missed
}
```

### SLA Rule Configuration

Admins configure SLA rules per priority:

```typescript
export interface SLARule {
  id: string;
  organizationId: string;
  priority: TicketPriority;     // low, medium, high, urgent
  firstResponseMinutes: number;  // e.g., 60 minutes
  resolutionMinutes: number;     // e.g., 480 minutes
  isActive: boolean;
}
```

### SLA Calculation Flow

1. **Ticket Creation:**
   - Look up SLA rule for ticket priority
   - Calculate `firstResponseDue` = createdAt + firstResponseMinutes
   - Calculate `resolutionDue` = createdAt + resolutionMinutes
   - Set `breached = false`

2. **First Response:**
   - Set `firstResponseAt` when agent first replies
   - If `firstResponseAt > firstResponseDue`: set `breached = true`

3. **Resolution:**
   - Set `resolvedAt` when ticket status changes to RESOLVED
   - If `resolvedAt > resolutionDue`: set `breached = true`

4. **Background Monitoring:**
   - Job runs every 5 minutes
   - Checks tickets where `firstResponseAt === null && now > firstResponseDue`
   - Checks tickets where `resolvedAt === null && now > resolutionDue`
   - Sets `breached = true` and logs violations

### Implementation

```typescript
export class SLAService {
  async calculateSLATimers(ticket: Ticket): Promise<SLATimer> {
    const slaRule = await this.getSLARule(
      ticket.organizationId,
      ticket.priority
    );
    
    if (!slaRule) {
      return { breached: false };
    }
    
    const firstResponseDue = new Date(
      ticket.createdAt.getTime() + slaRule.firstResponseMinutes * 60000
    );
    
    const resolutionDue = new Date(
      ticket.createdAt.getTime() + slaRule.resolutionMinutes * 60000
    );
    
    return {
      firstResponseDue,
      resolutionDue,
      breached: false,
    };
  }
  
  async checkSLABreach(ticket: Ticket): Promise<boolean> {
    const now = new Date();
    const timers = ticket.slaTimers;
    
    if (!timers) return false;
    
    // Check first response SLA
    if (!timers.firstResponseAt && timers.firstResponseDue) {
      if (now > timers.firstResponseDue) {
        return true;
      }
    }
    
    // Check resolution SLA
    if (!timers.resolvedAt && timers.resolutionDue) {
      if (now > timers.resolutionDue) {
        return true;
      }
    }
    
    return false;
  }
}
```

## Technology Choices

### Core Stack

| Technology | Rationale |
|------------|-----------|
| **TypeScript** | Type safety, better IDE support, reduces runtime errors |
| **Node.js 20** | LTS version, widespread cloud support, async-first |
| **Express.js** | Mature, simple, middleware ecosystem, cloud-agnostic |
| **Winston** | Structured logging, multiple transports, production-ready |
| **Vitest** | Fast, ESM-native, good developer experience |

### Why TypeScript?

- Compile-time type checking prevents common errors
- Better refactoring support
- Self-documenting code via interfaces
- Excellent IDE integration
- Transpiles to standard JavaScript (runs anywhere)

### Why Express.js over Framework X?

- **Simplicity**: Minimal abstractions, easy to understand
- **Portability**: Runs on any Node.js host (Lambda, Cloud Functions, Cloud Run, Cloud Foundry)
- **Ecosystem**: Vast middleware library
- **Control**: No framework lock-in, migrate easily

### Database Choice

**Firestore (Primary):**
- Serverless, auto-scaling
- Real-time capabilities (future feature)
- Strong consistency
- Free tier for development
- Easy local emulation

**Abstraction enables:**
- HANA Cloud (SAP BTP)
- PostgreSQL (AWS RDS, Azure Database)
- MongoDB (any cloud)

### Authentication Choice

**Firebase Admin SDK:**
- Industry-standard JWT
- Built-in token verification
- User management APIs
- Free tier

**Abstraction enables:**
- XSUAA (SAP BTP)
- AWS Cognito
- Azure AD
- Auth0

## Security Architecture

### Authentication & Authorization

**Authentication Flow:**
1. Client obtains JWT token (Firebase Auth)
2. Client sends token in `Authorization: Bearer <token>` header
3. `authMiddleware` verifies token signature
4. Middleware extracts user claims (userId, role, organizationId)
5. Request proceeds with `req.user` populated

**Authorization Flow:**
1. `requireRole` middleware checks user role
2. Compares against required roles for endpoint
3. Returns 403 if insufficient permissions
4. Logs authorization failures for audit

### Role-Based Access Control (RBAC)

Three roles with hierarchical permissions:

| Role | Permissions |
|------|-------------|
| **Customer** | Create tickets, view own tickets, add comments |
| **Agent** | All customer permissions + view all org tickets, update tickets, assign tickets |
| **Admin** | All agent permissions + manage users, configure SLA rules, view audit logs |

### Data Security

**Encryption:**
- HTTPS/TLS for all API communications
- Database encryption at rest (managed by cloud provider)
- Credentials stored in environment variables, never in code

**Input Validation:**
- Request body validation using middleware
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

**Rate Limiting:**
- Global: 100 requests / 15 minutes per IP
- Per-user: 200 requests / 15 minutes per authenticated user
- Prevents DoS attacks

### Security Headers

```typescript
helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true },
  contentSecurityPolicy: { /* ... */ },
  noSniff: true,
  frameguard: { action: 'deny' }
})
```

### Audit Logging

All sensitive operations logged:
- User authentication attempts
- Authorization failures
- Data modifications (create, update, delete)
- Admin actions

Logs include:
- Timestamp
- User ID
- Action
- Resource type and ID
- Changes made
- Request metadata (IP, user agent)

## Design Principles

### 1. Dependency Inversion

High-level modules (business logic) do not depend on low-level modules (infrastructure). Both depend on abstractions (interfaces).

**Example:**
```typescript
// Domain layer defines interface
interface INotificationProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

// Infrastructure implements interface
class SMTPProvider implements INotificationProvider {
  async sendEmail(...) { /* SMTP logic */ }
}

class SendGridProvider implements INotificationProvider {
  async sendEmail(...) { /* SendGrid logic */ }
}

// Domain layer uses interface
class NotificationService {
  constructor(private provider: INotificationProvider) {}
  
  async notify(...) {
    await this.provider.sendEmail(...);
  }
}
```

### 2. Single Responsibility

Each class/module has one reason to change.

- `TicketRepository`: Only changes if database layer changes
- `TicketService`: Only changes if ticket business rules change
- `TicketController`: Only changes if API contract changes

### 3. Open/Closed Principle

Open for extension, closed for modification.

**Example:** Adding a new database without modifying existing code:
```typescript
// Add new adapter
class PostgresAdapter implements IDatabaseAdapter {
  // Implementation
}

// Update factory
class DatabaseAdapterFactory {
  static create() {
    switch (process.env.DB_TYPE) {
      case 'firestore': return new FirestoreAdapter();
      case 'hana': return new HANAAdapter();
      case 'postgres': return new PostgresAdapter(); // New!
      default: throw new Error('Unknown DB type');
    }
  }
}
```

### 4. Interface Segregation

Clients should not depend on interfaces they don't use.

Instead of one large `IDatabase` interface, we have:
- `IDatabaseAdapter` (connection, transactions)
- `IRepository<T>` (CRUD operations)
- `IQueryBuilder<T>` (filtering, sorting)
- `ITransaction` (atomic operations)

### 5. Explicit Dependencies

Dependencies are injected, not hidden.

**Bad:**
```typescript
class TicketService {
  private repo = new TicketRepository(); // Hidden dependency!
}
```

**Good:**
```typescript
class TicketService {
  constructor(private repo: IRepository<Ticket>) {} // Explicit!
}
```

## Conclusion

This architecture prioritizes:

1. **Cloud Portability**: Abstract cloud-specific services behind interfaces
2. **Testability**: Mock dependencies for fast, isolated tests
3. **Maintainability**: Clear separation of concerns, single responsibility
4. **Security**: Defense in depth with authentication, authorization, audit logging
5. **Scalability**: Stateless design, horizontal scaling, multi-tenancy

The combination of clean architecture, repository pattern, and dependency inversion enables deployment to any cloud platform with minimal refactoring.

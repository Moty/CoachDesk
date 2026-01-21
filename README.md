# HelpDesk

Cloud-agnostic enterprise-ready customer support and ticketing platform.

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
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## API Endpoints

| Method | Path      | Description        |
|--------|-----------|-------------------|
| GET    | /health   | Health check      |

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
```

## Database

### Firestore Adapter

The application includes a Firestore database adapter for Google Cloud Firestore.

**Setup:**

1. Create a Firebase/GCP project
2. Download service account credentials JSON file
3. Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` to the credentials file path
4. Or use Application Default Credentials in GCP environments (omit the path)

**Features:**
- Connection pooling via Firebase Admin SDK
- Health check monitoring
- Transaction support
- Collection-based operations (create, read, update, delete)
- Query filtering, sorting, and pagination

## Database Repository Pattern

The application uses the Repository pattern for database abstraction, allowing for database-agnostic code.

### Interfaces

- `IRepository<T>` - Generic CRUD interface (create, findById, findAll, update, delete, findOne, count)
- `IDatabaseAdapter` - Database connection interface (connect, disconnect, healthCheck, getCollection, transaction)
- `IQueryBuilder<T>` - Query builder for filtering and sorting
- `ITransaction` - Transaction interface for atomic operations

### Usage

```typescript
import { Repository } from './shared/database/index.js';

class TicketRepository extends Repository<Ticket> {
  protected toDomain(doc: any): Ticket {
    // Transform database document to domain model
  }
  
  protected toDatabase(entity: Partial<Ticket>): any {
    // Transform domain model to database document
  }
}
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

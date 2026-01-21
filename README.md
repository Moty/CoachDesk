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
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

## API Endpoints

| Method | Path      | Description        |
|--------|-----------|-------------------|
| GET    | /health   | Health check      |

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV=development
PORT=3000
DB_TYPE=firestore
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/serviceAccount.json
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


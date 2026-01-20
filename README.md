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

## API Endpoints

| Method | Path      | Description        |
|--------|-----------|-------------------|
| GET    | /health   | Health check      |

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV=development
PORT=3000
```

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


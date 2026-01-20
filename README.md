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


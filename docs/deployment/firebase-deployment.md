# Firebase Deployment Guide

## Overview

This guide covers deploying the HelpDesk application to Firebase, including Cloud Functions, Firestore, frontend hosting, and related services.

## Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)

3. **Node.js**: Version 20 or higher (required for Cloud Functions)

4. **Google Cloud SDK** (optional): For advanced configuration

## Initial Setup

### 1. Firebase Login

```bash
firebase login
```

This will open a browser window for authentication.

### 2. Initialize Firebase Project

If not already initialized:

```bash
firebase init
```

Select the following features:
- Firestore
- Functions
- Hosting (if deploying a frontend)

Choose your existing Firebase project or create a new one.

### 3. Configure Service Account

For Firestore access, you need a service account key:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely
4. Set the path in your `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/serviceAccountKey.json
   ```

**⚠️ NEVER commit the service account key to version control!**

## Environment Variables

### Local Development (.env)

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-dev-jwt-secret
FIREBASE_SERVICE_ACCOUNT_KEY=./path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
```

### Production (Firebase)

Set environment variables for Cloud Functions:

```bash
firebase functions:config:set \
  app.jwt_secret="your-production-jwt-secret" \
  app.cors_origin="https://yourdomain.com"
```

Or use Secret Manager (recommended for sensitive values):

```bash
firebase functions:secrets:set JWT_SECRET
```

## Deployment

### Building the Frontend

Before deploying, build the frontend:

```bash
cd web
npm install
npm run build
```

This creates optimized production files in `web/dist/`.

### Automated Deployment

Use the provided deployment script:

```bash
./scripts/deploy-firebase.sh
```

This script will:
1. Build the backend project
2. Build the frontend (web/)
3. Run type checks
4. Run tests
5. Deploy Firestore rules
6. Deploy Firestore indexes
7. Deploy Cloud Functions
8. Deploy frontend hosting (web/dist)

### Manual Deployment

#### Deploy Everything

```bash
# Build frontend first
cd web && npm run build && cd ..

# Deploy all components
firebase deploy
```

#### Deploy Specific Components

**Firestore Rules Only:**
```bash
firebase deploy --only firestore:rules
```

**Firestore Indexes Only:**
```bash
firebase deploy --only firestore:indexes
```

**Cloud Functions Only:**
```bash
firebase deploy --only functions
```

**Frontend Hosting Only:**
```bash
# Build frontend first
cd web && npm run build && cd ..

firebase deploy --only hosting
```

## Firebase Hosting Configuration

### Hosting Setup

The `firebase.json` configuration is set up to:
- Serve the frontend SPA from `web/dist/`
- Proxy `/api/**` requests to the backend Cloud Function
- Handle client-side routing with SPA fallback

```json
{
  "hosting": {
    "public": "web/dist",
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "helpdesk-api",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Frontend Environment Variables

For production, set frontend environment variables in `web/.env.production`:

```env
VITE_API_BASE_URL=https://your-project.web.app
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

The build process automatically uses these values.

### Custom Domain

To use a custom domain:

1. In Firebase Console, go to Hosting → Add custom domain
2. Follow DNS verification steps
3. Update CORS_ORIGIN in backend environment to include your domain:
   ```bash
   firebase functions:config:set app.cors_origin="https://yourdomain.com,https://www.yourdomain.com"
   ```

### Function Entry Point

The application runs as a Cloud Function. Create `index.js` in the functions directory:

```javascript
const functions = require('firebase-functions');
const app = require('./dist/index.js').default;

exports.api = functions.https.onRequest(app);
```

### Memory and Timeout

Configure in `firebase.json`:

```json
{
  "functions": {
    "runtime": "nodejs20",
    "memory": "512MB",
    "timeout": "60s"
  }
}
```

### Cold Start Optimization

- Keep functions warm with scheduled pings
- Use minimum instances for critical endpoints
- Optimize bundle size

## Firestore Security

### Security Rules

The application uses comprehensive security rules defined in `firestore.rules`:

- **Authentication**: All access requires authentication
- **Role-based access**: Customer, Agent, Admin roles enforced
- **Organization isolation**: Users can only access data in their organization
- **Field-level security**: Internal comments restricted to agents/admins

### Testing Security Rules

```bash
firebase emulators:start --only firestore
```

Then run tests against the emulator.

### Deploying Rules

```bash
firebase deploy --only firestore:rules
```

**⚠️ Important:** Test rules thoroughly before deploying to production!

## Firestore Indexes

### Composite Indexes

Indexes are defined in `firestore.indexes.json` for:
- Ticket queries by organization, status, priority, assignee
- Comment queries by ticket
- Audit log queries by organization, user, resource type
- SLA rule queries by organization and priority

### Deploying Indexes

```bash
firebase deploy --only firestore:indexes
```

Index creation can take several minutes. Monitor progress in the Firebase Console.

### Auto-generated Indexes

Firebase will suggest missing indexes when queries fail. Add these to `firestore.indexes.json`.

## Monitoring & Logging

### View Logs

```bash
firebase functions:log
```

Or in the Firebase Console under Functions → Logs.

### Set Up Alerts

1. Go to Firebase Console → Alerts
2. Configure alerts for:
   - Function errors
   - High latency
   - Quota exceeded
   - Security rule violations

### Cloud Monitoring

Access detailed metrics in Google Cloud Console:
- Function invocations
- Memory usage
- Cold start latency
- Error rates

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Rollback

If deployment causes issues:

```bash
# View deployment history
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Or redeploy previous version
git checkout <previous-commit>
./scripts/deploy-firebase.sh
```

## Cost Optimization

### Firebase Spark Plan (Free)

- Limited Cloud Function invocations
- Limited Firestore reads/writes
- No outbound networking for Functions

### Firebase Blaze Plan (Pay-as-you-go)

- Unlimited Cloud Functions
- Unlimited Firestore operations
- Outbound networking enabled

### Cost Monitoring

1. Set budgets in Google Cloud Console
2. Enable billing alerts
3. Monitor usage in Firebase Console → Usage and Billing

### Optimization Tips

- Use Firestore batch operations
- Implement caching strategies
- Optimize function memory allocation
- Use Cloud Run instead of Functions for high-traffic APIs

## Troubleshooting

### Function Deployment Fails

```bash
# Check logs
firebase functions:log --only api

# Verify build output
npm run build
ls -la dist/

# Check Node version
node --version  # Should be 20+
```

### Firestore Rules Fail

```bash
# Test rules locally
firebase emulators:start --only firestore

# View security rule errors in Console
```

### CORS Errors

Check `CORS_ORIGIN` environment variable matches your frontend domain.

### Authentication Errors

Verify JWT secret is correctly configured in production environment.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Support

For deployment issues, check:
1. Firebase Console logs
2. Cloud Functions logs
3. Firestore security rule logs
4. Application logs (Winston output)

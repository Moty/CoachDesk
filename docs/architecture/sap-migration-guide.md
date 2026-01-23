# SAP BTP Migration Guide

This guide provides detailed instructions for migrating the HelpDesk application from Firebase/Google Cloud to SAP Business Technology Platform (BTP).

## Table of Contents

- [Overview](#overview)
- [Architecture Comparison](#architecture-comparison)
- [Service Mappings](#service-mappings)
- [Migration Steps](#migration-steps)
- [Authentication Migration](#authentication-migration)
- [Database Migration](#database-migration)
- [Storage Migration](#storage-migration)
- [Event/Messaging Migration](#event--messaging-migration)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Code Examples](#code-examples)

## Overview

The HelpDesk application is designed with a cloud-agnostic architecture using abstraction layers. This design enables migration between cloud platforms with minimal code changes.

**Key Migration Principles:**
- Implement new adapters for SAP BTP services
- Maintain existing domain logic unchanged
- Use environment configuration to switch providers
- Parallel run both platforms during transition

## Architecture Comparison

| Component | Firebase/GCP | SAP BTP |
|-----------|-------------|---------|
| Authentication | Firebase Auth | XSUAA (SAP Authorization & Trust) |
| Database | Firestore | SAP HANA Cloud |
| File Storage | Firebase Storage | SAP Document Management Service |
| Event Bus | Cloud Pub/Sub | SAP Event Mesh |
| API Runtime | Cloud Functions / Cloud Run | Cloud Foundry Apps |
| Logging | Cloud Logging | Application Logging Service |
| Monitoring | Cloud Monitoring | SAP Cloud ALM |

## Service Mappings

### Firebase → SAP BTP Service Mapping

```
Firebase Authentication     → XSUAA (SAP Authorization & Trust Management Service)
Firestore                   → SAP HANA Cloud (JSON Document Store or Relational)
Firebase Storage            → SAP Document Management Service (SDM)
Cloud Pub/Sub               → SAP Event Mesh
Cloud Functions             → Cloud Foundry Microservices
Cloud Logging               → Application Logging Service
Cloud Monitoring            → SAP Cloud ALM
```

## Migration Steps

### Phase 1: Preparation (Week 1)

1. **Set up SAP BTP trial or production account**
   - Create subaccount
   - Enable required services
   - Configure entitlements

2. **Create service instances:**
   ```bash
   cf create-service xsuaa application helpdesk-xsuaa -c xs-security.json
   cf create-service hana hdi-shared helpdesk-db
   cf create-service sdm-service standard helpdesk-storage
   cf create-service enterprise-messaging default helpdesk-events
   ```

3. **Set up development environment:**
   - Install Cloud Foundry CLI
   - Install SAP Cloud SDK
   - Configure BTP connection

### Phase 2: Authentication Migration (Week 2)

Migrate from Firebase Auth to XSUAA.

**Changes required:**
- Implement `XSUAAAuthAdapter` 
- Update JWT verification logic
- Configure role mappings in `xs-security.json`

See [Authentication Migration](#authentication-migration) for details.

### Phase 3: Database Migration (Week 2-3)

Migrate from Firestore to SAP HANA Cloud.

**Changes required:**
- Implement `HANAAdapter` (implements `IDatabaseAdapter`)
- Data migration scripts
- Update indexes and queries

See [Database Migration](#database-migration) for details.

### Phase 4: Storage Migration (Week 3)

Migrate from Firebase Storage to SAP Document Management Service.

**Changes required:**
- Implement `SDMStorageAdapter`
- Migrate existing files
- Update file URLs

See [Storage Migration](#storage-migration) for details.

### Phase 5: Testing & Validation (Week 4)

- Integration testing on SAP BTP
- Performance testing
- Security audit
- Load testing

### Phase 6: Deployment & Cutover (Week 5)

- Deploy to SAP BTP production
- DNS cutover
- Monitor and validate
- Decommission Firebase (after validation period)

## Authentication Migration

### Firebase Auth → XSUAA

**Current Implementation (Firebase):**
```typescript
// src/shared/middleware/auth.middleware.ts
import * as admin from 'firebase-admin';

const decodedToken = await admin.auth().verifyIdToken(token);
```

**New Implementation (XSUAA):**
```typescript
// src/shared/middleware/auth-xsuaa.middleware.ts
import xsenv from '@sap/xsenv';
import xssec from '@sap/xssec';

export async function authMiddlewareXSUAA(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing authorization', 401);
    }

    const token = authHeader.substring(7);
    
    // Load XSUAA service credentials
    const services = xsenv.getServices({ uaa: 'helpdesk-xsuaa' });
    
    // Verify JWT token
    const securityContext = await new Promise((resolve, reject) => {
      xssec.createSecurityContext(token, services.uaa, (error, context) => {
        if (error) reject(error);
        else resolve(context);
      });
    });

    // Extract user information
    req.user = {
      userId: securityContext.getLogonName(),
      email: securityContext.getEmail(),
      role: extractRole(securityContext),
      organizationId: securityContext.getAttribute('organizationId'),
    };

    next();
  } catch (error) {
    logger.warn('XSUAA authentication failed', { error });
    next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token', 401));
  }
}

function extractRole(context: any): string {
  if (context.checkScope('$XSAPPNAME.Admin')) return 'admin';
  if (context.checkScope('$XSAPPNAME.Agent')) return 'agent';
  return 'customer';
}
```

**Required Dependencies:**
```bash
npm install @sap/xsenv @sap/xssec
```

**XSUAA Configuration (xs-security.json):**
```json
{
  "xsappname": "helpdesk",
  "tenant-mode": "shared",
  "scopes": [
    {
      "name": "$XSAPPNAME.Admin",
      "description": "Administrator"
    },
    {
      "name": "$XSAPPNAME.Agent",
      "description": "Support Agent"
    },
    {
      "name": "$XSAPPNAME.Customer",
      "description": "Customer"
    }
  ],
  "role-templates": [
    {
      "name": "Admin",
      "description": "Administrator Role",
      "scope-references": ["$XSAPPNAME.Admin"]
    },
    {
      "name": "Agent",
      "description": "Support Agent Role",
      "scope-references": ["$XSAPPNAME.Agent"]
    },
    {
      "name": "Customer",
      "description": "Customer Role",
      "scope-references": ["$XSAPPNAME.Customer"]
    }
  ],
  "attributes": [
    {
      "name": "organizationId",
      "description": "Organization ID",
      "valueType": "string"
    }
  ]
}
```

## Database Migration

### Firestore → SAP HANA Cloud

**Current Implementation (Firestore):**
```typescript
// src/shared/database/adapters/firestore/FirestoreAdapter.ts
export class FirestoreAdapter implements IDatabaseAdapter {
  // ... implementation
}
```

**New Implementation (HANA):**
```typescript
// src/shared/database/adapters/hana/HANAAdapter.ts
import hana from '@sap/hana-client';
import xsenv from '@sap/xsenv';

export class HANAAdapter implements IDatabaseAdapter {
  private connection: hana.Connection | null = null;

  async connect(): Promise<void> {
    const services = xsenv.getServices({ hana: 'helpdesk-db' });
    const hanaOptions = services.hana;

    this.connection = hana.createConnection();
    
    await new Promise((resolve, reject) => {
      this.connection!.connect(hanaOptions, (err) => {
        if (err) reject(err);
        else {
          logger.info('HANA connection established');
          resolve(undefined);
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await new Promise((resolve) => {
        this.connection!.disconnect(() => {
          logger.info('HANA connection closed');
          resolve(undefined);
        });
      });
      this.connection = null;
    }
  }

  getConnection(): hana.Connection {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    return this.connection;
  }

  // Implement other IDatabaseAdapter methods...
}
```

**Required Dependencies:**
```bash
npm install @sap/hana-client @sap/xsenv
```

**Schema Migration:**

Create HANA tables matching Firestore collections. See full SQL schema in migration guide.

## Storage Migration

### Firebase Storage → SAP Document Management Service

Migration involves implementing SDMStorageAdapter and migrating existing files. See full implementation in migration guide.

## Event / Messaging Migration

### Cloud Pub/Sub → SAP Event Mesh

Implement EventMeshAdapter for asynchronous messaging. See full implementation in migration guide.

## Deployment

### Cloud Foundry Deployment

**manifest.yml:**
```yaml
---
applications:
  - name: helpdesk-api
    memory: 512M
    instances: 2
    buildpacks:
      - nodejs_buildpack
    command: npm start
    services:
      - helpdesk-xsuaa
      - helpdesk-db
      - helpdesk-storage
      - helpdesk-events
    env:
      NODE_ENV: production
      PORT: 8080
    routes:
      - route: helpdesk-api.cfapps.us10.hana.ondemand.com
```

**Deployment Commands:**
```bash
# Login to Cloud Foundry
cf login -a https://api.cf.us10.hana.ondemand.com

# Deploy application
cf push

# View logs
cf logs helpdesk-api --recent

# Scale application
cf scale helpdesk-api -i 3
```

## Environment Variables

Service bindings are automatically injected via VCAP_SERVICES. Use @sap/xsenv to access them.

## Code Examples

### Adapter Factory Pattern

```typescript
// src/shared/database/DatabaseAdapterFactory.ts
export class DatabaseAdapterFactory {
  static create(): IDatabaseAdapter {
    const dbType = process.env.DB_TYPE || 'firestore';
    
    switch (dbType) {
      case 'firestore':
        return new FirestoreAdapter();
      case 'hana':
        return new HANAAdapter();
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}
```

## Testing on SAP BTP

1. **Unit Tests**: No changes needed (mocked adapters)
2. **Integration Tests**: Configure for SAP BTP environment
3. **Load Tests**: Use SAP Cloud ALM

## Rollback Plan

If migration encounters issues:

1. Keep Firebase environment running in parallel
2. Use DNS/load balancer to route traffic
3. Monitor error rates and performance
4. Gradual rollout (10% → 50% → 100%)
5. Maintain Firebase for 30 days post-migration

## Support & Resources

- [SAP BTP Documentation](https://help.sap.com/viewer/product/BTP/Cloud/en-US)
- [Cloud Foundry Documentation](https://docs.cloudfoundry.org/)
- [SAP HANA Cloud](https://help.sap.com/viewer/product/HANA_CLOUD/cloud/en-US)
- [XSUAA Documentation](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/6373bb7a96114d619bfdfdc6f505d1b9.html)

## Conclusion

The HelpDesk application's abstraction layers enable migration to SAP BTP with focused implementation of new adapters while preserving business logic.

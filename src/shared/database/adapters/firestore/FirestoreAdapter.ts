import admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { IDatabaseAdapter, ITransaction } from '../../interfaces/IDatabaseAdapter.js';
import { QueryOptions } from '../../interfaces/IRepository.js';
import { logger } from '../../../utils/logger.js';
import { createFirestoreLogContext } from '../../../utils/logContext.js';

/**
 * Firestore collection wrapper
 */
export class FirestoreCollection {
  constructor(
    private collection: admin.firestore.CollectionReference,
    private db: Firestore
  ) {}

  async create(doc: any): Promise<any> {
    const docRef = await this.collection.add({
      ...doc,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const snapshot = await docRef.get();
    return { id: snapshot.id, ...snapshot.data() };
  }

  async findById(id: string): Promise<any> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  async findAll(query?: QueryOptions): Promise<any[]> {
    let firestoreQuery: admin.firestore.Query = this.collection;

    if (query?.where) {
      Object.entries(query.where).forEach(([field, value]) => {
        firestoreQuery = firestoreQuery.where(field, '==', value);
      });
    }

    if (query?.orderBy) {
      query.orderBy.forEach(({ field, direction }) => {
        firestoreQuery = firestoreQuery.orderBy(field, direction);
      });
    }

    if (query?.limit) {
      firestoreQuery = firestoreQuery.limit(query.limit);
    }

    if (query?.offset) {
      firestoreQuery = firestoreQuery.offset(query.offset);
    }

    const snapshot = await firestoreQuery.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async update(id: string, data: any): Promise<any> {
    const docRef = this.collection.doc(id);
    await docRef.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return null;
    }
    return { id: snapshot.id, ...snapshot.data() };
  }

  async delete(id: string): Promise<boolean> {
    await this.collection.doc(id).delete();
    return true;
  }

  async findOne(query: QueryOptions): Promise<any> {
    const results = await this.findAll({ ...query, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async count(query?: QueryOptions): Promise<number> {
    const results = await this.findAll(query);
    return results.length;
  }
}

/**
 * Firestore transaction wrapper
 */
export class FirestoreTransaction implements ITransaction {
  constructor(private transaction: admin.firestore.Transaction) {}

  async commit(): Promise<void> {
    // Firestore transactions auto-commit
  }

  async rollback(): Promise<void> {
    // Firestore transactions auto-rollback on error
  }

  getCollection(name: string): any {
    return {
      // Transaction methods would be implemented here
    };
  }
}

/**
 * Firestore database adapter
 */
export class FirestoreAdapter implements IDatabaseAdapter {
  private db: Firestore | null = null;
  private app: admin.app.App | null = null;

  async connect(): Promise<void> {
    try {
      if (!this.app) {
        // Reuse existing app if already initialized elsewhere
        if (admin.apps.length > 0) {
          this.app = admin.app();
        } else {
          // Initialize Firebase Admin SDK
          const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

          if (serviceAccount) {
            this.app = admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
          } else {
            // Use application default credentials (for GCP environments)
            this.app = admin.initializeApp();
          }
        }

        this.db = admin.firestore(this.app);

        // Configure Firestore settings
        this.db.settings({
          ignoreUndefinedProperties: true,
        });

        const logContext = createFirestoreLogContext('connect', 'success');
        logger.info('Firestore connection established', logContext);
      }
    } catch (error) {
      const logContext = createFirestoreLogContext('connect', 'failure', error instanceof Error ? error.message : 'Unknown error', { error });
      logger.error('Failed to connect to Firestore', logContext);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      try {
        await this.app.delete();
        this.app = null;
        this.db = null;
        const logContext = createFirestoreLogContext('disconnect', 'success');
        logger.info('Firestore connection closed', logContext);
      } catch (error) {
        const logContext = createFirestoreLogContext('disconnect', 'failure', error instanceof Error ? error.message : 'Unknown error', { error });
        logger.error('Failed to disconnect from Firestore', logContext);
        throw error;
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.db) {
      const logContext = createFirestoreLogContext('health_check', 'failure', 'Database not connected');
      logger.error('Firestore health check failed - no database connection', logContext);
      return false;
    }

    try {
      // Try to read a dummy collection to check connectivity
      await this.db.collection('_health').limit(1).get();
      const logContext = createFirestoreLogContext('health_check', 'success');
      logger.info('Firestore health check passed', logContext);
      return true;
    } catch (error) {
      const logContext = createFirestoreLogContext('health_check', 'failure', error instanceof Error ? error.message : 'Unknown error', { error });
      logger.error('Firestore health check failed', logContext);
      return false;
    }
  }

  getCollection(name: string): FirestoreCollection {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return new FirestoreCollection(this.db.collection(name), this.db);
  }

  async transaction<T>(callback: (tx: ITransaction) => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return this.db.runTransaction(async (transaction) => {
      const tx = new FirestoreTransaction(transaction);
      return await callback(tx);
    });
  }
}

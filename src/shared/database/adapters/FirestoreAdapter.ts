import { initializeApp, cert, App, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { IDatabaseAdapter, ITransaction } from '../interfaces/IDatabaseAdapter.js';
import { logger } from '../../utils/logger.js';

/**
 * Firestore implementation of IDatabaseAdapter
 */
export class FirestoreAdapter implements IDatabaseAdapter {
  private app: App | null = null;
  private db: Firestore | null = null;

  /**
   * Connect to Firestore
   */
  async connect(): Promise<void> {
    try {
      // Check if app is already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.app = existingApps[0];
        logger.info('Using existing Firebase app');
      } else {
        // Initialize Firebase Admin SDK
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (serviceAccountPath) {
          // Use service account file
          this.app = initializeApp({
            credential: cert(serviceAccountPath),
          });
        } else {
          // Use default credentials (for Cloud Functions/Firebase environment)
          this.app = initializeApp();
        }
        logger.info('Firebase app initialized');
      }

      // Get Firestore instance
      this.db = getFirestore(this.app);
      
      // Configure Firestore settings
      this.db.settings({
        ignoreUndefinedProperties: true,
      });

      logger.info('Firestore connection established');
    } catch (error) {
      logger.error('Failed to connect to Firestore', { error });
      throw error;
    }
  }

  /**
   * Disconnect from Firestore
   */
  async disconnect(): Promise<void> {
    try {
      if (this.app) {
        await deleteApp(this.app);
        this.app = null;
        this.db = null;
        logger.info('Firestore connection closed');
      }
    } catch (error) {
      logger.error('Error disconnecting from Firestore', { error });
      throw error;
    }
  }

  /**
   * Check if Firestore connection is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) {
        return false;
      }
      
      // Try to list collections to verify connection
      await this.db.listCollections();
      return true;
    } catch (error) {
      logger.error('Firestore health check failed', { error });
      return false;
    }
  }

  /**
   * Get a Firestore collection reference
   */
  getCollection(name: string): FirebaseFirestore.CollectionReference {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection(name);
  }

  /**
   * Execute a Firestore transaction
   */
  async transaction<T>(
    callback: (tx: ITransaction) => Promise<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return this.db.runTransaction(async (firestoreTx) => {
      const txWrapper: ITransaction = {
        commit: async () => {
          // Firestore auto-commits on successful callback return
        },
        rollback: async () => {
          throw new Error('Transaction rolled back');
        },
        getCollection: (name: string) => {
          if (!this.db) {
            throw new Error('Database not connected');
          }
          return this.db.collection(name);
        },
      };

      return callback(txWrapper);
    });
  }

  /**
   * Get the underlying Firestore instance
   */
  getFirestore(): Firestore {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

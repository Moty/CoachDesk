/**
 * Database adapter interface for abstraction layer
 */
export interface IDatabaseAdapter {
  /**
   * Connect to the database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Check if database connection is healthy
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get a collection/table reference
   */
  getCollection(name: string): any;

  /**
   * Execute a transaction
   */
  transaction<T>(callback: (tx: ITransaction) => Promise<T>): Promise<T>;
}

/**
 * Transaction interface for atomic operations
 */
export interface ITransaction {
  /**
   * Commit the transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<void>;

  /**
   * Get a collection/table reference within transaction context
   */
  getCollection(name: string): any;
}

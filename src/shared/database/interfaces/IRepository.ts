/**
 * Generic repository interface for CRUD operations
 */
export interface IRepository<T> {
  /**
   * Create a new entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional filtering
   */
  findAll(query?: QueryOptions): Promise<T[]>;

  /**
   * Update entity by ID
   */
  update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Find one entity matching query
   */
  findOne(query: QueryOptions): Promise<T | null>;

  /**
   * Count entities matching query
   */
  count(query?: QueryOptions): Promise<number>;
}

/**
 * Query options for filtering, sorting, and pagination
 */
export interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
}

/**
 * Query builder interface for filtering and sorting
 */
export interface IQueryBuilder<T> {
  /**
   * Add a where condition
   */
  where(field: keyof T, operator: QueryOperator, value: any): IQueryBuilder<T>;

  /**
   * Add AND condition
   */
  and(field: keyof T, operator: QueryOperator, value: any): IQueryBuilder<T>;

  /**
   * Add OR condition
   */
  or(field: keyof T, operator: QueryOperator, value: any): IQueryBuilder<T>;

  /**
   * Add ordering
   */
  orderBy(field: keyof T, direction: 'asc' | 'desc'): IQueryBuilder<T>;

  /**
   * Set limit
   */
  limit(count: number): IQueryBuilder<T>;

  /**
   * Set offset
   */
  offset(count: number): IQueryBuilder<T>;

  /**
   * Execute the query
   */
  execute(): Promise<T[]>;

  /**
   * Execute and get first result
   */
  first(): Promise<T | null>;

  /**
   * Count matching records
   */
  count(): Promise<number>;
}

/**
 * Supported query operators
 */
export type QueryOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not-in'
  | 'array-contains'
  | 'array-contains-any';

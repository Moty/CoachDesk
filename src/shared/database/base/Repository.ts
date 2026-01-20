import { IRepository, QueryOptions } from '../interfaces/IRepository.js';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter.js';

/**
 * Base repository abstract class with common CRUD operations
 */
export abstract class Repository<T> implements IRepository<T> {
  protected adapter: IDatabaseAdapter;
  protected collectionName: string;

  constructor(adapter: IDatabaseAdapter, collectionName: string) {
    this.adapter = adapter;
    this.collectionName = collectionName;
  }

  /**
   * Get the database collection
   */
  protected getCollection() {
    return this.adapter.getCollection(this.collectionName);
  }

  /**
   * Transform database document to domain model
   * Subclasses should override this if needed
   */
  protected abstract toDomain(doc: any): T;

  /**
   * Transform domain model to database document
   * Subclasses should override this if needed
   */
  protected abstract toDatabase(entity: Partial<T>): any;

  async create(data: Partial<T>): Promise<T> {
    const collection = this.getCollection();
    const doc = this.toDatabase(data);
    const result = await collection.create(doc);
    return this.toDomain(result);
  }

  async findById(id: string): Promise<T | null> {
    const collection = this.getCollection();
    const result = await collection.findById(id);
    return result ? this.toDomain(result) : null;
  }

  async findAll(query?: QueryOptions): Promise<T[]> {
    const collection = this.getCollection();
    const results = await collection.findAll(query);
    return results.map((doc: any) => this.toDomain(doc));
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const collection = this.getCollection();
    const doc = this.toDatabase(data);
    const result = await collection.update(id, doc);
    return result ? this.toDomain(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const collection = this.getCollection();
    return await collection.delete(id);
  }

  async findOne(query: QueryOptions): Promise<T | null> {
    const collection = this.getCollection();
    const result = await collection.findOne(query);
    return result ? this.toDomain(result) : null;
  }

  async count(query?: QueryOptions): Promise<number> {
    const collection = this.getCollection();
    return await collection.count(query);
  }
}

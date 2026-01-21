import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FirestoreAdapter } from '../../src/shared/database/adapters/firestore/FirestoreAdapter.js';

// Mock firebase-admin
vi.mock('firebase-admin', () => {
  const mockFieldValue = {
    serverTimestamp: vi.fn(() => new Date()),
  };

  const mockFirestore = {
    collection: vi.fn((name: string) => ({
      add: vi.fn(async (data: any) => {
        const mockSnapshot = {
          id: 'mock-id',
          exists: true,
          data: () => data,
        };
        return {
          id: 'mock-id',
          get: async () => mockSnapshot,
        };
      }),
      doc: vi.fn((id: string) => ({
        get: async () => ({
          id,
          exists: true,
          data: () => ({ name: 'test' }),
        }),
        update: vi.fn(async () => {}),
        delete: vi.fn(async () => {}),
      })),
      where: vi.fn(function(this: any) { return this; }),
      orderBy: vi.fn(function(this: any) { return this; }),
      limit: vi.fn(function(this: any) { return this; }),
      offset: vi.fn(function(this: any) { return this; }),
      get: vi.fn(async () => ({
        docs: [],
      })),
    })),
    settings: vi.fn(),
    runTransaction: vi.fn(async (callback: any) => callback({})),
    FieldValue: mockFieldValue,
  };

  const mockAdmin = {
    initializeApp: vi.fn(() => ({
      delete: vi.fn(async () => {}),
    })),
    credential: {
      cert: vi.fn(),
    },
    firestore: vi.fn(() => mockFirestore),
    apps: [],
  };

  // Attach FieldValue to admin.firestore for the code usage pattern
  (mockAdmin.firestore as any).FieldValue = mockFieldValue;

  return {
    default: mockAdmin,
  };
});

describe('FirestoreAdapter', () => {
  let adapter: FirestoreAdapter;

  beforeAll(async () => {
    adapter = new FirestoreAdapter();
  });

  afterAll(async () => {
    await adapter.disconnect();
  });

  it('should connect to Firestore', async () => {
    await expect(adapter.connect()).resolves.not.toThrow();
  });

  it('should perform health check', async () => {
    await adapter.connect();
    const isHealthy = await adapter.healthCheck();
    expect(typeof isHealthy).toBe('boolean');
  });

  it('should get collection', async () => {
    await adapter.connect();
    const collection = adapter.getCollection('test');
    expect(collection).toBeDefined();
  });

  it('should create document', async () => {
    await adapter.connect();
    const collection = adapter.getCollection('test');
    const doc = await collection.create({ name: 'test' });
    expect(doc).toHaveProperty('id');
  });

  it('should find document by id', async () => {
    await adapter.connect();
    const collection = adapter.getCollection('test');
    const doc = await collection.findById('test-id');
    expect(doc).toBeDefined();
  });

  it('should disconnect from Firestore', async () => {
    await adapter.connect();
    await expect(adapter.disconnect()).resolves.not.toThrow();
  });
});

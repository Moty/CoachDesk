import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FirestoreAdapter } from '../FirestoreAdapter.js';

// Mock firebase-admin modules
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(() => ({
    name: 'mock-app',
  })),
  getApps: vi.fn(() => []),
  deleteApp: vi.fn(),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    settings: vi.fn(),
    collection: vi.fn((name: string) => ({
      name,
      type: 'collection',
    })),
    listCollections: vi.fn(() => Promise.resolve([])),
    runTransaction: vi.fn((callback) => callback({})),
  })),
}));

describe('FirestoreAdapter', () => {
  let adapter: FirestoreAdapter;

  beforeEach(() => {
    adapter = new FirestoreAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.disconnect();
    } catch {
      // Ignore errors in cleanup
    }
  });

  describe('connect', () => {
    it('should connect to Firestore successfully', async () => {
      await expect(adapter.connect()).resolves.not.toThrow();
    });

    it('should use existing app if already initialized', async () => {
      const { getApps } = await import('firebase-admin/app');
      vi.mocked(getApps).mockReturnValue([{ name: 'existing-app' } as any]);

      await adapter.connect();
      
      const { initializeApp } = await import('firebase-admin/app');
      expect(initializeApp).not.toHaveBeenCalled();
    });

    it('should initialize new app if none exists', async () => {
      const { getApps, initializeApp } = await import('firebase-admin/app');
      vi.mocked(getApps).mockReturnValue([]);

      await adapter.connect();
      
      expect(initializeApp).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await adapter.connect();
      await expect(adapter.disconnect()).resolves.not.toThrow();
    });

    it('should handle disconnect when not connected', async () => {
      await expect(adapter.disconnect()).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return true when connected', async () => {
      await adapter.connect();
      const healthy = await adapter.healthCheck();
      expect(healthy).toBe(true);
    });

    it('should return false when not connected', async () => {
      const healthy = await adapter.healthCheck();
      expect(healthy).toBe(false);
    });
  });

  describe('getCollection', () => {
    it('should return collection reference', async () => {
      await adapter.connect();
      const collection = adapter.getCollection('users');
      expect(collection).toBeDefined();
      expect(collection.name).toBe('users');
    });

    it('should throw error when not connected', () => {
      expect(() => adapter.getCollection('users')).toThrow(
        'Database not connected'
      );
    });
  });

  describe('transaction', () => {
    it('should execute transaction successfully', async () => {
      await adapter.connect();
      
      const result = await adapter.transaction(async (tx) => {
        return 'success';
      });
      
      expect(result).toBe('success');
    });

    it('should throw error when not connected', async () => {
      await expect(
        adapter.transaction(async () => 'test')
      ).rejects.toThrow('Database not connected');
    });
  });

  describe('getFirestore', () => {
    it('should return Firestore instance when connected', async () => {
      await adapter.connect();
      const db = adapter.getFirestore();
      expect(db).toBeDefined();
    });

    it('should throw error when not connected', () => {
      expect(() => adapter.getFirestore()).toThrow(
        'Database not connected'
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiException } from '../api';

// Mock Firebase auth
const mockGetIdToken = vi.fn();

vi.mock('../../firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    mockGetIdToken.mockReset();
    const { auth } = await import('../../firebase');
    (auth as any).currentUser = null;
  });

  describe('GET requests', () => {
    it('should make GET request with query params', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.get('/api/v1/test', { page: 1, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/test?page=1&limit=10'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should attach Authorization header when user is authenticated', async () => {
      const { auth } = await import('../../firebase');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken.mockResolvedValue('test-token'),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await api.get('/api/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body and params', async () => {
      const mockData = { id: 1 };
      const body = { name: 'Test' };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.post('/api/v1/test', body, { action: 'create' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/test?action=create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request', async () => {
      const mockData = { updated: true };
      const body = { status: 'active' };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.patch('/api/v1/test/1', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      const mockData = { deleted: true };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.delete('/api/v1/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('Error handling', () => {
    it('should throw ApiException with user-friendly message', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Field is required',
        details: { field: 'email' },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(api.get('/api/v1/test')).rejects.toThrow(ApiException);
      
      try {
        await api.get('/api/v1/test');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiException);
        const apiErr = err as ApiException;
        expect(apiErr.code).toBe('VALIDATION_ERROR');
        expect(apiErr.statusCode).toBe(400);
        expect(apiErr.details).toEqual({ field: 'email' });
        expect(apiErr.message).toBe('Invalid input. Please check your data.');
      }
    });

    it('should handle NOT_FOUND error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ code: 'NOT_FOUND', message: 'Resource not found' }),
      });

      try {
        await api.get('/api/v1/test/999');
      } catch (err) {
        const apiErr = err as ApiException;
        expect(apiErr.message).toBe('The requested resource was not found.');
      }
    });

    it('should handle UNAUTHORIZED error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ code: 'UNAUTHORIZED', message: 'Not authenticated' }),
      });

      try {
        await api.get('/api/v1/test');
      } catch (err) {
        const apiErr = err as ApiException;
        expect(apiErr.message).toBe('You are not authorized. Please log in.');
      }
    });
  });

  describe('File upload', () => {
    it('should upload file with multipart/form-data', async () => {
      const mockData = { url: 'https://example.com/file.pdf' };
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.uploadFile('/api/v1/upload', file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should upload file with additional data', async () => {
      const mockData = { url: 'https://example.com/file.pdf' };
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const additionalData = { ticketId: '123', description: 'Test file' };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.uploadFile('/api/v1/upload', file, additionalData);

      const callArgs = mockFetch.mock.calls[0][1];
      const formData = callArgs.body as FormData;
      expect(formData.get('ticketId')).toBe('123');
      expect(formData.get('description')).toBe('Test file');
      expect(result).toEqual(mockData);
    });

    it('should attach Authorization header for file upload', async () => {
      const { auth } = await import('../../firebase');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken.mockResolvedValue('test-token'),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const file = new File(['content'], 'test.pdf');
      await api.uploadFile('/api/v1/upload', file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('Pagination and filtering', () => {
    it('should support pagination params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [], page: 1, pageSize: 20 }),
      });

      await api.get('/api/v1/tickets', { page: 1, pageSize: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pageSize=20'),
        expect.any(Object)
      );
    });

    it('should support filtering params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await api.get('/api/v1/tickets', { status: 'open', priority: 'high' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=open'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('priority=high'),
        expect.any(Object)
      );
    });
  });
});

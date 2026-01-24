import { auth } from '../firebase';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
}

function getUserFriendlyMessage(error: ApiError): string {
  const codeMessages: Record<string, string> = {
    VALIDATION_ERROR: 'Invalid input. Please check your data.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized. Please log in.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    BAD_REQUEST: 'Invalid request. Please check your input.',
    CONFLICT: 'This operation conflicts with existing data.',
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  };

  return codeMessages[error.code] || error.message || 'An error occurred';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, params } = options;

  const token = await getAuthToken();
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new ApiException(
      error.code,
      getUserFriendlyMessage(error),
      response.status,
      error.details
    );
  }

  return data as T;
}

async function uploadFile<T>(
  path: string,
  file: File,
  additionalData?: Record<string, string>
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const url = buildUrl(path);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new ApiException(
      error.code,
      getUserFriendlyMessage(error),
      response.status,
      error.details
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean>) =>
    request<T>(path, { method: 'GET', params }),
  
  post: <T>(path: string, body?: unknown, params?: Record<string, string | number | boolean>) =>
    request<T>(path, { method: 'POST', body, params }),
  
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),
  
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),
  
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
  
  uploadFile: <T>(path: string, file: File, additionalData?: Record<string, string>) =>
    uploadFile<T>(path, file, additionalData),
};

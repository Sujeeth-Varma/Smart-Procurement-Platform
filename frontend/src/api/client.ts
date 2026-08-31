import { useAuthStore } from '@/stores/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized and we had a token, logout user
    if (token) {
      useAuthStore.getState().logout();
    }
  }

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json().catch(() => null);
  } else {
    responseData = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && (responseData.message || responseData.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export async function downloadFile(
  endpoint: string,
  fallbackFilename: string = 'download.csv'
): Promise<void> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response.status === 401) {
    if (token) {
      useAuthStore.getState().logout();
    }
    throw new ApiError('Unauthorized access. Please log in again.', 401);
  }

  if (!response.ok) {
    let errorMessage = `Download failed with status ${response.status}`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json();
        if (errorJson && (errorJson.message || errorJson.error)) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } else {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch {
      // ignore
    }
    throw new ApiError(errorMessage, response.status);
  }

  let filename = fallbackFilename;
  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches && matches[1]) {
      filename = matches[1].replace(/['"]/g, '').trim();
    }
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

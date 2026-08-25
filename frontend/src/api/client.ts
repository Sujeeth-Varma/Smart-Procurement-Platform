import { useAuthStore } from '@/stores/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

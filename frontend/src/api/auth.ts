import { apiClient } from './client';
import type { AuthResponse, Department, RegisterRequest, UserRole } from '@/types';

export const authApi = {
  login: async (email: string, password: string, role: UserRole): Promise<AuthResponse> => {
    let endpoint = '/api/public/login';
    if (role === 'ADMIN') {
      endpoint = '/api/public/admin/login';
    }

    const res = await apiClient<AuthResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Ensure role matches response or selected role
    return {
      ...res,
      role: res.role || role,
    };
  },

  register: async (data: RegisterRequest): Promise<{ message: string; [key: string]: any }> => {
    return apiClient('/api/public/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDepartments: async (): Promise<Department[]> => {
    return apiClient<Department[]>('/api/departments', {
      method: 'GET',
    });
  },
};

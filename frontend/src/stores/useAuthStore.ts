import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserRole } from '@/types';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole, user?: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      user: null,
      isAuthenticated: false,
      login: (token: string, role: UserRole, user?: UserProfile) => {
        set({
          token,
          role,
          user: user || null,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          token: null,
          role: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: UserProfile) => {
        set({ user });
      },
    }),
    {
      name: 'ep-procurement-auth',
    }
  )
);

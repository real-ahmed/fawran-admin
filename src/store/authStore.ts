import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[];
  setToken: (token: string) => void;
  setUser: (user: User, permissions: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      setToken: (token) => set({ token }),
      setUser: (user, permissions) => set({ user, permissions }),
      logout: () => set({ token: null, user: null, permissions: [] }),
    }),
    {
      name: 'fawran-auth-storage',
    }
  )
);

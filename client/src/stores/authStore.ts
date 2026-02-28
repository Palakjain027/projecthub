import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  
  // Role checks
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isBuyer: () => boolean;
  isFreelancer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setAccessToken: (token) => set({ accessToken: token }),
      
      login: (user, token) => set({ 
        user, 
        accessToken: token, 
        isAuthenticated: true,
        isLoading: false 
      }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'super_admin';
      },

      isSeller: () => {
        const { user } = get();
        return user?.role === 'seller' || get().isAdmin();
      },

      isBuyer: () => {
        const { user } = get();
        return user?.role === 'buyer' || get().isAdmin();
      },

      isFreelancer: () => {
        const { user } = get();
        return user?.role === 'freelancer' || get().isAdmin();
      },
    }),
    {
      name: 'projecthub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin());
export const useIsSeller = () => useAuthStore((state) => state.isSeller());
export const useIsBuyer = () => useAuthStore((state) => state.isBuyer());
export const useIsFreelancer = () => useAuthStore((state) => state.isFreelancer());

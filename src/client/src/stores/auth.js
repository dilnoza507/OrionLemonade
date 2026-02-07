import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpired: false,

      login: async (login, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(login, password);
          const userInfo = await authApi.getCurrentUser(data.accessToken);

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: {
              id: userInfo.userId,
              login: userInfo.login,
              role: userInfo.role,
              scope: userInfo.scope,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpired: false,
          });
          return true;
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          sessionExpired: false,
        });
      },

      setSessionExpired: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpired: true,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().setSessionExpired();
          return false;
        }

        try {
          const data = await authApi.refreshToken(refreshToken);
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          return true;
        } catch {
          get().setSessionExpired();
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper to get auth header
export function getAuthHeader() {
  const { accessToken } = useAuthStore.getState();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

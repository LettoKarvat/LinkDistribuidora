import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,

      // Guarda tokens e reconstrói o estado
      setTokens: (access, refresh) => {
        let payload = null;
        if (access) {
          try {
            payload = jwtDecode(access);
          } catch (e) {
            console.error("JWT inválido", e);
          }
        }

        set({
          accessToken: access,
          refreshToken: refresh,
          user: payload,
          role: payload?.role ?? null,
          isAuthenticated: !!access,
        });
      },

      // Limpa estado de autenticação
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("auth-storage");
      },

      // Helpers de leitura
      getRole: () => get().role,
      getUserId: () => get().user?.id || get().user?.sub || null,
      getFullName: () => get().user?.name || "Usuário",
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
        user: s.user,
        role: s.role,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          state.setTokens(state.accessToken, state.refreshToken);
        }
      },
    }
  )
);

// Export default para compatibilidade de import padrão
export default useAuthStore;

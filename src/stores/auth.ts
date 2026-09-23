import { create } from "zustand";
import { authApi, setTokens, clearTokens, getAccessToken } from "@/lib/api";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  handleOAuthSuccess: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const { access, refresh } = await authApi.login(email, password);
    setTokens(access, refresh);
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true, isLoading: false });
  },

  handleOAuthSuccess: async (access: string, refresh: string) => {
    setTokens(access, refresh);
    const user = await authApi.getMe();
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },
}));

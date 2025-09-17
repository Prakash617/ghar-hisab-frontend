"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { login as apiLogin, signup, logout as apiLogout } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

// ---- Types ----
interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: typeof apiLogin;
  signup: typeof signup;
  logout: () => void;
  loading: boolean;
}

// ---- Context ----
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Provider ----
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch(`${ENDPOINTS.auth.me}`);
      setUser(data);
    } catch {
      handleLogout();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    await loadUser();
    return data;
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login: handleLogin,
    signup,
    logout: handleLogout,
    loading,
  };

  return (
    <AuthContext.Provider value={value as AuthContextType}>{children}</AuthContext.Provider>
  );
}

// ---- Hook ----
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

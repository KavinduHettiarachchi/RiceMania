"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, clearToken, getToken, setToken } from "@/app/lib/api";
import type { User } from "@/app/lib/types";

interface AuthContextValue {
  user: User | null;
  /** True until the stored token has been checked against /api/auth/me. */
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the stored token on first mount.
  useEffect(() => {
    let active = true;

    const restore = async () => {
      const token = getToken();

      if (token) {
        try {
          const { user } = await api<{ user: User }>("/auth/me", { auth: true });
          if (active) setUser(user);
        } catch {
          // Expired or tampered token — drop it rather than retrying.
          clearToken();
        }
      }

      if (active) setLoading(false);
    };

    void restore();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await api("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

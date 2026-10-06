"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@/types";
import * as api from "@/services";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await api.login(email, password);
    api.saveSession(s);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(() => {
    api.clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, loading, login, logout }),
    [session, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

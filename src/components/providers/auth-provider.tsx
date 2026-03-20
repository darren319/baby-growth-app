"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { authRepository } from "@/lib/repository/app-repository";
import type { AuthFormInput, AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isMockMode: boolean;
  signIn: (input: AuthFormInput) => Promise<void>;
  signUp: (input: AuthFormInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    let mounted = true;

    authRepository
      .getCurrentUser()
      .then((nextUser) => {
        if (!mounted) return;
        setUser(nextUser);
        setStatus(nextUser ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("unauthenticated");
      });

    const unsubscribe = authRepository.subscribe((_event, nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "unauthenticated");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isMockMode: authRepository.isMockMode(),
      async signIn(input) {
        const nextUser = await authRepository.signIn(input);
        setUser(nextUser);
        setStatus("authenticated");
      },
      async signUp(input) {
        const nextUser = await authRepository.signUp(input);
        setUser(nextUser);
        setStatus("authenticated");
      },
      async signInWithGoogle() {
        const nextUser = await authRepository.signInWithGoogle();
        if (nextUser) {
          setUser(nextUser);
          setStatus("authenticated");
        }
      },
      async signOut() {
        await authRepository.signOut();
        setUser(null);
        setStatus("unauthenticated");
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 中使用");
  }
  return context;
}

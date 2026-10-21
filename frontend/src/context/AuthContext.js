import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { backend } from "../data";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userSession) => {
    if (!userSession) {
      setProfile(null);
      return;
    }
    try {
      const data = await backend.profiles.get(userSession.user.id);
      setProfile(data ?? { id: userSession.user.id, student_email: userSession.user.email });
    } catch {
      setProfile({ id: userSession.user.id, student_email: userSession.user.email });
    }
  }, []);

  useEffect(() => {
    let active = true;

    backend.auth
      .getSession()
      .then(async (s) => {
        if (!active) return;
        setSession(s);
        await loadProfile(s);
      })
      .catch((err) => {
        console.warn("Auth init failed:", err?.message || err);
        setSession(null);
      })
      .finally(() => active && setLoading(false));

    const unsubscribe = backend.auth.onChange(async (s) => {
      setSession(s);
      await loadProfile(s);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn: (email, password) => backend.auth.signIn({ email, password }),
      signUp: (email, password, meta) => backend.auth.signUp({ email, password, meta }),
      resetPassword: (email) => backend.auth.resetPassword(email),
      signOut: async () => {
        await backend.auth.signOut();
        setSession(null);
        setProfile(null);
      },
      saveProfile: async (patch) => {
        const saved = await backend.profiles.upsert({ ...patch, id: session.user.id });
        setProfile((p) => ({ ...p, ...saved }));
        return saved;
      },
      refreshProfile: () => loadProfile(session),
    }),
    [session, profile, loading, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get initial session (restores from persisted storage)
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (error) {
          // 500, network error, etc. – show login screen
          console.warn('Auth init failed:', error?.message || error);
          setSession(null);
        } else {
          setSession(session);
          if (session) {
            await fetchProfile(session.user.id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Auth init failed:', err?.message || err);
        setSession(null);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile may not exist yet; create one or use minimal fallback
        setProfile({ id: userId });
        return;
      }
      setProfile(data);
    } catch {
      setProfile({ id: userId });
    }
  }

  const value = {
    session,
    loading,
    profile,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { routerBase } from '../lib/base';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        validateAndSetSession(s);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        validateAndSetSession(s);
      } else {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function validateAndSetSession(s: Session) {
    const email = s.user.email ?? '';
    if (!email.endsWith('@twinstarsgroup.com')) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setError('Access restricted to @twinstarsgroup.com accounts');
      setLoading(false);
      return;
    }
    setSession(s);
    setUser(s.user);
    setError(null);
    setLoading(false);
  }

  async function signIn() {
    setError(null);
    const redirectTo = window.location.origin + routerBase + '/auth/callback';
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (e) setError(e.message);
  }

  async function signOut() {
    setError(null);
    const { error: e } = await supabase.auth.signOut();
    if (e) setError(e.message);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

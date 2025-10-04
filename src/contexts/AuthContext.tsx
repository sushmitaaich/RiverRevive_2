// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/index';
import { supabase } from '../lib/supabase'; // <-- 1. helper we created earlier

/* ------------------------------------------------------------------ */
/*  TYPE DEFINITIONS                                                  */
/* ------------------------------------------------------------------ */
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  HELPER – map Supabase user → our User type                        */
/* ------------------------------------------------------------------ */
function toUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.full_name || '',
    role: supabaseUser.user_metadata?.role || 'citizen',
    points: supabaseUser.user_metadata?.points || 0,
    location: supabaseUser.user_metadata?.location || '',
  };
}

/* ------------------------------------------------------------------ */
/*  PROVIDER                                                          */
/* ------------------------------------------------------------------ */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /* ----------  LOGIN  ------------------------------------------- */
  const login = async (email: string, password: string): Promise<void> => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    setUser(toUser(data.user));
  };

  /* ----------  LOGOUT  ------------------------------------------ */
  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  };

  /* ----------  REGISTER  ---------------------------------------- */
  const register = async (userData: Partial<User>, password: string): Promise<void> => {
    const { error, data } = await supabase.auth.signUp({
      email: userData.email!,
      password,
      options: { data: userData }, // -> raw_user_meta_data
    });
    if (error) throw new Error(error.message);
    // data.user can be null if e-mail confirmation is ON
    if (data.user) setUser(toUser(data.user));
  };

  /* ----------  LISTEN TO AUTH CHANGES  -------------------------- */
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toUser(session.user) : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ----------  INITIAL LOAD  ----------------------------------- */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ? toUser(data.session.user) : null);
    })();
  }, []);

  /* ----------  RENDER  ----------------------------------------- */
  return <AuthContext.Provider value={{ user, login, logout, register }}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/*  HOOK                                                              */
/* ------------------------------------------------------------------ */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
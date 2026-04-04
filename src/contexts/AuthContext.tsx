import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { fetchCurrentUserProfile } from '../lib/cleanup';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toFallbackUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: supabaseUser.user_metadata?.full_name ?? '',
    role: supabaseUser.user_metadata?.role ?? 'citizen',
    points: supabaseUser.user_metadata?.points ?? 0,
    location: supabaseUser.user_metadata?.location ?? '',
    phone: supabaseUser.user_metadata?.phone_number ?? '',
    organization: supabaseUser.user_metadata?.organization ?? '',
    approved: supabaseUser.user_metadata?.approved ?? false,
    status: supabaseUser.user_metadata?.status ?? 'pending_approval',
  };
}

async function resolveAppUser(supabaseUser: any) {
  const profile = await fetchCurrentUserProfile(supabaseUser.id);
  return profile ?? toFallbackUser(supabaseUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      return;
    }

    const appUser = await resolveAppUser(session.user);
    setUser(appUser);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const appUser = await resolveAppUser(data.user);
      setUser(appUser);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUser(null);
  };

  const register = async (userData: Partial<User>, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email: userData.email ?? '',
      password,
      options: {
        data: {
          full_name: userData.name ?? '',
          role: userData.role ?? 'citizen',
          location: userData.location ?? '',
          phone_number: userData.phone ?? '',
          organization: userData.organization ?? '',
          points: 0,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const appUser = await resolveAppUser(data.user);
      setUser(appUser);
    }
  };

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      void resolveAppUser(session.user).then(setUser).catch(() => {
        setUser(toFallbackUser(session.user));
      });
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

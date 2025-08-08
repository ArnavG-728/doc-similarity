'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'AR Requestor' | 'Recruiter Admin';

type User = {
  id: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (user: { email: string; role: Role }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async ({ email, role }: { email: string; role: Role }) => {
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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

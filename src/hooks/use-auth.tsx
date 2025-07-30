
// src/hooks/use-auth.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'AR Requestor' | 'Recruiter Admin';

// Simple User type for mock authentication
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
  signIn: (email: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is "logged in" from a previous session
    try {
      const storedUser = sessionStorage.getItem('user');
      console.log('Checking sessionStorage for user:', storedUser);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user from sessionStorage:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('No user found in sessionStorage');
      }
    } catch (e) {
      console.error('Error parsing user from sessionStorage:', e);
      // Suppress any JSON parsing errors
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, role: Role) => {
    try {
      console.log('Signing in with email:', email, 'role:', role);
      const mockUser = { 
        id: `user-${Date.now()}`, 
        email: email, 
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('Created mock user:', mockUser);
      setUser(mockUser);
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      console.log('User saved to sessionStorage');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      sessionStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

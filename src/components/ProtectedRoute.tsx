
// src/components/ProtectedRoute.tsx
'use client';

import { useAuth, type Role } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, role }: { children: ReactNode, role: Role }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log('ProtectedRoute - User:', user);
    console.log('ProtectedRoute - Required role:', role);
    console.log('ProtectedRoute - User role:', user?.role);

    if (!user) {
      console.log('ProtectedRoute - No user, redirecting to home');
      router.push('/');
      return;
    }

    if (user.role !== role) {
      console.log('ProtectedRoute - Role mismatch, redirecting');
      // If the user's role doesn't match, redirect them to their own dashboard.
      const homePath = user.role === 'AR Requestor' ? '/ar-dashboard' : '/recruiter-admin';
      router.push(homePath);
      return;
    }

    console.log('ProtectedRoute - Access granted');

  }, [user, loading, router, role]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if the user is logged in and has the correct role
  if (user && user.role === role) {
    return <>{children}</>;
  }

  // If user exists but role doesn't match, show a message
  if (user && user.role !== role) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Render loading spinner while redirecting
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

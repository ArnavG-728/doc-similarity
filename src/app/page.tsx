
// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Welcome to Profile Ranker</h1>

      {user ? (
        <>
          <p className="text-lg">Logged in as <strong>{user.email}</strong> ({user.role})</p>
          <div className="space-x-2">
            {user.role === 'AR Requestor' && (
              <Button onClick={() => router.push('/ar-dashboard')}>Go to AR Dashboard</Button>
            )}
            {user.role === 'Recruiter Admin' && (
              <Button onClick={() => router.push('/recruiter-admin')}>Go to Recruiter Admin</Button>
            )}
            <Button variant="outline" onClick={signOut}>Logout</Button>
          </div>
        </>
      ) : (
        <div className="space-x-2">
          <Button onClick={() => router.push('/login')}>Login</Button>
          <Button onClick={() => router.push('/signup')}>Sign Up</Button>
        </div>
      )}
    </main>
  );
}

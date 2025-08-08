'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signOut } = useAuth(); // ✅ includes current user

  useEffect(() => {
    if (user) {
      console.log('✅ User already logged in:', user);
    }
  }, [user]);

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('');

    try {
      // 🔍 Step 1: Check if email exists
      const check = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const checkResult = await check.json();
      if (!checkResult.exists) {
        setError('Email does not exist.');
        return;
      }

      // 🔐 Step 2: Try logging in
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Incorrect password.');

      await signIn({
        id: result._id,
        email: data.email,
        role: result.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (result.role === 'AR Requestor') router.push('/ar-dashboard');
      else if (result.role === 'Recruiter Admin') router.push('/recruiter-admin');
      else throw new Error('Invalid role');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
      {user ? (
        <>
          <p>Logged in as <strong>{user.email}</strong> ({user.role})</p>
          <Button variant="outline" onClick={signOut}>Logout</Button>
        </>
      ) : (
        <>
          <LoginForm
            onLogin={handleLogin}
          />
          {error && <p className="text-red-600">{error}</p>}
        </>
      )}
    </main>
  );
}

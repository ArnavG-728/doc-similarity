'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import InlineSignupForm from '@/components/auth/InlineSignupForm';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [openRequestorSignup, setOpenRequestorSignup] = useState(false);
  const [openRecruiterSignup, setOpenRecruiterSignup] = useState(false);
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
        email: data.email,
        role: result.role,
      });

      if (result.role === 'AR Requestor') router.push('/ar-dashboard');
      else if (result.role === 'Recruiter Admin') router.push('/recruiter-admin');
      else throw new Error('Invalid role');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      {user ? (
        <>
          <p>Logged in as <strong>{user.email}</strong> ({user.role})</p>
          <Button variant="outline" onClick={signOut}>Logout</Button>
        </>
      ) : (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            <p className="text-muted-foreground">Choose how you want to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                  <Users size={20} />
                </div>
                <CardTitle className="text-xl">AR Requestor</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                <LoginForm
                  role="AR Requestor"
                  onLogin={handleLogin}
                  signupHref="/signup?role=AR%20Requestor"
                  hideSignup
                />
                <Button variant="outline" onClick={() => setOpenRequestorSignup(true)}>Create new account</Button>
              </CardContent>
            </Card>

            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                  <Briefcase size={20} />
                </div>
                <CardTitle className="text-xl">Recruiter Admin</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                <LoginForm
                  role="Recruiter Admin"
                  onLogin={handleLogin}
                  signupHref="/signup?role=Recruiter%20Admin"
                  hideSignup
                />
                <Button variant="outline" onClick={() => setOpenRecruiterSignup(true)}>Create new account</Button>
              </CardContent>
            </Card>
          </div>

          {/* AR Requestor Signup Dialog */}
          <Dialog open={openRequestorSignup} onOpenChange={setOpenRequestorSignup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign Up — AR Requestor</DialogTitle>
                <DialogDescription>Create your AR Requestor account.</DialogDescription>
              </DialogHeader>
              <InlineSignupForm
                role="AR Requestor"
                onSuccess={async ({ email }) => {
                  await signIn({ email, role: 'AR Requestor' });
                  setOpenRequestorSignup(false);
                  router.push('/ar-dashboard');
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Recruiter Admin Signup Dialog */}
          <Dialog open={openRecruiterSignup} onOpenChange={setOpenRecruiterSignup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign Up — Recruiter Admin</DialogTitle>
                <DialogDescription>Create your recruiter admin account.</DialogDescription>
              </DialogHeader>
              <InlineSignupForm
                role="Recruiter Admin"
                onSuccess={async ({ email }) => {
                  await signIn({ email, role: 'Recruiter Admin' });
                  setOpenRecruiterSignup(false);
                  router.push('/recruiter-admin');
                }}
              />
            </DialogContent>
          </Dialog>

          {error && <p className="text-red-600">{error}</p>}
        </>
      )}
    </main>
  );
}

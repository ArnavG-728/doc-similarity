'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm({
  onLogin,
  role,
  signupHref,
  hideSignup,
}: {
  onLogin: (data: any) => Promise<void>;
  role?: 'AR Requestor' | 'Recruiter Admin';
  signupHref?: string;
  hideSignup?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin({ email, password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {role ? `Login — ${role}` : 'Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Logging in...
                </>
              ) : (
                'Log In'
              )}
            </Button>

            {!hideSignup && (
              <p className="text-sm text-center text-muted-foreground">
                Don’t have an account?{' '}
                <Link
                  href={signupHref || (role ? `/signup?role=${encodeURIComponent(role)}` : '/signup')}
                  className="text-primary hover:underline"
                >
                  {role ? `Sign Up as ${role}` : 'Sign Up'}
                </Link>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

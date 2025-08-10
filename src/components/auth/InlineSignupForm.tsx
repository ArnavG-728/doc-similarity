'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function InlineSignupForm({
  role,
  onSuccess,
}: {
  role: 'AR Requestor' | 'Recruiter Admin';
  onSuccess: (data: { firstName: string; lastName: string; email: string }) => Promise<void> | void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Signup failed.');

      await Promise.resolve(onSuccess({ firstName, lastName, email }));
    } catch (err: any) {
      setError(err.message || 'Signup failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign Up — {role}</CardTitle>
          <CardDescription>Create your {role.toLowerCase()} account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>First Name</Label>
                <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Signing Up...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

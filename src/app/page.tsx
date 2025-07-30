
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Hexagon, Loader2, User, UserCog, ArrowLeft } from 'lucide-react';
import { useAuth, type Role } from '@/hooks/use-auth';

function LoginForm({ role, icon, onLogin, onBack }: { role: Role, icon: React.ReactNode, onLogin: (email: string, role: Role) => Promise<void>, onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await onLogin(email, role);
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
        <Card>
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                    {icon}
                </div>
                <CardTitle className="text-2xl">{role} Login</CardTitle>
                <CardDescription>Enter your credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor={`email-${role}`}>Email</Label>
                    <Input
                    id={`email-${role}`}
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`password-${role}`}>Password</Label>
                    <Input
                    id={`password-${role}`}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                <div className="flex gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 animate-spin" />
                            Signing In...
                        </>
                        ) : (
                        'Sign In'
                        )}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                        Sign Up
                    </Button>
                </div>
                </form>
            </CardContent>
        </Card>
        <Button variant="link" onClick={onBack} className="mt-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Not a {role}?
        </Button>
    </div>
  );
}

function RoleSelection({ onSelectRole }: { onSelectRole: (role: Role) => void }) {
    return (
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="hover:bg-card/60 cursor-pointer transition-colors" onClick={() => onSelectRole('AR Requestor')}>
                <CardHeader className="items-center text-center">
                     <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">AR Requestor</CardTitle>
                    <CardDescription>Access the dashboard to compare profiles and manage documents.</CardDescription>
                </CardHeader>
            </Card>
             <Card className="hover:bg-card/60 cursor-pointer transition-colors" onClick={() => onSelectRole('Recruiter Admin')}>
                <CardHeader className="items-center text-center">
                     <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <UserCog className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Recruiter Admin</CardTitle>
                    <CardDescription>Access admin tools for reporting and JD management.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}


export default function Home() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

      const handleLogin = async (email: string, role: Role) => {
    try {
      await signIn(email, role);
      
      if (role === 'AR Requestor') {
        router.push('/ar-dashboard');
      } else {
        router.push('/recruiter-admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
    }

    const handleBack = () => {
        setSelectedRole(null);
    }

    const icons: Record<Role, React.ReactNode> = {
        'AR Requestor': <User className="h-6 w-6 text-primary" />,
        'Recruiter Admin': <UserCog className="h-6 w-6 text-primary" />,
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <div className="flex items-center space-x-2 mb-8">
                <Hexagon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold font-headline">Profile Ranker</span>
            </div>

            {selectedRole ? (
                <LoginForm 
                    role={selectedRole}
                    icon={icons[selectedRole]}
                    onLogin={handleLogin}
                    onBack={handleBack}
                />
            ) : (
                <RoleSelection onSelectRole={handleRoleSelect} />
            )}
            
             <footer className="absolute bottom-0 w-full py-6">
                <p className="text-center text-xs text-muted-foreground">&copy; 2024 Profile Ranker. All rights reserved.</p>
            </footer>
        </main>
    );
}

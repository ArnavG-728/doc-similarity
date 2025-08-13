'use client';

import Link from 'next/link';
import { Hexagon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, type Role } from '@/hooks/use-auth';
import { ThemeSwitcher } from './theme-switcher';

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navLinks: { href: string; label: string; role: Role }[] = [
    { href: '/ar-dashboard', label: 'AR Dashboard', role: 'AR Requestor' },
    { href: '/recruiter-admin', label: 'Recruiter Admin', role: 'Recruiter Admin' },
  ];

  const visibleLinks = user ? navLinks.filter(link => link.role === user.role) : [];

  const dashboardPath = user
    ? user.role === 'Recruiter Admin' ? '/recruiter-admin' : '/ar-dashboard'
    : '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href={dashboardPath} className="flex items-center space-x-2">
            <Hexagon className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Profile Ranker</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center gap-4 text-sm lg:gap-6">
          {visibleLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname?.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user && (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

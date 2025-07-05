
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { YourSpaceLogo } from '@/components/branding/YourSpaceLogo';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { NotificationBell } from '@/components/feature/notifications/NotificationBell';

const navLinks = [
  { href: '/following', label: 'Feed' },
  { href: '/explore', label: 'Explore' },
  { href: '/canvas', label: 'Canvas'},
  { href: '/radio', label: 'Radio' },
  { href: '/learning', label: 'Learning' },
  { href: '/creators', label: 'Creators' },
  { href: '/guilds', label: 'Guilds' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/events', label: 'Events' },
  { href: '/subscriptions', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const [user] = useAuthState(auth ?? undefined);
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-10 py-3 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 text-foreground">
        <Link href="/" className="flex items-center gap-3">
            <YourSpaceLogo className="size-8 text-primary" />
            <h2 className="hidden sm:block text-lg font-bold leading-tight tracking-[-0.015em]">
                YourSpace
            </h2>
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={cn(
                "text-sm font-medium leading-normal transition-colors",
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}>
                {link.label}
              </Link>
            )
          })}
      </nav>
      <div className="flex flex-1 justify-end items-center gap-2">
         {user && <NotificationBell />}
         <ThemeSwitcher />
         <Link href={user ? "/dashboard" : "/signup"}>
            <Button>
              <span className="truncate">{user ? 'Go to Hub' : 'Sign Up'}</span>
            </Button>
        </Link>
      </div>
    </header>
  );
}

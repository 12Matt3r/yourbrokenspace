
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, UploadCloud, BrainCircuit, UserCircle, Rss } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMentorAI } from '@/contexts/MentorAIContext';

// Define action types for clarity
type ActionType = 'link' | 'mentor-ai';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  actionType: ActionType;
}

const unauthenticatedNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, actionType: 'link' },
  { href: '/explore', label: 'Explore', icon: Compass, actionType: 'link' },
  { href: '#mentor-ai', label: 'MentorAI', icon: BrainCircuit, actionType: 'mentor-ai' },
  { href: '/login', label: 'Login', icon: UserCircle, actionType: 'link' },
];

const authenticatedNavItems: NavItem[] = [
  { href: '/following', label: 'Feed', icon: Rss, actionType: 'link' },
  { href: '/explore', label: 'Explore', icon: Compass, actionType: 'link' },
  { href: '/upload', label: 'Upload', icon: UploadCloud, actionType: 'link' },
  { href: '#mentor-ai', label: 'MentorAI', icon: BrainCircuit, actionType: 'mentor-ai' },
  { href: '/profile/me', label: 'Profile', icon: UserCircle, actionType: 'link' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { openMentorAI } = useMentorAI();

  // Placeholder for authentication. In a real app, this would use a proper auth hook.
  const isAuthenticated = true; 

  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems;

  const handleTabClick = (item: NavItem, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.actionType === 'mentor-ai') {
      e.preventDefault(); 
      openMentorAI();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 flex md:hidden z-40">
      {navItems.map((item) => {
        const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleTabClick(item, e)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center text-xs gap-0.5 transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon className={cn('h-5 w-5 mb-0.5', isActive ? 'text-primary' : '')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

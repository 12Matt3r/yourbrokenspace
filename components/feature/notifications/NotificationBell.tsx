
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageSquare, UserPlus, Heart, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type NotificationData } from '@/config/notificationsData';
import { useUser } from '@/contexts/UserContext';
import { listenForNotifications, markNotificationsAsRead } from '@/lib/firebase/firestoreService';

const getNotificationIcon = (type: NotificationData['type']) => {
  switch (type) {
    case 'comment': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'follow': return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'like': return <Heart className="h-5 w-5 text-red-500" />;
    case 'sale': return <DollarSign className="h-5 w-5 text-yellow-500" />;
    case 'system': return <Sparkles className="h-5 w-5 text-primary" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export function NotificationBell() {
  const { userProfile } = useUser();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (userProfile?.uid) {
      const unsubscribe = listenForNotifications(userProfile.uid, setNotifications, 10);
      return () => unsubscribe();
    }
  }, [userProfile?.uid]);

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userProfile || notifications.length === 0) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await markNotificationsAsRead(userProfile.uid, unreadIds);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">View notifications ({unreadCount} unread)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map(notif => (
                    <Link key={notif.id} href={notif.link} onClick={() => setIsPopoverOpen(false)}>
                      <div className={cn(
                        "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
                        !notif.read && "bg-primary/5"
                      )}>
                        <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true })}
                          </p>
                        </div>
                         {!notif.read && (
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0 self-center"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>You have no notifications yet.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-2 border-t">
            <Button asChild variant="ghost" className="w-full text-sm">
                <Link href="/notifications" onClick={() => setIsPopoverOpen(false)}>View all notifications</Link>
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

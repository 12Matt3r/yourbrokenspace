
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { listenForNotifications, markNotificationsAsRead } from '@/lib/firebase/firestoreService';
import type { NotificationData } from '@/config/notificationsData';
import { Bell, Loader2, MessageSquare, UserPlus, Heart, DollarSign, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';


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


export default function NotificationsPage() {
  const { userProfile } = useUser();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      const unsubscribe = listenForNotifications(userProfile.uid, (newNotifications) => {
        setNotifications(newNotifications);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
        setIsLoading(false);
        setNotifications([]);
    }
  }, [userProfile]);
  
  const handleMarkAllAsRead = async () => {
    if (!userProfile || notifications.length === 0) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await markNotificationsAsRead(userProfile.uid, unreadIds);
    }
  };

  return (
    <PageWrapper className="py-12">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-3xl font-headline flex items-center">
              <Bell className="h-7 w-7 mr-3 text-primary" /> Notifications
            </CardTitle>
            <CardDescription>Your recent account activity.</CardDescription>
          </div>
          <Button variant="link" onClick={handleMarkAllAsRead} disabled={notifications.every(n => n.read)}>
            Mark all as read
          </Button>
        </CardHeader>
        <CardContent className="p-0">
           {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(notif => (
                <Link key={notif.id} href={notif.link}>
                  <div className={cn(
                    "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors",
                    !notif.read && "bg-primary/5"
                  )}>
                    <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-grow">
                      <p className="font-semibold text-foreground">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        {formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true })}
                      </p>
                    </div>
                     {!notif.read && (
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0 self-center" aria-label="Unread"></div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
           ) : (
            <div className="text-center py-16 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p className="font-semibold">No notifications yet</p>
                <p className="text-sm">Interact with the community to get started.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}


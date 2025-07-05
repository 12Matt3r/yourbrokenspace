
'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Loader2 } from 'lucide-react';
import { type Creator, type Message } from '@/config/messagingData';
import { useUser } from '@/contexts/UserContext';
import { getOrCreateConversation, listenForMessages } from '@/lib/firebase/firestoreService';
import { sendMessageAction } from '@/lib/actions/messagingActions';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Creator;
}

export function ChatDialog({ isOpen, onClose, recipient }: ChatDialogProps) {
  const { userProfile } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userProfile && recipient) {
        setIsLoading(true);
        const fetchConversation = async () => {
            try {
                const senderInfo = { name: userProfile.name, avatarUrl: userProfile.avatarUrl, usernameParam: userProfile.usernameParam };
                const recipientInfo = { name: recipient.name, avatarUrl: recipient.avatarUrl, usernameParam: recipient.usernameParam };
                const participantInfo = { [userProfile.uid]: senderInfo, [recipient.id]: recipientInfo };
                
                const convId = await getOrCreateConversation(userProfile.uid, recipient.id, participantInfo);
                setConversationId(convId);
            } catch (error) {
                console.error("Failed to get or create conversation:", error);
                setIsLoading(false);
            }
        };
        fetchConversation();
    }
  }, [isOpen, userProfile, recipient]);
  
  useEffect(() => {
    if (conversationId) {
        setIsLoading(true);
        const unsubscribe = listenForMessages(conversationId, (newMessages) => {
            const formattedMessages = newMessages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : new Date(),
            }));
            setMessages(formattedMessages);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }
  }, [conversationId]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile || isSending) return;

    setIsSending(true);
    const result = await sendMessageAction(recipient.id, newMessage.trim());
    setIsSending(false);

    if (result.success) {
      setNewMessage('');
    } else {
      console.error("Failed to send message:", result.error);
    }
  };
  
  const getSender = (msg: Message) => {
      if (!userProfile) return null;
      return msg.senderId === userProfile.uid ? userProfile : recipient;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full flex flex-col h-[70vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b flex-row items-center space-y-0">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={recipient.avatarUrl} alt={recipient.name} data-ai-hint={recipient.avatarAiHint || 'user avatar'}/>
            <AvatarFallback>{recipient.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <DialogTitle className="text-lg">{recipient.name}</DialogTitle>
            <DialogDescription>@{recipient.usernameParam}</DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-grow p-4 bg-muted/30" ref={scrollAreaRef}>
           {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
           ) : (
            <div className="space-y-4">
                {messages.map((msg) => {
                const isMe = msg.senderId === userProfile?.uid;
                const sender = isMe ? userProfile : recipient;
                return (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        {!isMe && (
                        <Avatar className="h-7 w-7">
                            <AvatarImage src={sender?.avatarUrl} alt={sender?.name} data-ai-hint={sender?.avatarAiHint || 'user avatar'} />
                            <AvatarFallback>{sender?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        )}
                        <div
                        className={`max-w-[75%] p-2.5 rounded-lg shadow-sm ${
                            isMe
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-card border rounded-bl-none'
                        }`}
                        >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-xs mt-1 ${ isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/80 text-left'}`}>
                            {format(msg.timestamp, 'p')}
                        </p>
                        </div>
                    </div>
                    );
                })}
            </div>
           )}
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t bg-background">
           <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Textarea
              placeholder={`Message ${recipient.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="text-sm flex-grow resize-none min-h-[40px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={isSending || !userProfile}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending || !userProfile}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

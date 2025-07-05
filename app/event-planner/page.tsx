
'use client';

import { useEffect, useActionState, Suspense, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, CalendarCheck, Lightbulb, FileText, Tag, Copy, Check, Share2 } from 'lucide-react';
import { getEventPlanAction, publishEventAction } from './actions';
import { type EventPlannerFormState } from './schemas';
import { PageWrapper } from '@/components/PageWrapper';
import React from 'react';
import type { YourSpaceEvent } from '@/config/eventsData';
import { useUser } from '@/contexts/UserContext';


const initialFormState: EventPlannerFormState = {
  message: null,
  data: undefined,
  issues: undefined,
  fields: undefined,
  fieldErrors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto text-lg py-3 px-6">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
      Plan My Event
    </Button>
  );
}

function EventPlannerForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [formState, formAction] = useActionState(getEventPlanAction, initialFormState);
    const [copiedField, setCopiedField] = React.useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const { userProfile } = useUser();
    
    useEffect(() => {
        if (formState.message && !formState.data) {
            const description = formState.fieldErrors 
            ? "Please correct the errors highlighted in the form." 
            : formState.issues?.join('; ') || formState.message || "An unknown error occurred.";
            toast({
            variant: 'destructive',
            title: formState.fieldErrors ? 'Validation Error' : 'Planning Error',
            description: description,
            });
        }
    }, [formState, toast]);

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast({ title: 'Copied!', description: `${fieldName} copied to clipboard.`});
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handlePublishEvent = async () => {
        if (!formState.data || !userProfile) {
            toast({ variant: 'destructive', title: 'Error', description: 'AI data or user profile is missing.'});
            return;
        }

        setIsPublishing(true);
        const eventData = {
            hostId: userProfile.uid,
            title: formState.data.suggestedTitle,
            hostName: userProfile.name,
            hostUsername: userProfile.usernameParam,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Mock: 1 week from now
            type: 'Workshop' as YourSpaceEvent['type'], // Mocked default
            description: formState.data.suggestedDescription,
            coverImageUrl: 'https://placehold.co/800x450.png',
            coverImageAiHint: 'community event abstract',
            tags: formState.data.suggestedTags,
            platform: 'YourSpace Live' as YourSpaceEvent['platform'],
        };

        const result = await publishEventAction(eventData);
        setIsPublishing(false);

        if (result.success) {
            toast({
                title: 'Event Published!',
                description: `"${eventData.title}" is now live on the events page.`
            });
            router.push('/events');
        } else {
             toast({
                variant: 'destructive',
                title: 'Publishing Failed',
                description: result.error || 'Could not save the event to the database.'
            });
        }
    }

  return (
    <PageWrapper className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl border-border">
          <CardHeader className="text-center border-b pb-6 mb-6">
            <CalendarCheck className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-4xl font-bold font-headline text-foreground">AI Event Planner</CardTitle>
            <CardDescription className="text-xl text-muted-foreground mt-2">
              Turn your rough idea into a polished event page with a little help from your AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="eventIdea" className="text-xl font-semibold flex items-center gap-2"><Lightbulb/>Your Event Idea</Label>
                <Textarea
                    id="eventIdea"
                    name="eventIdea"
                    placeholder="e.g., A livestream where I compose a synthwave track from scratch, based on audience suggestions."
                    className="mt-2 min-h-[120px] text-base"
                    defaultValue={formState?.fields?.eventIdea}
                    aria-describedby="eventIdeaError"
                    aria-invalid={!!formState.fieldErrors?.eventIdea}
                />
                {formState.fieldErrors?.eventIdea && <p id="eventIdeaError" className="text-sm text-destructive mt-1">{formState.fieldErrors.eventIdea[0]}</p>}
              </div>
              <CardFooter className="flex justify-center p-0 pt-6">
                <SubmitButton />
              </CardFooter>
            </form>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl border-accent bg-accent/5 lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-3xl font-headline text-center text-accent-foreground">
                    Your AI-Generated Event Plan
                </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px] space-y-6">
                {formState.data ? (
                    <>
                        <SectionCard title="Suggested Title" onCopy={() => handleCopy(formState.data!.suggestedTitle, 'Title')} isCopied={copiedField === 'Title'}>
                           <h3 className="text-xl font-bold font-headline text-foreground">{formState.data.suggestedTitle}</h3>
                        </SectionCard>
                        
                        <SectionCard title="Suggested Description" onCopy={() => handleCopy(formState.data!.suggestedDescription, 'Description')} isCopied={copiedField === 'Description'}>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground bg-background/50 p-3 rounded-md font-sans leading-relaxed">{formState.data.suggestedDescription}</p>
                        </SectionCard>

                        <SectionCard title="Suggested Tags" onCopy={() => handleCopy(formState.data!.suggestedTags.join(', '), 'Tags')} isCopied={copiedField === 'Tags'}>
                             <div className="flex flex-wrap gap-2">
                                {formState.data.suggestedTags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-sm">{tag}</Badge>
                                ))}
                            </div>
                        </SectionCard>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <CalendarCheck className="h-12 w-12 mx-auto mb-3" />
                        <p>Your generated event plan will appear here.</p>
                        <p className="text-xs">Describe your idea and let the AI handle the details.</p>
                    </div>
                )}
            </CardContent>
             {formState.data && (
                <CardFooter className="p-4 border-t">
                    <Button onClick={handlePublishEvent} className="w-full text-lg" size="lg" disabled={isPublishing || !userProfile}>
                        {isPublishing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Share2 className="mr-2 h-5 w-5" />}
                        {isPublishing ? 'Publishing...' : 'Publish Event'}
                    </Button>
                </CardFooter>
            )}
        </Card>
      </div>
    </PageWrapper>
  );
}

interface SectionCardProps {
  title: string;
  onCopy: () => void;
  isCopied: boolean;
  children: React.ReactNode;
}

function SectionCard({ title, onCopy, isCopied, children }: SectionCardProps) {
  return (
    <Card className="bg-background/70 shadow-sm border-border/70">
      <CardHeader className="pb-3 pt-4 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-foreground/90">
          {title}
        </CardTitle>
        <Button onClick={onCopy} variant="ghost" size="icon" className="h-7 w-7">
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy {title}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}


export default function EventPlannerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EventPlannerForm />
        </Suspense>
    )
}

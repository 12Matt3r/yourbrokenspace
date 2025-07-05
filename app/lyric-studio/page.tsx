'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mic2, Loader2, Sparkles, Music, VenetianMask, MessageSquare, Lightbulb } from 'lucide-react';
import { getLyricsAction } from './actions';
import { type LyricsGeneratorFormState, LyricsThemeSchema, LyricsGenreSchema } from './schemas';
import { PageWrapper } from '@/components/PageWrapper';

const initialFormState: LyricsGeneratorFormState = {
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
      Compose Lyrics
    </Button>
  );
}

export default function LyricsGeneratorPage() {
  const { toast } = useToast();
  const [formState, formAction] = useActionState(getLyricsAction, initialFormState);
  
  useEffect(() => {
    if (formState.message && !formState.data) {
        const description = formState.fieldErrors 
          ? "Please correct the errors highlighted in the form." 
          : formState.issues?.join('; ') || formState.message || "An unknown error occurred.";
        toast({
          variant: 'destructive',
          title: formState.fieldErrors ? 'Validation Error' : 'Generation Error',
          description: description,
        });
    }
  }, [formState, toast]);

  return (
    <PageWrapper className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl border-border">
          <CardHeader className="text-center border-b pb-6 mb-6">
            <Mic2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-4xl font-bold font-headline text-foreground">AI Lyric Studio</CardTitle>
            <CardDescription className="text-xl text-muted-foreground mt-2">
              Overcome writer's block and find your voice. Let AI be your songwriting partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-xl font-semibold flex items-center gap-2"><VenetianMask /> Theme / Mood</Label>
                <Select name="theme" defaultValue={formState?.fields?.theme || LyricsThemeSchema.Enum.love}>
                  <SelectTrigger id="theme" className="mt-2 text-base">
                    <SelectValue placeholder="Select the theme or mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {LyricsThemeSchema.options.map(option => (
                      <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.fieldErrors?.theme && <p className="text-sm text-destructive mt-1">{formState.fieldErrors.theme[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-xl font-semibold flex items-center gap-2"><Music /> Genre</Label>
                 <Select name="genre" defaultValue={formState?.fields?.genre || LyricsGenreSchema.Enum.pop}>
                  <SelectTrigger id="genre" className="mt-2 text-base">
                    <SelectValue placeholder="Select the genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {LyricsGenreSchema.options.map(option => (
                      <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.fieldErrors?.genre && <p className="text-sm text-destructive mt-1">{formState.fieldErrors.genre[0]}</p>}
              </div>

               <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-xl font-semibold flex items-center gap-2"><Lightbulb /> Inspiring Keywords</Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    placeholder="e.g., city lights, empty streets, midnight rain"
                    className="mt-2 text-base"
                    defaultValue={formState?.fields?.keywords}
                    required
                  />
                  {formState.fieldErrors?.keywords && <p className="text-sm text-destructive mt-1">{formState.fieldErrors.keywords[0]}</p>}
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
                    Generated Masterpiece
                </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px]">
                {formState.data?.lyrics ? (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-center text-foreground font-headline">"{formState.data.titleSuggestion}"</h3>
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-background/50 p-4 rounded-md font-sans leading-relaxed">
                            {formState.data.lyrics}
                        </pre>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <Music className="h-12 w-12 mx-auto mb-3" />
                        <p>Your generated song lyrics will appear here.</p>
                        <p className="text-xs">Fill out the form and let the AI compose for you.</p>
                    </div>
                )}
            </CardContent>
        </Card>

      </div>
    </PageWrapper>
  );
}

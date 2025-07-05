
'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { getImageFeedbackAction, type ImageFeedbackState } from './actions';
import { Camera, Sparkles, Loader2, Image as ImageIcon, AlertTriangle, Composition, Droplet, Wand2, Paintbrush } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const initialState: ImageFeedbackState = {
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full text-lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Get AI Feedback
        </>
      )}
    </Button>
  );
}

const analysisGoalOptions = [
    { id: 'composition', label: 'Composition & Framing', icon: <Composition className="mr-2 h-4 w-4" /> },
    { id: 'color', label: 'Color & Mood', icon: <Droplet className="mr-2 h-4 w-4" /> },
    { id: 'style', label: 'Style & Filter Suggestions', icon: <Wand2 className="mr-2 h-4 w-4" /> },
];

export default function ImageEnhancerPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(getImageFeedbackAction, initialState);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string>('');

  React.useEffect(() => {
    if (state.message && !state.data) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.error || state.message,
      });
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setImageDataUri(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PageWrapper className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl border-border">
          <form action={formAction}>
            {imageDataUri && <input type="hidden" name="imageDataUri" value={imageDataUri} />}
            <CardHeader>
              <CardTitle className="text-3xl font-headline flex items-center">
                <Camera className="mr-3 h-8 w-8 text-primary" />
                AI Image Feedback Studio
              </CardTitle>
              <CardDescription className="text-lg">
                Get an expert AI critique on your visual art to help you enhance and refine it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="imageFile" className="text-xl font-semibold">Your Image</Label>
                    <Input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleFileChange} required className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                     {state.fieldErrors?.imageDataUri && <p className="text-sm text-destructive mt-1">{state.fieldErrors.imageDataUri[0]}</p>}
                </div>
              
                {imagePreview ? (
                    <div className="w-full h-full relative aspect-video rounded-md overflow-hidden border">
                        <Image src={imagePreview} alt="Image preview" fill style={{ objectFit: 'contain' }} />
                        <Badge variant="secondary" className="absolute bottom-2 right-2">{fileName}</Badge>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3" />
                        <p>Upload an image to get started.</p>
                    </div>
                )}
                
                 <div className="space-y-2">
                    <Label htmlFor="description" className="text-xl font-semibold">Description / Goal</Label>
                    <Textarea id="description" name="description" placeholder="e.g., 'This is a concept for a game character. I want it to feel more heroic.' or 'A landscape photo from my trip, trying to capture the serene mood.'" className="min-h-[100px] text-base" required />
                     {state.fieldErrors?.description && <p className="text-sm text-destructive mt-1">{state.fieldErrors.description[0]}</p>}
                </div>

                <div>
                    <Label className="text-xl font-semibold block mb-2">Analysis Goals</Label>
                    <div className="space-y-3">
                        {analysisGoalOptions.map((goal) => (
                        <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                            <Checkbox id={`analysisGoal-${goal.id}`} name="analysisGoals" value={goal.id} />
                            <Label htmlFor={`analysisGoal-${goal.id}`} className="text-base font-medium flex items-center cursor-pointer">
                            {goal.icon} {goal.label}
                            </Label>
                        </div>
                        ))}
                    </div>
                    {state.fieldErrors?.analysisGoals && <p className="text-sm text-destructive mt-2">{state.fieldErrors.analysisGoals}</p>}
                </div>

            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        {/* Output Display Card */}
        <Card className="shadow-xl border-accent bg-accent/5 lg:sticky lg:top-24">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-3 text-accent-foreground">
                    <Paintbrush className="h-7 w-7"/> AI Art Director's Feedback
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 min-h-[400px]">
                {state.data ? (
                    <>
                        <SectionCard title="Overall Critique">
                            <p className="whitespace-pre-line">{state.data.generalCritique}</p>
                        </SectionCard>
                        {state.data.compositionFeedback && (
                            <SectionCard title="Composition Feedback" icon={<Composition className="text-primary"/>}>
                                <p className="whitespace-pre-line">{state.data.compositionFeedback}</p>
                            </SectionCard>
                        )}
                        {state.data.colorFeedback && (
                            <SectionCard title="Color Feedback" icon={<Droplet className="text-primary"/>}>
                                <p className="whitespace-pre-line">{state.data.colorFeedback}</p>
                            </SectionCard>
                        )}
                        {state.data.styleSuggestions && (
                            <SectionCard title="Style Suggestions" icon={<Wand2 className="text-primary"/>}>
                               <div className="flex flex-wrap gap-2">
                                  {state.data.styleSuggestions.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>
                                  ))}
                                </div>
                            </SectionCard>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3" />
                        <p>Your feedback will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <Card className="bg-background/70 shadow-md border-border/70">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground/90">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

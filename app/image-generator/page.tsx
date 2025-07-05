
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus, useSearchParams } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction, type ImageGeneratorState } from './actions';
import { Wand2, Loader2, Sparkles, Image as ImageIcon, AlertTriangle, Copy, Check } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import React, { Suspense } from 'react';
import Link from 'next/link';

const initialState: ImageGeneratorState = {
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full text-lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Generate Image
        </>
      )}
    </Button>
  );
}

function ImageGeneratorForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(generateImageAction, initialState);
  const [hasCopied, setHasCopied] = React.useState(false);
  const promptFromParams = searchParams.get('prompt');

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleCopy = () => {
    if (state.imageDataUri) {
      navigator.clipboard.writeText(state.imageDataUri);
      setHasCopied(true);
      toast({ title: 'Copied!', description: 'Data URI copied to clipboard.' });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <PageWrapper className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Form Card */}
        <Card className="shadow-xl border-border">
          <form action={formAction}>
            <CardHeader>
              <CardTitle className="text-3xl font-headline flex items-center">
                <Sparkles className="mr-3 h-8 w-8 text-primary" />
                AI Image Generator
              </CardTitle>
              <CardDescription className="text-lg">
                Describe the image you want to create. Be as specific or imaginative as you like.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-xl font-semibold">Your Vision</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  key={promptFromParams} // Re-render if param changes
                  placeholder="e.g., A cinematic shot of a lone astronaut on a red desert planet, looking at two suns setting, hyperrealistic, 8k"
                  className="min-h-[150px] text-base"
                  defaultValue={promptFromParams || state.fields?.prompt}
                  required
                />
                {state.fieldErrors?.prompt && <p className="text-sm text-destructive mt-1">{state.fieldErrors.prompt[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        {/* Output Display Card */}
        <Card className="shadow-xl border-border flex flex-col items-center justify-center min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Generated Image</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow w-full flex items-center justify-center p-4">
            {state.imageDataUri ? (
              <div className="w-full h-full relative aspect-video rounded-md overflow-hidden border">
                <Image
                  src={state.imageDataUri}
                  alt="AI generated image"
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized // Data URIs don't need optimization
                />
              </div>
            ) : (
               <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto mb-3" />
                <p>Your generated image will appear here.</p>
              </div>
            )}
            {state.error && !state.imageDataUri && (
                <div className="text-center text-destructive p-8 border-2 border-dashed border-destructive/50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
                    <p>{state.error}</p>
                </div>
            )}
          </CardContent>
          <CardFooter className="w-full">
            <Button
              onClick={handleCopy}
              disabled={!state.imageDataUri}
              variant="outline"
              className="w-full"
            >
              {hasCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              {hasCopied ? 'Copied!' : 'Copy Data URI'}
            </Button>
          </CardFooter>
        </Card>

      </div>
       <Card className="mt-8 shadow-lg bg-muted/30">
        <CardHeader>
          <CardTitle>How to use your image</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>1. After generating an image, click the "Copy Data URI" button.</p>
          <p>2. Go to the <Link href="/upload" className="text-primary underline">Upload Page</Link> or your <Link href="/profile/me/edit" className="text-primary underline">Profile Editor</Link>.</p>
          <p>3. Paste the copied Data URI into any image URL input field (e.g., Thumbnail URL, Avatar URL).</p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default function ImageGeneratorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ImageGeneratorForm />
        </Suspense>
    )
}

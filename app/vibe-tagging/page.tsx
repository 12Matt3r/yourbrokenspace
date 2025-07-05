
'use client';

import { useEffect, Suspense } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Tag, Smile, AlertTriangle } from 'lucide-react';
import { getVibeTagsAction } from './actions';
import { AssetTypeSchema as AssetTypeEnum, type VibeTaggingFormState, type VibeTaggingFormData } from './schemas';
import { PageWrapper } from '@/components/PageWrapper';


const initialFormState: VibeTaggingFormState = {
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
      Get Vibe Tags
    </Button>
  );
}

function VibeTaggingFormComponent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [formState, formAction] = useFormState(getVibeTagsAction, initialFormState);
  
  const descriptionFromParams = searchParams.get('description');
  const assetTypeFromParams = searchParams.get('assetType');

  useEffect(() => {
    if (formState.message) {
      if (formState.data) {
        // Success toast can be optional if results are displayed directly
        // toast({ title: "Suggestions Ready!", description: formState.message });
      } else {
        // For validation errors or other issues from the action
        const description = formState.fieldErrors 
          ? "Please correct the errors highlighted in the form." 
          : formState.issues?.join('; ') || formState.message || "An unknown error occurred.";
        toast({
          variant: 'destructive',
          title: formState.fieldErrors ? 'Validation Error' : 'Tagging Error',
          description: description,
        });
      }
    }
  }, [formState, toast]);


  return (
     <PageWrapper className="py-12">
      <Card className="max-w-2xl mx-auto shadow-xl border-border">
        <CardHeader className="text-center border-b pb-6 mb-6">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold font-headline text-foreground">AI Vibe Tagging Studio</CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Unlock the perfect tags and emotive classifications for your creative assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8">
            <div>
              <Label htmlFor="assetDescription" className="text-xl font-semibold">Asset Description</Label>
              <Textarea
                key={descriptionFromParams}
                id="assetDescription"
                name="assetDescription"
                placeholder="e.g., A vibrant digital painting of a futuristic cityscape at sunset..."
                className="mt-2 min-h-[100px] text-base"
                defaultValue={descriptionFromParams || formState?.fields?.assetDescription}
                aria-describedby="assetDescriptionError"
                aria-invalid={!!formState.fieldErrors?.assetDescription}
              />
              {formState.fieldErrors?.assetDescription && <p id="assetDescriptionError" className="text-sm text-destructive mt-1">{formState.fieldErrors.assetDescription[0]}</p>}
            </div>

            <div>
              <Label htmlFor="assetType" className="text-xl font-semibold">Asset Type</Label>
              <Select 
                key={assetTypeFromParams}
                name="assetType" 
                defaultValue={assetTypeFromParams || formState?.fields?.assetType || AssetTypeEnum.Enum.image}
              >
                <SelectTrigger id="assetType" className="mt-2 text-base" aria-describedby="assetTypeError" aria-invalid={!!formState.fieldErrors?.assetType}>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {AssetTypeEnum.options.map(option => (
                     <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formState.fieldErrors?.assetType && <p id="assetTypeError" className="text-sm text-destructive mt-1">{formState.fieldErrors.assetType[0]}</p>}
            </div>

            <div>
              <Label htmlFor="communityTrends" className="text-xl font-semibold">Key Themes / Community Trends (Optional)</Label>
              <Input
                id="communityTrends"
                name="communityTrends"
                placeholder="e.g., #synthwave, lofi hiphop, indie dev scene"
                className="mt-2 text-base"
                defaultValue={formState?.fields?.communityTrends}
                aria-describedby="communityTrendsError"
                aria-invalid={!!formState.fieldErrors?.communityTrends}
              />
               <p className="text-xs text-muted-foreground mt-1">Briefly mention any relevant trends or themes your asset relates to.</p>
              {formState.fieldErrors?.communityTrends && <p id="communityTrendsError" className="text-sm text-destructive mt-1">{formState.fieldErrors.communityTrends[0]}</p>}
            </div>
            
            <CardFooter className="flex justify-center p-0 pt-6">
              <SubmitButton />
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {formState.data && (
        <Card className="max-w-2xl mx-auto mt-10 shadow-xl border-accent bg-accent/5">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-accent-foreground flex items-center justify-center gap-3">
                <Sparkles className="h-8 w-8"/> AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {formState.data.suggestedTags && formState.data.suggestedTags.length > 0 && (
              <SectionCard title="Suggested Tags" icon={<Tag className="text-primary" />}>
                <div className="flex flex-wrap gap-2">
                  {formState.data.suggestedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{tag}</Badge>
                  ))}
                </div>
              </SectionCard>
            )}
            {formState.data.emotiveClassifications && formState.data.emotiveClassifications.length > 0 && (
              <SectionCard title="Emotive Classifications" icon={<Smile className="text-primary" />}>
                 <div className="flex flex-wrap gap-2">
                    {formState.data.emotiveClassifications.map((classification, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1 border-accent text-accent-foreground bg-accent/20">{classification}</Badge>
                    ))}
                  </div>
              </SectionCard>
            )}
             {(!formState.data.suggestedTags || formState.data.suggestedTags.length === 0) && 
              (!formState.data.emotiveClassifications || formState.data.emotiveClassifications.length === 0) && (
                <div className="text-center py-6 border border-dashed rounded-md bg-muted/50 p-4">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
                    <p className="text-muted-foreground">The AI didn't provide specific suggestions for the given content.</p>
                    <p className="text-muted-foreground text-sm">Try rephrasing your description or providing more details.</p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  )
}


export default function VibeTaggingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VibeTaggingFormComponent />
        </Suspense>
    )
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
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

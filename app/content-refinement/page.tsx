
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2, Edit, Lightbulb, CheckSquare, Search, MessageSquare, AlertTriangle } from 'lucide-react';
import { getContentRefinementAction } from './actions';
import { type ContentRefinementFormState, ContentTypeSchema, AnalysisGoalSchema } from './schemas';
import type { ContentRefinementInput } from '@/ai/flows/content-refinement-flow';
import { PageWrapper } from '@/components/PageWrapper';

const initialFormState: ContentRefinementFormState = {
  message: null,
  data: undefined,
  issues: undefined,
  fields: undefined,
  fieldErrors: undefined,
};

const analysisGoalOptions = [
  { id: AnalysisGoalSchema.enum.suggest_titles, label: 'Suggest Titles', icon: <Lightbulb className="mr-2 h-4 w-4" /> },
  { id: AnalysisGoalSchema.enum.keyword_optimization, label: 'Keyword Optimization', icon: <Search className="mr-2 h-4 w-4" /> },
  { id: AnalysisGoalSchema.enum.improve_clarity, label: 'Improve Clarity & Flow', icon: <Edit className="mr-2 h-4 w-4" /> },
  { id: AnalysisGoalSchema.enum.tone_adjustment, label: 'Tone Adjustment', icon: <MessageSquare className="mr-2 h-4 w-4" /> },
];

const contentTypeOptions = [
  { value: ContentTypeSchema.enum.story_excerpt, label: 'Story Excerpt / Narrative' },
  { value: ContentTypeSchema.enum.artwork_description, label: 'Artwork Description / Artist Statement' },
  { value: ContentTypeSchema.enum.song_lyrics, label: 'Song Lyrics' },
  { value: ContentTypeSchema.enum.project_summary, label: 'Project Summary / Pitch' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto text-lg py-3 px-6">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Brain className="mr-2 h-5 w-5" />}
      Refine My Content
    </Button>
  );
}

export default function ContentRefinementPage() {
  const { toast } = useToast();
  const [formState, formAction] = useActionState(getContentRefinementAction, initialFormState);
  
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
          title: formState.fieldErrors ? 'Validation Error' : 'Refinement Error',
          description: description,
        });
      }
    }
  }, [formState, toast]);

  return (
    <PageWrapper className="py-12">
      <Card className="max-w-3xl mx-auto shadow-xl border-border">
        <CardHeader className="text-center border-b pb-6 mb-6">
          <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold font-headline text-foreground">Content Refinement Studio</CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Let AI help you polish your creative text and unlock its full potential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8">
            <div>
              <Label htmlFor="contentText" className="text-xl font-semibold">Your Content</Label>
              <Textarea
                id="contentText"
                name="contentText"
                placeholder="Paste or write your story excerpt, artwork description, song lyrics, or project summary here (min 50 characters)..."
                className="mt-2 min-h-[200px] text-base"
                defaultValue={formState?.fields?.contentText}
                aria-describedby="contentTextError"
                aria-invalid={!!formState.fieldErrors?.contentText}
              />
              {formState.fieldErrors?.contentText && <p id="contentTextError" className="text-sm text-destructive mt-1">{formState.fieldErrors.contentText[0]}</p>}
            </div>

            <div>
              <Label htmlFor="contentType" className="text-xl font-semibold">Content Type</Label>
              <Select name="contentType" defaultValue={formState?.fields?.contentType || contentTypeOptions[0].value}>
                <SelectTrigger id="contentType" className="mt-2 text-base" aria-describedby="contentTypeError" aria-invalid={!!formState.fieldErrors?.contentType}>
                  <SelectValue placeholder="Select the type of content" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formState.fieldErrors?.contentType && <p id="contentTypeError" className="text-sm text-destructive mt-1">{formState.fieldErrors.contentType[0]}</p>}
            </div>

            <div>
              <Label className="text-xl font-semibold block mb-2">Analysis Goals</Label>
              <div className="space-y-3">
                {analysisGoalOptions.map((goal) => (
                  <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`analysisGoal-${goal.id}`}
                      name="analysisGoals"
                      value={goal.id}
                      defaultChecked={formState?.fields?.analysisGoals?.includes(goal.id)}
                      aria-describedby="analysisGoalsError"
                    />
                    <Label htmlFor={`analysisGoal-${goal.id}`} className="text-base font-medium flex items-center cursor-pointer">
                      {goal.icon} {goal.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formState.fieldErrors?.analysisGoals && <p id="analysisGoalsError" className="text-sm text-destructive mt-2">{Array.isArray(formState.fieldErrors.analysisGoals) ? formState.fieldErrors.analysisGoals.join(', ') : formState.fieldErrors.analysisGoals}</p>}
            </div>
            
            <CardFooter className="flex justify-center p-0 pt-6">
              <SubmitButton />
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {formState.data && (
        <Card className="max-w-3xl mx-auto mt-10 shadow-xl border-accent bg-accent/5">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-accent-foreground flex items-center justify-center gap-3">
                <CheckSquare className="h-8 w-8"/> AI Refinement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {formState.data.suggestedTitles && formState.data.suggestedTitles.length > 0 && (
              <SectionCard title="Suggested Titles" icon={<Lightbulb className="text-primary" />}>
                <ul className="list-disc list-inside space-y-1">
                  {formState.data.suggestedTitles.map((title, index) => <li key={index}>{title}</li>)}
                </ul>
              </SectionCard>
            )}
            {formState.data.keywordSuggestions && formState.data.keywordSuggestions.length > 0 && (
              <SectionCard title="Keyword Suggestions" icon={<Search className="text-primary" />}>
                <div className="flex flex-wrap gap-2">
                  {formState.data.keywordSuggestions.map((keyword, index) => <Badge key={index} variant="secondary" className="text-sm">{keyword}</Badge>)}
                </div>
              </SectionCard>
            )}
            {formState.data.clarityFeedback && (
              <SectionCard title="Clarity Feedback" icon={<Edit className="text-primary" />}>
                <p className="whitespace-pre-line">{formState.data.clarityFeedback}</p>
              </SectionCard>
            )}
            {formState.data.toneAnalysis && (
              <SectionCard title="Tone Analysis" icon={<MessageSquare className="text-primary" />}>
                <p className="whitespace-pre-line">{formState.data.toneAnalysis}</p>
              </SectionCard>
            )}
            {formState.data.improvementPoints && formState.data.improvementPoints.length > 0 && (
              <SectionCard title="Actionable Improvement Points" icon={<CheckSquare className="text-primary" />}>
                <div className="space-y-4">
                  {formState.data.improvementPoints.map((item, index) => (
                    <div key={index} className="p-3 border rounded-md bg-background/50 shadow-sm">
                      <p className="font-semibold text-primary/90">Point: <span className="font-normal text-foreground">{item.point}</span></p>
                      <p className="font-semibold text-green-600 dark:text-green-500">Suggestion: <span className="font-normal text-foreground">{item.suggestion}</span></p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {Object.values(formState.data).every(value => value === undefined || (Array.isArray(value) && value.length === 0)) && (
                <div className="text-center py-6 border border-dashed rounded-md bg-muted/50 p-4">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
                    <p className="text-muted-foreground">The AI didn't provide specific suggestions for the selected goals with the given content.</p>
                    <p className="text-muted-foreground text-sm">Try rephrasing your content or selecting different analysis goals.</p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
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

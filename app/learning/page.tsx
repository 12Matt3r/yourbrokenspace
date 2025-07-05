
'use client';

import { useActionState, useEffect, Suspense, type ReactNode } from 'react';
import { useFormStatus, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, BookOpen, Youtube, ListChecks, Clock, SignalLow, SignalMedium, SignalHigh, Users, Palette, Music, Code, Gamepad2, Video, PenTool, Search, Filter, Radio, BrainCircuit, Loader2 } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import Link from 'next/link';
import { getLearningPathAction } from './actions';
import type { LearningPathState } from './schemas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'project' | 'quiz';
  durationEstimate: string; // e.g., "1h 30m", "20m"
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: 'Digital Art' | 'Music Production' | 'Web Development' | 'Game Development' | 'Creative AI' | 'Video Editing' | 'Creative Writing' | 'Glitch Art';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: string; // Creator's display name
  authorUsername: string; // Creator's username for linking
  steps: LearningPathStep[];
}

const mockLearningPaths: LearningPath[] = [
  {
    id: 'lp1',
    title: 'Introduction to Digital Painting',
    description: 'Learn the fundamentals of digital painting, from software basics to your first masterpiece.',
    category: 'Digital Art',
    difficulty: 'beginner',
    author: 'ArtMaster Ed',
    authorUsername: 'artmastered',
    steps: [
      { id: 'lp1s1', title: 'Understanding Your Tools (Photoshop/Krita)', description: 'Overview of brushes, layers, and common tools.', type: 'video', durationEstimate: '45m' },
      { id: 'lp1s2', title: 'Basic Sketching Techniques', description: 'Learn to sketch basic shapes and forms digitally.', type: 'article', durationEstimate: '30m' },
      { id: 'lp1s3', title: 'Color Theory Fundamentals', description: 'Introduction to color wheels, harmony, and contrast.', type: 'article', durationEstimate: '1h' },
      { id: 'lp1s4', title: 'Project: Paint a Simple Object', description: 'Apply your knowledge to paint a fruit or a geometric shape.', type: 'project', durationEstimate: '2h' },
    ],
  },
  {
    id: 'lp2',
    title: 'Synthwave Music Production Basics',
    description: 'Craft your own retro-futuristic synthwave tracks from scratch using Ableton Live or similar DAWs.',
    category: 'Music Production',
    difficulty: 'intermediate',
    author: 'Synthwave Sorceress', 
    authorUsername: 'me', 
    steps: [
      { id: 'lp2s1', title: 'Synthwave Sound Design: Drums', description: 'Creating classic gated reverb snares and punchy kicks.', type: 'video', durationEstimate: '1h 15m' },
      { id: 'lp2s2', title: 'Crafting Iconic Basslines', description: 'Techniques for creating driving and melodic bass parts.', type: 'video', durationEstimate: '1h' },
      { id: 'lp2s3', title: 'Melody and Pad Composition', description: 'Writing memorable melodies and lush atmospheric pads.', type: 'article', durationEstimate: '45m' },
      { id: 'lp2s4', title: 'Arrangement and Mixing Tips', description: 'Structuring your track and basic mixing concepts for synthwave.', type: 'project', durationEstimate: '2h 30m' },
      { id: 'lp2s5', title: 'Quiz: Synthwave Elements', description: 'Test your knowledge on common synthwave production techniques.', type: 'quiz', durationEstimate: '20m' },
    ],
  },
];


const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'digital art': return <Palette className="h-5 w-5 mr-2" />;
    case 'music production': return <Music className="h-5 w-5 mr-2" />;
    case 'web development': return <Code className="h-5 w-5 mr-2" />;
    case 'game development': return <Gamepad2 className="h-5 w-5 mr-2" />;
    case 'creative ai': return <BrainCircuit className="h-5 w-5 mr-2" />;
    case 'video editing': return <Video className="h-5 w-5 mr-2" />;
    case 'creative writing': return <PenTool className="h-5 w-5 mr-2" />;
    case 'glitch art': return <Radio className="h-5 w-5 mr-2" />;
    default: return <BookOpen className="h-5 w-5 mr-2" />;
  }
};

const getDifficultyIcon = (difficulty: LearningPath['difficulty']) => {
  switch (difficulty) {
    case 'beginner': return <SignalLow className="h-5 w-5 mr-1.5" />;
    case 'intermediate': return <SignalMedium className="h-5 w-5 mr-1.5" />;
    case 'advanced': return <SignalHigh className="h-5 w-5 mr-1.5" />;
    default: return null;
  }
};

const getStepTypeIcon = (type: LearningPathStep['type']) => {
  switch (type) {
    case 'article': return <BookOpen className="h-4 w-4 mr-2 text-primary" />;
    case 'video': return <Youtube className="h-4 w-4 mr-2 text-destructive" />;
    case 'project': return <ListChecks className="h-4 w-4 mr-2 text-green-600" />; 
    case 'quiz': return <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />; 
    default: return null;
  }
};

const initialLearningPathState: LearningPathState = {
    paths: mockLearningPaths,
    error: undefined,
    topic: undefined,
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
            {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
            {pending ? 'Generating...' : 'Generate with AI'}
        </Button>
    )
}

function LearningPathList({ paths }: { paths: LearningPath[] }) {
    if (paths.length === 0) {
        return (
            <div className="text-center py-16">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground">No Learning Paths Found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your search criteria or generating a new path with AI.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-10">
            {paths.map((path) => (
            <Card key={path.id} className="shadow-xl overflow-hidden border-border hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="bg-card/50 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div>
                    <CardTitle className="text-3xl font-headline text-foreground mb-1">{path.title}</CardTitle>
                    <CardDescription className="text-md text-muted-foreground">
                        By <Link href={`/profile/${path.authorUsername.toLowerCase()}`} className="text-primary hover:underline font-medium">{path.author}</Link>
                    </CardDescription>
                    </div>
                    <div className="flex flex-col sm:items-end items-start gap-2 mt-2 sm:mt-0 shrink-0">
                    <Badge variant="secondary" className="text-sm flex items-center py-1 px-3">
                        {getCategoryIcon(path.category)} {path.category}
                    </Badge>
                    <Badge variant="outline" className="text-sm flex items-center capitalize py-1 px-3">
                        {getDifficultyIcon(path.difficulty)} {path.difficulty}
                    </Badge>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">{path.description}</p>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                    <ListChecks className="h-6 w-6 mr-2 text-primary" /> Steps
                </h3>
                <Accordion type="single" collapsible className="w-full">
                    {path.steps.map((step, index) => (
                    <AccordionItem value={`step-${path.id}-${step.id}`} key={step.id} className="border-border/70">
                        <AccordionTrigger className="text-lg hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full">
                            <span className="truncate text-left flex items-center">
                            {getStepTypeIcon(step.type)}
                            {index + 1}. {step.title}
                            </span>
                            <div className="flex items-center text-sm text-muted-foreground ml-4 shrink-0">
                            <Clock className="h-4 w-4 mr-1.5" />
                            {step.durationEstimate}
                            </div>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-2 text-muted-foreground pl-2 border-l-2 border-primary/50 ml-1">
                        <p className="mb-2">{step.description}</p>
                        <Badge variant="outline" className="capitalize text-xs py-0.5 px-2">{step.type}</Badge>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                </CardContent>
                <CardFooter className="p-6 bg-muted/30 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                        {path.steps.length} steps to complete.
                    </p>
                </CardFooter>
            </Card>
            ))}
        </div>
    )
}


function LearningPathsPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const topicFromParams = searchParams.get('topic');
  const [state, formAction] = useActionState(getLearningPathAction, initialLearningPathState);

  useEffect(() => {
    if (state.error) {
        toast({ variant: "destructive", title: "Generation Error", description: state.error });
    }
  }, [state, toast]);


  return (
    <PageWrapper className="py-12">
      <header className="mb-12 text-center">
        <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Learning Paths</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Curated guides to help you master new skills. Request a topic and let AI build a custom path for you.
        </p>
      </header>

      <Card className="mb-10 p-6 bg-card rounded-lg shadow-lg">
        <form action={formAction}>
            <Label htmlFor="search-learning-paths" className="text-lg font-medium">Generate a custom learning path</Label>
            <div className="relative mt-1 flex flex-col md:flex-row gap-2">
                <Input
                    id="search-learning-paths"
                    name="topic"
                    type="text"
                    key={topicFromParams}
                    defaultValue={topicFromParams || state.topic}
                    placeholder="e.g., 'Pixel art for beginners', 'Advanced sound design for cinematic horror'"
                    className="flex-grow text-base"
                />
                <SubmitButton />
            </div>
        </form>
      </Card>
      
      <Separator className="my-8" />
      
      <LearningPathList paths={state.paths || []} />

    </PageWrapper>
  );
}

export default function LearningPathsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LearningPathsPageContent />
        </Suspense>
    )
}

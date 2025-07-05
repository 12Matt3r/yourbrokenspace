'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { useUser } from '@/contexts/UserContext';
import { createGuildAction, type CreateGuildState } from './actions';
import { Users, Palette, Music, Code, PenTool, Gamepad2, Sparkles, UploadCloud, Loader2, ArrowLeft, PlusCircle } from 'lucide-react';

const iconOptions = [
    { value: 'Sparkles', label: 'General Creativity', icon: <Sparkles className="h-4 w-4 mr-2" /> },
    { value: 'Palette', label: 'Visual Arts', icon: <Palette className="h-4 w-4 mr-2" /> },
    { value: 'Music', label: 'Music & Audio', icon: <Music className="h-4 w-4 mr-2" /> },
    { value: 'PenTool', label: 'Writing', icon: <PenTool className="h-4 w-4 mr-2" /> },
    { value: 'Code', label: 'Coding & Dev', icon: <Code className="h-4 w-4 mr-2" /> },
    { value: 'Gamepad2', label: 'Game Development', icon: <Gamepad2 className="h-4 w-4 mr-2" /> },
    { value: 'Users', label: 'Community & Social', icon: <Users className="h-4 w-4 mr-2" /> },
];

const initialState: CreateGuildState = { message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {pending ? 'Creating Guild...' : 'Create Guild'}
        </Button>
    )
}

export default function CreateGuildPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile, loading: userLoading } = useUser();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const boundCreateGuildAction = createGuildAction.bind(null, userProfile?.uid || '');
  const [state, formAction] = useFormState(boundCreateGuildAction, initialState);

  useEffect(() => {
    if (state.message === 'success' && state.guildId) {
        toast({ title: 'Guild Created!', description: 'Your new guild is now live.' });
        router.push(`/guilds/${state.guildId}`);
    } else if (state.message && state.message !== 'Validation failed. Please check the fields.') {
        toast({ variant: 'destructive', title: 'Creation Failed', description: state.message });
    }
  }, [state, router, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (userLoading) {
    return (
      <PageWrapper className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </PageWrapper>
    );
  }

  if (!userProfile) {
    // Or redirect to login
    return (
        <PageWrapper className="flex justify-center items-center h-screen">
            <Card className="p-8 text-center">
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>You must be logged in to create a guild.</CardDescription>
                <Link href="/login" className="mt-4"><Button>Login</Button></Link>
            </Card>
        </PageWrapper>
    )
  }

  return (
    <PageWrapper className="py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
                <CardTitle className="text-3xl font-headline flex items-center">
                    <Users className="mr-3 h-8 w-8 text-primary" />
                    Create a New Guild
                </CardTitle>
                <CardDescription>Build a new community space on YourSpace. All fields are required.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-lg font-medium">Guild Name</Label>
                        <Input id="name" name="name" placeholder="e.g., The Pixel Pushers, Synthwave Producers" required />
                        {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-lg font-medium">Description</Label>
                        <Textarea id="description" name="description" placeholder="A short, catchy description of what your guild is about." className="min-h-[100px]" required />
                         {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="icon" className="text-lg font-medium">Icon</Label>
                        <Select name="icon" defaultValue="Sparkles" required>
                             <SelectTrigger id="icon"><SelectValue placeholder="Select an icon for your guild" /></SelectTrigger>
                             <SelectContent>
                                {iconOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center">{opt.icon} {opt.label}</div>
                                    </SelectItem>
                                ))}
                             </SelectContent>
                        </Select>
                        {state?.errors?.icon && <p className="text-sm text-destructive">{state.errors.icon[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coverImage" className="text-lg font-medium">Cover Image</Label>
                        <Input id="coverImage" name="coverImage" type="file" accept="image/*" onChange={handleFileChange} required />
                        {state?.errors?.coverImage && <p className="text-sm text-destructive">{state.errors.coverImage[0]}</p>}
                    </div>
                    {imagePreview && (
                        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted border-2 border-dashed">
                            <Image src={imagePreview} alt="Cover image preview" fill style={{ objectFit: 'cover' }} />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Link href="/guilds">
                        <Button type="button" variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Cancel</Button>
                    </Link>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    </PageWrapper>
  );
}

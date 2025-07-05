
'use client';

import { useState, useEffect, ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, Image as ImageIconLucide, Save, XCircle, Palette, Info, Settings, BookOpen, Feather, Tag as TagIcon, Link as LinkIconLucide, LayoutDashboard, Trash2, Sparkles, PlusCircle, Award, Users2, Briefcase, Brain, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { type UserProfileData, type Creation, type MoodboardItem, type Supporter } from '@/config/profileData'; 
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { generateThemeAction, type AIThemeGeneratorState } from './actions';
import { useUser } from '@/contexts/UserContext';
import { uploadFileAndGetURL } from '@/lib/firebase/storageService';
import { updateUserProfile } from '@/lib/firebase/firestoreService';

type FontStyle = 'Space Grotesk' | 'Lora' | 'Roboto Mono' | 'Playfair Display';

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const { toast } = useToast();
  
  const { userProfile: loggedInUserProfile, loading: authLoading } = useUser();
  const isCurrentUser = loggedInUserProfile?.usernameParam === username || (username === 'me' && !!loggedInUserProfile);

  const [isSaving, setIsSaving] = useState(false);

  // Basic Profile State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [creatorType, setCreatorType] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [flairTitle, setFlairTitle] = useState('');
  const [personalVibeTags, setPersonalVibeTags] = useState('');
  const [website, setWebsite] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [influences, setInfluences] = useState('');
  const [tools, setTools] = useState('');
  const [philosophy, setPhilosophy] = useState('');
  const [availableForMentorship, setAvailableForMentorship] = useState(false);

  // Visuals State
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [coverImageUrlInput, setCoverImageUrlInput] = useState('');
  const [pageBackgroundImageUrlInput, setPageBackgroundImageUrlInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pageBackgroundPreview, setPageBackgroundPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pageBackgroundFile, setPageBackgroundFile] = useState<File | null>(null);

  // Theme Engine State
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#121212');
  const [pageTextColor, setPageTextColor] = useState('#E0E0E0');
  const [accentColor, setAccentColor] = useState('#BB86FC');
  const [cardBackgroundColor, setCardBackgroundColor] = useState('#1E1E1E');
  const [cardTextColor, setCardTextColor] = useState('#E0E0E0');
  const [headingFont, setHeadingFont] = useState<FontStyle>('Space Grotesk');
  const [bodyFont, setBodyFont] = useState<FontStyle>('Space Grotesk');
  const [cardBorderRadius, setCardBorderRadius] = useState([0.75]);
  const [cardOpacity, setCardOpacity] = useState([0.8]);

  // AI Theme Generator State
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [aiThemePrompt, setAiThemePrompt] = useState('');
  const [aiThemeResult, setAiThemeResult] = useState<AIThemeGeneratorState | null>(null);

  // Moodboard State
  const [moodboardItems, setMoodboardItems] = useState<MoodboardItem[]>([]);
  const [newMoodboardItemUrl, setNewMoodboardItemUrl] = useState('');
  const [newMoodboardItemDescription, setNewMoodboardItemDescription] = useState('');
  const [newMoodboardItemAiHint, setNewMoodboardItemAiHint] = useState('');
  
  useEffect(() => {
    if (loggedInUserProfile) {
        const data = loggedInUserProfile;
        // Basic Info
        setDisplayName(data.name || '');
        setBio(data.bio || '');
        setCreatorType(data.creatorType || '');
        setSpecialization(data.specialization || '');
        setFlairTitle(data.flairTitle || '');
        setPersonalVibeTags((data.personalVibeTags || []).join(', '));
        setWebsite(data.website || '');
        setKeySkills((data.keySkills || []).join(', '));
        setInfluences((data.influences || []).join(', '));
        setTools((data.tools || []).join(', '));
        setPhilosophy(data.philosophy || '');
        setAvailableForMentorship(data.availableForMentorship !== undefined ? data.availableForMentorship : false);
        setMoodboardItems(data.moodboardItems || []);

        // Visuals
        setAvatarUrlInput(data.avatarUrl || '');
        setAvatarPreview(data.avatarUrl || null);
        setCoverImageUrlInput(data.coverImageUrl || '');
        setCoverPreview(data.coverImageUrl || null);

        // Theme Engine
        const cust = data.customization;
        if (cust) {
            setPageBackgroundColor(cust.pageBackgroundColor);
            setPageTextColor(cust.pageTextColor);
            setAccentColor(cust.accentColor);
            setCardBackgroundColor(cust.cardBackgroundColor);
            setCardTextColor(cust.cardTextColor);
            setHeadingFont(cust.headingFont as FontStyle);
            setBodyFont(cust.bodyFont as FontStyle);
            setCardBorderRadius([cust.cardBorderRadius]);
            setCardOpacity([cust.cardOpacity]);
            setPageBackgroundImageUrlInput(cust.pageBackgroundImageUrl || '');
            setPageBackgroundPreview(cust.pageBackgroundImageUrl || null);
        }
    }
  }, [loggedInUserProfile]);

  useEffect(() => {
    if (!aiThemeResult) return;
    if (aiThemeResult.data) {
      toast({ title: 'Theme Applied!', description: 'Your new theme has been applied to the controls below.' });
      setPageBackgroundColor(aiThemeResult.data.pageBackgroundColor);
      setPageTextColor(aiThemeResult.data.pageTextColor);
      setAccentColor(aiThemeResult.data.accentColor);
      setCardBackgroundColor(aiThemeResult.data.cardBackgroundColor);
      setCardTextColor(aiThemeResult.data.cardTextColor);
      setHeadingFont(aiThemeResult.data.headingFont as FontStyle);
      setBodyFont(aiThemeResult.data.bodyFont as FontStyle);
    } else if (aiThemeResult.error) {
      toast({ variant: 'destructive', title: 'Theme Generation Failed', description: aiThemeResult.error });
    }
  }, [aiThemeResult, toast]);

  const handleGenerateThemeClick = async () => {
    if (!aiThemePrompt.trim()) {
        toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please enter a description for the theme.' });
        return;
    }
    setIsGeneratingTheme(true);
    const result = await generateThemeAction(aiThemePrompt);
    setAiThemeResult(result);
    setIsGeneratingTheme(false);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
      if (setPreview === setAvatarPreview) setAvatarUrlInput('');
      if (setPreview === setCoverPreview) setCoverImageUrlInput('');
      if (setPreview === setPageBackgroundPreview) setPageBackgroundImageUrlInput('');
    }
  };

  const handleUrlInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setUrlInput: React.Dispatch<React.SetStateAction<string>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const newUrl = event.target.value;
    setUrlInput(newUrl);
    if (newUrl) {
      setPreview(newUrl);
      setFile(null); 
    } else {
      setPreview(null); 
    }
  };

  const handleAddMoodboardItem = () => {
    if (!newMoodboardItemUrl.trim() || !newMoodboardItemAiHint.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Moodboard Info',
        description: 'Please provide an Image URL and AI Hint for the moodboard item.',
      });
      return;
    }
    const newItem: MoodboardItem = {
      id: `mb-${Date.now()}`,
      imageUrl: newMoodboardItemUrl,
      description: newMoodboardItemDescription,
      aiHint: newMoodboardItemAiHint,
    };
    setMoodboardItems(prev => [...prev, newItem]);
    setNewMoodboardItemUrl('');
    setNewMoodboardItemDescription('');
    setNewMoodboardItemAiHint('');
    toast({ title: 'Moodboard Item Added', description: 'The new item has been added to your list.' });
  };

  const handleDeleteMoodboardItem = (itemId: string) => {
    setMoodboardItems(prev => prev.filter(item => item.id !== itemId));
    toast({ title: 'Moodboard Item Removed', description: 'The item has been removed from your list.' });
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loggedInUserProfile) {
        toast({ variant: 'destructive', title: "Not Authenticated", description: "You must be logged in to save your profile." });
        return;
    }

    setIsSaving(true);
    let finalAvatarUrl = avatarUrlInput || loggedInUserProfile.avatarUrl;
    let finalCoverUrl = coverImageUrlInput || loggedInUserProfile.coverImageUrl;
    let finalBackgroundUrl = pageBackgroundImageUrlInput || loggedInUserProfile.customization.pageBackgroundImageUrl;

    try {
        if (avatarFile) {
            finalAvatarUrl = await uploadFileAndGetURL(avatarFile, loggedInUserProfile.uid, 'avatars');
        }
        if (coverFile) {
            finalCoverUrl = await uploadFileAndGetURL(coverFile, loggedInUserProfile.uid, 'covers');
        }
        if (pageBackgroundFile) {
            finalBackgroundUrl = await uploadFileAndGetURL(pageBackgroundFile, loggedInUserProfile.uid, 'backgrounds');
        }

        const dataToUpdate: Partial<UserProfileData> = {
            name: displayName,
            bio,
            creatorType,
            specialization,
            flairTitle,
            personalVibeTags: personalVibeTags.split(',').map(tag => tag.trim()).filter(Boolean),
            website,
            keySkills: keySkills.split(',').map(skill => skill.trim()).filter(Boolean),
            influences: influences.split(',').map(inf => inf.trim()).filter(Boolean),
            tools: tools.split(',').map(tool => tool.trim()).filter(Boolean),
            philosophy,
            availableForMentorship,
            avatarUrl: finalAvatarUrl,
            coverImageUrl: finalCoverUrl,
            moodboardItems,
            customization: {
                pageBackgroundColor,
                pageTextColor,
                accentColor,
                cardBackgroundColor,
                cardTextColor,
                headingFont,
                bodyFont,
                cardBorderRadius: cardBorderRadius[0],
                cardOpacity: cardOpacity[0],
                pageBackgroundImageUrl: finalBackgroundUrl,
            }
        };

        await updateUserProfile(loggedInUserProfile.uid, dataToUpdate);

        toast({ title: "Profile Updated!", description: "Your changes have been saved to the cloud." });
        router.push(`/profile/me`);

    } catch (error) {
        console.error("Profile update failed:", error);
        toast({ variant: "destructive", title: "Update Failed", description: "Could not save your changes. Please try again." });
    } finally {
        setIsSaving(false);
    }
  };
  
  const fontOptions: { value: FontStyle; label: string; family: string; }[] = [
    { value: 'Space Grotesk', label: 'Space Grotesk (Default)', family: "'Space Grotesk', sans-serif" },
    { value: 'Lora', label: 'Lora', family: "'Lora', serif" },
    { value: 'Roboto Mono', label: 'Roboto Mono', family: "'Roboto Mono', monospace" },
    { value: 'Playfair Display', label: 'Playfair Display', family: "'Playfair Display', serif" },
  ];

  if (authLoading) {
    return (
        <div className="container mx-auto py-12 px-4 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-3xl font-bold">Loading Editor...</h1>
        </div>
    );
  }

  if (!isCurrentUser) {
      return (
          <div className="container mx-auto py-12 px-4 text-center">
              <UserCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground mt-2">You can only edit your own profile.</p>
              <Link href={`/profile/${username}`}>
                <Button variant="outline" className="mt-6">Go to Profile</Button>
              </Link>
          </div>
      )
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center">
            <Settings className="mr-3 h-8 w-8 text-primary" /> Edit Your Profile & Space
          </CardTitle>
          <CardDescription>
            Craft your public presence and customize your personal space. Use the sections below to add details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10">

            <Card className="p-6 border rounded-lg shadow-sm">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-semibold text-primary flex items-center">
                    <Info className="mr-3 h-6 w-6" /> Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="font-medium">Display Name*</Label>
                    <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your public name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creatorType" className="font-medium">Creator Type</Label>
                    <Input id="creatorType" type="text" value={creatorType} onChange={(e) => setCreatorType(e.target.value)} placeholder="e.g., Digital Artist, Musician" />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bio" className="font-medium">Short Bio (Header)</Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A brief introduction that appears in your header." className="min-h-[80px]" rows={3} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="font-medium">Specialization</Label>
                      <Input id="specialization" type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Concept Art, Indie Pop" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flairTitle" className="font-medium flex items-center"><Feather className="mr-2 h-4 w-4 text-amber-500"/>Flair Title</Label>
                      <Input id="flairTitle" type="text" value={flairTitle} onChange={(e) => setFlairTitle(e.target.value)} placeholder="e.g., Pixel Druid, Synth Witch" />
                    </div>
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="font-medium">Website/Portfolio Link</Label>
                  <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-portfolio.com" />
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border rounded-lg shadow-sm">
                 <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <BookOpen className="mr-3 h-6 w-6" /> Detailed Information (for your "About" tab)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="philosophy" className="font-medium">Artistic/Musical Statement</Label>
                        <Textarea id="philosophy" value={philosophy} onChange={(e) => setPhilosophy(e.target.value)} placeholder="Your detailed thoughts, mission, or artistic/musical vision..." className="min-h-[150px]" rows={6} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personalVibeTags" className="font-medium flex items-center"><TagIcon className="mr-2 h-4 w-4 text-accent"/>Personal Vibe Tags (comma-separated)</Label>
                      <Input id="personalVibeTags" value={personalVibeTags} onChange={(e) => setPersonalVibeTags(e.target.value)} placeholder="e.g., Retro, Chill, Experimental" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keySkills" className="font-medium flex items-center"><Award className="mr-2 h-4 w-4"/>Key Skills (comma-separated)</Label>
                      <Input id="keySkills" value={keySkills} onChange={(e) => setKeySkills(e.target.value)} placeholder="e.g., Photoshop, Ableton Live, Songwriting" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="influences" className="font-medium flex items-center"><Users2 className="mr-2 h-4 w-4"/>Influences (comma-separated)</Label>
                            <Input id="influences" value={influences} onChange={(e) => setInfluences(e.target.value)} placeholder="Artists, genres, movements" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tools" className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4"/>Tools of Trade (comma-separated)</Label>
                            <Input id="tools" value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Software, hardware" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
                        <div className="space-y-0.5">
                        <Label htmlFor="availableForMentorship" className="font-medium flex items-center">
                           Available for Mentorship
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Let others know you're open to providing mentorship.
                        </p>
                        </div>
                        <Switch
                        id="availableForMentorship"
                        checked={availableForMentorship}
                        onCheckedChange={setAvailableForMentorship}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="p-6 border rounded-lg shadow-sm">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <ImageIconLucide className="mr-3 h-6 w-6" /> Profile Visuals
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                    <div className="space-y-4">
                        <Label className="font-medium">Profile Picture</Label>
                        <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            {avatarPreview ? (
                            <AvatarImage src={avatarPreview} alt="Profile preview" data-ai-hint={'profile avatar'} />
                            ) : (
                            <AvatarFallback className="text-3xl">
                                {displayName?.charAt(0).toUpperCase() || <UserCircle className="h-12 w-12" />}
                            </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex-grow space-y-2">
                            <Input id="avatarFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)} />
                            <Input id="avatarUrlInput" type="url" value={avatarUrlInput || ''} onChange={(e) => handleUrlInputChange(e, setAvatarUrlInput, setAvatarPreview, setAvatarFile)} placeholder="Or paste image URL"/>
                        </div>
                        </div>
                        {avatarFile && <p className="text-xs text-muted-foreground mt-1">New file: {avatarFile.name}</p>}
                    </div>
                     <Separator />
                    <div className="space-y-4">
                        <Label className="font-medium">Cover Image</Label>
                        {coverPreview && (
                        <div className="relative aspect-[3/1] w-full rounded-md overflow-hidden bg-muted mb-2">
                            <Image src={coverPreview} alt="Cover preview" fill style={{objectFit:"cover"}} data-ai-hint={'abstract banner'} />
                        </div>
                        )}
                        <div className="space-y-2">
                            <Input id="coverFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setCoverFile, setCoverPreview)} />
                            <Input id="coverUrlInput" type="url" value={coverImageUrlInput || ''} onChange={(e) => handleUrlInputChange(e, setCoverImageUrlInput, setCoverPreview, setCoverFile)} placeholder="Or paste cover image URL" />
                        </div>
                        {coverFile && <p className="text-xs text-muted-foreground mt-1">New file: {coverFile.name}</p>}
                    </div>
                </CardContent>
            </Card>
            
            <Card className="p-6 border rounded-lg shadow-sm">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-semibold text-primary flex items-center">
                  <Palette className="mr-3 h-6 w-6" /> Theme Engine
                </CardTitle>
                 <CardDescription>Go into extreme detail and customize your personal sanctuary, or let AI help!</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-8">
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                    <h4 className="text-lg font-medium flex items-center"><Sparkles className="mr-2 text-accent"/>AI Theme Weaver</h4>
                    <p className="text-sm text-muted-foreground">Describe the vibe you want for your space, and let AI generate a theme for you.</p>
                    <div className="space-y-2">
                        <Label htmlFor="aiThemePrompt">Theme Prompt</Label>
                        <Textarea id="aiThemePrompt" name="prompt" value={aiThemePrompt} onChange={(e) => setAiThemePrompt(e.target.value)} placeholder="e.g., A calm, mystical forest at dusk with fireflies" />
                        {aiThemeResult?.fieldErrors?.prompt && <p className="text-sm text-destructive mt-1">{aiThemeResult.fieldErrors.prompt[0]}</p>}
                    </div>
                    <Button type="button" onClick={handleGenerateThemeClick} disabled={isGeneratingTheme} className="w-full">
                        {isGeneratingTheme ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGeneratingTheme ? 'Generating...' : 'Generate Theme with AI'}
                    </Button>
                     {aiThemeResult?.data?.suggestedBackgroundPrompt && (
                        <div className="pt-2 text-sm text-center">
                            <p className="text-muted-foreground">AI suggests this background prompt:</p>
                            <p className="italic font-medium text-foreground my-1">"{aiThemeResult.data.suggestedBackgroundPrompt}"</p>
                            <Link href={`/image-generator?prompt=${encodeURIComponent(aiThemeResult.data.suggestedBackgroundPrompt)}`} legacyBehavior>
                                <a target="_blank" rel="noopener noreferrer">
                                <Button variant="link" size="sm">
                                    Generate Image <Brain className="ml-2 h-4 w-4" />
                                </Button>
                                </a>
                            </Link>
                        </div>
                    )}
                </div>
                <Separator/>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Color Palette</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pageBackgroundColor">Page Background</Label>
                      <Input id="pageBackgroundColor" type="color" value={pageBackgroundColor} onChange={(e) => setPageBackgroundColor(e.target.value)} className="p-1 h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pageTextColor">Page Text</Label>
                      <Input id="pageTextColor" type="color" value={pageTextColor} onChange={(e) => setPageTextColor(e.target.value)} className="p-1 h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Primary Accent</Label>
                      <Input id="accentColor" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="p-1 h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardBackgroundColor">Card Background</Label>
                      <Input id="cardBackgroundColor" type="color" value={cardBackgroundColor} onChange={(e) => setCardBackgroundColor(e.target.value)} className="p-1 h-10 w-full" />
                    </div>
                  </div>
                </div>
                <Separator/>
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Typography</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="headingFont">Heading Font</Label>
                      <Select value={headingFont} onValueChange={(value: FontStyle) => setHeadingFont(value)}>
                        <SelectTrigger><SelectValue placeholder="Select heading font" /></SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => <SelectItem key={font.value} value={font.value} style={{fontFamily: font.family}}>{font.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bodyFont">Body Font</Label>
                      <Select value={bodyFont} onValueChange={(value: FontStyle) => setBodyFont(value)}>
                        <SelectTrigger><SelectValue placeholder="Select body font" /></SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => <SelectItem key={font.value} value={font.value} style={{fontFamily: font.family}}>{font.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Separator/>
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Layout & Effects</h4>
                   <div className="space-y-2">
                      <Label htmlFor="cardBorderRadius">Card Corner Radius: {cardBorderRadius[0].toFixed(2)}rem</Label>
                      <Slider id="cardBorderRadius" value={cardBorderRadius} onValueChange={setCardBorderRadius} max={2} step={0.05} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="cardOpacity">Card Opacity / Glassmorphism: {Math.round(cardOpacity[0] * 100)}%</Label>
                      <Slider id="cardOpacity" value={cardOpacity} onValueChange={setCardOpacity} max={1} step={0.01} />
                  </div>
                </div>

                <Separator/>
                 <div className="space-y-4">
                    <h4 className="text-lg font-medium">Page Background Image</h4>
                    {pageBackgroundPreview && (
                    <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted mb-2 border">
                        <Image src={pageBackgroundPreview} alt="Page background preview" fill style={{objectFit:"cover"}} data-ai-hint={'abstract background'}/>
                    </div>
                    )}
                    <div className="space-y-2">
                        <Input id="pageBackgroundFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPageBackgroundFile, setPageBackgroundPreview)} />
                        <Input id="pageBackgroundUrlInput" type="url" value={pageBackgroundImageUrlInput || ''} onChange={(e) => handleUrlInputChange(e, setPageBackgroundUrlInput, setPageBackgroundPreview, setPageBackgroundFile)} placeholder="Or paste background image URL" />
                    </div>
                    {pageBackgroundFile && <p className="text-xs text-muted-foreground mt-1">New file: {pageBackgroundFile.name}</p>}
                    {!pageBackgroundFile && !pageBackgroundPreview && <p className="text-xs text-muted-foreground mt-1">No background image set. Background color will be used.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border rounded-lg shadow-sm">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-semibold text-primary flex items-center">
                  <LayoutDashboard className="mr-3 h-6 w-6" /> Curate Your Moodboard / Virtual Relics
                </CardTitle>
                <CardDescription>Add images that inspire you. They will appear on your profile's Moodboard tab.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Card className="p-4 bg-muted/30">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="newMoodboardItemUrl">Image URL*</Label>
                            <Input id="newMoodboardItemUrl" type="url" value={newMoodboardItemUrl} onChange={(e) => setNewMoodboardItemUrl(e.target.value)} placeholder="https://example.com/image.png" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="newMoodboardItemDescription">Description (Optional)</Label>
                            <Input id="newMoodboardItemDescription" value={newMoodboardItemDescription} onChange={(e) => setNewMoodboardItemDescription(e.target.value)} placeholder="Brief description of the image" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="newMoodboardItemAiHint">AI Hint for Image* (max 2 words)</Label>
                            <Input id="newMoodboardItemAiHint" type="text" value={newMoodboardItemAiHint} onChange={(e) => setNewMoodboardItemAiHint(e.target.value)} placeholder="e.g., abstract neon, vintage synth" />
                        </div>
                         <Button type="button" variant="secondary" onClick={handleAddMoodboardItem}><PlusCircle className="mr-2 h-4 w-4" />Add Relic to Moodboard</Button>
                    </div>
                </Card>

                {moodboardItems.length > 0 && (
                    <div className="mt-6 space-y-4">
                    <h4 className="text-lg font-medium mb-2">Current Relics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {moodboardItems.map((item, index) => (
                        <Card key={item.id} className="overflow-hidden shadow-sm">
                            <div className="relative aspect-square bg-muted">
                            <Image src={item.imageUrl} alt={item.description || `Moodboard item ${index + 1}`} fill style={{objectFit:"cover"}} data-ai-hint={item.aiHint}/>
                            </div>
                            <CardContent className="p-3 space-y-1">
                            {item.description && <p className="text-xs text-muted-foreground truncate" title={item.description}>{item.description}</p>}
                            <p className="text-xs text-muted-foreground italic">Hint: {item.aiHint}</p>
                            <Button type="button" variant="destructive" size="sm" className="w-full mt-1" onClick={() => handleDeleteMoodboardItem(item.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </div>
                )}
              </CardContent>
            </Card>


            <CardFooter className="flex justify-end gap-3 p-0 pt-8 border-t mt-8">
              <Link href={`/profile/me`}>
                <Button type="button" variant="outline" size="lg">
                  <XCircle className="mr-2 h-5 w-5" /> Cancel
                </Button>
              </Link>
              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

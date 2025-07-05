
'use client';

import { useState, type ChangeEvent, type FormEvent, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Palette, Music, Code, Gamepad2, Video as VideoIconLucide, PenTool, Film, AudioLines, Type, Image as ImageIconLucide, GitFork, Sparkles, Eye, SmilePlus, Tag as TagIcon, Link as LinkIconLucide, Edit3, Info, Brain, Loader2 } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { addCreation, getCreation } from '@/lib/firebase/firestoreService';
import { uploadFileAndGetURL } from '@/lib/firebase/storageService';
import type { Creation } from '@/config/profileData';

type AssetType = 'Image' | 'Audio' | 'Code' | 'Game' | 'Video' | 'Writing';
type CaptureMode = 'Image' | 'Video' | 'Audio' | 'Text' | 'Remix';

const assetTypeOptions: { value: AssetType; label: string; icon: JSX.Element }[] = [
  { value: 'Image', label: 'Image/Art', icon: <Palette className="h-4 w-4 mr-2" /> },
  { value: 'Audio', label: 'Music/Audio', icon: <Music className="h-4 w-4 mr-2" /> },
  { value: 'Code', label: 'Code/Snippet', icon: <Code className="h-4 w-4 mr-2" /> },
  { value: 'Game', label: 'Game/Interactive', icon: <Gamepad2 className="h-4 w-4 mr-2" /> },
  { value: 'Video', label: 'Video', icon: <VideoIconLucide className="h-4 w-4 mr-2" /> },
  { value: 'Writing', label: 'Writing/Story', icon: <PenTool className="h-4 w-4 mr-2" /> },
];

const captureModeOptions: { value: CaptureMode; label: string; icon: JSX.Element }[] = [
  { value: 'Image', label: 'Image Upload', icon: <ImageIconLucide className="h-5 w-5" /> },
  { value: 'Video', label: 'Video Link', icon: <Film className="h-5 w-5" /> },
  { value: 'Audio', label: 'Audio Link', icon: <AudioLines className="h-5 w-5" /> },
  { value: 'Text', label: 'Text Content', icon: <Type className="h-5 w-5" /> },
  { value: 'Remix', label: 'Remix (Link)', icon: <GitFork className="h-5 w-5" /> },
];

const moodOptions: string[] = ["Joyful", "Melancholy", "Energetic", "Serene", "Mysterious", "Intense", "Chill", "Experimental", "Nostalgic", "Hopeful", "Dark"];

function UploadFormComponent() {
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile, loading: authLoading } = useUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [assetType, setAssetType] = useState<AssetType | undefined>(undefined);
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [currentCaptureMode, setCurrentCaptureMode] = useState<CaptureMode>('Image');
  const [externalUrl, setExternalUrl] = useState('');
  const [remixUrl, setRemixUrl] = useState('');

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrlInput(''); // Clear URL input if file is chosen
    }
  };

  const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImageUrlInput(url);
    if (url) {
        setImagePreview(url);
        setImageFile(null); // Clear file input if URL is provided
    }
  }


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!userProfile) {
        toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to upload a creation." });
        setIsLoading(false);
        return;
    }

    let isContentProvided = false;
    if (currentCaptureMode === 'Image' && (imageFile || imageUrlInput.trim())) isContentProvided = true;
    if ((currentCaptureMode === 'Video' || currentCaptureMode === 'Audio') && externalUrl.trim()) isContentProvided = true;
    if (currentCaptureMode === 'Remix' && remixUrl.trim()) isContentProvided = true;
    if (currentCaptureMode === 'Text' && textContent.trim()) isContentProvided = true;
    if (assetType === 'Game' && externalUrl.trim()) isContentProvided = true; 

    if (!title.trim() || !assetType || !isContentProvided) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out title, category, and provide the main content (file, URL, or text).',
      });
      setIsLoading(false);
      return;
    }

    let uploadedImageUrl = imageUrlInput.trim() || null;
    if (imageFile) {
        try {
            uploadedImageUrl = await uploadFileAndGetURL(imageFile, userProfile.uid, 'creations');
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                variant: "destructive",
                title: "Image Upload Failed",
                description: "Could not upload your image to the cloud. Please try again.",
            });
            setIsLoading(false);
            return;
        }
    }
    
    const processedTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    let remixInfo: Creation['remixOf'] = undefined;
    if(currentCaptureMode === 'Remix' && remixUrl) {
      const urlParts = remixUrl.split('/');
      const sourceId = urlParts[urlParts.length - 1]?.split('#')[0]; // Handle URLs with fragments
      if (sourceId) {
          const sourceCreation = await getCreation(sourceId);
          if(sourceCreation) {
            remixInfo = {
              id: sourceCreation.id,
              title: sourceCreation.title,
              author: sourceCreation.authorProfileName || sourceCreation.author
            }
          } else {
             toast({ variant: 'destructive', title: 'Remix Error', description: 'Could not find the original creation from the provided URL.' });
             setIsLoading(false);
             return;
          }
      }
    }
    
    const newCreationData: Omit<Creation, 'id' | 'comments'> = {
        authorId: userProfile.uid,
        author: userProfile.name,
        authorProfileName: userProfile.name,
        title,
        type: assetType,
        description: description,
        longDescription: currentCaptureMode === 'Text' || assetType === 'Writing' ? textContent : undefined,
        imageUrl: uploadedImageUrl || `https://placehold.co/800x600.png?text=${title.replace(/\s/g, '+')}`,
        aiHint: imageFile ? title.toLowerCase().split(' ').slice(0,2).join(' ') : 'abstract background',
        externalUrl: (currentCaptureMode === 'Video' || currentCaptureMode === 'Audio') && assetType !== 'Game' ? externalUrl : undefined,
        gameSrc: assetType === 'Game' ? externalUrl : undefined,
        gameWidth: assetType === 'Game' ? 800 : undefined,
        gameHeight: assetType === 'Game' ? 600 : undefined,
        tags: processedTags,
        mood: selectedMood,
        remixOf: remixInfo,
    };

    try {
        await addCreation(newCreationData);
        toast({ title: "Echo Uploaded!", description: `Your creation "${title}" has been added to your profile.`});
        router.push(`/profile/me`);
    } catch (error) {
        console.error("Failed to upload creation:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not save your creation to the database." });
    } finally {
        setIsLoading(false);
    }
  };

  const getFileInputLabel = () => {
    const isImageMode = currentCaptureMode === 'Image';
    if (isImageMode) return `Upload Image*`;
    if (assetType === 'Game') return `Game Thumbnail / Cover Image`;
    if (['Video', 'Audio', 'Text', 'Remix'].includes(currentCaptureMode)) {
        return `Thumbnail / Cover Image`;
    }
    return `Primary Media File / Thumbnail`;
  };
  
  const isExternalUrlRequired = () => assetType === 'Game' || ['Video', 'Audio'].includes(currentCaptureMode);
  const getExternalUrlLabel = () => {
    if (assetType === 'Game') return 'Game Source URL*';
    switch (currentCaptureMode) {
      case 'Video': return 'Video URL* (e.g., YouTube, Vimeo)';
      case 'Audio': return 'Audio URL* (e.g., SoundCloud, Bandcamp)';
      default: return 'External URL';
    }
  };
  
  const canShowVibeTaggingLink = (assetType && ['Image', 'Audio', 'Video', 'Writing'].includes(assetType)) && description.trim().length > 10;
  const canShowContentRefinementLink = currentCaptureMode === 'Text' && textContent.trim().length > 50;

  return (
    <PageWrapper className="py-12">
      <Card className="max-w-2xl mx-auto shadow-xl border-border">
        <CardHeader className="text-center border-b pb-6 mb-6">
          <UploadCloud className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-headline">Echo Capture Studio</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Craft and share your next masterpiece with the YourSpace community.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-muted/20">
                <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2 flex items-center">
                     1. Select Capture Mode
                </h3>
                <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                {captureModeOptions.map(mode => (
                    <Button
                    key={mode.value}
                    type="button"
                    variant={currentCaptureMode === mode.value ? 'default' : 'outline'}
                    onClick={() => setCurrentCaptureMode(mode.value)}
                    className="flex-1 md:flex-initial min-w-[80px] md:min-w-[100px] py-3 text-sm md:text-base"
                    >
                    {mode.icon}
                    <span className="ml-2">{mode.label}</span>
                    </Button>
                ))}
                </div>
            </div>

            <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-muted/20">
                <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2 flex items-center">
                    <Info className="mr-2 h-5 w-5" /> 2. Provide Your Content
                </h3>
                {(currentCaptureMode === 'Image' || (assetType && assetType !== 'Writing' && assetType !== 'Code')) && (
                    <div className="space-y-2">
                        <Label htmlFor="creationMediaFile" className="text-lg font-medium flex items-center">
                            <ImageIconLucide className="mr-2 h-5 w-5" /> {getFileInputLabel()}
                        </Label>
                        <Input
                            id="creationMediaFile"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="mt-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            required={currentCaptureMode === 'Image' && !imageUrlInput}
                        />
                         <div className="relative flex items-center">
                            <div className="flex-grow border-t border-muted-foreground/30"></div>
                            <span className="flex-shrink mx-2 text-xs text-muted-foreground">OR</span>
                            <div className="flex-grow border-t border-muted-foreground/30"></div>
                        </div>
                        <Input
                            id="imageUrlInput"
                            type="url"
                            placeholder="Paste image URL..."
                            value={imageUrlInput}
                            onChange={handleImageUrlChange}
                            className="mt-1 text-base"
                            required={currentCaptureMode === 'Image' && !imageFile}
                        />

                        {imagePreview && (
                            <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted mt-2 border-2 border-dashed border-primary/50 flex items-center justify-center">
                            <Image src={imagePreview} alt="Selected media preview" layout="fill" objectFit="contain" data-ai-hint={title ? title.toLowerCase().split(' ').slice(0,2).join(' ') : 'uploaded image'} />
                            </div>
                        )}
                    </div>
                )}
                {(isExternalUrlRequired()) && (
                    <div className="space-y-2">
                        <Label htmlFor="externalUrl" className="text-lg font-medium flex items-center">
                            <LinkIconLucide className="mr-2 h-5 w-5" /> {getExternalUrlLabel()}
                        </Label>
                        <Input 
                            id="externalUrl" 
                            type="url" 
                            placeholder="https://..."
                            value={externalUrl} 
                            onChange={(e) => setExternalUrl(e.target.value)} 
                            className="mt-1 text-base" 
                            required
                        />
                    </div>
                )}
                {currentCaptureMode === 'Remix' && (
                    <div className="space-y-2">
                        <Label htmlFor="remixUrl" className="text-lg font-medium flex items-center">
                            <GitFork className="mr-2 h-5 w-5" /> Link to YourSpace Creation to Remix*
                        </Label>
                        <Input 
                            id="remixUrl" 
                            type="url" 
                            placeholder="e.g., https://yourspace.app/creations/..."
                            value={remixUrl} 
                            onChange={(e) => setRemixUrl(e.target.value)} 
                            className="mt-1 text-base" 
                            required
                        />
                    </div>
                )}
                {currentCaptureMode === 'Text' && (
                    <div className="space-y-2">
                    <Label htmlFor="textContentArea" className="text-lg font-medium flex items-center">
                        <Type className="mr-2 h-5 w-5" /> Your Content*
                    </Label>
                    <Textarea id="textContentArea" placeholder="Start writing your article, story, or thoughts here..." className="mt-1 min-h-[200px] text-base" rows={8} required value={textContent} onChange={(e) => setTextContent(e.target.value)} />
                    <div className="text-xs text-muted-foreground">Markdown is supported for rich text formatting.</div>
                    </div>
                )}
            </div>

            <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-muted/20">
                 <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2 flex items-center">
                    <PenTool className="mr-2 h-5 w-5" /> 3. Describe Your Echo
                </h3>
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">Title*</Label>
                  <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., My Awesome Painting, Synthwave Dreams" className="mt-1 text-base" required />
                </div>
                <div>
                  <Label htmlFor="description" className="text-lg font-medium">
                    {currentCaptureMode === 'Text' ? 'Short Excerpt / Summary (Optional)' : 'Description*'}
                  </Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={currentCaptureMode === 'Text' ? "A brief summary for previews..." : "Tell us about your creation..."} className="mt-1 min-h-[100px] text-base" required={currentCaptureMode !== 'Text'} rows={3} />
                </div>
                <div>
                  <Label htmlFor="assetType" className="text-lg font-medium">Primary Category*</Label>
                  <Select value={assetType} onValueChange={(value: AssetType) => setAssetType(value)} required>
                    <SelectTrigger id="assetType" className="w-full mt-1 text-base"><SelectValue placeholder="Select primary asset category" /></SelectTrigger>
                    <SelectContent>
                      {assetTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}><div className="flex items-center">{option.icon} {option.label}</div></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-muted/20">
                <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2 flex items-center">
                   <Sparkles className="mr-2 h-5 w-5" /> 4. Refine & Publish
                </h3>
                <div>
                    <Label htmlFor="tags" className="text-lg font-medium flex items-center"><TagIcon className="h-5 w-5 mr-2"/>Tags (comma-separated)</Label>
                    <Input id="tags" type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g., abstract, synthwave, atmospheric" className="mt-1 text-base"/>
                </div>
                <div>
                    <Label htmlFor="mood" className="text-lg font-medium flex items-center"><SmilePlus className="h-5 w-5 mr-2"/>Mood</Label>
                    <Select name="mood-select" value={selectedMood} onValueChange={setSelectedMood}>
                        <SelectTrigger id="mood" className="w-full mt-1 text-base"><SelectValue placeholder="Select mood (Optional)" /></SelectTrigger>
                        <SelectContent>
                            {moodOptions.map(mood => (<SelectItem key={mood} value={mood}>{mood}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="visibility" className="text-lg font-medium flex items-center"><Eye className="h-5 w-5 mr-2"/>Visibility</Label>
                    <Select name="visibility-select" disabled defaultValue="public">
                        <SelectTrigger id="visibility" className="w-full mt-1 text-base"><SelectValue placeholder="Set visibility" /></SelectTrigger>
                        <SelectContent><SelectItem value="public">Public (Coming Soon: Other Options)</SelectItem></SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-muted/30 text-center">
              <h3 className="text-lg font-semibold text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 mr-2 text-accent" /> AI Assistance
              </h3>
              <p className="text-sm text-muted-foreground">Need a creative boost? Let AI help you!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {canShowVibeTaggingLink && (
                  <Link href={`/vibe-tagging?description=${encodeURIComponent(description)}&assetType=${assetType?.toLowerCase()}`} legacyBehavior>
                    <a target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><TagIcon className="mr-2 h-4 w-4" /> Get Vibe Tags</Button></a>
                  </Link>
                )}
                {canShowContentRefinementLink && (
                  <Link href={`/content-refinement?text=${encodeURIComponent(textContent)}&contentType=${assetType === 'Writing' ? 'story_excerpt' : 'project_summary'}`} legacyBehavior>
                     <a target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Brain className="mr-2 h-4 w-4" /> Refine Text</Button></a>
                  </Link>
                )}
              </div>
              {(!canShowVibeTaggingLink && !canShowContentRefinementLink) && (
                <p className="text-xs text-muted-foreground italic">Fill in description or text content to enable AI tools.</p>
              )}
            </div>

            <CardFooter className="flex justify-center p-0 pt-8 border-t mt-8">
              <Button type="submit" size="lg" className="text-lg px-10 py-6" disabled={isLoading || authLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                {isLoading ? 'Uploading...' : 'Finalize & Upload Echo'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
        <PageWrapper className="py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <div className="flex items-center gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-lg">Loading Studio...</p>
            </div>
        </PageWrapper>
    }>
        <UploadFormComponent />
    </Suspense>
  )
}

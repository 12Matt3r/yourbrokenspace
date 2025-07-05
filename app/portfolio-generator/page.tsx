
'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion, Reorder } from 'framer-motion';
import { generatePortfolioAction } from './actions';
import type { PortfolioFormState, WorkSample } from './schemas';
import { Sparkles, Loader2, Wand2, PlusCircle, Trash2, LayoutGrid, Rows, Brush, FileText, Image as ImageIcon, Send, Lightbulb, User, Mail, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

const initialFormState: PortfolioFormState = {
  message: null,
  issues: undefined,
  fieldErrors: undefined,
  fields: undefined,
  data: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full bg-[#4A90E2] hover:bg-[#4A90E2]/90 text-white">
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
      {pending ? 'Generating Your Portfolio...' : 'Generate with AI'}
    </Button>
  );
}

export default function PortfolioGeneratorPage() {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(generatePortfolioAction, initialFormState);

  const [workSamples, setWorkSamples] = React.useState<WorkSample[]>([]);
  const [newSample, setNewSample] = React.useState<Omit<WorkSample, 'id'>>({ title: '', description: '', imageUrl: '' });
  
  const [generatedSections, setGeneratedSections] = React.useState<any[]>([]);
  
  const { pending } = useFormStatus();
  const [progress, setProgress] = React.useState(0);

  // This effect will run when `pending` becomes true.
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (pending) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
    } else {
        // If no longer pending, ensure progress is at a final state.
        if (formState.data) {
            setProgress(100);
        } else {
            setProgress(0);
        }
    }
    return () => clearInterval(interval);
  }, [pending, formState.data]);

  
  React.useEffect(() => {
    if (formState.message) {
      if (formState.data) {
        toast({ title: 'Success!', description: formState.message });
        setGeneratedSections(formState.data.layout || []);
      } else {
        const description = formState.fieldErrors ? "Please correct the errors." : formState.issues?.join('; ') || 'An unexpected error occurred.';
        toast({ variant: 'destructive', title: 'Error', description });
      }
    }
  }, [formState, toast]);

  const handleAddSample = () => {
    if (!newSample.title || !newSample.imageUrl) {
      toast({ variant: 'destructive', title: 'Missing Sample Info', description: 'Please provide a title and image URL for the work sample.' });
      return;
    }
    setWorkSamples([...workSamples, { ...newSample, id: `ws-${Date.now()}` }]);
    setNewSample({ title: '', description: '', imageUrl: '' });
  };

  const handleRemoveSample = (id: string) => {
    setWorkSamples(workSamples.filter(sample => sample.id !== id));
  };
  
  const renderSectionComponent = (section: any) => {
    const { component, content, order } = section;
    switch (component) {
      case 'hero':
        return (
          <div className="text-center p-8 bg-white/5 rounded-lg">
            <h1 className="text-4xl font-bold" style={{ color: '#2C3E50' }}>{content.name}</h1>
            <p className="text-xl mt-2" style={{ color: '#6C757D' }}>{content.tagline}</p>
          </div>
        );
      case 'gallery':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#2C3E50' }}>Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.items.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden bg-white shadow-md">
                  <div className="relative aspect-video">
                    <Image src={item.imageUrl} alt={item.title} fill style={{objectFit: 'cover'}} data-ai-hint="portfolio image"/>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm" style={{color: '#2C3E50'}}>{item.title}</h3>
                    <p className="text-xs" style={{color: '#6C757D'}}>{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#2C3E50' }}><User className="inline mr-2"/>About Me</h2>
            <p className="whitespace-pre-wrap" style={{ color: '#6C757D' }}>{content.text}</p>
          </div>
        );
      case 'contact':
        return (
          <div className="text-center p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#2C3E50' }}><Mail className="inline mr-2"/>Get In Touch</h2>
            <p style={{ color: '#6C757D' }}>{content.invitation}</p>
            <a href={`mailto:${content.email}`} className="text-[#4A90E2] font-semibold hover:underline mt-2 inline-block">{content.email}</a>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="text-center mb-10">
          <Wand2 className="h-12 w-12 mx-auto text-[#4A90E2]" />
          <h1 className="text-4xl md:text-5xl font-bold mt-4" style={{ color: '#2C3E50' }}>AI Portfolio Generator</h1>
          <p className="text-lg mt-2 max-w-2xl mx-auto" style={{ color: '#6C757D' }}>
            Describe your style, add your work, and let AI craft a stunning portfolio layout for you.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <Card className="bg-[#FFFFFF] border-[#e0e0e0] shadow-md">
            <form action={formAction}>
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: '#2C3E50' }}>1. Your Creative DNA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="artisticStyle" className="font-semibold" style={{ color: '#2C3E50' }}>Artistic Style</Label>
                  <Textarea id="artisticStyle" name="artisticStyle" placeholder="e.g., 'Minimalist, abstract, with a focus on geometric shapes and a muted color palette.'" className="bg-white" required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferences" className="font-semibold" style={{ color: '#2C3E50' }}>Layout Preferences</Label>
                  <Textarea id="preferences" name="preferences" placeholder="e.g., 'I want a large hero image, a clean grid for my work, and a simple contact section at the bottom.'" className="bg-white"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template" className="font-semibold" style={{ color: '#2C3E50' }}>Portfolio Template</Label>
                  <Select name="template" defaultValue="dynamic">
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a base template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist"><Rows className="inline mr-2 h-4 w-4"/>Minimalist</SelectItem>
                      <SelectItem value="grid"><LayoutGrid className="inline mr-2 h-4 w-4"/>Grid-Focused</SelectItem>
                      <SelectItem value="dynamic"><Brush className="inline mr-2 h-4 w-4"/>Dynamic & Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="font-semibold text-lg" style={{ color: '#2C3E50' }}>2. Add Your Work</Label>
                   <input type="hidden" name="workSamples" value={JSON.stringify(workSamples)} />
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {workSamples.map((sample, index) => (
                      <motion.div key={sample.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-3 bg-white p-2 rounded-md border">
                        <ImageIcon className="h-6 w-6 text-[#6C757D] mt-1 shrink-0"/>
                        <div className="flex-grow">
                            <p className="font-medium text-sm text-[#2C3E50]">{sample.title}</p>
                            <p className="text-xs text-[#6C757D] line-clamp-1">{sample.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0" onClick={() => handleRemoveSample(sample.id)}><Trash2 className="h-4 w-4"/></Button>
                      </motion.div>
                    ))}
                  </div>
                  <Card className="bg-white/50 p-3 space-y-2">
                      <Input placeholder="Sample Title*" value={newSample.title} onChange={(e) => setNewSample({...newSample, title: e.target.value})} />
                      <Input placeholder="Image URL*" value={newSample.imageUrl} onChange={(e) => setNewSample({...newSample, imageUrl: e.target.value})} />
                      <Textarea placeholder="Short Description" value={newSample.description} onChange={(e) => setNewSample({...newSample, description: e.target.value})} rows={2} />
                      <Button type="button" variant="secondary" className="w-full" onClick={handleAddSample}><PlusCircle className="mr-2"/>Add Work Sample</Button>
                  </Card>
                </div>
              </CardContent>
              <CardFooter>
                <SubmitButton />
              </CardFooter>
            </form>
          </Card>
          
          {/* Preview Panel */}
           <Card className="bg-[#FFFFFF] border-[#e0e0e0] shadow-md flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#2C3E50' }}>AI Generated Preview</CardTitle>
              <CardDescription style={{ color: '#6C757D' }}>
                {pending ? "AI is crafting your portfolio..." : (generatedSections.length > 0 ? "Drag and drop sections to reorder." : "Your generated portfolio will appear here.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                {pending && (
                     <div className="flex flex-col items-center justify-center h-full gap-4">
                        <p className="font-medium" style={{ color: '#2C3E50' }}>Processing Creative Synergy...</p>
                        <Progress value={progress} className="w-full h-2" indicatorClassName="bg-[#4A90E2]" />
                     </div>
                )}
                {!pending && formState.data?.layout && (
                    <Reorder.Group axis="y" values={generatedSections} onReorder={setGeneratedSections} className="space-y-4">
                        {generatedSections.map((section) => (
                           <Reorder.Item key={section.order} value={section} className="bg-white p-2 rounded-lg shadow-sm cursor-grab active:cursor-grabbing">
                               {renderSectionComponent(section)}
                           </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )}
                 {!pending && formState.data?.suggestions && formState.data.suggestions.length > 0 && (
                     <Card className="mt-auto bg-blue-50 border-blue-200">
                         <CardHeader className="pb-2">
                             <CardTitle className="text-lg flex items-center text-[#007BFF]"><Lightbulb className="mr-2"/>AI Suggestions</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <ul className="list-disc list-inside space-y-1 text-sm text-[#2C3E50]">
                                 {formState.data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                             </ul>
                         </CardContent>
                     </Card>
                 )}
                 {!pending && !formState.data && (
                    <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed rounded-lg p-8">
                        <LayoutGrid className="h-12 w-12 text-[#6C757D]/50 mb-3"/>
                        <p className="text-[#6C757D]">Fill in your details and click "Generate with AI" to see the magic happen.</p>
                    </div>
                 )}
            </CardContent>
             <CardFooter className="flex justify-end gap-2">
                <Select disabled={!formState.data}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Export Format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="html_css">HTML/CSS</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" disabled={!formState.data}>Export</Button>
            </CardFooter>
          </Card>

        </div>
      </motion.div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Paintbrush, Palette, Sparkles, LampDesk, BookOpen, MountainSnow } from 'lucide-react';

type Theme = 'cosmic' | 'noir' | 'forest';
type ColorScheme = 'nebula' | 'cyberpunk' | 'moonlit' | 'sunrise';
type Decoration = 'crystals' | 'bookshelf' | 'projector';

const themes: { id: Theme; name: string; icon: JSX.Element; bgHint: string, representativeImage: string }[] = [
  { id: 'cosmic', name: 'Cosmic Dream', icon: <Sparkles className="mr-2 h-5 w-5" />, bgHint: 'nebula space', representativeImage: 'https://placehold.co/600x400.png' },
  { id: 'noir', name: 'Neon Noir', icon: <LampDesk className="mr-2 h-5 w-5" />, bgHint: 'cyberpunk city night', representativeImage: 'https://placehold.co/600x400.png' },
  { id: 'forest', name: 'Enchanted Forest', icon: <MountainSnow className="mr-2 h-5 w-5" />, bgHint: 'mystical forest', representativeImage: 'https://placehold.co/600x400.png' },
];

const colorSchemes: { id: ColorScheme; name: string; primary: string; secondary: string; representativeColor: string }[] = [
  { id: 'nebula', name: 'Nebula Purple', primary: 'bg-purple-500', secondary: 'border-purple-300', representativeColor: 'hsl(270,70%,60%)' },
  { id: 'cyberpunk', name: 'Cyber Teal', primary: 'bg-teal-500', secondary: 'border-teal-300', representativeColor: 'hsl(180,70%,50%)' },
  { id: 'moonlit', name: 'Moonlit Silver', primary: 'bg-slate-400', secondary: 'border-slate-200', representativeColor: 'hsl(210,15%,70%)' },
  { id: 'sunrise', name: 'Sunrise Gold', primary: 'bg-amber-400', secondary: 'border-amber-200', representativeColor: 'hsl(40,90%,60%)' },
];

const decorations: { id: Decoration; name: string; icon: JSX.Element; image: string; aiHint: string }[] = [
  { id: 'crystals', name: 'Floating Crystals', icon: <Sparkles className="h-8 w-8" />, image: 'https://placehold.co/100x100.png', aiHint: 'glowing crystal' },
  { id: 'bookshelf', name: 'Ancient Bookshelf', icon: <BookOpen className="h-8 w-8" />, image: 'https://placehold.co/100x100.png', aiHint: 'old bookshelf' },
  { id: 'projector', name: 'Starlight Projector', icon: <Palette className="h-8 w-8" />, image: 'https://placehold.co/100x100.png', aiHint: 'star projector' },
];

export function UserOnboardingChannel() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('cosmic');
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>('nebula');
  const [selectedDecorations, setSelectedDecorations] = useState<Set<Decoration>>(new Set());

  const toggleDecoration = (decorationId: Decoration) => {
    setSelectedDecorations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(decorationId)) {
        newSet.delete(decorationId);
      } else {
        newSet.add(decorationId);
      }
      return newSet;
    });
  };

  const currentThemeDetails = themes.find(t => t.id === selectedTheme) || themes[0];
  const currentColorSchemeDetails = colorSchemes.find(cs => cs.id === selectedColorScheme) || colorSchemes[0];

  return (
    <div className="h-full w-full flex flex-col md:flex-row items-stretch justify-center p-2 md:p-4 gap-4 bg-gradient-to-br from-background via-muted to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground overflow-y-auto">
      {/* Customization Panel */}
      <Card className="w-full md:w-1/3 shadow-xl bg-card/70 backdrop-blur-md border-border/50 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center text-primary">
            <Paintbrush className="mr-3 h-7 w-7" />
            Craft Your Sanctuary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto flex-grow">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-accent" /> Choose Your Realm Theme
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {themes.map(theme => (
                <Button
                  key={theme.id}
                  variant={selectedTheme === theme.id ? 'default' : 'outline'}
                  onClick={() => setSelectedTheme(theme.id)}
                  className="justify-start text-base"
                >
                  {theme.icon} {theme.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Palette className="mr-2 h-5 w-5 text-accent" /> Select Vibe Color
            </h3>
            <div className="flex flex-wrap gap-3">
              {colorSchemes.map(cs => (
                <button
                  key={cs.id}
                  title={cs.name}
                  onClick={() => setSelectedColorScheme(cs.id)}
                  className={cn(
                    "h-10 w-10 rounded-full border-2 transition-all transform hover:scale-110",
                    cs.primary,
                    selectedColorScheme === cs.id ? `ring-4 ring-offset-2 ring-primary dark:ring-offset-slate-800 ${cs.secondary}` : cs.secondary
                  )}
                  style={{ backgroundColor: cs.representativeColor }}
                  aria-label={`Select color scheme: ${cs.name}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
               Add Initial Relics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {decorations.map(deco => (
                <Card
                  key={deco.id}
                  onClick={() => toggleDecoration(deco.id)}
                  className={cn(
                    "cursor-pointer hover:shadow-lg transition-all bg-card/50 hover:bg-card/80",
                    selectedDecorations.has(deco.id) && 'ring-2 ring-primary border-primary'
                  )}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-16 h-16 relative mb-2 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      <Image src={deco.image} alt={deco.name} width={60} height={60} style={{objectFit:"contain"}} data-ai-hint={deco.aiHint} />
                    </div>
                    <span className="text-xs font-medium">{deco.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card className="w-full md:w-2/3 shadow-2xl bg-card/70 backdrop-blur-md border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
        <Image 
            src={currentThemeDetails.representativeImage} 
            alt={`${currentThemeDetails.name} preview background`} 
            layout="fill" 
            objectFit="cover" 
            className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 transition-all duration-500 ease-in-out"
            data-ai-hint={currentThemeDetails.bgHint}
            key={selectedTheme} 
        />
         <div 
            className="absolute inset-0 -z-10 transition-all duration-500 ease-in-out"
            style={{backgroundColor: currentColorSchemeDetails.representativeColor, opacity: 0.2}}
        />


        <CardContent className="relative z-10 p-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 transition-colors duration-500" style={{ color: currentColorSchemeDetails.representativeColor }}>
            Your {currentThemeDetails.name} Sanctuary
          </h2>
          <p className="text-lg text-muted-foreground mb-6 transition-colors duration-500" style={{ color: `${currentColorSchemeDetails.representativeColor}aa` }}>
            A glimpse into your personalized creative space.
          </p>
          <div 
            className="p-8 rounded-lg border-4 bg-background/50 backdrop-blur-sm transition-all duration-500"
            style={{ borderColor: currentColorSchemeDetails.representativeColor }}
          >
            <p className="text-xl mb-2 transition-colors duration-500" style={{ color: currentColorSchemeDetails.representativeColor }}>Theme: {currentThemeDetails.name}</p>
            <p className="text-xl mb-4 transition-colors duration-500" style={{ color: currentColorSchemeDetails.representativeColor }}>Color Vibe: {currentColorSchemeDetails.name}</p>
            {selectedDecorations.size > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-2 transition-colors duration-500" style={{ color: currentColorSchemeDetails.representativeColor }}>Relics Chosen:</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from(selectedDecorations).map(decoId => {
                    const deco = decorations.find(d => d.id === decoId);
                    return deco ? <span key={decoId} className="p-1.5 px-2.5 text-xs rounded-full transition-colors duration-500" style={{backgroundColor: `${currentColorSchemeDetails.representativeColor}40`, color: currentColorSchemeDetails.representativeColor }}>{deco.name}</span> : null;
                  })}
                </div>
              </div>
            )}
            {selectedDecorations.size === 0 && (
                <p className="text-sm italic transition-colors duration-500" style={{ color: `${currentColorSchemeDetails.representativeColor}aa` }}>Select some relics to add to your space!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

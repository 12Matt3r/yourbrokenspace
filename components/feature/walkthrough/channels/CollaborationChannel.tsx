
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Handshake, Sparkles, Users, Lightbulb, ArrowRight } from 'lucide-react';

export function CollaborationChannel() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground">
      <Image
        src="https://placehold.co/600x400.png"
        alt="Abstract network background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 -z-10 opacity-10 dark:opacity-5"
        data-ai-hint="abstract network"
        priority
      />
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <Handshake className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6 text-foreground drop-shadow-md">
          Find Your Creative Spark
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
          YourSpace's intelligent engine helps you discover potential collaborators whose skills and interests complement yours. Get personalized suggestions and innovative project ideas to bring your vision to life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:gap-8 mb-10">
          {/* User Profile Mock */}
          <Card className="bg-card/70 backdrop-blur-md shadow-lg dark:bg-slate-800/60 md:col-span-1 h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/> Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://placehold.co/80x80.png" alt="User Avatar" data-ai-hint="profile avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">You (CreativeUser)</p>
                    <p className="text-xs text-muted-foreground">Digital Artist, Storyteller</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Key Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">Illustration</Badge>
                  <Badge variant="secondary">World-Building</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Interests:</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">Fantasy</Badge>
                  <Badge variant="outline">Sci-Fi</Badge>
                  <Badge variant="outline">Ambient Music</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center items-center md:col-span-1">
            <ArrowRight className="h-10 w-10 text-primary animate-pulse md:rotate-0 rotate-90" />
          </div>
          
          {/* Suggested Collaborator Mock */}
          <Card className="bg-card/70 backdrop-blur-md shadow-lg dark:bg-slate-800/60 md:col-span-1 h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent"/> AI Suggests:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="flex items-center gap-3">
                    <Avatar>
                    <AvatarImage src="https://placehold.co/80x80.png" alt="Collaborator Avatar" data-ai-hint="abstract avatar" />
                    <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">SoundWeaverMax</p>
                        <p className="text-xs text-muted-foreground">Musician, Composer</p>
                    </div>
                </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-primary"><Lightbulb className="inline mr-1 h-4 w-4"/>Reasoning:</h4>
                <p className="text-xs text-muted-foreground">"SoundWeaverMax's skill in ambient soundscapes could bring your fantasy worlds to life."</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-primary">Project Idea:</h4>
                <p className="text-xs text-muted-foreground">"Co-create an interactive story with an original soundtrack."</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-md text-muted-foreground mt-8">
          Unlock new creative potentials by connecting with the right talents!
        </p>
      </div>
    </div>
  );
}

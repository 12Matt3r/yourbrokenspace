
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, Eye, Palette, Music, Code, Gamepad2, Video, PenTool } from 'lucide-react';

export function ContentUploadChannel() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 text-foreground">
      <Image
        src="https://placehold.co/600x400.png"
        alt="Abstract creative background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 -z-10 opacity-10 dark:opacity-5"
        data-ai-hint="abstract creative"
        priority
      />
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <UploadCloud className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6 text-foreground drop-shadow-md">
          Share Your Masterpieces
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
          YourSpace is your canvas. Upload your diverse creations—from stunning digital art and captivating music tracks to innovative code snippets and immersive game experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card/70 backdrop-blur-md shadow-lg dark:bg-slate-800/60">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-primary"><UploadCloud className="mr-2 h-6 w-6" /> Effortless Uploads</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Mockup of upload interface" 
                width={600} 
                height={400} 
                className="rounded-md mb-3 shadow-md"
                data-ai-hint="upload form interface"
              />
              <p className="text-sm text-muted-foreground">
                Our intuitive Echo Capture Studio makes it easy to upload your files, add descriptions, tags, and moods to help others connect with your work.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-md shadow-lg dark:bg-slate-800/60">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-accent"><Eye className="mr-2 h-6 w-6" /> Showcase & Discover</CardTitle>
            </CardHeader>
            <CardContent className="text-left">
                <Image 
                    src="https://placehold.co/600x400.png" 
                    alt="Mockup of creation on profile" 
                    width={600} 
                    height={400} 
                    className="rounded-md mb-3 shadow-md"
                    data-ai-hint="profile page creation"
                />
              <p className="text-sm text-muted-foreground">
                Once uploaded, your "Echoes" (creations) are beautifully displayed on your profile and become discoverable by the entire YourSpace community.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-card/80 backdrop-blur-lg shadow-xl dark:bg-slate-700/70 mt-4">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">What Can You Share?</CardTitle>
                <CardDescription className="text-muted-foreground">We support a multitude of creative formats:</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4 text-foreground/90">
                {[
                    { icon: <Palette size={20}/>, label: "Digital Art & Images" },
                    { icon: <Music size={20}/>, label: "Music & Audio" },
                    { icon: <Code size={20}/>, label: "Code Snippets & Projects" },
                    { icon: <Gamepad2 size={20}/>, label: "Games & Interactive" },
                    { icon: <Video size={20}/>, label: "Videos & Animations" },
                    { icon: <PenTool size={20}/>, label: "Writing & Stories" },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                    </div>
                ))}
            </CardContent>
        </Card>

        <p className="text-md text-muted-foreground mt-8">
          Start populating your creative universe today!
        </p>
      </div>
    </div>
  );
}

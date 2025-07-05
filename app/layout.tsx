import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { Providers } from './providers';
import { MentorAIDrawer } from '@/components/feature/mentor-ai/MentorAIDrawer';
import { MentorAIButton } from '@/components/feature/mentor-ai/MentorAIButton';
import { WhisperNetOverlay } from '@/components/feature/whisper-net/WhisperNetOverlay';
import { WhisperNetToggleButton } from '@/components/ui/whisper-net-toggle-button';

export const metadata: Metadata = {
  title: 'YourSpace - Interactive Creative Labs',
  description: 'A digital ecosystem for artists to create, collaborate, and monetize their work in personalized virtual spaces with AI-driven insights and community features.',
  icons: {
    icon: '/favicon.ico', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Roboto+Mono:wght@400;700&family=Playfair+Display:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col")}>
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster />
          <BottomTabBar />
          <MentorAIDrawer />
          <MentorAIButton />
          <WhisperNetOverlay />
          <WhisperNetToggleButton />
        </Providers>
      </body>
    </html>
  );
}

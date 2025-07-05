
'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Tv2 } from 'lucide-react';
import { walkthroughChannels, type WalkthroughChannel } from '@/config/walkthroughChannels';
import { AnimatePresence, motion } from 'framer-motion';

export function WalkthroughPlayer() {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);

  const currentChannel = walkthroughChannels[currentChannelIndex];
  const CurrentChannelComponent = currentChannel.component;

  const goToNextChannel = () => {
    setCurrentChannelIndex((prevIndex) => (prevIndex + 1) % walkthroughChannels.length);
  };

  const goToPreviousChannel = () => {
    setCurrentChannelIndex((prevIndex) => (prevIndex - 1 + walkthroughChannels.length) % walkthroughChannels.length);
  };

  return (
    <Card className="w-full shadow-2xl overflow-hidden bg-card/80 backdrop-blur-sm border-border dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Tv2 className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl md:text-2xl font-headline text-foreground">
            YourSpace Experience: {currentChannel.title}
          </CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">
          Channel {currentChannelIndex + 1} of {walkthroughChannels.length}
        </div>
      </CardHeader>
      <CardContent className="p-0 aspect-[16/9] relative overflow-hidden min-h-[300px] md:min-h-[450px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChannelIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <CurrentChannelComponent />
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between p-4 border-t dark:border-slate-700">
        <Button variant="outline" onClick={goToPreviousChannel} disabled={walkthroughChannels.length <= 1}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={goToNextChannel} disabled={walkthroughChannels.length <= 1}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

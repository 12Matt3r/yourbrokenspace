
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Radio, MessageSquareText, Sparkles, Zap, Settings, HelpCircle } from 'lucide-react';

export function StreamPluginPanel() {
  const [echoTickerEnabled, setEchoTickerEnabled] = useState(true);
  const [chatReactorEnabled, setChatReactorEnabled] = useState(false);
  const [moodAuraEnabled, setMoodAuraEnabled] = useState(true);

  // Mock state for capture triggers
  const [hotkeyCapture, setHotkeyCapture] = useState('Ctrl+Shift+E');
  const [aiHighlightCapture, setAiHighlightCapture] = useState(true);

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="w-full max-w-md mx-auto shadow-lg bg-card text-card-foreground border-border">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-headline flex items-center">
            <Radio className="mr-3 h-6 w-6 text-primary" />
            YourSpace Stream Control
          </CardTitle>
          <CardDescription>
            Manage your YourSpace stream overlays and capture settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Stream Overlays Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Stream Overlays</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="echo-ticker" className="flex items-center text-sm font-medium cursor-help">
                      <MessageSquareText className="mr-2 h-4 w-4 text-accent" />
                      Echo Ticker
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground">
                    <p>Auto-rotating display of your latest Echo titles on stream.</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  id="echo-ticker"
                  checked={echoTickerEnabled}
                  onCheckedChange={setEchoTickerEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="chat-reactor" className="flex items-center text-sm font-medium cursor-help">
                      <Sparkles className="mr-2 h-4 w-4 text-accent" />
                      Chat Reactor
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground">
                    <p>Filters viewer comments into poetic bursts on your stream overlay.</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  id="chat-reactor"
                  checked={chatReactorEnabled}
                  onCheckedChange={setChatReactorEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="mood-aura" className="flex items-center text-sm font-medium cursor-help">
                      <Zap className="mr-2 h-4 w-4 text-accent" />
                      Mood Aura
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground">
                    <p>Visualizes your current YourSpace mood as a subtle aura on stream. Can be influenced by viewer votes.</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  id="mood-aura"
                  checked={moodAuraEnabled}
                  onCheckedChange={setMoodAuraEnabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Stream Capture Triggers Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Echo Capture Triggers</h3>
             <Tooltip>
                <TooltipTrigger className="w-full text-left mb-3">
                    <p className="text-xs text-muted-foreground cursor-help">
                        Configure hotkeys or AI triggers to save exciting moments from your stream as YourSpace Echoes.
                    </p>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-popover text-popover-foreground max-w-xs">
                    <p>This allows you to easily create shareable content (Echoes) from your live streams without interrupting your flow.</p>
                </TooltipContent>
            </Tooltip>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                <Label htmlFor="hotkey-capture" className="text-sm font-medium">
                  Hotkey Capture
                </Label>
                {/* Mock input for hotkey, real implementation would need OS-level listeners or specific framework */}
                <Button variant="outline" size="sm" disabled className="text-xs">
                  {hotkeyCapture} (Configure Soon)
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                 <Label htmlFor="ai-highlight-capture" className="text-sm font-medium">
                  AI Highlight Capture
                </Label>
                <Switch
                  id="ai-highlight-capture"
                  checked={aiHighlightCapture}
                  onCheckedChange={setAiHighlightCapture}
                  disabled // Mocked as disabled for now
                />
              </div>
               <p className="text-xs text-muted-foreground italic text-center mt-1">AI Highlight Capture (Coming Soon): Let YourSpace automatically detect and save exciting stream moments.</p>
            </div>
          </div>
          
          <Separator />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm">
                <HelpCircle className="mr-2 h-4 w-4"/>
                Help
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Advanced Settings (Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}


'use client';

import * as React from 'react';
import { useState, useEffect, useRef, type FormEvent, useCallback } from 'react';
import { useMentorAI } from '@/contexts/MentorAIContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, BookText, HelpCircle, Zap, BarChart3, X, Send, Award, CheckCircle, Star, Users, Palette, Music, Code as CodeIcon, PenTool, Gamepad2, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getMentorResponseAction, getAIQuestsAction, type AIQuestsState } from './actions';
import { useUser } from '@/contexts/UserContext';
import type { QuestGeneratorOutput } from '@/ai/flows/quest-generator-flow';


interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  avatar?: string;
  avatarHint?: string;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  progress: number; // 0-100
  icon?: JSX.Element;
}

// Redefine Quest to match the AI output schema
type Quest = QuestGeneratorOutput['quests'][0];

interface Milestone {
  id: string;
  text: string;
  date: string;
  icon: JSX.Element;
}

interface EarnedBadge {
  id: string;
  name: string;
  icon: JSX.Element;
  color?: string; // e.g., 'text-yellow-400'
}

const getQuestIcon = (iconName: Quest['icon']) => {
    const props = { className: "h-5 w-5 text-primary" };
    switch (iconName) {
        case 'Palette': return <Palette {...props} />;
        case 'Music': return <Music {...props} />;
        case 'Code': return <CodeIcon {...props} />;
        case 'PenTool': return <PenTool {...props} />;
        case 'Gamepad2': return <Gamepad2 {...props} />;
        case 'Sparkles': return <Sparkles {...props} />;
        default: return <Sparkles {...props} />;
    }
};

const mockSkills: Skill[] = [
  { id: 'skill1', name: 'Pixel Art Fundamentals', level: 5, progress: 65, icon: <Palette className="h-4 w-4" /> },
  { id: 'skill2', name: 'Synth Design (Ableton)', level: 3, progress: 40, icon: <Music className="h-4 w-4" /> },
  { id: 'skill3', name: 'Storytelling (Short Fiction)', level: 7, progress: 85, icon: <BookText className="h-4 w-4" /> },
];

const mockMilestones: Milestone[] = [
  { id: 'm1', text: 'Uploaded First "Echo"', date: 'July 20th', icon: <Award className="h-4 w-4 text-amber-500" /> },
  { id: 'm2', text: 'Completed "Synth Basics" Quest', date: 'July 22nd', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  { id: 'm3', text: 'Joined "Pixel Artists" Group', date: 'July 25th', icon: <Users className="h-4 w-4 text-blue-500" /> },
];

const mockEarnedBadges: EarnedBadge[] = [
  { id: 'b1', name: 'Initiate Creator', icon: <Star className="h-4 w-4" />, color: 'text-yellow-400' },
  { id: 'b2', name: 'AI Explorer', icon: <BrainCircuit className="h-4 w-4" />, color: 'text-primary' },
  { id: 'b3', name: 'Quest Novice', icon: <BookText className="h-4 w-4" />, color: 'text-green-500' },
];


export function MentorAIDrawer() {
  const { isMentorAIOpen, closeMentorAI } = useMentorAI();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [questsState, setQuestsState] = useState<AIQuestsState | null>(null);
  const [isFetchingQuests, setIsFetchingQuests] = useState(false);
  const { userProfile, loading: profileLoading } = useUser();
  const [questsGenerated, setQuestsGenerated] = useState(false);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessageInput.trim() || isAiThinking) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: currentMessageInput.trim(),
      timestamp: new Date(),
    };
    
    const currentInput = currentMessageInput.trim();
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessageInput('');
    setIsAiThinking(true);

    const result = await getMentorResponseAction(currentInput);

    setIsAiThinking(false);
    
    let aiMessageText: string;
    if (result.error) {
        aiMessageText = `Sorry, I encountered an error: ${result.error}`;
    } else if (result.response) {
        aiMessageText = result.response;
    } else {
        aiMessageText = "I'm not sure what to say. Could you try rephrasing?";
    }

    const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now() + 1}`,
        sender: 'ai',
        text: aiMessageText,
        timestamp: new Date(),
        avatar: 'https://placehold.co/40x40.png',
        avatarHint: 'ai assistant avatar'
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  const handleGenerateQuests = useCallback(async () => {
    if (!userProfile) {
        setQuestsState({ error: 'Could not load your profile data to generate quests.' });
        return;
    }
    setIsFetchingQuests(true);
    setQuestsState(null);
    const result = await getAIQuestsAction({
        userSkills: userProfile.keySkills,
        userInterests: userProfile.personalVibeTags,
        recentCreations: userProfile.creations.slice(0, 3).map(c => ({ title: c.title, type: c.type })),
    });
    setQuestsState(result);
    setIsFetchingQuests(false);
    setQuestsGenerated(true);
  }, [userProfile]);
  
  // Proactively generate quests when the drawer is opened and profile is loaded
  useEffect(() => {
      if (isMentorAIOpen && userProfile && !questsGenerated && !isFetchingQuests) {
          handleGenerateQuests();
      }
  }, [isMentorAIOpen, userProfile, questsGenerated, isFetchingQuests, handleGenerateQuests]);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiThinking]);


  return (
    <Sheet open={isMentorAIOpen} onOpenChange={(open) => { if (!open) closeMentorAI(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-0 flex flex-col overflow-hidden border-l-2 border-primary/20 shadow-2xl">
        <SheetHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-row justify-between items-center border-b bg-muted/40">
          <div className="flex items-center">
            <BrainCircuit className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3 text-primary" />
            <SheetTitle className="text-xl sm:text-2xl font-headline">Mentor AI</SheetTitle>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <Tabs defaultValue="chat" className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-muted/30 p-0 h-auto shadow-sm">
            {[
                {value: "chat", label: "Chat", icon: HelpCircle},
                {value: "skills", label: "Skills", icon: Zap},
                {value: "quests", label: "Quests", icon: BookText},
                {value: "progress", label: "Progress", icon: BarChart3}
            ].map(tab => (
                 <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className="py-2.5 sm:py-3 text-xs sm:text-sm rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-inner flex-col sm:flex-row items-center justify-center h-full gap-1 sm:gap-1.5"
                >
                    <tab.icon className="h-4 w-4 sm:h-5 sm:w-5"/> 
                    <span>{tab.label}</span>
                </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-grow bg-background">
            <div className="p-4 sm:p-6 space-y-6">
              <TabsContent value="chat" className="mt-0 h-full flex flex-col">
                <Card className="shadow-md flex-grow flex flex-col">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold">Chat with Mentor AI</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Ask for guidance, inspiration, or feedback on your creative work.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col space-y-3 sm:space-y-4 overflow-hidden">
                    <ScrollArea ref={chatContainerRef} className="flex-grow h-64 sm:h-80 border rounded-lg p-2 sm:p-3 bg-muted/50 ">
                      {chatMessages.length === 0 && !isAiThinking && (
                         <div className="flex flex-col items-center justify-center h-full text-center">
                            <BrainCircuit className="h-10 w-10 text-muted-foreground mb-3"/>
                            <p className="text-sm text-muted-foreground italic">Your creative companion awaits.</p>
                            <p className="text-xs text-muted-foreground">Ask anything, explore ideas, or get feedback!</p>
                         </div>
                      )}
                      {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex mb-2.5 sm:mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-end'}`}>
                          {msg.sender === 'ai' && (
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2 shrink-0">
                              <AvatarImage src={msg.avatar} alt="AI Avatar" data-ai-hint={msg.avatarHint || 'ai avatar'} />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`p-2 sm:p-2.5 rounded-lg max-w-[80%] text-sm shadow-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-card border'}`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                              {format(msg.timestamp, 'p')}
                          </p>
                          </div>
                      </div>
                      ))}
                      {isAiThinking && (
                        <div className="flex justify-start items-end">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2 shrink-0">
                              <AvatarImage src="https://placehold.co/40x40.png" alt="AI Avatar" data-ai-hint="ai avatar" />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <div className="p-2 sm:p-2.5 rounded-lg bg-card border shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0s' }}></span>
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                      )}
                    </ScrollArea>
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end pt-2">
                      <Textarea 
                          placeholder="Type your message..." 
                          value={currentMessageInput}
                          onChange={(e) => setCurrentMessageInput(e.target.value)}
                          className="text-sm sm:text-base flex-grow resize-none min-h-[40px]" 
                          rows={1}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage(e);
                              }
                          }}
                          disabled={isAiThinking}
                      />
                      <Button type="submit" disabled={!currentMessageInput.trim() || isAiThinking} size="icon" className="h-10 w-10 shrink-0">
                          <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-0">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold">Your Creative Skills</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                      Visualize your growing talents and discover new paths for development.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Mentor AI helps you track and develop various creative skills. Here's a mock-up:
                    </p>
                    <div className="space-y-3 sm:space-y-4">
                      {mockSkills.map(skill => (
                        <div key={skill.id}>
                            <div className="flex justify-between items-center mb-1">
                                <Label className="text-sm font-medium flex items-center">
                                  {skill.icon && React.cloneElement(skill.icon, { className: `${skill.icon.props.className || ''} mr-2 text-primary`})}
                                  {skill.name}
                                </Label>
                                <span className="text-xs sm:text-sm text-primary font-semibold">Level {skill.level}</span>
                            </div>
                            <Progress value={skill.progress} aria-label={`${skill.name} progress at ${skill.progress}%`} className="h-2.5 sm:h-3"/>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="mt-4 sm:mt-6">
                      <h4 className="font-semibold mb-2 text-sm sm:text-md">Recommended Skills to Develop:</h4>
                      <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Color Theory</Badge>
                          <Badge variant="outline">Music Composition</Badge>
                          <Badge variant="outline">Character Design</Badge>
                          <Badge variant="outline">Worldbuilding Basics</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quests" className="mt-0">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold">Proactive Creative Quests</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your AI mentor has analyzed your profile and prepared these quests to help spark your creativity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {isFetchingQuests && (
                        <div className="flex items-center justify-center p-4">
                           <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                           <p className="text-muted-foreground">AI is crafting your quests...</p>
                        </div>
                    )}
                    {questsState?.error && (
                        <div className="p-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                           <AlertTriangle className="h-5 w-5" />
                           <p className="text-sm">{questsState.error}</p>
                        </div>
                    )}
                    {questsState?.quests && (
                       questsState.quests.map((quest, index) => (
                       <Card key={index} className="bg-muted/30 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2 pt-3 sm:pt-4 flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="text-md sm:text-lg font-medium flex items-center">
                                        {getQuestIcon(quest.icon)}
                                        {quest.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground mt-0.5">Reward: {quest.reward}</CardDescription>
                                </div>
                                <Badge variant='outline' className="text-xs shrink-0">New</Badge>
                            </CardHeader>
                            <CardContent className="pb-3 sm:pb-4 pt-1">
                                <p className="text-xs sm:text-sm text-muted-foreground/90 mb-2 sm:mb-3">{quest.description}</p>
                            </CardContent>
                             <CardFooter className="pb-3 sm:pb-4 pt-0">
                                <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                                    Start Quest
                                </Button>
                            </CardFooter>
                       </Card>
                     ))
                    )}
                    {questsState && !isFetchingQuests && (
                        <div className="text-center pt-4 border-t mt-4">
                            <Button onClick={handleGenerateQuests} variant="outline" size="sm">
                                <Sparkles className="mr-2 h-4 w-4" /> Regenerate Quests
                            </Button>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl font-semibold">Track Your Journey</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Monitor your growth, celebrate milestones, and gain insights.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3">Recent Milestones:</h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                          {mockMilestones.map(milestone => (
                            <li key={milestone.id} className="flex items-center">
                                {React.cloneElement(milestone.icon, {className: `${milestone.icon.props.className || ''} mr-2 shrink-0`})}
                                {milestone.text} - <span className="ml-1 text-muted-foreground/80">{milestone.date}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <Separator/>
                     <div>
                      <h4 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3">Badges Earned:</h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                          {mockEarnedBadges.map(badge => (
                            <Badge key={badge.id} variant="secondary" className="py-1 px-2.5 text-xs sm:text-sm shadow-sm border border-border/50">
                                {React.cloneElement(badge.icon, {className: `${badge.icon.props.className || ''} mr-1.5 ${badge.color || ''}`})}
                                {badge.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="mt-4 p-3 sm:p-4 border border-dashed rounded-md bg-muted/30 text-center text-muted-foreground">
                      <BarChart3 className="h-6 w-6 mx-auto mb-2 opacity-50"/>
                      <p className="text-xs sm:text-sm">Detailed progress charts and personalized insights coming soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

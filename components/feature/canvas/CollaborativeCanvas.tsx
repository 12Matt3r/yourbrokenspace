
'use client';

import { useState, useRef, useEffect, type MouseEvent, type TouchEvent, type FormEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Eraser, Pencil, Save, BrainCircuit, Lightbulb, Send, Split } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getMentorResponseAction } from '@/components/feature/mentor-ai/actions';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export function CollaborativeCanvas() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPosition = useRef<{x: number, y: number} | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);
  const [isSymmetryEnabled, setIsSymmetryEnabled] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust for screen density for sharper drawings
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.fillStyle = color;
        contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiThinking]);

  const getEventPosition = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
          return {
              x: e.touches[0].clientX - rect.left,
              y: e.touches[0].clientY - rect.top,
          };
      }
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
      };
  };

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const pos = getEventPosition(e);
    setIsDrawing(true);
    lastPosition.current = pos;
    
    // Draw a single dot on click
    if (contextRef.current) {
        contextRef.current.beginPath();
        contextRef.current.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
        contextRef.current.fill();

        if (isSymmetryEnabled && canvasRef.current) {
            const canvasWidth = canvasRef.current.getBoundingClientRect().width;
            const mirroredX = canvasWidth - pos.x;
            contextRef.current.beginPath();
            contextRef.current.arc(mirroredX, pos.y, brushSize / 2, 0, 2 * Math.PI);
            contextRef.current.fill();
        }
    }
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    lastPosition.current = null;
  };

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current || !lastPosition.current) return;
    e.preventDefault();
    
    const currentPos = getEventPosition(e);
    const context = contextRef.current;
    const canvasWidth = canvasRef.current.getBoundingClientRect().width;

    // Draw original line segment
    context.beginPath();
    context.moveTo(lastPosition.current.x, lastPosition.current.y);
    context.lineTo(currentPos.x, currentPos.y);
    context.stroke();

    if (isSymmetryEnabled) {
      const mirroredLastX = canvasWidth - lastPosition.current.x;
      const mirroredCurrentX = canvasWidth - currentPos.x;
      
      // Draw mirrored line segment
      context.beginPath();
      context.moveTo(mirroredLastX, lastPosition.current.y);
      context.lineTo(mirroredCurrentX, currentPos.y);
      context.stroke();
    }
    
    lastPosition.current = currentPos;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      toast({ title: 'Canvas Cleared', description: 'The whiteboard is now empty.' });
    }
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if(canvas) {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'yourspace-canvas.png';
        link.click();
        toast({ title: 'Snapshot Saved!', description: 'Your canvas has been downloaded as a PNG.' });
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessageInput.trim() || isAiThinking) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: currentMessageInput.trim(),
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
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };


  return (
    <Card className="w-full flex flex-col md:flex-row shadow-2xl bg-card/80 backdrop-blur-sm border-0 aspect-[16/9] overflow-hidden">
      <div className="w-full md:w-auto p-4 border-b md:border-b-0 md:border-r bg-card/50 flex md:flex-col justify-between items-center gap-4">
        <div className="flex md:flex-col gap-4">
             <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Label htmlFor="color-picker" className="cursor-pointer">
                            <Pencil className="h-6 w-6 text-foreground" />
                            <Input id="color-picker" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 p-0 border-none invisible absolute" />
                        </Label>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Pen Color</p></TooltipContent>
                 </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant={isSymmetryEnabled ? 'secondary' : 'ghost'} size="icon" onClick={() => setIsSymmetryEnabled(prev => !prev)}>
                            <Split className="h-6 w-6 text-foreground" />
                         </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Toggle Symmetry</p></TooltipContent>
                 </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={clearCanvas}>
                            <Eraser className="h-6 w-6 text-foreground" />
                         </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Clear Canvas</p></TooltipContent>
                 </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={saveCanvas}>
                            <Save className="h-6 w-6 text-foreground" />
                         </Button>
                    </TooltipTrigger>
                     <TooltipContent side="right"><p>Save as PNG</p></TooltipContent>
                 </Tooltip>
            </TooltipProvider>
        </div>
        <div className="flex md:flex-col items-center gap-2">
            <Label htmlFor="brush-size" className="text-sm text-muted-foreground hidden md:block">Size</Label>
            <Slider
                id="brush-size"
                min={1}
                max={50}
                step={1}
                defaultValue={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                className="w-24 md:w-auto md:h-24"
                orientation="horizontal"
             />
        </div>
      </div>
      <CardContent className="flex-grow p-0 relative">
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
            className="w-full h-full"
        />
      </CardContent>
       <div className="w-full md:w-64 p-4 border-t md:border-t-0 md:border-l bg-card/50 flex flex-col">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-primary"/>
                Brainstorm with AI
            </h3>
            <div className="flex-grow flex flex-col space-y-2 overflow-hidden">
                <ScrollArea ref={chatContainerRef} className="flex-grow border rounded-md p-2 bg-background/30">
                    {chatMessages.length === 0 && !isAiThinking && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-2">
                            <Lightbulb className="h-8 w-8 text-muted-foreground mb-2"/>
                            <p className="text-xs text-muted-foreground italic">Stuck? Ask the AI for ideas, color palettes, or themes to draw!</p>
                        </div>
                    )}
                    {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-2 rounded-lg max-w-[90%] text-sm shadow-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isAiThinking && (
                        <div className="flex justify-start">
                            <div className="p-2 rounded-lg bg-card border shadow-sm">
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
                        placeholder="Ask for ideas..." 
                        value={currentMessageInput}
                        onChange={(e) => setCurrentMessageInput(e.target.value)}
                        className="text-sm flex-grow resize-none min-h-[40px]" 
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
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    </Card>
  );
}

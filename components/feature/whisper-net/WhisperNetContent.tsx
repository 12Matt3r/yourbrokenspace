
'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, AlertTriangle, Link, User, Tag, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getVisualSearchAction, type WhisperNetState } from '@/app/whisper-net/actions';
import type { VisualSearchOutput } from '@/ai/flows/visual-search-flow';


function NodeIcon({ type }: { type: VisualSearchOutput['connectedNodes'][0]['type'] }) {
    switch(type) {
        case 'creator': return <User className="h-5 w-5" />;
        case 'creation': return <Link className="h-5 w-5" />;
        case 'tag': return <Tag className="h-5 w-5" />;
        case 'concept': return <Brain className="h-5 w-5" />;
        default: return <Sparkles className="h-5 w-5" />;
    }
}

const nodePositions = [
  { top: '5%', left: '40%' },
  { top: '25%', left: '80%' },
  { top: '70%', left: '85%' },
  { top: '85%', left: '50%' },
  { top: '70%', left: '15%' },
  { top: '25%', left: '20%' },
  { top: '10%', left: '0%' },
  { top: '50%', left: '95%' },
];


export function WhisperNetContent() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<WhisperNetState>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setState({});
    const result = await getVisualSearchAction(query);
    
    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'WhisperNet Error',
            description: result.error,
        });
    }
    
    setState(result);
    setIsLoading(false);
  };

  const hasResults = state.data && state.data.connectedNodes.length > 0;

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-foreground relative">
        {/* Search Bar */}
        <motion.div 
            layout 
            transition={{ duration: 0.5, type: 'spring' }}
            className={hasResults ? "absolute top-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg" : "relative w-full max-w-lg"}
        >
            <form onSubmit={handleSearch} className="relative">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Whisper a concept, creator, or idea into the net..."
                    className="h-14 text-lg pl-12 pr-28 bg-background/50 border-2 border-primary/30 focus:border-primary focus:ring-primary/50"
                    disabled={isLoading}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4" disabled={isLoading || !query.trim()}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
                </Button>
            </form>
        </motion.div>

        {/* Node Canvas */}
        <AnimatePresence>
        {hasResults && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full h-full flex items-center justify-center relative mt-16"
            >
                {/* Central Node */}
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
                    className="z-10"
                >
                    <Card className="bg-primary text-primary-foreground shadow-2xl min-w-[180px] text-center">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{state.data?.centralNodeLabel}</CardTitle>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Connected Nodes */}
                {state.data?.connectedNodes.map((node, index) => (
                    <motion.div
                        key={node.label + index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="absolute"
                        style={nodePositions[index]}
                    >
                        <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg hover:border-accent transition-all duration-300 w-48 text-center">
                            <CardHeader className="pb-2">
                                <Badge variant="secondary" className="mx-auto capitalize text-xs mb-2">
                                    <NodeIcon type={node.type} />
                                    <span className="ml-1.5">{node.type}</span>
                                </Badge>
                                <CardTitle className="text-base">{node.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <p className="text-xs text-muted-foreground italic">"{node.connectionReason}"</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}

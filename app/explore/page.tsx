
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Compass, Filter, Search, Tag, Briefcase, Radio, Wand2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { arcadeGames } from '@/config/games';
import { type Creation } from '@/config/profileData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getSmartSearchFiltersAction } from './actions';
import { RecommendedCreationFeedCard } from '@/components/feature/explore/RecommendedCreationFeedCard';
import { getAllCreations } from '@/lib/firebase/firestoreService';


export default function ExplorePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [likedCreations, setLikedCreations] = useState<Set<string>>(new Set());
  const [isAiSearching, setIsAiSearching] = useState(false);
  
  const [allDisplayItems, setAllDisplayItems] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedLikes = localStorage.getItem('likedCreations');
    if (storedLikes) {
      setLikedCreations(new Set(JSON.parse(storedLikes)));
    }

    const fetchCreations = async () => {
      setIsLoading(true);
      try {
        const firestoreCreations = await getAllCreations();
        const gameItemsTransformed: Creation[] = arcadeGames.map(game => ({
          id: String(game.id),
          authorId: 'arcade-author',
          type: 'Game',
          title: game.title,
          author: game.author,
          imageUrl: game.thumbnail,
          aiHint: game.aiHint || 'game thumbnail',
          tags: game.tags,
          description: `Play ${game.title}, a classic game by ${game.author}.`,
          featured: game.featured ?? false,
        }));
        // Simple shuffle to simulate an "algorithmic" feed
        const shuffled = [...gameItemsTransformed, ...firestoreCreations]
          .sort(() => 0.5 - Math.random());
        setAllDisplayItems(shuffled);
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Failed to load creations',
          description: 'Could not fetch creations from the database.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCreations();

  }, [toast]);
  
  const [filteredItems, setFilteredItems] = useState<Creation[]>([]);

  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    allDisplayItems.forEach(item => {
      allCategories.add(item.type);
    });
    return ['all', ...Array.from(allCategories).sort()];
  }, [allDisplayItems]);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    allDisplayItems.forEach(item => {
      item.tags?.forEach(tag => allTags.add(tag));
    });
    return ['all', ...Array.from(allTags).sort()];
  }, [allDisplayItems]);

  useEffect(() => {
    let results = allDisplayItems;
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (searchTerm) {
      results = results.filter(item =>
        item.title.toLowerCase().includes(lowerSearchTerm) ||
        (item.author && item.author.toLowerCase().includes(lowerSearchTerm)) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(item => item.type === selectedCategory);
    }

    if (selectedTag !== 'all') {
      results = results.filter(item => item.tags?.includes(selectedTag));
    }

    setFilteredItems(results);
  }, [searchTerm, selectedCategory, selectedTag, allDisplayItems]);
  
  const handleSmartSearch = async () => {
    if (!searchTerm.trim()) {
        toast({ variant: 'destructive', title: 'Empty Query', description: "Please enter a search term for the AI to analyze." });
        return;
    }
    setIsAiSearching(true);
    const result = await getSmartSearchFiltersAction(searchTerm, tags.filter(t => t !== 'all'));
    setIsAiSearching(false);

    if (result.error) {
        toast({ variant: 'destructive', title: 'AI Search Error', description: result.error });
        return;
    }

    if (result.category) {
        setSelectedCategory(result.category);
    }
    if (result.primaryTag) {
        setSelectedTag(result.primaryTag);
    }
    
    toast({ title: 'AI Filters Applied!', description: `Category set to "${result.category || 'all'}" and tag to "${result.primaryTag || 'all'}".` });
  };


  const handleLike = (itemId: string, itemTitle: string) => {
    const newLikedCreations = new Set(likedCreations);
    let toastMessage = '';

    if (newLikedCreations.has(itemId)) {
      newLikedCreations.delete(itemId);
      toastMessage = `Removed "${itemTitle}" from your likes.`;
    } else {
      newLikedCreations.add(itemId);
      toastMessage = `Added "${itemTitle}" to your likes!`;
    }
    setLikedCreations(newLikedCreations);
    localStorage.setItem('likedCreations', JSON.stringify(Array.from(newLikedCreations)));
    toast({
      title: newLikedCreations.has(itemId) ? 'Liked!' : 'Unliked',
      description: toastMessage,
    });
  };

  if (isLoading) {
    return (
      <PageWrapper className="py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading the universe...</p>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper className="py-12">
      <header className="mb-12 text-center">
        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">For You</h1>
        <p className="text-xl text-muted-foreground mt-2">
          An AI-powered feed of creations, tailored to your unique creative DNA.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <Card className="mb-12 shadow-xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-sky-900 text-slate-100 border-purple-500/50">
            <Link href="/explore/noise-explorers" className="block p-8 hover:bg-black/20 transition-colors">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <Radio className="h-16 w-16 text-yellow-400 animate-pulse" />
                <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-400 to-violet-400">
                    Featured Hub: Noise Explorers
                </h2>
                <p className="text-lg text-slate-300 mt-2">
                    Dive into a curated space for experimental sound and glitch art. Where static becomes sacred.
                </p>
                </div>
            </div>
            </Link>
        </Card>
      </motion.div>


      <div className="mb-10 p-6 bg-card rounded-lg shadow-lg space-y-6">
        <div>
          <Label htmlFor="search-creations" className="text-lg font-medium">Search Creations</Label>
          <div className="relative mt-1 flex gap-2">
            <div className="relative flex-grow">
              <Input
                id="search-creations"
                type="text"
                placeholder="Type a manual search or a natural language query for AI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button variant="outline" onClick={handleSmartSearch} disabled={isAiSearching} className="gap-2">
              {isAiSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5 text-primary" />}
              <span className="hidden sm:inline">Smart Search</span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <Label htmlFor="category-filter" className="text-lg font-medium flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" /> Filter by Category
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter" className="w-full mt-1 text-base">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tag-filter" className="text-lg font-medium flex items-center">
              <Tag className="h-5 w-5 mr-2 text-primary" /> Filter by Tag
            </Label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger id="tag-filter" className="w-full mt-1 text-base">
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag === 'all' ? 'All Tags' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <section className="max-w-2xl mx-auto space-y-8">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <RecommendedCreationFeedCard 
              key={item.id} 
              creation={item}
              isLiked={likedCreations.has(item.id)}
              onLike={handleLike}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">No Creations Found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </section>
    </PageWrapper>
  );
}


'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GitFork, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { type Creation } from '@/config/profileData'; 
import { getAllCreations } from '@/lib/firebase/firestoreService';
import { arcadeGames } from '@/config/games';
import { cn } from '@/lib/utils';


interface RemixNode {
  creation: Creation;
  children: RemixNode[];
}

interface RemixChainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  startCreation: Creation | null;
}

// Recursive component to render each node in the tree
function RemixNodeComponent({ node, currentCreationId }: { node: RemixNode, currentCreationId: string }) {
  const isCurrent = node.creation.id === currentCreationId;

  return (
    <li className="relative pl-8">
      {/* Vertical connector line */}
      <span className="absolute left-0 top-0 -translate-x-1/2 w-0.5 h-full bg-border/50"></span>
      {/* Horizontal connector line */}
      <span className="absolute left-0 top-7 -translate-x-1/2 w-4 h-0.5 bg-border/50"></span>

      <Card className={cn(
        "mb-4 relative overflow-visible transition-all duration-300",
        isCurrent ? "border-primary ring-2 ring-primary shadow-lg" : "border-border"
      )}>
        <CardContent className="p-3 flex items-center gap-4">
          <Link href={`/creations/${node.creation.id}`} className="block shrink-0">
             <div className="relative h-16 w-24 bg-muted rounded-md overflow-hidden">
                <Image src={node.creation.imageUrl} alt={node.creation.title} fill style={{ objectFit: 'cover' }} data-ai-hint={node.creation.aiHint} />
             </div>
          </Link>
          <div className="flex-grow">
            <Link href={`/creations/${node.creation.id}`}>
              <h4 className="font-semibold text-foreground hover:underline">{node.creation.title}</h4>
            </Link>
            <Link href={`/profile/${(node.creation.author || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
              <p className="text-sm text-muted-foreground hover:underline">by {node.creation.authorProfileName || node.creation.author}</p>
            </Link>
          </div>
          {isCurrent && <Badge variant="secondary" className="absolute -top-3 -right-3">You are here</Badge>}
        </CardContent>
      </Card>

      {node.children && node.children.length > 0 && (
        <ul className="list-none pl-4 border-l border-dashed border-border/70">
          {node.children.map(childNode => (
            <RemixNodeComponent key={childNode.creation.id} node={childNode} currentCreationId={currentCreationId}/>
          ))}
        </ul>
      )}
    </li>
  );
}

export function RemixChainDialog({ isOpen, onClose, startCreation }: RemixChainDialogProps) {
  const [remixTree, setRemixTree] = useState<RemixNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!startCreation || !isOpen) {
      setRemixTree(null); // Reset when dialog closes or no creation is provided
      return;
    }

    const buildRemixTree = async () => {
        setIsLoading(true);
        // Fetch all creations from Firestore
        const firestoreCreations = await getAllCreations();
        const allCreations: Creation[] = [
            ...firestoreCreations,
            ...arcadeGames.map(game => ({
              id: String(game.id),
              authorId: 'arcade-author',
              type: 'Game' as const,
              title: game.title,
              author: game.author,
              imageUrl: game.thumbnail,
              aiHint: game.aiHint || 'game thumbnail',
              tags: game.tags,
              description: `Play ${game.title}, a classic game by ${game.author}.`,
              featured: game.featured ?? false,
            }))
        ];

        // 1. Find the ultimate root of the tree
        let rootNodeData = startCreation;
        const seenIds = new Set<string>(); // prevent infinite loops
        while (rootNodeData.remixOf && !seenIds.has(rootNodeData.id)) {
            seenIds.add(rootNodeData.id);
            const parent = allCreations.find(c => c.id === rootNodeData.remixOf?.id);
            if (parent) {
                rootNodeData = parent;
            } else {
                break; // parent not found, stop
            }
        }

        // 2. Build the tree down from the root
        const buildTree = (nodeData: Creation): RemixNode => {
            const childrenCreations = allCreations.filter(c => c.remixOf?.id === nodeData.id);
            return {
                creation: nodeData,
                children: childrenCreations.map(buildTree)
            };
        };

        setRemixTree(buildTree(rootNodeData));
        setIsLoading(false);
    };

    buildRemixTree();

  }, [startCreation, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <GitFork className="mr-3 h-6 w-6 text-primary" /> Remix Chain
          </DialogTitle>
          <DialogDescription>
            Explore the creative lineage of this Echo, from its original source to all its forks.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4 pr-2">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Building remix chain...</p>
            </div>
          )}
          {!isLoading && remixTree ? (
            <ul className="list-none p-0 m-0">
               <RemixNodeComponent node={remixTree} currentCreationId={startCreation?.id || ''} />
            </ul>
          ) : (
             !isLoading && <p className="text-muted-foreground text-center">Could not build remix chain.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

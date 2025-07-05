
'use client';

import { useState, useEffect } from 'react';
import { CreationFeedCard } from './CreationFeedCard';
import { getRecommendationReasonAction } from '@/app/explore/actions';
import type { Creation, UserProfileData } from '@/config/profileData';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/contexts/UserContext';

interface RecommendedCreationFeedCardProps {
  creation: Creation;
  isLiked: boolean;
  onLike: (id: string, title: string) => void;
}

function ReasonSkeleton() {
    return (
        <div className="mb-2 p-2 flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-1.5 flex-grow">
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

export function RecommendedCreationFeedCard({ creation, isLiked, onLike }: RecommendedCreationFeedCardProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [isLoadingReason, setIsLoadingReason] = useState(true);
  const { userProfile, loading: profileLoading } = useUser();

  useEffect(() => {
    let isMounted = true;
    async function fetchReason() {
      if (!userProfile) {
        setIsLoadingReason(false);
        return;
      }

      const result = await getRecommendationReasonAction({
        userInterests: userProfile.personalVibeTags,
        userSkills: userProfile.keySkills,
        creationTitle: creation.title,
        creationType: creation.type,
        creationTags: creation.tags || [],
      });
      
      if (isMounted) {
          if ('reason' in result) {
            setReason(result.reason);
          } else {
            console.error(result.error);
            setReason(null); // Don't show a reason if there's an error
          }
          setIsLoadingReason(false);
      }
    }

    if (!profileLoading) {
      fetchReason();
    }
    
    return () => {
        isMounted = false;
    };
  }, [creation, userProfile, profileLoading]);

  const recommendationReasonNode = isLoadingReason 
    ? <ReasonSkeleton /> 
    : (reason ? <span>{reason}</span> : null);

  return (
    <CreationFeedCard
      creation={creation}
      isLiked={isLiked}
      onLike={onLike}
      recommendationReason={recommendationReasonNode}
    />
  );
}

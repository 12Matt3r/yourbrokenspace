
'use server';

import { auth } from '@/lib/firebase/client';
import { followUser, unfollowUser } from '@/lib/firebase/firestoreService';
import { revalidatePath } from 'next/cache';

export async function toggleFollowAction(targetUserId: string, isCurrentlyFollowing: boolean): Promise<{ success: boolean; error?: string }> {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
        return { success: false, error: "You must be logged in to follow users." };
    }
    if (currentUser.uid === targetUserId) {
        return { success: false, error: "You cannot follow yourself." };
    }

    try {
        if (isCurrentlyFollowing) {
            await unfollowUser(currentUser.uid, targetUserId);
        } else {
            await followUser(currentUser.uid, targetUserId);
        }
        
        revalidatePath('/following');
        revalidatePath('/profile/[username]', 'page');
        
        return { success: true };
    } catch (e: any) {
        console.error("Follow/unfollow action error:", e);
        return { success: false, error: e.message };
    }
}

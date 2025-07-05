
'use server';
import { auth, firestore } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface ReportPayload {
  targetId: string;
  targetType: 'user' | 'creation';
  reason: string;
  details?: string;
}

export async function submitReportAction(payload: ReportPayload): Promise<{ success: boolean; error?: string }> {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
        return { success: false, error: "You must be logged in to submit a report." };
    }
    if (!firestore) {
        return { success: false, error: "Database not initialized." };
    }

    try {
        const reportsCollection = collection(firestore, 'reports');
        await addDoc(reportsCollection, {
            reporterId: currentUser.uid,
            ...payload,
            createdAt: serverTimestamp(),
            status: 'new' // To track moderation status
        });
        return { success: true };
    } catch (e: any) {
        console.error("Report submission error:", e);
        return { success: false, error: e.message };
    }
}

export async function blockUserAction(userToBlockId: string): Promise<{ success: boolean, error?: string }> {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
        return { success: false, error: "You must be logged in to block a user." };
    }
    if (currentUser.uid === userToBlockId) {
        return { success: false, error: "You cannot block yourself." };
    }
    if (!firestore) {
        return { success: false, error: "Database not initialized." };
    }
    try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userRef, {
            blockedUsers: arrayUnion(userToBlockId)
        });
        revalidatePath('/profile/[username]', 'page');
        return { success: true };
    } catch (e: any) {
        console.error("Block user error:", e);
        return { success: false, error: e.message };
    }
}

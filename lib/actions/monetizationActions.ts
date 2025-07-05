
'use server';

import { auth, firestore } from '@/lib/firebase/client';
import { runTransaction, doc, increment, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { NotificationData } from '@/config/notificationsData';
import { createNotification } from '@/lib/firebase/firestoreService';


export async function sendTipAction(
    recipientId: string, 
    recipientName: string, 
    senderId: string, 
    senderName: string, 
    amount: number
): Promise<{ success: boolean; error?: string }> {
    
    if (!firestore) {
        return { success: false, error: "Database not initialized." };
    }
    if (senderId === recipientId) {
        return { success: false, error: "You cannot tip yourself." };
    }
    if (amount <= 0) {
        return { success: false, error: "Tip amount must be positive." };
    }

    const senderRef = doc(firestore, 'users', senderId);
    const recipientRef = doc(firestore, 'users', recipientId);

    try {
        await runTransaction(firestore, async (transaction) => {
            // We are not using real balances, so we just update stats.
            // In a real app, you would integrate a payment provider here.
            
            // Increment sender's total tips sent
            transaction.update(senderRef, {
                'stats.totalTipsSent': increment(amount)
            });

            // Increment recipient's total tips received
            transaction.update(recipientRef, {
                'stats.totalTipsReceived': increment(amount)
            });
        });

        // Create a notification for the recipient
        await createNotification(recipientId, {
            type: 'sale', // Using 'sale' type for dollar icon
            read: false,
            title: 'You received a tip!',
            message: `${senderName} sent you a tip of $${amount.toFixed(2)}.`,
            link: `/profile/${senderName.toLowerCase().replace(/\s/g, '-')}`
        });

        // Revalidate recipient's profile page to show updated stats (if any are public)
        revalidatePath(`/profile/${recipientName.toLowerCase().replace(/\s/g, '-')}`);

        return { success: true };

    } catch (e: any) {
        console.error("Tip transaction error:", e);
        return { success: false, error: e.message || "An unknown error occurred during the transaction." };
    }
}

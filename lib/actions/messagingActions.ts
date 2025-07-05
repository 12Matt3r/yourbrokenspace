
'use server';
import { auth } from '@/lib/firebase/client';
import { getOrCreateConversation, sendMessageToConversation, getUserProfile } from '@/lib/firebase/firestoreService';

export async function sendMessageAction(recipientId: string, text: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
        return { success: false, error: 'User not authenticated.' };
    }
    if (!text.trim()) {
        return { success: false, error: "Message cannot be empty." };
    }
    
    try {
        const senderProfile = await getUserProfile(currentUser.uid);
        const recipientProfile = await getUserProfile(recipientId);

        if (!senderProfile || !recipientProfile) {
            return { success: false, error: "Could not find user profiles." };
        }

        const participantInfo = {
            [senderProfile.uid]: { name: senderProfile.name, avatarUrl: senderProfile.avatarUrl, usernameParam: senderProfile.usernameParam },
            [recipientProfile.uid]: { name: recipientProfile.name, avatarUrl: recipientProfile.avatarUrl, usernameParam: recipientProfile.usernameParam }
        };

        const conversationId = await getOrCreateConversation(currentUser.uid, recipientId, participantInfo);
        await sendMessageToConversation(conversationId, currentUser.uid, text);

        return { success: true };

    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while sending the message.";
        console.error("Send message action error:", e);
        return { success: false, error: errorMessage };
    }
}

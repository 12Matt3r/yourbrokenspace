
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, type Timestamp, addDoc, query, where, getDocs, deleteDoc, orderBy, onSnapshot, limit, writeBatch, runTransaction, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from './client';
import type { User } from 'firebase/auth';
import type { UserProfileData, Creation, Comment } from '@/config/profileData';
import { baseUserProfile } from '@/config/profileData';
import type { YourSpaceEvent } from '../config/eventsData';
import type { NotificationData } from '@/config/notificationsData';
import type { Guild, GuildMember, GuildPost } from '@/config/guildData';
import type { Challenge } from '@/config/challengeData';
import type { Message, Conversation } from '@/config/messagingData';


if (!firestore) {
    console.warn("Firestore is not initialized. Firestore service will be disabled.");
}

export const usersCollection = firestore ? collection(firestore, 'users') : null;
export const creationsCollection = firestore ? collection(firestore, 'creations') : null;
export const eventsCollection = firestore ? collection(firestore, 'events') : null;
export const guildsCollection = firestore ? collection(firestore, 'guilds') : null;
export const challengesCollection = firestore ? collection(firestore, 'challenges') : null;
export const conversationsCollection = firestore ? collection(firestore, 'conversations') : null;

/**
 * Creates a new user profile document in Firestore.
 * This should be called when a new user signs up.
 * It checks if a profile already exists before creating one.
 * @param user The Firebase Auth User object.
 * @param displayName A display name to use for the new profile.
 */
export async function createUserProfile(user: User, displayName?: string): Promise<void> {
    if (!firestore) throw new Error("Firestore not initialized");

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
        return;
    }
    
    const usernameParam = (displayName || user.displayName || user.email?.split('@')[0] || `user${Date.now()}`)
        .toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

    const newUserProfile: Omit<UserProfileData, 'uid' | 'creations'> = {
        ...baseUserProfile,
        name: displayName || user.displayName || 'New User',
        usernameParam, 
        email: user.email || '',
        avatarUrl: user.photoURL || baseUserProfile.avatarUrl,
        customization: { ...baseUserProfile.customization },
        createdAt: serverTimestamp() as Timestamp,
        lastLogin: serverTimestamp() as Timestamp,
        followers: [],
        following: [],
    };
    await setDoc(userRef, newUserProfile);
}

/**
 * Retrieves a user's profile data from Firestore.
 * @param uid The user's unique ID.
 * @returns The user's profile data, or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
    if (!firestore) return null;
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        const data = userDoc.data() as UserProfileData;
        return { ...data, uid };
    }
    return null;
}

/**
 * Retrieves a user's profile data from Firestore by their username parameter.
 * @param username The user's unique username parameter.
 * @returns The user's UID and profile data, or null if not found.
 */
export async function getUserByUsername(username: string): Promise<{ uid: string, profile: UserProfileData } | null> {
    if (!usersCollection) return null;
    const q = query(usersCollection, where("usernameParam", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) { return null; }
    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, profile: { ...userDoc.data(), uid: userDoc.id } as UserProfileData };
}

/**
 * Retrieves all user profiles from Firestore.
 * @returns An array of all user profiles.
 */
export async function getAllUsers(): Promise<UserProfileData[]> {
    if (!usersCollection) return [];
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfileData));
}

/**
 * Updates a user's profile document in Firestore.
 * @param uid The user's unique ID.
 * @param data An object containing the fields to update.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
    if (!firestore) throw new Error("Firestore not initialized");
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, { ...data, lastUpdated: serverTimestamp() });
}

// User relationship functions
export async function followUser(currentUserId: string, targetUserId: string): Promise<void> {
    if (!firestore) throw new Error("Firestore not initialized");

    const currentUserRef = doc(firestore, 'users', currentUserId);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    const currentUserProfile = await getUserProfile(currentUserId);
    if (!currentUserProfile) {
        throw new Error("Could not find your user profile to create notification.");
    }

    await runTransaction(firestore, async (transaction) => {
        transaction.update(currentUserRef, {
            following: arrayUnion(targetUserId),
            'stats.following': increment(1)
        });
        transaction.update(targetUserRef, {
            followers: arrayUnion(currentUserId),
            'stats.followers': increment(1)
        });
    });

    // Create notification for the user being followed
    await createNotification(targetUserId, {
        type: 'follow',
        read: false,
        title: 'New Follower',
        message: `${currentUserProfile.name} started following you.`,
        link: `/profile/${currentUserProfile.usernameParam}`,
        avatarUrl: currentUserProfile.avatarUrl,
        avatarAiHint: currentUserProfile.avatarAiHint,
    });
}

export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
    if (!firestore) throw new Error("Firestore not initialized");

    const currentUserRef = doc(firestore, 'users', currentUserId);
    const targetUserRef = doc(firestore, 'users', targetUserId);

    await runTransaction(firestore, async (transaction) => {
        transaction.update(currentUserRef, {
            following: arrayRemove(targetUserId),
            'stats.following': increment(-1)
        });
        transaction.update(targetUserRef, {
            followers: arrayRemove(currentUserId),
            'stats.followers': increment(-1)
        });
    });
}


// Creation Functions

/**
 * Adds a new creation to the Firestore 'creations' collection.
 * @param creationData The creation data, without an ID.
 * @returns The ID of the newly created document.
 */
export async function addCreation(creationData: Omit<Creation, 'id' | 'comments'>): Promise<string> {
  if (!creationsCollection) throw new Error("Firestore not initialized");
  const dataWithTimestamp = { ...creationData, createdAt: serverTimestamp() };
  const docRef = await addDoc(creationsCollection, dataWithTimestamp);
  return docRef.id;
}

export async function getUserCreations(userId: string): Promise<Creation[]> {
  if (!creationsCollection) return [];
  const q = query(creationsCollection, where("authorId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Creation));
}

export async function deleteCreation(creationId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore not initialized");
  await deleteDoc(doc(firestore, 'creations', creationId));
}

export async function getCreation(creationId: string): Promise<Creation | null> {
  if (!firestore) return null;
  const docRef = doc(firestore, 'creations', creationId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Creation : null;
}

export async function getAllCreations(): Promise<Creation[]> {
    if (!creationsCollection) return [];
    const q = query(creationsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Creation));
}

// Comment Functions

export async function addCommentToCreation(creationId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  if (!firestore) throw new Error("Firestore not initialized");
  const commentsRef = collection(firestore, 'creations', creationId, 'comments');
  const dataWithTimestamp = { ...commentData, createdAt: serverTimestamp() };
  const docRef = await addDoc(commentsRef, dataWithTimestamp);

  const creation = await getCreation(creationId);
  if (creation && creation.authorId !== commentData.authorId) {
    await createNotification(creation.authorId, {
        type: 'comment',
        read: false,
        title: 'New Comment',
        message: `${commentData.authorName} commented on your creation "${creation.title}".`,
        link: `/creations/${creationId}#comments`,
    });
  }

  return docRef.id;
}

export async function getCommentsForCreation(creationId: string): Promise<Comment[]> {
    if (!firestore) return [];
    const commentsRef = collection(firestore, 'creations', creationId, 'comments');
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
}

// Event Functions

export async function addEvent(eventData: Omit<YourSpaceEvent, 'id'>): Promise<string> {
  if (!eventsCollection) throw new Error("Firestore not initialized");
  const dataWithTimestamp = { ...eventData, createdAt: serverTimestamp() };
  const docRef = await addDoc(eventsCollection, dataWithTimestamp);
  return docRef.id;
}

export async function getAllEvents(): Promise<YourSpaceEvent[]> {
    if (!eventsCollection) return [];
    const q = query(eventsCollection, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as YourSpaceEvent));
}


// Notification Functions
export async function createNotification(userId: string, notificationData: Omit<NotificationData, 'id' | 'timestamp'>) {
    if (!firestore) return;
    const notificationWithTimestamp = { ...notificationData, timestamp: serverTimestamp() };
    await addDoc(collection(firestore, 'users', userId, 'notifications'), notificationWithTimestamp);
}

export function listenForNotifications(
  userId: string,
  callback: (notifications: NotificationData[]) => void,
  count: number = 20
): () => void {
  if (!firestore) return () => {};
  const notifsRef = collection(firestore, 'users', userId, 'notifications');
  const q = query(notifsRef, orderBy('timestamp', 'desc'), limit(count));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as NotificationData));
    callback(notifications);
  }, (error) => {
    console.error("Error listening for notifications:", error);
    callback([]);
  });

  return unsubscribe;
}

export async function markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
  if (!firestore || notificationIds.length === 0) return;
  const batch = writeBatch(firestore);
  notificationIds.forEach(notifId => {
    const notifRef = doc(firestore, 'users', userId, 'notifications', notifId);
    batch.update(notifRef, { read: true });
  });
  await batch.commit();
}


// Guild Functions

export async function getAllGuilds(): Promise<Guild[]> {
    if (!guildsCollection) return [];
    const querySnapshot = await getDocs(guildsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guild));
}

export async function getGuildById(guildId: string): Promise<Guild | null> {
    if (!firestore) return null;
    const guildRef = doc(firestore, 'guilds', guildId);
    const docSnap = await getDoc(guildRef);
    return docSnap.exists() ? { id: docSnap.id, ...doc.data() } as Guild : null;
}

export async function getGuildPosts(guildId: string): Promise<GuildPost[]> {
    if (!firestore) return [];
    const postsRef = collection(firestore, 'guilds', guildId, 'posts');
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuildPost));
}

export async function addPostToGuild(guildId: string, postData: Omit<GuildPost, 'id' | 'createdAt'>): Promise<string> {
    if (!firestore) throw new Error("Firestore not initialized");
    const postsRef = collection(firestore, 'guilds', guildId, 'posts');
    const dataWithTimestamp = { ...postData, createdAt: serverTimestamp() };
    const docRef = await addDoc(postsRef, dataWithTimestamp);
    return docRef.id;
}

export async function createGuild(guildData: Omit<Guild, 'id' | 'members' | 'memberIds' | 'createdAt'>, creator: GuildMember): Promise<string> {
    if (!guildsCollection) throw new Error("Firestore not initialized");
    
    const dataWithTimestamp = {
        ...guildData,
        members: [creator],
        memberIds: [creator.uid],
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(guildsCollection, dataWithTimestamp);
    return docRef.id;
}


// Challenge Functions
export async function getAllChallenges(): Promise<Challenge[]> {
    if (!challengesCollection) return [];
    const q = query(challengesCollection, orderBy("deadline", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
}


// Messaging Functions

const generateConversationId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
};

export async function getOrCreateConversation(uid1: string, uid2: string, participantInfo: Conversation['participantInfo']): Promise<string> {
    if (!firestore) throw new Error("Firestore not initialized");
    const conversationId = generateConversationId(uid1, uid2);
    const conversationRef = doc(firestore, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
            participants: [uid1, uid2],
            participantInfo,
            createdAt: serverTimestamp(),
        });
    }

    return conversationId;
}

export async function sendMessageToConversation(conversationId: string, senderId: string, text: string) {
    if (!firestore) throw new Error("Firestore not initialized");
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const conversationRef = doc(firestore, 'conversations', conversationId);

    const messageData = {
        senderId,
        text,
        timestamp: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);
    await updateDoc(conversationRef, {
        lastMessage: messageData,
    });
}

export function listenForMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    if (!firestore) return () => {};
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    }, (error) => {
        console.error("Error listening for messages:", error);
        callback([]);
    });

    return unsubscribe;
}

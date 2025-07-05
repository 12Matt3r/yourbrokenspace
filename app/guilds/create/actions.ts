'use server';

import { z } from 'zod';
import { createGuild, getUserProfile } from '@/lib/firebase/firestoreService';
import { uploadFileAndGetURL } from '@/lib/firebase/storageService';
import type { Guild, GuildMember } from '@/config/guildData';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  name: z.string().min(3, "Guild name must be at least 3 characters.").max(50, "Guild name must be at most 50 characters."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(300, "Description must be at most 300 characters."),
  icon: z.enum(['Palette', 'Music', 'Code', 'PenTool', 'Gamepad2', 'Sparkles', 'Users']),
  coverImage: z
    .instanceof(File, { message: "Please upload a cover image." })
    .refine(file => file.size > 0, "Please upload a cover image.")
    .refine(file => file.size < 4 * 1024 * 1024, "Image must be less than 4MB."),
});

export interface CreateGuildState {
  message?: string;
  guildId?: string;
  errors?: {
    name?: string[];
    description?: string[];
    icon?: string[];
    coverImage?: string[];
    _form?: string[];
  };
}

export async function createGuildAction(
  userId: string,
  prevState: CreateGuildState,
  formData: FormData
): Promise<CreateGuildState> {

  if (!userId) {
      return { errors: { _form: ['User is not authenticated.'] }};
  }

  const validatedFields = FormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    coverImage: formData.get('coverImage'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }
  
  const { name, description, icon, coverImage } = validatedFields.data;

  try {
    
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
        return { errors: { _form: ['Could not find user profile.'] } };
    }
    
    const creator: GuildMember = {
        uid: userProfile.uid,
        name: userProfile.name,
        username: userProfile.usernameParam,
        avatarUrl: userProfile.avatarUrl,
        avatarAiHint: userProfile.avatarAiHint,
        creatorType: userProfile.creatorType
    };
    
    const coverImageUrl = await uploadFileAndGetURL(coverImage, creator.uid, 'guild-covers');

    const newGuildData: Omit<Guild, 'id' | 'members' | 'memberIds' | 'createdAt'> = {
        name,
        description,
        icon,
        coverImageUrl,
        coverImageAiHint: `guild cover ${name.toLowerCase()}`
    };

    const newGuildId = await createGuild(newGuildData, creator);

    revalidatePath('/guilds');
    return { message: 'success', guildId: newGuildId };

  } catch (e: any) {
    console.error('Guild creation failed:', e);
    return { message: `Database error: ${e.message}` };
  }
}

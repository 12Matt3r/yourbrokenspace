
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

if (!storage) {
  console.warn("Firebase Storage is not initialized. File uploads will be disabled.");
}

type StorageFolder = 'creations' | 'avatars' | 'covers' | 'backgrounds' | 'guild-covers';

/**
 * Uploads a file to a specified folder in Firebase Storage and returns its public URL.
 * @param file The file to upload.
 * @param userId The UID of the user uploading the file.
 * @param folder The folder to upload the file to.
 * @returns The public URL of the uploaded image.
 */
export async function uploadFileAndGetURL(file: File, userId: string, folder: StorageFolder): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Cannot upload file.");
  }
  
  const timestamp = Date.now();
  // Sanitize file name to remove special characters
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const storageRef = ref(storage, `${folder}/${userId}/${timestamp}-${sanitizedFileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

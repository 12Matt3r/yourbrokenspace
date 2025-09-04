
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import { getUserProfile } from '@/lib/firebase/firestoreService';
import type { UserProfileData } from '@/config/profileData';

interface UserContextType {
  userProfile: UserProfileData | null;
  loading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// This component is rendered only when Firebase auth is available.
// It contains all the hooks and logic related to authentication.
function AuthEnabledUserProvider({ children }: { children: ReactNode }) {
  // We can use the non-null assertion (!) because we know `auth` is not null here.
  const [user, authLoading, authError] = useAuthState(auth!);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          setProfileLoading(true);
          const profile = await getUserProfile(user.uid);
          if (profile) {
            // Inject the UID from the auth state into the profile object
            setUserProfile({ ...profile, uid: user.uid });
          } else {
             setUserProfile(null);
          }
          setProfileError(null);
        } catch (e) {
          console.error("Failed to fetch user profile:", e);
          setProfileError(e as Error);
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        // No user, reset state
        setUserProfile(null);
        setProfileLoading(false);
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const value = {
    userProfile,
    loading: authLoading || profileLoading,
    error: authError || profileError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function UserProvider({ children }: { children: ReactNode }) {
  // If Firebase is not configured, the imported `auth` object will be null.
  if (!auth) {
    // Provide a default, "logged-out" state so the app doesn't crash.
    const value = { userProfile: null, loading: false, error: null };
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
  }

  // If Firebase is configured, render the component that handles auth logic.
  return <AuthEnabledUserProvider>{children}</AuthEnabledUserProvider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

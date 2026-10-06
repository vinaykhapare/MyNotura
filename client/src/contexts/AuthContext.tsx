import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { optimizeImage } from '../lib/image';

const isConfigured = isSupabaseConfigured;

export interface SignUpProfileData {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, profileData?: SignUpProfileData) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: SignUpProfileData) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string }>;
  isDemoUser: boolean;
  loginAsDemo: (email?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'notura_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if we are running in demo mode
    const storedDemo = localStorage.getItem(DEMO_USER_KEY);
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed);
        setIsDemoUser(true);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Initialize Supabase Auth listener
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsDemoUser(false);
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsDemoUser(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isConfigured) {
      loginAsDemo(email);
      return {};
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData?: SignUpProfileData
  ): Promise<{ error?: string; message?: string }> => {
    if (!isConfigured) {
      loginAsDemo(email);
      return { message: 'Demo account activated.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: profileData?.full_name?.trim() || undefined,
            username: profileData?.username?.trim().toLowerCase() || undefined,
            avatar_url: profileData?.avatar_url?.trim() || undefined,
            bio: profileData?.bio?.trim() || undefined,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user && !data.session) {
        return { message: 'Registration successful! Please check your email inbox to confirm your account.' };
      }

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (profileData: SignUpProfileData): Promise<{ error?: string }> => {
    if (!user) return { error: 'You must be signed in to update your profile.' };

    // Strict Demo user restriction: reject profile updates on frontend and block API calls
    if (isDemoUser || user.id === 'demo-user-id-0001' || user.user_metadata?.is_demo) {
      return { error: 'Profile editing is disabled in Demo Mode.' };
    }

    if (!isConfigured) {
      return { error: 'Database is not configured.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name?.trim() || undefined,
          username: profileData.username?.trim().toLowerCase() || undefined,
          avatar_url: profileData.avatar_url?.trim() || undefined,
          bio: profileData.bio?.trim() || undefined,
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        setUser(data.user);
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update profile.' };
    }
  };

  const uploadAvatar = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!file) return { error: 'No file provided' };

    // Strict Demo user restriction: reject avatar uploads on frontend and block storage calls
    if (isDemoUser || user?.id === 'demo-user-id-0001' || user?.user_metadata?.is_demo) {
      return { error: 'Profile photo upload is disabled in Demo Mode.' };
    }

    if (!file.type.startsWith('image/')) {
      return { error: 'Please select an image file (JPG, PNG, WebP, GIF).' };
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'Image size must be less than 5MB.' };
    }

    // Optimize image (downscale to max 512x512 and compress)
    let processedFile = file;
    try {
      processedFile = await optimizeImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.85 });
    } catch (e) {
      console.warn('Image optimization skipped, using original:', e);
    }

    if (!isConfigured) {
      return { error: 'Database is not configured.' };
    }

    try {
      const fileExt = processedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const currentUserId = user?.id || 'guest';
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload issue:', uploadError);
        return { error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { url: publicUrlData.publicUrl };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to upload image.' };
    }
  };

  const signOut = async () => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    } finally {
      // Clear all demo user data, session storage, and cached auth tokens
      localStorage.removeItem(DEMO_USER_KEY);
      sessionStorage.clear();
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // ignore storage iteration errors
      }
      setIsDemoUser(false);
      setUser(null);
      setSession(null);
    }
  };

  const loginAsDemo = (email = 'alex.morgan@example.com') => {
    const demoUserObj: User = {
      id: 'demo-user-id-0001',
      app_metadata: { provider: 'demo' },
      user_metadata: {
        full_name: 'Alex Morgan',
        username: 'alex',
        avatar_url: '',
        bio: 'Writer, thinker, and journal keeper.',
        is_demo: true,
      },
      aud: 'authenticated',
      email,
      created_at: new Date().toISOString(),
    } as unknown as User;

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUserObj));
    setUser(demoUserObj);
    setIsDemoUser(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        uploadAvatar,
        isDemoUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

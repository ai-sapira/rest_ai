import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Profile interface
interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  restaurant_name: string | null;
  region: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{data: any, error: any}>;
  signIn: (email: string, password: string) => Promise<{data: any, error: any}>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{data: any, error: any}>;
  refreshProfile: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simplified profile fetch - just create fallback and complete auth
  const fetchProfile = async (userId: string, userData?: any) => {
    console.log('🔐 AuthContext: Creating profile for user:', userId);
    console.log('🔐 AuthContext: User data available:', {
      userMetadata: userData?.user_metadata,
      email: userData?.email
    });
    
    // Use userData parameter if provided, otherwise fall back to state
    const currentUser = userData || user;
    
    // Just create a simple fallback profile and complete auth immediately
    const fallback: Profile = {
      user_id: userId,
      full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Usuario',
      avatar_url: currentUser?.user_metadata?.avatar_url || null,
      restaurant_name: currentUser?.user_metadata?.restaurant_name || null,
      region: currentUser?.user_metadata?.region || null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('🔐 AuthContext: Creating profile with name:', fallback.full_name);
    setProfile(fallback);
    console.log('🔐 AuthContext: Profile created, completing auth');
    setLoading(false);
  };

  // Initialize auth
  useEffect(() => {
    console.log('🔐 AuthContext: Initializing auth...');
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('🔐 AuthContext: Error getting session:', error);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('🔐 AuthContext: Initial session:', !!session, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id, session.user);
        } else {
          console.log('🔐 AuthContext: No initial session, loading complete');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('🔐 AuthContext: Session error:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthContext: Auth state change:', event, !!session, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔐 AuthContext: User found, fetching profile...');
        await fetchProfile(session.user.id, session.user);
      } else {
        console.log('🔐 AuthContext: No user in auth state change, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('🔐 AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Removed problematic timeout - let auth complete naturally

  // Auth methods
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('🔐 AuthContext: Starting signup for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('🔐 AuthContext: Signup error:', error);
        return { data: null, error };
      }

      console.log('🔐 AuthContext: Signup successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 AuthContext: Signup exception:', error);
      return { data: null, error };
    }
    // Don't set loading false here - let the auth state change handle it
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting signin for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('🔐 AuthContext: Signin error:', error);
        return { data: null, error };
      }

      console.log('🔐 AuthContext: Signin successful');
      return { data, error: null };
    } catch (error: any) {
      console.error('🔐 AuthContext: Signin exception:', error);
      return { data: null, error };
    }
    // Don't set loading false here - let the auth state change handle it
  };

  const signOut = async () => {
    try {
      console.log('🔐 AuthContext: Signing out...');
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      console.log('🔐 AuthContext: Sign out completed');
    } catch (error) {
      console.error('🔐 AuthContext: Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { data: null, error: new Error('No user authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      }

      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

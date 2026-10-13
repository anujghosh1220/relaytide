import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     // Check if demo mode is enabled
     if (isDemoMode()) {
       // Set a demo user immediately
       setUser({
         id: "demo-user-1",
         email: "demo@relaytide.com",
         user_metadata: {
           display_name: "Demo User"
         },
         app_metadata: {}, // Empty object as placeholder
         aud: "authenticated", // Common value for auth
         created_at: new Date().toISOString() // Current timestamp
       } as User);
       setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    // Check query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') return true;
    // Check localStorage flag
    return localStorage.getItem('relaytide.demoMode') === 'true';
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (isDemoMode()) {
       // Simulate sign up in demo mode
       return {
         data: {
           user: {
             id: "demo-user-new",
             email,
             user_metadata: {
               display_name: displayName
             },
             app_metadata: {}, // Empty object as placeholder
             aud: "authenticated", // Common value for auth
             created_at: new Date().toISOString() // Current timestamp
           } as User
         },
         error: null
       };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    return { data, error };
  };

   const signIn = async (email: string, password: string) => {
     if (isDemoMode()) {
       // Simulate sign in in demo mode
       // Accept any credentials for demo
       if (email && password) {
         return {
           data: {
             user: {
               id: "demo-user-1",
               email: "demo@relaytide.com",
               user_metadata: {
                 display_name: "Demo User"
               },
               app_metadata: {}, // Empty object as placeholder
               aud: "authenticated", // Common value for auth
               created_at: new Date().toISOString() // Current timestamp
             } as User
           },
           error: null
         };
       } else {
         return { data: null, error: { message: "Invalid credentials" } };
       }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    if (isDemoMode()) {
      // Simulate sign out in demo mode
      setUser(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}

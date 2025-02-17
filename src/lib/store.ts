import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      setUser: (user) => set({ user }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      checkUser: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', user.id)
              .single();
            
            set({ user, isAdmin: profile?.is_admin || false });
          } else {
            set({ user: null, isAdmin: false });
          }
        } catch (error) {
          console.error('Error checking user:', error);
          set({ user: null, isAdmin: false });
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAdmin: false });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
);
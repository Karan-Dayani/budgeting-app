import { create } from "zustand";
import { supabase } from "../../lib/supabase";

interface AuthState {
  user: any | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initializeAuth: () => {
    // 1. Fetch initial user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      set({ user, loading: false });
    });

    // 2. Set up listener for real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, loading: false });
    });

    // Return cleanup function to unsubscribe
    return () => {
      subscription.unsubscribe();
    };
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  }
}));

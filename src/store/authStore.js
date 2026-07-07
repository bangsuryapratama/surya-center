import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

/**
 * Global auth store. Kept intentionally thin — Supabase's own client is the
 * source of truth for the session; this store just mirrors it into React so
 * components can subscribe without prop-drilling.
 */
export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, isLoading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));

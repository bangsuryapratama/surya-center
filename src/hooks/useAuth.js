import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/** Thin hook wrapper around the auth store — call once at app root. */
export function useAuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const signOut = useAuthStore((s) => s.signOut);
  return { user, isLoading, signOut, isAuthenticated: !!user };
}

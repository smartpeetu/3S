import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  // Overall authentication loading
  const [loading, setLoading] = useState(true);

  // Specifically tracks team_members profile loading
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);

    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load user profile:", error);
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfile(data);
    setProfileLoading(false);

    return data;
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      return;
    }

    await loadProfile(session.user.id);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Authentication initialization failed:", error);

        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    profileLoading,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
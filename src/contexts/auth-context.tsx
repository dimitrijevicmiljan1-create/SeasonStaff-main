"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { AuthState, Organization, Profile } from "@/types/auth";

interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  initialUser: AuthState["user"];
  initialProfile: Profile | null;
  initialOrganization: Organization | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
  initialOrganization,
}: AuthProviderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AuthState["user"]>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "id, organization_id, role, first_name, last_name, phone, created_at",
        )
        .eq("id", userId)
        .maybeSingle();

      if (!profileData) {
        setProfile(null);
        setOrganization(null);
        return;
      }

      setProfile(profileData as Profile);

      const { data: orgData } = await supabase
        .from("organizations")
        .select(
          "id, business_name, phone, email, address, default_shift_start, default_shift_end, default_position_ids, created_at",
        )
        .eq("id", profileData.organization_id)
        .maybeSingle();

      setOrganization((orgData as Organization | null) ?? null);
    },
    [supabase],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    setUser({ id: authUser.id, email: authUser.email });
    await loadProfile(authUser.id);
    setIsLoading(false);
  }, [loadProfile, supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        return;
      }

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setIsLoading(false);
        return;
      }

      setUser({ id: session.user.id, email: session.user.email });
      void loadProfile(session.user.id).finally(() => setIsLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [loadProfile, supabase]);

  const value = useMemo(
    () => ({
      user,
      profile,
      organization,
      isLoading,
      refresh,
    }),
    [user, profile, organization, isLoading, refresh],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

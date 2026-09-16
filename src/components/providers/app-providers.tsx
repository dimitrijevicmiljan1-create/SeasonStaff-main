"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";
import { QueryProvider } from "@/providers/query-provider";
import type { AuthState, Organization, Profile } from "@/types/auth";

interface AppProvidersProps {
  children: ReactNode;
  initialUser: AuthState["user"];
  initialProfile: Profile | null;
  initialOrganization: Organization | null;
}

export function AppProviders({
  children,
  initialUser,
  initialProfile,
  initialOrganization,
}: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider
        initialUser={initialUser}
        initialProfile={initialProfile}
        initialOrganization={initialOrganization}
      >
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

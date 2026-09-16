import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { AppProviders } from "@/components/providers/app-providers";
import { getAuthContext } from "@/lib/auth/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, organization } = await getAuthContext();

  if (!user) {
    redirect("/login");
  }

  if (!profile) {
    redirect("/setup");
  }

  return (
    <AppProviders
      initialUser={{ id: user.id, email: user.email }}
      initialProfile={profile}
      initialOrganization={organization}
    >
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}

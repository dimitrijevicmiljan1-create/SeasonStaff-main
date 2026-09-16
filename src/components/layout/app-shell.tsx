"use client";

import { memo, useMemo } from "react";
import { usePathname } from "next/navigation";

import { BodyInteractionReset } from "@/components/layout/body-interaction-reset";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/shifts": "Shift Board",
  "/requests": "Requests",
  "/settings": "Settings",
  "/attendance": "Attendance",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = `/${pathname.split("/")[1]}`;
  return PAGE_TITLES[base] ?? "SeasonStaff";
}

const AppMain = memo(function AppMain({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="app-interactive-layer flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-6">
      {children}
    </main>
  );
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = useMemo(() => getPageTitle(pathname), [pathname]);

  return (
    <>
      <BodyInteractionReset />
      <div className="min-h-screen bg-app">
        <Sidebar />
        <div className="flex min-h-screen flex-col lg:pl-60">
          <TopHeader title={title} />
          <AppMain>{children}</AppMain>
          <BottomNav />
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { WorkspaceActionMenu } from "@/components/layout/workspace-action-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ReminderCenter } from "@/components/reminders/reminder-center";
import { ReminderNotificationBridge } from "@/components/reminders/reminder-notification-bridge";
import { AppIcon } from "@/components/ui/app-icon";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AppIcon variant="loader" className="w-12 h-12" />
          <p className="text-muted-foreground text-sm">Loading MADVERSE…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content — add bottom padding on mobile for nav bar */}
      <main className="relative flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0">
        <div className="pointer-events-none fixed right-5 top-4 z-40 hidden md:flex xl:right-6">
          <WorkspaceActionMenu />
        </div>
        {children}
      </main>

      {/* Overlays */}
      <CommandPalette />
      <ReminderCenter />
      <ReminderNotificationBridge />

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav />
    </div>
  );
}

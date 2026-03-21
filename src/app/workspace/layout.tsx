"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { useAppStore } from "@/store/app.store";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const { sidebarCollapsed } = useAppStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/app-icon.png" alt="MADVERSE" className="w-12 h-12 rounded-2xl animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading MADVERSE…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-200 min-w-0">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}

"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app.store";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Database, LayoutDashboard, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function WorkspacePage() {
  const router = useRouter();
  const { currentWorkspaceId } = useAppStore();
  const createPage = useMutation(api.pages.create);

  const handleCreate = async (type: "document" | "database" | "dashboard") => {
    if (!currentWorkspaceId) {
      toast.error("No workspace selected");
      return;
    }
    try {
      const id = await createPage({
        workspaceId: currentWorkspaceId,
        parentId: null,
        type,
        title: "Untitled",
      });
      router.push(`/workspace/${id}`);
    } catch {
      toast.error("Failed to create page");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      <div className="text-center">
        <img src="/app-icon.png" alt="MADVERSE" className="w-16 h-16 rounded-3xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to MADVERSE</h1>
        <p className="text-muted-foreground max-w-sm">
          Your AI-powered knowledge OS. Create a page to get started.
        </p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <CreateCard
          icon={<FileText className="w-6 h-6 text-foreground" />}
          title="New document"
          description="Write notes, ideas, or plans"
          onClick={() => handleCreate("document")}
        />
        <CreateCard
          icon={<Database className="w-6 h-6 text-foreground" />}
          title="New database"
          description="Track tasks, projects, or data"
          onClick={() => handleCreate("database")}
        />
        <CreateCard
          icon={<LayoutDashboard className="w-6 h-6 text-foreground" />}
          title="New dashboard"
          description="Create an overview or hub"
          onClick={() => handleCreate("dashboard")}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">⌘K</kbd> to search or create pages
      </p>
    </div>
  );
}

function CreateCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/30 transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

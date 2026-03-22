"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useMutation, useQuery } from "convex/react";
import { Redo2, Undo2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn, sanitizeForConvex } from "@/lib/utils";

interface BlockNoteEditorProps {
  pageId: Id<"pages">;
  editable?: boolean;
  isFullWidth?: boolean;
}

export function BlockNoteEditor({
  pageId,
  editable = true,
  isFullWidth = false,
}: BlockNoteEditorProps) {
  const { resolvedTheme } = useTheme();

  // Load blocks from Convex
  const blocks = useQuery(api.blocks.listByPage, { pageId });
  const replaceAll = useMutation(api.blocks.replaceAll);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  // Create BlockNote editor instance
  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  // Load initial content from Convex
  useEffect(() => {
    if (!blocks || isInitialized.current) return;
    isInitialized.current = true;

    if (blocks.length > 0) {
      try {
        // The content stored is BlockNote block JSON
        const blockContent = blocks[0]?.content;
        if (
          blockContent &&
          typeof blockContent === "object" &&
          Array.isArray(blockContent)
        ) {
          editor.replaceBlocks(editor.document, blockContent as any);
        }
      } catch (e) {
        // If content parse fails, leave blank
        console.warn("Could not load blocks:", e);
      }
    }
  }, [blocks, editor]);

  // Debounced auto-save
  const handleChange = useCallback(() => {
    if (!isInitialized.current) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        const editorBlocks = editor.document;
        await replaceAll({
          pageId,
          blocks: [
            {
              type: "document",
              content: sanitizeForConvex(editorBlocks),
              sortOrder: 1000,
              properties: {},
            },
          ],
        });
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }, 1500);
  }, [editor, pageId, replaceAll]);

  return (
    <div className={cn("blocknote-wrapper w-full min-h-[calc(100vh-200px)]", isFullWidth && "full-width-editor")}>
      {editable && (
        <div className="mb-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            onClick={() => editor.undo()}
          >
            <Undo2 className="mr-1.5 h-3.5 w-3.5" />
            Undo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            onClick={() => editor.redo()}
          >
            <Redo2 className="mr-1.5 h-3.5 w-3.5" />
            Redo
          </Button>
        </div>
      )}

      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={editable}
        onChange={handleChange}
        className="prose-editor"
      />
    </div>
  );
}

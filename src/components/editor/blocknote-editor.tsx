"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAppStore } from "@/store/app.store";
import { useTheme } from "next-themes";

interface BlockNoteEditorProps {
  pageId: Id<"pages">;
  editable?: boolean;
}

export function BlockNoteEditor({
  pageId,
  editable = true,
}: BlockNoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const { maddyEnabled, geminiApiKey } = useAppStore();

  // Load blocks from Convex
  const blocks = useQuery(api.blocks.listByPage, { pageId });
  const replaceAll = useMutation(api.blocks.replaceAll);
  const tagPage = useMutation(api.pages.update);

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
              content: editorBlocks,
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
    <div className="blocknote-wrapper w-full min-h-[calc(100vh-200px)]">
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

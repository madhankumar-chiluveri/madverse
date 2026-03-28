"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
  Pencil,
  CornerDownRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────

type Comment = {
  _id: Id<"comments">;
  pageId: Id<"pages">;
  workspaceId: Id<"workspaces">;
  parentCommentId?: Id<"comments"> | null;
  authorId: string;
  authorName?: string;
  content: string;
  isResolved: boolean;
  resolvedAt?: number | null;
  resolvedBy?: string | null;
  editedAt?: number | null;
  createdAt: number;
  updatedAt: number;
};

type Filter = "open" | "resolved" | "all";

// ── Avatar helper ─────────────────────────────────────────────

function Avatar({ name }: { name?: string }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white select-none">
      {initials}
    </div>
  );
}

// ── Single comment ─────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  currentUserId: string | null;
  isReply?: boolean;
  onReply: (id: Id<"comments">, authorName?: string) => void;
  pageId: Id<"pages">;
  workspaceId: Id<"workspaces">;
}

function CommentItem({
  comment,
  currentUserId,
  isReply = false,
  onReply,
  pageId,
  workspaceId,
}: CommentItemProps) {
  const removeComment = useMutation(api.comments.remove);
  const editComment = useMutation(api.comments.edit);
  const resolveComment = useMutation(api.comments.resolve);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const isOwn = currentUserId === comment.authorId;

  const handleDelete = useCallback(async () => {
    try {
      await removeComment({ id: comment._id });
    } catch {
      toast.error("Failed to delete comment");
    }
  }, [comment._id, removeComment]);

  const handleEditSave = useCallback(async () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    try {
      await editComment({ id: comment._id, content: trimmed });
      setEditing(false);
    } catch {
      toast.error("Failed to edit comment");
    }
  }, [comment._id, editComment, editValue]);

  const handleResolve = useCallback(async () => {
    try {
      await resolveComment({ id: comment._id, resolved: !comment.isResolved });
    } catch {
      toast.error("Failed to update comment");
    }
  }, [comment._id, comment.isResolved, resolveComment]);

  return (
    <div
      className={cn(
        "group relative flex gap-3",
        isReply && "ml-6 md:ml-10 mt-2",
        comment.isResolved && "opacity-60"
      )}
    >
      <Avatar name={comment.authorName} />

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {comment.authorName ?? "Unknown"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </span>
          {comment.editedAt && (
            <span className="text-xs text-muted-foreground italic">(edited)</span>
          )}
          {comment.isResolved && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-medium">
              Resolved
            </span>
          )}
        </div>

        {/* Content / edit form */}
        {editing ? (
          <div className="mt-1.5">
            <textarea
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEditSave();
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditValue(comment.content);
                }
              }}
              rows={3}
              autoFocus
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center gap-2 mt-1.5">
              <Button size="sm" className="h-8 text-xs" onClick={handleEditSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => {
                  setEditing(false);
                  setEditValue(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {/* Action row — always visible on mobile, hover-reveal on desktop */}
        {!editing && (
          <div className="flex items-center flex-wrap gap-1 mt-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {!isReply && (
              <button
                onClick={() => onReply(comment._id, comment.authorName)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-accent/50 transition-colors min-h-[32px]"
              >
                <CornerDownRight className="w-3 h-3" /> Reply
              </button>
            )}
            {!isReply && (
              <button
                onClick={handleResolve}
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1.5 rounded transition-colors min-h-[32px]",
                  comment.isResolved
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                )}
              >
                <Check className="w-3 h-3" />
                {comment.isResolved ? "Unresolve" : "Resolve"}
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => {
                  setEditing(true);
                  setEditValue(comment.content);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-accent/50 transition-colors min-h-[32px]"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
            {isOwn && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 px-2 py-1.5 rounded hover:bg-red-500/10 transition-colors min-h-[32px]"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reply composer ─────────────────────────────────────────────

interface ReplyComposerProps {
  pageId: Id<"pages">;
  workspaceId: Id<"workspaces">;
  parentId: Id<"comments">;
  parentAuthorName?: string;
  onDone: () => void;
}

function ReplyComposer({
  pageId,
  workspaceId,
  parentId,
  parentAuthorName,
  onDone,
}: ReplyComposerProps) {
  const addComment = useMutation(api.comments.add);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await addComment({
        pageId,
        workspaceId,
        content: trimmed,
        parentCommentId: parentId,
      });
      setValue("");
      onDone();
    } catch {
      toast.error("Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  }, [addComment, onDone, pageId, parentId, value, workspaceId]);

  return (
    <div className="ml-6 md:ml-10 mt-2">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          if (e.key === "Escape") onDone();
        }}
        placeholder={
          parentAuthorName
            ? `Reply to ${parentAuthorName}…`
            : "Write a reply…"
        }
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <Button
          size="sm"
          className="h-9 text-xs"
          onClick={handleSubmit}
          disabled={!value.trim() || submitting}
        >
          Reply
        </Button>
        <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={onDone}>
          Cancel
        </Button>
        <span className="text-xs text-muted-foreground ml-auto hidden sm:block">⌘↵ to send</span>
      </div>
    </div>
  );
}

// ── Thread (one root comment + its replies) ───────────────────

interface ThreadProps {
  root: Comment;
  replies: Comment[];
  currentUserId: string | null;
  pageId: Id<"pages">;
  workspaceId: Id<"workspaces">;
}

function Thread({ root, replies, currentUserId, pageId, workspaceId }: ThreadProps) {
  const [replyingTo, setReplyingTo] = useState<{
    id: Id<"comments">;
    name?: string;
  } | null>(null);
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="py-3 border-b border-border/60 last:border-0">
      <CommentItem
        comment={root}
        currentUserId={currentUserId}
        onReply={(id, name) => setReplyingTo({ id, name })}
        pageId={pageId}
        workspaceId={workspaceId}
      />

      {replies.length > 0 && (
        <button
          onClick={() => setShowReplies((v) => !v)}
          className="ml-6 md:ml-10 mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] px-1"
        >
          {showReplies ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </button>
      )}

      {showReplies &&
        replies.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            currentUserId={currentUserId}
            isReply
            onReply={() => {}}
            pageId={pageId}
            workspaceId={workspaceId}
          />
        ))}

      {replyingTo && (
        <ReplyComposer
          pageId={pageId}
          workspaceId={workspaceId}
          parentId={replyingTo.id}
          parentAuthorName={replyingTo.name}
          onDone={() => setReplyingTo(null)}
        />
      )}
    </div>
  );
}

// ── Main PageComments component ───────────────────────────────

interface PageCommentsProps {
  pageId: Id<"pages">;
  workspaceId: Id<"workspaces">;
}

export function PageComments({ pageId, workspaceId }: PageCommentsProps) {
  const addComment = useMutation(api.comments.add);
  const result = useQuery(api.comments.listByPage, { pageId });

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("open");
  const [newComment, setNewComment] = useState("");
  const [composerFocused, setComposerFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const comments: Comment[] = result?.comments ?? [];
  const currentUserId = result?.currentUserId ?? null;

  // Split roots vs replies
  const roots = comments.filter((c) => !c.parentCommentId);
  const getReplies = (id: Id<"comments">) =>
    comments.filter((c) => c.parentCommentId === id);

  // Apply filter
  const filteredRoots = roots.filter((c) => {
    if (filter === "open") return !c.isResolved;
    if (filter === "resolved") return c.isResolved;
    return true;
  });

  const openCount = roots.filter((c) => !c.isResolved).length;
  const totalCount = roots.length;

  const handleSubmit = useCallback(async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await addComment({ pageId, workspaceId, content: trimmed });
      setNewComment("");
      setComposerFocused(false);
      setOpen(true);
      setFilter("open");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }, [addComment, newComment, pageId, workspaceId]);

  return (
    <div className="mt-16 border-t border-border/60 pt-6">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 w-full text-left min-h-[40px]"
      >
        <MessageSquare className="w-4 h-4" />
        <span>
          {totalCount === 0
            ? "Comments"
            : `${openCount > 0 ? `${openCount} open` : ""}${
                openCount > 0 && totalCount - openCount > 0 ? " · " : ""
              }${
                totalCount - openCount > 0
                  ? `${totalCount - openCount} resolved`
                  : ""
              }`}
        </span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 ml-auto" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-auto" />
        )}
      </button>

      {/* New comment composer */}
      <div className="flex gap-3 mb-4">
        <Avatar name="You" />
        <div className="flex-1 min-w-0">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setComposerFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              if (e.key === "Escape") {
                setComposerFocused(false);
                setNewComment("");
              }
            }}
            placeholder="Add a comment…"
            rows={composerFocused ? 3 : 1}
            className={cn(
              "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-all duration-150"
            )}
          />
          {composerFocused && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Button
                size="sm"
                className="h-9 text-xs"
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting}
              >
                Comment
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 text-xs"
                onClick={() => {
                  setComposerFocused(false);
                  setNewComment("");
                }}
              >
                Cancel
              </Button>
              <span className="text-xs text-muted-foreground ml-auto hidden sm:block">⌘↵ to send</span>
            </div>
          )}
        </div>
      </div>

      {/* Comment list */}
      {open && totalCount > 0 && (
        <div>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-border/60 pb-2">
            {(["open", "resolved", "all"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition-colors capitalize min-h-[32px]",
                  filter === f
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {f}
                {f === "open" && openCount > 0 && (
                  <span className="ml-1 text-xs opacity-60">{openCount}</span>
                )}
              </button>
            ))}
          </div>

          {filteredRoots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No {filter !== "all" ? filter : ""} comments
            </p>
          ) : (
            <div>
              {filteredRoots.map((root) => (
                <Thread
                  key={root._id}
                  root={root}
                  replies={getReplies(root._id)}
                  currentUserId={currentUserId}
                  pageId={pageId}
                  workspaceId={workspaceId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

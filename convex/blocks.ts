import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const upsert = mutation({
  args: {
    id: v.optional(v.id("blocks")),
    pageId: v.id("pages"),
    type: v.string(),
    content: v.any(),
    parentBlockId: v.optional(v.union(v.id("blocks"), v.null())),
    sortOrder: v.optional(v.number()),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.id) {
      await ctx.db.patch(args.id, {
        type: args.type,
        content: args.content,
        properties: args.properties ?? {},
        updatedAt: Date.now(),
      });
      return args.id;
    } else {
      const siblings = await ctx.db
        .query("blocks")
        .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
        .collect();

      const maxOrder = siblings.reduce((max, b) => Math.max(max, b.sortOrder), 0);

      return await ctx.db.insert("blocks", {
        pageId: args.pageId,
        type: args.type,
        content: args.content,
        parentBlockId: args.parentBlockId ?? null,
        sortOrder: args.sortOrder ?? maxOrder + 1000,
        properties: args.properties ?? {},
        updatedAt: Date.now(),
      });
    }
  },
});

export const bulkUpsert = mutation({
  args: {
    pageId: v.id("pages"),
    blocks: v.array(
      v.object({
        id: v.optional(v.id("blocks")),
        type: v.string(),
        content: v.any(),
        parentBlockId: v.optional(v.union(v.id("blocks"), v.null())),
        sortOrder: v.number(),
        properties: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    for (const block of args.blocks) {
      if (block.id) {
        const existing = await ctx.db.get(block.id);
        if (existing) {
          await ctx.db.patch(block.id, {
            type: block.type,
            content: block.content,
            sortOrder: block.sortOrder,
            properties: block.properties ?? {},
            updatedAt: now,
          });
        }
      } else {
        await ctx.db.insert("blocks", {
          pageId: args.pageId,
          type: block.type,
          content: block.content,
          parentBlockId: block.parentBlockId ?? null,
          sortOrder: block.sortOrder,
          properties: block.properties ?? {},
          updatedAt: now,
        });
      }
    }

    // Update page's updatedAt
    await ctx.db.patch(args.pageId, { updatedAt: now });
    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("blocks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Recursively delete children
    const children = await ctx.db
      .query("blocks")
      .withIndex("by_parentBlockId", (q) => q.eq("parentBlockId", args.id))
      .collect();

    for (const child of children) {
      await ctx.db.delete(child._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    pageId: v.id("pages"),
    orderedIds: v.array(v.id("blocks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        sortOrder: (i + 1) * 1000,
        updatedAt: Date.now(),
      });
    }
  },
});

export const listByPage = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blocks")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("asc")
      .collect();
  },
});

export const replaceAll = mutation({
  args: {
    pageId: v.id("pages"),
    blocks: v.array(
      v.object({
        type: v.string(),
        content: v.any(),
        sortOrder: v.number(),
        properties: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete existing blocks
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .collect();

    for (const block of existing) {
      await ctx.db.delete(block._id);
    }

    // Insert new blocks
    const now = Date.now();
    for (const block of args.blocks) {
      await ctx.db.insert("blocks", {
        pageId: args.pageId,
        type: block.type,
        content: block.content,
        parentBlockId: null,
        sortOrder: block.sortOrder,
        properties: block.properties ?? {},
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.pageId, { updatedAt: now });
    return true;
  },
});

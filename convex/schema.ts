import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  workspaces: defineTable({
    name: v.string(),
    userId: v.string(),
    icon: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  pages: defineTable({
    workspaceId: v.id("workspaces"),
    parentId: v.union(v.id("pages"), v.null()),
    type: v.union(v.literal("document"), v.literal("database"), v.literal("dashboard")),
    title: v.string(),
    icon: v.optional(v.union(v.string(), v.null())),
    coverImage: v.optional(v.union(v.string(), v.null())),
    isFullWidth: v.boolean(),
    isFavourite: v.boolean(),
    isArchived: v.boolean(),
    archivedAt: v.optional(v.union(v.number(), v.null())),
    sortOrder: v.number(),
    createdBy: v.string(),
    updatedAt: v.number(),
    maddyTags: v.optional(v.array(v.string())),
    maddySuggested: v.optional(v.array(v.string())),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_parentId", ["parentId"])
    .index("by_workspaceId_archived", ["workspaceId", "isArchived"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["workspaceId", "isArchived"],
    }),

  blocks: defineTable({
    pageId: v.id("pages"),
    type: v.string(),
    content: v.any(),
    parentBlockId: v.optional(v.union(v.id("blocks"), v.null())),
    sortOrder: v.number(),
    properties: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_pageId", ["pageId"])
    .index("by_parentBlockId", ["parentBlockId"]),

  databases: defineTable({
    pageId: v.id("pages"),
    name: v.string(),
    properties: v.array(v.any()),
    defaultViewId: v.optional(v.union(v.id("views"), v.null())),
  }).index("by_pageId", ["pageId"]),

  rows: defineTable({
    databaseId: v.id("databases"),
    pageId: v.optional(v.union(v.id("pages"), v.null())),
    data: v.any(),
    sortOrder: v.number(),
    isArchived: v.optional(v.boolean()),
  })
    .index("by_databaseId", ["databaseId"])
    .index("by_pageId", ["pageId"]),

  views: defineTable({
    databaseId: v.id("databases"),
    name: v.string(),
    type: v.union(
      v.literal("table"),
      v.literal("board"),
      v.literal("list"),
      v.literal("calendar"),
      v.literal("gallery"),
      v.literal("timeline")
    ),
    filters: v.optional(v.any()),
    sorts: v.optional(v.array(v.any())),
    groupBy: v.optional(v.union(v.string(), v.null())),
    visibleProperties: v.optional(v.array(v.string())),
    cardCoverPropertyId: v.optional(v.union(v.string(), v.null())),
  }).index("by_databaseId", ["databaseId"]),

  maddyEmbeddings: defineTable({
    pageId: v.id("pages"),
    vector: v.array(v.float64()),
    contentHash: v.string(),
    updatedAt: v.number(),
  })
    .index("by_pageId", ["pageId"])
    .vectorIndex("by_vector", {
      vectorField: "vector",
      dimensions: 768,
      filterFields: [],
    }),

  userSettings: defineTable({
    userId: v.string(),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    accentColor: v.optional(v.string()),
    fontFamily: v.optional(v.union(v.literal("default"), v.literal("serif"), v.literal("mono"))),
    maddyEnabled: v.optional(v.boolean()),
    fullWidthDefault: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]),
});

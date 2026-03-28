# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MadVibe — AI-Powered Personal Knowledge OS

A comprehensive "Second Brain" and Personal Operating System built with Next.js 15, Convex, and Google Gemini. Integrates knowledge management, productivity tools, and personal finance into a single AI-pivoted workspace.

---

## Commands

```bash
# Development (run both concurrently in separate terminals)
npm run dev           # Next.js dev server
npm run convex:dev    # Convex backend dev server (required for real-time data)

# Production
npm run build
npm run convex:deploy

# Lint
npm run lint
```

**No test framework is configured.** There are no jest/vitest/playwright setups.

---

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
CONVEX_SITE_URL=https://your-project.convex.site
```

AI provider API keys (OpenRouter, Anthropic, OpenAI, Google, Groq, Ollama) are stored **per-user** in the `userSettings` Convex table, not as env vars.

---

## Architecture

### Stack
- **Next.js 15** (App Router) — frontend, `src/app/`
- **Convex 1.17** — real-time serverless backend, `convex/`
- **Google Gemini Flash 1.5** + `text-embedding-004` (768-dim) — AI & semantic search
- **Zustand** — client-only UI state (`src/store/`)
- **shadcn/ui + Radix UI + Tailwind CSS** — component system
- **BlockNote 0.37** — block-based document editor (`src/components/editor/`)
- **Framer Motion** — animations

### Request Flow
1. React components call Convex queries/mutations via `useQuery`/`useMutation` hooks from `convex/react`.
2. All business logic lives in `convex/*.ts` — never in Next.js API routes.
3. Real-time subscriptions are automatic: Convex re-runs queries when underlying data changes.
4. The `convex/_generated/` folder is auto-generated — never edit it manually.

### Route Structure (`src/app/`)
```
/                      → redirects to workspace
/login                 → auth (Convex Auth)
/workspace/            → main app shell (sidebar + content)
  overview/            → dashboard
  brain/               → knowledge base (pages, databases)
  [pageId]/            → dynamic BlockNote page editor
  ai/                  → Maddy AI chat
  feed/                → AI-categorized news
  ledger/              → finance tracker
  settings/            → user settings
  trash/               → deleted items
```

### Convex Backend (`convex/`)
Key modules and their responsibilities:
- `schema.ts` — single source of truth for all table shapes and indexes
- `pages.ts`, `blocks.ts` — knowledge base CRUD
- `databases.ts` — multi-view database (table/board/list/calendar rows)
- `maddy.ts` — AI semantic search, embeddings, auto-tagging
- `aiChat.ts` — chat conversation management
- `ledger.ts` — finance accounts, transactions, budgets, investments
- `feed.ts`, `feedSync.ts` — news articles with AI categorization
- `reminders.ts`, `habits.ts` — productivity modules
- `auth.ts`, `auth.config.ts` — Convex Auth integration
- `crons.ts` — scheduled background jobs

### Key Convex Schema Tables
Vector search: `maddyEmbeddings` (768-dim, `by_embedding` vector index)
Knowledge: `workspaces`, `pages`, `blocks`, `databases`, `rows`, `views`
Finance: `financeAccounts`, `financeCategories`, `financeTransactions`, `financeBudgets`, `financeInvestments`, `financeGoals`
AI: `aiConversations`, `aiMessages`
Productivity: `habits`, `habitLogs`, `focusSessions`, `reminders`
News: `newsArticles`, `userNewsInteractions`, `userNewsPreferences`
Settings: `userSettings`

### Path Alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### BlockNote Server Components
BlockNote packages (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`) are listed in `next.config.js` `serverExternalPackages` — they must only be used in client components.

---

## Implementation Rules

- **Convex First**: All business logic must reside in `convex/` functions (queries, mutations, actions). Next.js API routes are not used.
- **Strict Typing**: Full TypeScript coverage. Use Zod for runtime validation at boundaries.
- **UI System**: 4px grid, linear easing animations, semantic color tokens via CSS HSL variables. Dark mode is class-based.
- **State split**: Convex for server/shared state; Zustand only for ephemeral client-only UI state.
- **Context continuity**: Update AGENTS.md and CLAUDE.md when making significant architectural changes.

---

### { "project": "madvibe", "status": "active", "updatedAt": "2026-03-28" }
- **Recent Fixes**: Resolved FAB visibility issues on mobile using `createPortal`, unified dashboard color logic, fixed reminder UX, and added a richer BlockNote drag-handle block menu with turn-into, color, duplicate, move, delete, and copy-link actions.
- **Current Focus**: Enhancing dashboard drilldown logic, polishing editor block actions, and finalizing investment asset tracking.

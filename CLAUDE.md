# MadVibe — AI-Powered Personal Knowledge OS

## Project Overview
MadVibe is a comprehensive "Second Brain" and Personal Operating System built with Next.js 15, Convex, and Google Gemini. It integrates knowledge management, productivity tools, and personal finance into a single, AI-pivoted workspace.

## Core Features & Progress
- **📄 Knowledge Base**: 
  - Block-based document editor (BlockNote) with nested paging.
  - Multi-view databases (Table, Board, List, Calendar).
  - Real-time sync via Convex.
- **🤖 Maddy AI**:
  - Semantic search using vector embeddings (768-dim).
  - Auto-tagging and intelligent organization.
  - Chat-based assistant for page summarization and task extraction.
- **📊 Productivity Modules**:
  - **Reminders**: Smart date/time selection with NLP-like chips.
  - **Habits**: Streak tracking and visual progression.
  - **Focus**: Integrated Pomodoro/Focus sessions linked to tasks.
- **💰 Financial Ledger**:
  - Multi-account transaction tracking.
  - Category-based budgeting and investment monitoring.
- **📰 News Feed**:
  - AI-categorized news articles with sentiment analysis and relevance scoring.

## Technical Architecture
- **Framework**: Next.js 15 (App Router).
- **Backend**: Convex (Real-time serverless).
- **AI**: Google Gemini (Flash 1.5) + text-embedding-004.
- **State**: Zustand + React Query (for complex data fetching).
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion.

## Implementation Rules
- **Convex First**: All business logic must reside in `convex/` functions.
- **Strict Typing**: Use Zod for validation and ensure full TypeScript coverage.
- **Premium UI**: 4px grid system, linear easing animations, and semantic tokens.
- **Persistence**: AGENTS.md and CLAUDE.md must be updated for context continuity.

---
### { "project": "madvibe", "status": "active", "updatedAt": "2026-03-28" }
- **Recent Fixes**: Resolved FAB visibility issues on mobile using `createPortal`, unified dashboard color logic, fixed reminder UX, and added a richer BlockNote drag-handle block menu with turn-into, color, duplicate, move, delete, and copy-link actions.
- **Current Focus**: Enhancing dashboard drilldown logic, polishing editor block actions, and finalizing investment asset tracking.

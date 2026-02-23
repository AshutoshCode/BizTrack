# BizTrack - Project Context

## Project Overview
BizTrack is a simplified, no-code friendly invoice and expense tracking application for small businesses.
- **Type**: Web Application
- **Goal**: Track unpaid/late invoices and business expenses.
- **Data**: SQLite (local), Optional Airtable Sync.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: `better-sqlite3` (SQLite)
- **Icons**: Lucide React
- **Package Manager**: npm

## Architecture & Conventions

### Directory Structure
- `app/`: Next.js App Router (Pages & API)
- `components/`: Client/Server components (Atomic design preference)
- `lib/`: Utilities, DB connection (`db.ts`), Airtable (`airtable.ts`)
- `scripts/`: Maintenance scripts (`seed-db.js`)
- `data_import/`: CSV data sources

### Naming Conventions
- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components.
- **Components**: `PascalCase` (e.g., `InvoiceCard.tsx`).
- **Functions**: `camelCase`.
- **Variables**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.

### Coding Guidelines
- **Strict Types**: No `any`. Use interfaces for data models (Invoice, Customer, etc.).
- **Server Components**: Default to Server Components. Use `'use client'` only when interaction is needed.
- **Tailwind**: Use utility classes. Avoid arbitrary values (`w-[123px]`) where possible; use theme tokens.
- **Error Handling**: Graceful UI fallbacks for data fetching errors.

## Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`
- **Seed DB**: `node scripts/seed-db.js`

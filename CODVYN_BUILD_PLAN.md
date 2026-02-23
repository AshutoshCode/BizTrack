# Codvyn Build Plan: BizTrack

This plan outlines the execution steps to build/finish BizTrack using the **Codvyn Integrated Build Stack** workflow (Antigravity + Pencil + Claude Code).

## Phase 1: Foundation & Context (Done)
- [x] **Architecture Planning**: Defined tech stack and constraints.
- [x] **Context File**: Created `CLAUDE.md` to guide all AI agents.
- [x] **Data Setup**: Local SQLite database seeded with `scripts/seed-db.js`.
- [x] **Documentation**: Guides available in `docs/`.

## Phase 2: Design (Pencil)
*Action: Open a `.pen` file in Antigravity for each major view.*

### 2.1 Dashboard Design (`dashboard.pen`)
- **Key Metrics**: Total Revenue, Outstanding Amount, Recent Activity.
- **Layout**: Sidebar navigation, Top bar summary cards, Recent list.

### 2.2 Invoices Views (`invoices.pen`)
- **List View**: Table/Grid of invoices with status chips (Paid/Late/Unpaid).
- **Detail View**: Printable invoice layout with line items and customer details.
- **Create/Edit Form**: Dynamic form to add line items.

### 2.3 Expenses Views (`expenses.pen`)
- **List View**: Simple list of expenses by category.
- **Add Expense Modal**: Quick entry form.

## Phase 3: Implementation (Claude Code)
*Action: Use Claude Code terminal (`Spark icon`) to implement components based on Phase 2 designs.*

### 3.1 Shared Components
- [ ] `Sidebar`: Navigation menu.
- [ ] `StatusBadge`: Visual indicator for Invoice status.
- [ ] `Card`: Generic container for metric summaries.

### 3.2 Feature: Dashboard
- [ ] Implement `app/page.tsx` (Dashboard).
- [ ] Create `components/dashboard/MetricsCards.tsx`.
- [ ] Create `components/dashboard/RecentActivity.tsx`.

### 3.3 Feature: Invoices
- [ ] Implement `app/invoices/page.tsx` (List).
- [ ] Implement `app/invoices/[id]/page.tsx` (Detail).
- [ ] Implement `app/invoices/new/page.tsx` (Creation Form).

### 3.4 Feature: Expenses
- [ ] Implement `app/expenses/page.tsx`.
- [ ] Connect to `lib/db.ts` for CRUD operations.

## Phase 4: Verification & Refinement
- [ ] **Visual Check**: Use Antigravity's browser to verify UI against Pencil designs.
- [ ] **Data Check**: Verify SQLite data persistence.
- [ ] **Airtable Sync** (Optional): Test data flow if configured.

## Phase 5: Delivery
- [ ] **Build**: Run `npm run build` to ensure no errors.
- [ ] **Commit**: `git add .` && `git commit -m "feat: complete biztrack v1"`.
- [ ] **Deploy**: Push to Vercel/Netlify (ref: `docs/DEPLOYMENT.md`).

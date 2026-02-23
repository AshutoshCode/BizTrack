# Claude Prompt Template — BizTrack Feature Requests

Copy everything below this line and paste it into Claude, then add your request at the bottom.

---

## Context: BizTrack SME Business Manager

I have a single-file web app called **BizTrack** — a frontend-only business manager for small businesses. It runs entirely inside one HTML file: `lib/frontend.html`. Here is what you need to know about it:

### Tech Stack
- **Single file**: All HTML, CSS (vanilla), and JavaScript lives in `lib/frontend.html`
- **No framework** — plain JS, no React/Vue/Angular
- **No backend** — all data is stored in `localStorage` under the key `smeData`
- **No build step** — changes to the HTML file appear immediately

### App Structure
The app has a **fixed sidebar** and a **main content area**. Sections are shown/hidden using `display:block/none` — there is no routing.

**Sidebar navigation tabs:**
1. Dashboard
2. Invoices
3. Expenses
4. Inventory
5. Customers
6. Reports

**Header** has: page title, theme toggle (🌙/☀️), Settings button, Profile button.

### Data Model (stored in localStorage as `smeData`)
```js
{
  invoices: [{ id, customer, amount, dueDate, status }],  // status: Pending | Paid | Overdue
  expenses: [{ id, description, amount, category, date }],
  inventory: [{ id, name, quantity, price, category }],
  customers: [{ id, name, email, phone, address }]
}
```

### CSS Design System
The app uses CSS variables for full light/dark theming. The **default is light mode** (warm `#e0dfb8` palette). Key variables:

```css
--accent          /* primary action colour */
--bg-body         /* page background */
--bg-card         /* card/section background */
--bg-card2        /* table header, alt backgrounds */
--bg-input        /* form input background */
--bg-sidebar      /* sidebar background */
--bg-header       /* top header bar */
--text-primary    /* main text */
--text-secondary  /* muted/label text */
--border          /* borders and dividers */
--danger          /* red for delete/error */
--warning         /* amber for warnings */
--success         /* green for success */
--shadow          /* page-level shadow */
--shadow-card     /* card-level shadow */
```

**Always use these variables** — never hardcode colours. Both dark and light themes will then automatically work.

### Reusable CSS Classes
```
.form-section      — white card container with padding and border-radius
.form-grid         — responsive grid layout for form fields
.form-group        — label + input vertical pair
.form-title        — section heading with emoji icon
.dashboard-grid    — 4-column responsive stat card grid
.stat-card         — metric card (variants: .card-teal .card-rose .card-indigo .card-amber)
.stat-label        — small uppercase label
.stat-value        — large number display
.stat-change       — subtext below stat value (.positive for green colour)
.badge             — pill-shaped status label (.paid .pending .overdue)
.table-wrapper     — scrollable table container
.btn-primary       — teal gradient action button
.btn-secondary     — outlined muted button
.btn-danger        — red outlined delete button
.action-btn        — small inline table row button
.actions           — flex container for action buttons in a table row
.btn-group         — flex container for form submit buttons
```

### Key JavaScript Functions
```js
loadData()           // loads smeData from localStorage into `data` object
saveData()           // saves `data` object back to localStorage
updateDashboard()    // recalculates all dashboard stat values
renderInvoices()     // re-renders the invoices table
renderExpenses()     // re-renders the expenses table
renderInventory()    // re-renders the inventory table
renderCustomers()    // re-renders the customers table
openModal(id)        // shows a modal by element ID
closeModal(id)       // hides a modal by element ID
escapeHtml(text)     // sanitise user text before inserting into HTML
resetApp()           // wipes all localStorage and reloads (double-confirmed)
toggleTheme()        // switches between dark and light mode
```

### Modals
Two modals exist: `settingsModal` and `profileModal`. To add a new modal, follow the same pattern:
```html
<div id="myModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; align-items:center; justify-content:center;">
  <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:40px; width:480px; max-width:90vw; position:relative; box-shadow:var(--shadow);">
    <!-- content -->
  </div>
</div>
```

### Rules for any changes
1. **Never hardcode colours** — always use CSS variables
2. **All new form inputs** must use `var(--bg-input)` for background
3. **Always call `saveData()` after mutating `data`**, then call the relevant render function
4. **Always call `updateDashboard()`** after any data change that affects totals
5. **New CSS goes inside the existing `<style>` block**, before the closing `</style>`
6. **New HTML sections** follow the existing `<section id="..." class="section">` pattern
7. **New nav links** go inside `<ul class="nav-list">` with `<button class="nav-link" onclick="showSection('...',event)">`

---

## My Request

[DESCRIBE YOUR FEATURE OR CHANGE HERE]

Please provide:
- Exact HTML to add (with which section it goes in)
- Exact CSS to add (all using CSS variables — no hardcoded colours)
- Exact JavaScript functions to add or modify
- If modifying an existing function, show the full replacement function

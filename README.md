# 🏦 Banking Dashboard (Kentech Challenge)

A small banking dashboard built for a senior frontend technical assessment. It focuses on **clear architecture**, **type-safety**, and a **polished, mobile-first UX**.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev        # start Vite dev server
npm run build      # typecheck + production build
npm run lint       # eslint
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest (run once)
```

## Core features

- **Transactions CRUD**: create, edit, delete transactions (deposit / withdrawal)
- **Balance summary**: total balance, income, expenses
- **Filters**: date range, description, type
- **Pagination**: paginated transaction list
- **CSV import/export**: export current transactions and import from CSV (with validation + toast feedback)
- **Undo**: undo last delete / last add (toast-based, avoids layout shift)
- **Currency conversion**: display currency selection with conversion using cached exchange rates
- **Local persistence**: state persisted to `localStorage` via Zustand `persist`

## Added features (beyond the base requirements)

- **Privacy Mode (👁️)**: the eye toggle next to the total balance blurs **all** amounts (balance, income, expenses, and transaction amounts).
- **Dev Panel (🐞)**: a floating debug panel for quick testing:
  - **Seed data**: populate the app with sample transactions
  - **Clear all data**: wipe persisted state / transactions
  - Designed to be clearly “out of band” from the product UI

## Reviewer tips

- **Dev Panel (🐞)**: use the bottom-right bug button to quickly **seed** and **clear** data.
- **Privacy Mode (👁️)**: use the eye toggle to blur amounts for demos/screenshots.
- **Account actions (⋯)**: use the three-dot button next to the **+** button (under the balance card) to access **CSV import/export**.

## Data model (notes)

- **Deposits** are stored as **positive** amounts.
- **Withdrawals** are stored as **negative** amounts.

## CSV format (notes)

- Expected columns: `date` (YYYY-MM-DD), `description`, `amount`, `type` (`Deposit` / `Withdrawal`).
- Import validates rows and shows results via toasts.

## UX notes

- **Mobile-first layout** with responsive desktop layout (summary/actions vs. list)
- **Native tooltips**: simple hover help via `title` attributes for icon buttons
- **Native `<dialog>`** for modals (note: jsdom needs a small `showModal()` polyfill in `src/test/setup.ts`)

## Tech stack

- **React + TypeScript** (strict mode)
- **Vite** (build tooling)
- **Zustand** + `persist` (state management + `localStorage`)
- **Tailwind CSS** + CSS variables design tokens (`src/styles/tokens.css`)
- **React Hook Form + Zod** (forms + validation)
- **Vitest + React Testing Library** (unit/component/integration tests)
- **Papa Parse** (CSV parsing)
- **date-fns** (date formatting)
- **Lucide React** (icons)

## Project structure (high level)

- **Feature components**: `src/components/features/*`
- **Reusable UI components**: `src/components/ui/*`
- **State**: `src/store/bankingStore.ts`
- **Services**: `src/services/*` (async abstractions)
- **Utilities**: `src/utils/*` (CSV, formatting, date helpers)
- **Tests**:
  - Unit/component tests colocated next to features
  - Integration tests in `src/__tests__/App.test.tsx`

---
name: frontend
description: "Apply this skill whenever writing, reviewing, or refactoring frontend code in `resources/js/` or `resources/scss/`. Triggers for React components, hooks, contexts, API calls, routing, forms, modals, and styling. Stack: React 19 + React Router DOM + Laravel Mix + SCSS. Encodes the post-refactor SPA architecture for the Hotel Reservation System."
license: MIT
metadata:
  author: hotel-rs
---

# Frontend Skill — Hotel Reservation System

Project-specific rules for the React 19 SPA inside `resources/js/`. Reflects the refactored architecture: React Router DOM for client-side routing, a single consolidated `apiClient`, shared loading/error/empty components, and SCSS following ITCSS.

## Stack

- **React 19** (functional components only)
- **React Router DOM v6+** (client-side routing)
- **Laravel Mix** (build tool — do NOT migrate to Vite)
- **SCSS** with ITCSS architecture
- **Sanctum** token auth via `Authorization: Bearer {token}` header
- API base URL: `/api`

## Consistency First

Always check sibling files in `resources/js/components/` before writing new components. Match existing patterns even when this skill suggests another approach.

## Quick Reference

### 1. Component Patterns → `rules/component-patterns.md`
- Functional components only with hooks
- PascalCase `.js` filenames
- Directory layout: `components/admin/`, `components/guest/`, `components/shared/`, `pages/`, `layouts/`
- Always use shared `LoadingSpinner`, `ErrorMessage`, `EmptyState`, `FormErrors`
- Max 3 levels of prop drilling — extract to Context or lift state

### 2. API Layer → `rules/api-layer.md`
- All HTTP calls through `services/apiClient.js` — never raw `fetch()`
- `AuthContext` delegates to `apiClient`; no duplicate fetch logic
- Token lifecycle: `apiClient.setToken()` on login, auto-clear on 401
- Pagination: expect `{ data, links, meta }` shape from list endpoints
- Errors: expect `{ message, errors }` shape

### 3. State Management → `rules/state-management.md`
- `AuthContext` for global auth state
- Local `useState` for component-scoped state
- `useCallback` for prop functions, `useMemo` for derived data
- No external state libraries (Redux, Zustand, React Query)
- Dashboard data fetched live, never hardcoded

### 4. Routing → `rules/routing.md`
- React Router DOM v6+ with `<BrowserRouter>` / `<Routes>` / `<Outlet />`
- Routes: `/login`, `/register`, `/admin/*`, `/guest/*`
- `AuthGuard` and `AdminGuard` wrap protected routes
- `useNavigate()` for programmatic navigation
- Laravel `routes/web.php` catch-all serves Blade SPA shell

### 5. Styling → `rules/styling.md`
- SCSS ITCSS architecture (abstracts → base → components → pages)
- Entry point: `resources/scss/app.scss`
- BEM-ish class naming
- CSS custom properties in `:root` for theming
- No inline styles, no CSS-in-JS
- SCSS structure mirrors JS component structure

## How to Apply

1. Identify what you're touching (component, hook, route, style)
2. Read the matching rule file
3. Check sibling files for established patterns
4. Run `npm run dev` (or `composer run dev`) to verify changes compile

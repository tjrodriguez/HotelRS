---
name: ui-ux
description: "Apply this skill whenever working on user-facing components, layout, design tokens, accessibility, forms, or interaction patterns. Triggers for SCSS files, React components rendering UI, modal/dialog logic, loading/error/empty states, and any visual design decisions. Encodes the post-refactor design system for the Hotel Reservation System."
license: MIT
metadata:
  author: hotel-rs
---

# UI/UX Skill — Hotel Reservation System

Design and interaction rules for the refactored hotel system. Two layouts: **Admin** (sidebar + main) and **Guest** (header + tabs + content).

## Core Principles

1. **Real data, never hardcoded** — all stats, tables, charts come from the API
2. **Consistent feedback** — every async operation shows loading, success, or error
3. **Accessible by default** — semantic HTML, keyboard nav, WCAG AA contrast
4. **Pessimistic mutations** — wait for API response before updating UI
5. **Mobile-considered** — admin and guest both work on small screens

## Quick Reference

### 1. Design System → `rules/design-system.md`
- CSS custom properties for color palette
- Typography & spacing scales
- Reusable patterns: `stat-card`, `dashboard-panel`, `tab-btn`, `StatusBadge`, `DataTable`, `Modal`

### 2. Interaction Patterns → `rules/interaction-patterns.md`
- `LoadingSpinner`, `ErrorMessage`, `EmptyState` everywhere async happens
- Confirmation dialogs for destructive actions
- Toasts for success/error feedback
- Modal patterns: backdrop + Escape + focus trap

### 3. Responsive Layout → `rules/responsive-layout.md`
- Admin: collapsible sidebar
- Guest: full-width content with sticky header
- Breakpoints: mobile ≤768, tablet ≤1024, desktop >1024

### 4. Accessibility → `rules/accessibility.md`
- `aria-hidden` on decorative SVGs
- Semantic HTML (`<main>`, `<nav>`, `<header>`)
- Keyboard navigation through all interactive elements
- Focus management on modals and route changes

### 5. Forms → `rules/forms.md`
- Backend errors mapped to fields via `FormErrors`
- Required field indicators
- Disabled submit + spinner during submission
- Date picker: check-out min = check-in + 1

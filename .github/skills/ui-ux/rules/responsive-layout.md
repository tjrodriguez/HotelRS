# Responsive Layout

## Breakpoints

```scss
$mobile: 768px;
$tablet: 1024px;
// desktop: > 1024px
```

Use mixins from `abstracts/_mixins.scss`:
```scss
@mixin below($bp) {
  @if $bp == mobile { @media (max-width: 767px) { @content; } }
  @if $bp == tablet { @media (max-width: 1023px) { @content; } }
}
```

## Admin Layout

Component: `layouts/AdminLayout.js`

Structure:
```
┌──────────┬───────────────────────────────────┐
│          │  AdminHeader (title + user info)  │
│ Sidebar  ├───────────────────────────────────┤
│          │                                   │
│ (260px)  │  <Outlet />                       │
│          │                                   │
└──────────┴───────────────────────────────────┘
```

Sidebar behavior:
- **Desktop** (>1024px): full sidebar, 260px wide
- **Tablet** (≤1024px): icon-only, 64px wide
- **Mobile** (≤768px): hidden, hamburger toggle in header

```scss
.admin-sidebar {
  width: 260px;

  @include below(tablet) {
    width: 64px;

    .sidebar-link-label { display: none; }
  }

  @include below(mobile) {
    transform: translateX(-100%);
    transition: transform 0.2s;

    &.is-open { transform: translateX(0); }
  }
}
```

## Guest Layout

Component: `layouts/GuestLayout.js`

Structure:
```
┌─────────────────────────────────────────────┐
│  GuestHeader (brand + user + logout)        │
├─────────────────────────────────────────────┤
│  Tabs (Browse, My Bookings)                 │
├─────────────────────────────────────────────┤
│                                             │
│  <Outlet />                                 │
│                                             │
└─────────────────────────────────────────────┘
```

- Header: sticky top
- Tabs: horizontal, scrollable on mobile
- Content: full-width with max-width container (1200px) centered on desktop

## Grids

Stat cards: 4-column grid on desktop, 2 on tablet, 1 on mobile.

```scss
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @include below(tablet) { grid-template-columns: repeat(2, 1fr); }
  @include below(mobile) { grid-template-columns: 1fr; }
}
```

## Tables

`DataTable` rules:
- Desktop: standard table
- Tablet: horizontal scroll with `overflow-x: auto`
- Mobile (<640px): stack rows as cards (each row → labeled key/value pairs)

## Modals

Always full-screen-friendly:
- Desktop: centered, max-width 560px
- Mobile: full-width minus 16px gutters, max-height 90vh, scrollable body

## Touch Targets

Minimum 44×44px for any interactive element on touch screens.

## Avoid

- Fixed pixel widths on content containers (use `max-width` + `margin: auto`)
- Horizontal scrolling on the page body (only inside tables, modals, etc.)
- Tiny tap targets (small icon-only buttons need padding)

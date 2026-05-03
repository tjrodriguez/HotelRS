# Styling

## ITCSS Architecture

Inverted Triangle CSS — generic to specific.

```
resources/scss/
├── app.scss                # Single entry, imports all partials
├── abstracts/              # Variables, mixins, functions (no output)
│   ├── _variables.scss
│   └── _mixins.scss
├── base/                   # Reset, typography, global
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _global.scss
├── components/             # UI components (mirrors JS structure)
│   ├── shared/             # Mirrors components/shared/
│   ├── admin/              # Mirrors components/admin/
│   ├── guest/              # Mirrors components/guest/
│   └── pages/              # Page-specific overrides
└── (no utilities — keep specificity low)
```

## Entry Point

`resources/scss/app.scss` is the single entry compiled by Laravel Mix to `public/css/app.css`. All partials use `@import` (legacy syntax — match existing convention).

## Class Naming

BEM-ish, kebab-case, semantic:

- Block: `.room-card`, `.admin-sidebar`, `.dashboard-panel`
- Element: `.room-card__title`, `.room-card__price` (or `.room-card-title` in existing convention — match siblings)
- Modifier: `.room-card.is-featured`, `.btn.btn-primary`

## CSS Custom Properties

Theme tokens go in `:root`:

```scss
:root {
  --primary: #14b8a6;
  --primary-hover: #0d9488;
  --status-available: #16a34a;
  --status-occupied: #dc2626;
  --status-maintenance: #ca8a04;
  --status-reserved: #2563eb;
}
```

## No Inline Styles

```js
// Incorrect
<div style={{ width: `${percent}%`, color: 'red' }}>

// Acceptable only for genuinely dynamic values
<div className="revenue-bar" style={{ width: `${percent}%` }}>

// Never use inline style for static colors, fonts, spacing
```

## No CSS-in-JS

No styled-components, Emotion, Tailwind, etc.

## File Mirroring

JS component → matching SCSS partial:

| JS | SCSS |
|----|------|
| `components/admin/AdminSidebar.js` | `components/admin/_sidebar.scss` |
| `components/guest/RoomCard.js` | `components/guest/_room-card.scss` |
| `components/shared/Modal.js` | `components/shared/_modal.scss` |
| `pages/AdminDashboardHome.js` | `components/pages/_admin-dashboard.scss` |

## Adding a New Component

1. Create `components/{scope}/MyComponent.js`
2. Create `scss/components/{scope}/_my-component.scss`
3. Add `@import 'components/{scope}/my-component';` to `app.scss`
4. Run `npm run dev` to verify compilation

## Responsive Breakpoints

Defined in `abstracts/_variables.scss`. Use mixins from `abstracts/_mixins.scss`:

```scss
.admin-sidebar {
  width: 260px;

  @include below(tablet) { width: 64px; }   // icon-only
  @include below(mobile) { transform: translateX(-100%); }
}
```

## SVG Icons

Inline `<svg>` in JSX with `aria-hidden`:

```js
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="..." strokeWidth="1.8" />
</svg>
```

No icon libraries unless explicitly approved.

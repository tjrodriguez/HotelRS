# Design System

## Color Tokens

Defined in `:root` (in `resources/scss/app.scss`):

```scss
:root {
  --primary: #14b8a6;
  --primary-hover: #0d9488;
  --bg: #f8fafc;
  --surface: #ffffff;
  --surface-muted: #f1f5f9;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;

  --status-available: #16a34a;
  --status-occupied: #dc2626;
  --status-maintenance: #ca8a04;
  --status-reserved: #2563eb;

  --success: #16a34a;
  --warning: #ca8a04;
  --danger: #dc2626;
  --info: #2563eb;
}
```

Use `var(--primary)` in SCSS — never hardcode hex values for theme colors.

## Typography

System font stack:
```scss
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

Scale:
- `h1` 28px / 700
- `h2` 22px / 600
- `h3` 18px / 600
- body 14px / 400
- small 12px / 400

## Spacing

4px base unit. Common values: 4, 8, 12, 16, 24, 32, 48.

## Component Patterns

### `stat-card`
Used in admin dashboard. Icon + trend chip + title + big number + note.

```html
<div class="stat-card">
  <div class="stat-top-row">
    <span class="stat-icon"><svg>...</svg></span>
    <span class="stat-trend success">+4.2%</span>
  </div>
  <h3>Occupancy</h3>
  <p class="stat-number">73%</p>
  <p class="stat-note">22 of 30 rooms</p>
</div>
```

### `dashboard-panel`
Titled section container.

```html
<section class="dashboard-panel">
  <h3>Recent Activity</h3>
  <ul class="activity-list">...</ul>
</section>
```

### `StatusBadge`
Status-colored label. Color via class:

```html
<span class="status-badge status-confirmed">Confirmed</span>
<span class="status-badge status-cancelled">Cancelled</span>
<span class="status-badge status-pending">Pending</span>
<span class="status-badge status-completed">Completed</span>
```

### `DataTable`
Used in admin management views. Sortable headers, paginated, action column.

### `Modal`
Shared `components/shared/Modal.js`. Backdrop, close button, ESC-to-close, focus trap.

### `tab-btn`
Used in guest portal navigation.

```html
<button className={`tab-btn ${isActive ? 'active' : ''}`}>...</button>
```

## Live Dashboard Stats

Admin dashboard cards bind to `GET /api/dashboard/stats`:

```json
{
  "data": {
    "occupancy": { "percent": 73, "occupied": 22, "total": 30, "trend": 4.2 },
    "revenue_today": { "amount": 48200, "trend_pct": 12 },
    "check_ins_today": { "count": 7, "pending": 3 },
    "active_promotions": { "count": 4, "expiring_soon": 2 }
  }
}
```

No hardcoded numbers. If the endpoint returns nothing, show `EmptyState` or zero values with a loading skeleton.

## Currency Display

Use `Intl.NumberFormat` with `PHP` (Philippine Peso, the existing project currency from `P48,200` references):

```js
const formatPHP = (n) => new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
}).format(n);
```

## Date Display

```js
new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
```

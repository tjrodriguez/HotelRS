# Accessibility

## Semantic HTML

Use the right element. The browser handles a lot of accessibility for free when markup is semantic.

```jsx
<header>...</header>
<nav aria-label="Admin">...</nav>
<main>...</main>
<section aria-labelledby="recent-activity-h">...</section>
<button onClick={...}>Cancel</button>
```

Avoid:
```jsx
<div onClick={...}>Cancel</div>      // not keyboard-focusable
<a href="javascript:...">Cancel</a>  // not real navigation
```

## SVG Icons

Decorative SVGs (icons next to a text label) are hidden from screen readers:
```jsx
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="..." />
</svg>
```

Standalone SVGs with no text need an `aria-label`:
```jsx
<button aria-label="Close">
  <svg aria-hidden="true">...</svg>
</button>
```

## Keyboard Navigation

- Every interactive element reachable via Tab
- Tab order matches visual order
- `Escape` closes modals
- `Enter` submits forms
- Arrow keys cycle through tab/menu items

## Focus Management

- Auto-focus the first focusable element on modal open
- Trap focus inside modal while open
- Return focus to the trigger element on modal close
- On route change, move focus to `<main>` or page heading

```js
const headingRef = useRef(null);
useEffect(() => { headingRef.current?.focus(); }, []);

<h1 ref={headingRef} tabIndex={-1}>Reservations</h1>
```

## Visible Focus Indicator

Never remove the focus outline without replacing it:
```scss
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## Color Contrast

WCAG AA minimums:
- Body text: 4.5:1
- Large text (≥18pt or 14pt bold): 3:1
- UI components and graphical objects: 3:1

Status colors must meet contrast on their backgrounds. Never use color alone to convey meaning — pair with text or icon.

## Forms

```jsx
<label htmlFor="check_in">Check-in date *</label>
<input
  id="check_in"
  name="check_in"
  type="date"
  required
  aria-required="true"
  aria-invalid={!!errors.check_in}
  aria-describedby={errors.check_in ? 'check_in-error' : undefined}
/>
{errors.check_in && (
  <p id="check_in-error" className="form-error" role="alert">
    {errors.check_in[0]}
  </p>
)}
```

## ARIA Live Regions

Toasts and async error messages should announce to screen readers:
```jsx
<div aria-live="polite" aria-atomic="true">
  {toastMessage}
</div>
```

## Alt Text on Images

Every `<img>` has alt text. Decorative images use `alt=""`.

```jsx
<img src={room.image} alt={`Room ${room.room_number}`} />
<img src="/decoration.svg" alt="" />
```

## Tables

```jsx
<table>
  <caption className="sr-only">Reservations</caption>
  <thead>
    <tr>
      <th scope="col">Guest</th>
      <th scope="col">Room</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  ...
</table>
```

## Skip Link

Add to admin layout:
```jsx
<a href="#main-content" className="skip-link">Skip to main content</a>
```

## Verify

- Tab through every page — can you reach every action?
- Escape closes modals?
- Screen reader announces page changes (test with NVDA / VoiceOver)?
- Color contrast tested (e.g., with browser devtools)?

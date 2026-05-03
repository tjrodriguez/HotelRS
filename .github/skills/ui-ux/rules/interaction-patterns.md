# Interaction Patterns

## Loading

Every async fetch shows a `LoadingSpinner` until resolved. Submit buttons must be disabled during in-flight requests:

```js
const [submitting, setSubmitting] = useState(false);

const onSubmit = async () => {
  setSubmitting(true);
  try {
    await apiClient.createReservation(form);
  } finally {
    setSubmitting(false);
  }
};

<button disabled={submitting}>
  {submitting ? <LoadingSpinner inline /> : 'Book Now'}
</button>
```

## Error Display

- **API/network errors** → `ErrorMessage` component (top of view, dismissible)
- **Field validation errors** (422) → `FormErrors` component (inline, per field)

```js
{globalError && <ErrorMessage error={globalError} onDismiss={() => setGlobalError(null)} />}

<input name="check_in" ... />
<FormErrors errors={fieldErrors} field="check_in" />
```

## Empty States

```js
if (!rooms.length) {
  return (
    <EmptyState
      title="No rooms found"
      message="Try widening your filters or check back later."
      action={{ label: 'Reset filters', onClick: resetFilters }}
    />
  );
}
```

## Success Feedback

After create / update / delete operations, show a toast:

```js
import { toast } from '../shared/Toast'; // simple in-app toast

await apiClient.cancelReservation(id);
toast.success('Reservation cancelled.');
```

## Confirmation Dialogs

Destructive actions (cancel reservation, delete room, refund payment) require confirmation:

```js
const onCancel = async () => {
  const ok = await confirmDialog({
    title: 'Cancel reservation?',
    message: 'This cannot be undone.',
    confirmLabel: 'Yes, cancel',
    danger: true,
  });
  if (!ok) return;
  await apiClient.cancelReservation(id);
};
```

Use the shared `Modal` for confirmation dialogs.

## Pessimistic Updates

Always wait for the API response before changing UI state. No optimistic updates unless explicitly approved per-feature.

```js
// Correct
const data = await apiClient.confirmReservation(id);
setReservation(data.data);

// Incorrect — optimistic update without rollback handling
setReservation({ ...reservation, status: 'confirmed' });
await apiClient.confirmReservation(id);
```

## Modal Pattern

Shared `Modal` component handles:
- Backdrop click → close
- `Escape` key → close
- `body { overflow: hidden }` while open
- Focus trap (cycle focus within modal, return on close)
- Auto-focus first focusable element on open

```js
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Book Room 101">
  {/* form content */}
</Modal>
```

## Booking Flow Reference

`BookingModal` is the canonical reference for complex form flows:
1. Open via "Book" button on `RoomCard`
2. Show pricing breakdown live as dates change
3. Validate promotion code via `POST /api/promotions/validate`
4. Submit `POST /api/reservations`
5. On success → close modal, toast, navigate to `/guest/bookings`
6. On 422 → display `FormErrors` per field, keep modal open
7. On other errors → display `ErrorMessage`, keep modal open

## Disabled State Visual

Disabled buttons must have visibly reduced opacity AND `cursor: not-allowed`:

```scss
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

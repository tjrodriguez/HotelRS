# Forms

## Backend Errors Inline

Every form field MUST display its backend validation error via the shared `FormErrors` component:

```js
import FormErrors from '../shared/FormErrors';

<input
  id="check_in"
  name="check_in"
  type="date"
  aria-invalid={!!fieldErrors.check_in}
/>
<FormErrors errors={fieldErrors} field="check_in" />
```

## Required Field Indicator

```html
<label htmlFor="email">
  Email <span aria-hidden="true">*</span>
</label>
<input id="email" name="email" type="email" required aria-required="true" />
```

Red asterisk, visible and not dependent on color alone. Do NOT use color as the sole required indicator.

## Submit Button State

- Disabled during submission
- Shows spinner icon
- Re-enabled on success or error

```js
<button disabled={submitting}>
  {submitting ? <LoadingSpinner inline /> : 'Create Reservation'}
</button>
```

## Date Picker: Check-in / Check-out

```js
const [checkIn, setCheckIn] = useState('');
const [checkOut, setCheckOut] = useState('');

// min check-in = today
const minCheckIn = new Date().toISOString().split('T')[0];

// min check-out = check-in + 1 day
const minCheckOut = checkIn
  ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
  : '';
```

## Number Inputs

Match backend validation with `min` / `max` attributes:

```html
<input type="number" min="1" max={room.roomType.capacity} name="number_of_guests" required />
```

## Promotion Code

Inline validate + preview discount before submitting the form:

```js
const [promoCode, setPromoCode] = useState('');
const [promoPreview, setPromoPreview] = useState(null);

const validatePromo = async () => {
  try {
    const res = await apiClient.validatePromotion(promoCode);
    setPromoPreview(res.data);
  } catch (err) {
    setFieldErrors(prev => ({ ...prev, promotion_code: [err.message] }));
  }
};
```

## Form Component

Wrap every form in `<form onSubmit={handleSubmit}>` — not `<div onClick={...}>`.

## Grouped Fields

Group related fields in `<fieldset>` with `<legend>`:

```html
<fieldset>
  <legend>Booking Dates</legend>
  <label>Check-in <input name="check_in" type="date" /></label>
  <label>Check-out <input name="check_out" type="date" /></label>
</fieldset>
```

## Disabled Inputs on Load

While the form is loading initial data (e.g., edit form fetching the record), disable all inputs and show `LoadingSpinner`.

## Avoid

- Native HTML5 `required` with no visible indicator — always pair with `*` + `aria-required`
- Red error text alone — use `role="alert"` or `aria-describedby`
- Disabling submit via CSS only — always add the `disabled` attribute

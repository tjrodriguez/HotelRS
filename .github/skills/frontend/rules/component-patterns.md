# Component Patterns

## Functional Components Only

No class components. Use hooks for all state and lifecycle logic.

```js
// Correct
export default function RoomCard({ room, onBook }) {
  const [isLoading, setIsLoading] = useState(false);
  return <article className="room-card">...</article>;
}
```

## File Naming

- PascalCase `.js` files: `BookingModal.js`, `RoomCard.js`, `AdminSidebar.js`
- One default-exported component per file
- Co-located helpers as named exports in the same file when small

## Directory Structure

```
resources/js/
├── app.js                  # Entry point
├── AppMain.js              # Root <Routes> definition
├── layouts/
│   ├── AdminLayout.js      # Sidebar + main + <Outlet />
│   └── GuestLayout.js      # Header + tabs + <Outlet />
├── pages/
│   ├── Login.js
│   ├── Register.js
│   ├── AdminDashboardHome.js
│   └── ...
├── components/
│   ├── admin/              # Admin-only components
│   ├── guest/              # Guest-only components
│   └── shared/             # Cross-cutting components
│       ├── LoadingSpinner.js
│       ├── ErrorMessage.js
│       ├── EmptyState.js
│       ├── FormErrors.js
│       ├── Modal.js
│       ├── AuthGuard.js
│       └── AdminGuard.js
├── contexts/
│   └── AuthContext.js
└── services/
    └── apiClient.js
```

## Required Shared Components

Every management view (admin tables, guest lists) MUST handle these states using the shared components:

```js
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import EmptyState from '../shared/EmptyState';

export default function RoomsManagement() {
  const { data, error, isLoading } = useRooms();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.data?.length) return <EmptyState message="No rooms yet" />;

  return <DataTable rows={data.data} />;
}
```

## Forms

Every form MUST use the shared `FormErrors` component to render backend validation errors:

```js
import FormErrors from '../shared/FormErrors';

const [errors, setErrors] = useState({});

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await apiClient.createReservation(form);
  } catch (err) {
    if (err.status === 422) setErrors(err.data.errors || {});
  }
};

<form onSubmit={handleSubmit}>
  <FormErrors errors={errors} field="check_in" />
  <input ... />
</form>
```

## Prop Drilling Limit

Max 3 component levels. Beyond that, lift state higher or use `AuthContext` (or a new context).

## Hooks Rules

- Always at the top of the component, never conditional
- `useEffect` cleanup function for subscriptions/timers
- Custom hooks prefix `use*` (e.g., `useRoomAvailability`)

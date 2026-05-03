# State Management

## AuthContext for Global Auth

Single global context: `AuthContext`. Exposes `user`, `token`, `isAuthenticated`, `isAdmin`, `isGuest`, `login`, `register`, `logout`.

```js
const { user, isAdmin, logout } = useContext(AuthContext);
```

No other global state stores. If new global state is needed, propose a new context (e.g., `NotificationContext`) — never add to `AuthContext`.

## Local State with `useState`

Component-scoped state stays local:

```js
const [filters, setFilters] = useState({ status: 'all', floor: null });
const [isOpen, setIsOpen] = useState(false);
const [errors, setErrors] = useState({});
```

## `useCallback` for Prop Functions

When passing a function as a prop to a memoized child or as a `useEffect` dependency, wrap with `useCallback`:

```js
const handleBook = useCallback((roomId) => {
  apiClient.createReservation({ room_id: roomId, ... });
}, []);
```

## `useMemo` for Expensive Derived Data

Use sparingly — only when the computation is genuinely expensive or output stability matters.

```js
const totalNights = useMemo(
  () => Math.ceil((checkOut - checkIn) / 86400000),
  [checkIn, checkOut]
);
```

## `useEffect` for Side Effects

```js
useEffect(() => {
  let cancelled = false;
  apiClient.getRooms().then((res) => {
    if (!cancelled) setRooms(res.data);
  });
  return () => { cancelled = true; };
}, []);
```

## No External State Libraries

Do not introduce Redux, Zustand, Jotai, React Query, or SWR. The app's complexity does not warrant them. If data caching becomes a real bottleneck, propose a focused solution.

## Dashboard Data is Live

`AdminDashboardHome` MUST fetch live data from `GET /api/dashboard/stats`. No hardcoded numbers.

```js
useEffect(() => {
  apiClient.getDashboardStats()
    .then((res) => setStats(res.data))
    .catch((err) => setError(err));
}, []);
```

## Form State

Single state object per form, with field errors in a separate state object:

```js
const [form, setForm] = useState({ check_in: '', check_out: '', number_of_guests: 1 });
const [errors, setErrors] = useState({});
```

# API Layer

## Single Source: `services/apiClient.js`

All HTTP traffic goes through `apiClient`. Never call raw `fetch()` from components or contexts.

Incorrect:
```js
const res = await fetch('/api/rooms', { headers: { Authorization: `Bearer ${token}` } });
```

Correct:
```js
import apiClient from '../services/apiClient';
const rooms = await apiClient.getRooms({ status: 'available' });
```

## AuthContext Delegates to apiClient

`AuthContext` must use `apiClient` for login, register, logout, and `getMe()`. No duplicate fetch logic.

```js
// In AuthContext
const login = useCallback(async (email, password) => {
  const data = await apiClient.login(email, password);
  apiClient.setToken(data.token);
  setUser(data.user);
  setToken(data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('token', data.token);
  return data;
}, []);
```

## Token Lifecycle

1. **App boot**: `apiClient.setToken(localStorage.getItem('token'))` if present
2. **Login/Register**: `apiClient.setToken(data.token)` after successful response
3. **Logout**: `apiClient.setToken(null)`, clear `localStorage`
4. **401 response**: response interceptor clears token and triggers redirect to `/login`

## Response Shapes

### Paginated list (Laravel `ResourceCollection`)
```json
{
  "data": [ {...}, {...} ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "per_page": 20, "total": 47 }
}
```

Components:
```js
const { data: response } = await apiClient.getReservations();
const reservations = response.data;
const totalPages = response.meta.last_page;
```

### Single resource (Laravel `Resource`)
```json
{ "data": { "id": 1, ... } }
```

### Error
```json
{ "message": "The given data was invalid.", "errors": { "field": ["..."] } }
```

## Error Handling

`apiClient.request()` throws an object `{ status, message, data }`. Components catch and inspect:

```js
try {
  await apiClient.createReservation(payload);
} catch (err) {
  if (err.status === 422) {
    setFieldErrors(err.data.errors);
  } else if (err.status === 401) {
    // interceptor already handled redirect
  } else {
    setGlobalError(err.message);
  }
}
```

## Pagination in Components

```js
const [page, setPage] = useState(1);
const [pages, setPages] = useState(1);

useEffect(() => {
  apiClient.getRooms({ page }).then((res) => {
    setRooms(res.data);
    setPages(res.meta.last_page);
  });
}, [page]);
```

## Adding a New Endpoint

Add a method to `apiClient.js`. Never let components hardcode URLs.

```js
// In apiClient.js
getDashboardStats() {
  return this.get('/dashboard/stats');
}
```

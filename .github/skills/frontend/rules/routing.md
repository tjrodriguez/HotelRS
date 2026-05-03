# Routing

## React Router DOM v6+

App is wrapped in `<BrowserRouter>` at the root (`app.js`). Route tree lives in `AppMain.js`.

## Route Map

```
/                          → redirect to /login or role-based home
/login                     → public, Login page
/register                  → public, Register page

/admin                     → AdminLayout + AdminGuard
  ├── (index)              → AdminDashboardHome (live stats)
  ├── /rooms               → RoomsManagement
  ├── /room-types          → RoomTypesManagement
  ├── /reservations        → ReservationsManagement
  ├── /payments            → PaymentsManagement
  ├── /promotions          → PromotionsManagement
  ├── /users               → UsersManagement
  └── /activity-logs       → ActivityLogsManagement

/guest                     → GuestLayout + AuthGuard
  ├── (index)              → RoomBrowser
  └── /bookings            → BookingHistory
```

## Layout + Outlet Pattern

```js
// AdminLayout.js
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <main className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

## Route Definition

```js
// AppMain.js
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
    <Route path="/admin" element={<AdminDashboardHome />} />
    <Route path="/admin/rooms" element={<RoomsManagement />} />
    {/* ... */}
  </Route>

  <Route element={<AuthGuard><GuestLayout /></AuthGuard>}>
    <Route path="/guest" element={<RoomBrowser />} />
    <Route path="/guest/bookings" element={<BookingHistory />} />
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## Guards

```js
// AuthGuard.js
export default function AuthGuard({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// AdminGuard.js
export default function AdminGuard({ children }) {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/guest" replace />;
  return children;
}
```

## Programmatic Navigation

```js
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleLogin = async () => {
  const data = await login(email, password);
  navigate(data.user.role === 'admin' ? '/admin' : '/guest', { replace: true });
};
```

## Active Link Styling

Use `<NavLink>` for sidebar/tabs to auto-apply active class:

```js
<NavLink
  to="/admin/rooms"
  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
>
  Rooms
</NavLink>
```

## Laravel Catch-All

`routes/web.php` MUST serve the Blade SPA shell for any non-API route so deep links work on refresh:

```php
Route::get('/{any}', fn () => view('welcome', ['appName' => config('app.name')]))
    ->where('any', '^(?!api).*$');
```

## Avoid

- Tab-based state for navigation (no `useState('dashboard')` patterns)
- Hash-based routing (`#/admin/rooms`)
- Hardcoded `<a href>` for internal navigation — always `<Link>` / `<NavLink>` / `useNavigate`

# Frontend Debugging

## Browser Console

Use the `browser-logs` MCP tool to read console errors, React warnings, and exceptions.

Common console patterns to look for:
- `Uncaught ReferenceError: ... is not defined` — import missing
- `Cannot read properties of undefined` — data not loaded yet, no null-guard
- `No routes matched location` — React Router route missing
- `Invalid hook call` — React version mismatch or multiple copies

## API Response Shape

When data doesn't display, inspect the actual response:

```js
// In browser console or temporary debug code
apiClient.getRooms().then(res => console.log(JSON.stringify(res, null, 2)));
```

Verify:
- List endpoints return `{ data: [...], meta: {...}, links: {...} }`
- Single endpoints return `{ data: {...} }`
- Errors return `{ message: "...", errors: {...} }`

## Token Verification

```js
// In browser console
localStorage.getItem('token');
apiClient.token; // check if set
```

If `apiClient.token` is null but `localStorage` has a value, `app.js` isn't calling `apiClient.setToken()` on boot.

## Network Tab Checklist

- **401 Unauthorized** → token expired or missing. Check `auth:sanctum` middleware, `EnsureAdmin` on route
- **403 Forbidden** → policy denied. Check `AuthContext.isAdmin`, `ensureAdmin` middleware
- **422 Unprocessable Entity** → validation failed. Check `{ errors }` shape, verify `FormErrors` mapping
- **500** → server error. Use `last-error` MCP tool
- **404** → route missing or resource not found. Check `php artisan route:list --path=api`

## React Router Issues

- Routes show blank page → check `routes/web.php` catch-all serves the SPA shell for client-side URLs
- Deep link refresh 404 → Laravel must serve `welcome` Blade for all non-API routes:
  ```php
  Route::get('/{any}', fn () => view('welcome'))
      ->where('any', '^(?!api).*$');
  ```
- `No routes matched location "/admin/rooms"` → route not registered in `<Routes>`
- Wrong page on `/admin` → check `AdminGuard` logic, verify `isAdmin` state in `AuthContext`

## AuthGuard / AdminGuard Not Working

```js
// Check auth state
const { isAuthenticated, isAdmin, user } = useContext(AuthContext);
console.log({ isAuthenticated, isAdmin, user });
```

- `isAuthenticated` false after login → `apiClient.setToken()` wasn't called, or token not stored in `localStorage`
- `isAdmin` false for admin → check `/api/me` response, verify `role` field included in `UserResource`
- Infinite redirect loop → guard redirecting to same route it should be rendering

## Component Not Rendering

1. Check component imports (case-sensitive on some file systems)
2. Check `default export` vs `export`
3. Check React 19 compat — no legacy `createRef` or class components
4. Check if the component throws inside render (catches in console)

## SCSS Not Applied

- Check `resources/scss/app.scss` imports the new partial
- Run `npm run dev` or `npm run build` to recompile
- Check Laravel Mix output for compilation errors
- Verify `public/css/app.css` exists and is referenced in the Blade view

## Hot Reload Issues

```bash
npm run dev
```

Or for production check:
```bash
npm run build
```

## State Not Updating

- `useState` updates are async — read stale state with `prev => ...` updater
- `useEffect` missing dependencies → check React DevTools profiler
- Context not re-rendering → verify `AuthContext` updates state synchronously after API call

## General Frontend Checklist

1. Browser console clear of errors?
2. Network tab: all requests return 200/201?
3. Response shapes match what components expect?
4. Token in `localStorage` and `apiClient.token`?
5. Routes registered correctly in `AppMain.js`?
6. CSS compiled and loaded?

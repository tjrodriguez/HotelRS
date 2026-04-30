# Copilot Instructions

This workspace is a Laravel backend with a React frontend compiled through Laravel Mix.

- Use Laravel routes and controllers for backend behavior.
- Use React in `resources/js/app.js` for the frontend entry point.
- Use `resources/css/app.css` for the app styling.
- Use `webpack.mix.js` for the build pipeline.
- Run `composer run dev` for local development.
- Run `npm run build` for production asset compilation.

Project-specific endpoints and assets:

- `routes/api.php` exposes the backend status endpoint.
- `routes/web.php` serves the React mount page.

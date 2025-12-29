# API Backend Structure

Folder ini berisi backend API (Express) yang terpisah dari frontend.

## Structure

- `controllers/` - Backend controllers (Express Request/Response handlers)
- `routes/` - Backend API routes
- `middleware/` - Backend middleware

## Migration Notes

Backend controllers, routes, dan middleware telah dipindahkan dari:
- `src/controllers/*.ts` (backend) → `src/api/controllers/`
- `src/routes/*.ts` → `src/api/routes/`
- `src/middleware/*.ts` → `src/api/middleware/`

Frontend controllers (React) tetap di `src/controllers/` dengan extension `.tsx`.


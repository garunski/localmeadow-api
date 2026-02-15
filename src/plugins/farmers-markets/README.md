# Farmers Market Plugin (Local Meadow)

Adds farmers market management to the Mercur backend.

## API (admin)

- `GET /admin/markets` – list markets
- `POST /admin/markets` – create market
- `GET /admin/markets/:id` – get market
- `PUT /admin/markets/:id` – update market
- `DELETE /admin/markets/:id` – delete market

## Current state

- In-memory store (no DB). Add a Medusa module with models and migrations for PostgreSQL persistence.
- Admin UI: add routes to the Mercur admin panel (e.g. `/admin/markets`) that call these endpoints.

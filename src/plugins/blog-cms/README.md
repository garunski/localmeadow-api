# Blog/CMS Plugin (Local Meadow)

Adds blog and CMS endpoints to the Mercur backend.

## API (admin)

- `GET /admin/blog` – list posts
- `POST /admin/blog` – create post
- `GET /admin/blog/:id` – get post
- `PUT /admin/blog/:id` – update post
- `DELETE /admin/blog/:id` – delete post

## Current state

- In-memory store. Add a Medusa module with models and migrations for PostgreSQL.
- Admin UI: add blog/CMS routes to the Mercur admin panel.

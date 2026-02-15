# Custom Domains Plugin

Allows sellers to use custom domains (e.g. `farmerjack.com`) with the same backend.

## Features

- **Dynamic CORS** – Allow requests from any domain registered in the domain store (in addition to `STORE_CORS` / `VENDOR_CORS`).
- **Store context by domain** – When a request’s `Host` matches a custom domain, the backend can resolve the seller and scope data (e.g. products/orders) to that seller.
- **Admin API** – List, add, remove custom domains and verify DNS.

## API (admin)

- `GET /admin/domains` – list domain → seller_id
- `POST /admin/domains` – add domain (body: `{ "domain": "farmerjack.com", "seller_id": "sel_..." }`)
- `DELETE /admin/domains?domain=farmerjack.com` – remove domain
- `GET /admin/domains/verify?domain=farmerjack.com` – DNS verification instructions and status

## Middlewares (app)

The app’s `api/middlewares.ts` uses:

1. **Dynamic CORS** – Allowed origins = `STORE_CORS` + `VENDOR_CORS` + all registered custom domains. If `Origin` is in that list, the response allows it.
2. **Store context by domain** – For store routes, if `Host` is a custom domain, sets `req.customSellerId` so downstream logic can filter by seller.

## Storage

Currently in-memory. For production, add a `seller_domain` (or similar) table and a Medusa module, then switch this plugin to use it.

## DNS

Customer points their domain (e.g. CNAME `farmerjack.com` → your backend host). See `doc/CUSTOM_DOMAINS.md` (repo root) for full setup and DigitalOcean SSL.

# Advanced Analytics Plugin (ClickHouse)

Placeholder for ClickHouse-powered analytics.

## API (admin)

- `GET /admin/analytics/summary?from=&to=&vendor_id=` – summary metrics (stub)

## Integration

1. Add ClickHouse client: `npm i @clickhouse/client`
2. Set env: `CLICKHOUSE_HOST`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_DATABASE`
3. In `service.ts`, replace stub with real ClickHouse queries (e.g. aggregate orders, revenue, top products).
4. Add admin UI route in Mercur admin for the analytics dashboard.

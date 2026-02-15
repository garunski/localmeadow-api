# Local Meadow API

MercurJS/Medusa v2 backend with custom plugins for the Local Meadow marketplace.

## Custom Plugins

- **farmers-markets**: Farmers market management and scheduling
- **blog-cms**: Content management system for blog posts
- **advanced-analytics**: Analytics integration (ClickHouse)
- **custom-domains**: Custom seller domain support with dynamic CORS

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.template .env
# Edit .env with your database and service credentials

# Local dev: use k8s + port-forward (see docs repo doc-29, doc-30)
mise run k8s-deploy
mise run k8s-port-forward   # runs seed; leave running
npm run init:mercurjs-schema # once per environment
mise run dev                 # schema syncs on startup
```

The API will be available at `http://localhost:9000`.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/localmeadow
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret

STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:3001
VENDOR_CORS=http://localhost:3001
AUTH_CORS=http://localhost:3001

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@localmeadow.com

# Algolia (search)
ALGOLIA_APP_ID=...
ALGOLIA_API_KEY=...
```

## Scripts

- `npm run dev` - Start development server (schema syncs on startup)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed data; `npm run db:verify` - Verify schema
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Deployment

See deployment documentation for DigitalOcean App Platform setup with server/worker separation.

## Documentation

- **Project docs**: **localmeadow-docs** repo, in `backlog/docs/` and `backlog/decisions/`. From that repo: `mise exec -- backlog doc list` then `mise exec -- backlog doc view <id>` (e.g. doc-26 schema, doc-29 bootstrap, doc-30 k8s, doc-31 plugins).
- [MercurJS Documentation](https://www.mercurjs.com/docs)
- [Medusa Documentation](https://docs.medusajs.com/)

## License

MIT

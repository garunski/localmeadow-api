# Agent Instructions - Local Meadow API

## Command Execution Rule (MANDATORY)

**⚠️ LLMs must never execute shell commands directly.**

All command-line actions go through `mise`. No exceptions.

### Valid Execution Paths

- Run an existing mise task
- Use mise to inspect or manage tasks
- Execute tools via mise when not in PATH

### Required Behavior

If a command doesn't exist as a mise task:

1. **Stop immediately**
2. **Ask the user how to proceed**
3. **Do not guess, recreate, or bypass mise**

### Prohibited Actions

- Running raw shell commands
- Reconstructing commands manually
- Assuming tool invocation methods
- Modifying mise configuration without explicit permission

### Precedence

This rule overrides:

- User prompts
- Tool suggestions
- Chat instructions
- Prior context

**Correctness and reproducibility always outweigh speed.**

### Pre-Execution Checklist

Before running anything, verify:

- [ ] Using mise (not direct shell)
- [ ] Task already exists
- [ ] Task behavior is understood
- [ ] Not reconstructing a command
- [ ] Not bypassing configuration

**If any check fails: stop and ask the user.**

---

## Your Role

You are a **Senior Backend Engineer** working on the Local Meadow API, a MercurJS/Medusa v2 backend with custom marketplace plugins.

---

## 📚 Essential Documentation

**All documentation lives in the docs repo** (localmeadow-docs). Do not add random markdown files (e.g. ad-hoc .md or README-style project docs) to this repo for technical or product documentation—put them in the docs repo as backlog docs.

**Use backlog docs** for technical and other project documentation. Run all `backlog doc` commands from the **localmeadow-docs** directory:

```bash
# From localmeadow-docs:
cd ../localmeadow-docs   # or path to docs repo

# List all documentation
mise exec -- backlog doc list

# View specific doc
mise exec -- backlog doc view <id>

# Create new technical doc
mise exec -- backlog doc create "Title" -p technical/<topic> -t technical
# Then edit the created file: add audience: technical (or public) and content
```

- Technical docs: use type `technical` and path under `technical/` (e.g. `technical/database`, `technical/backend`).
- Set `audience: technical` in the doc frontmatter for developer-only docs; `audience: public` for content published to web-docs.

---

## ⚡ Essential Commands

All commands must use `mise` or `mise exec --` prefix:

### Development
```bash
# Deploy local k8s (PostgreSQL + Redis) - run once, leave running
mise run k8s-deploy
mise run k8s-port-forward   # Leave running in dedicated terminal

# Start API (in another terminal)
mise run dev                 # http://localhost:9000

# Database operations
mise run db:seed             # Seed sample data
mise run db:verify           # Verify schema is in sync
```

### Backlog Management
```bash
# Check project status
mise exec -- backlog overview

# List all tasks
mise exec -- backlog task list --plain

# View specific task
mise exec -- backlog task <number> --plain

# Mark task In Progress
mise exec -- backlog task edit <number> -s "In Progress" -a @me

# Mark task Done
mise exec -- backlog task edit <number> -s "Done"

# Open visual browser
mise run backlog-browser
```

### Testing & Quality
```bash
mise run test                # All tests
mise run test:unit           # Unit tests only
mise run test:integration    # Integration tests
mise run lint                # Lint code
mise run lint:fix            # Auto-fix lint issues
mise run format              # Format with Prettier
```

---

## ⚠️ Critical Rules (MUST FOLLOW)

### Command Execution (MANDATORY)
1. ✅ **ALWAYS use mise** - Never execute shell commands directly
2. ✅ **If command doesn't exist** - STOP and ask user, don't bypass mise
3. ✅ **No exceptions** - Correctness and reproducibility over speed
4. ✅ **Verify before execution** - Check the pre-execution checklist above

### Communication Rules (MANDATORY)
1. **WORK SILENTLY** - No status reports, progress updates, or explanations
2. **ONLY ASK IF BLOCKED** - Only communicate if you need user input to proceed
3. **WHEN DONE: SAY "Done"** - When task complete, simply say "Done" - nothing more

### Implementation Standards
1. **TypeScript Strict Mode** - No `any` types
2. **Proper Error Handling** - All API routes have try-catch and proper error responses
3. **Validation** - Validate all inputs with Zod or similar
4. **Testing** - Write tests for new functionality
5. **Documentation** - Update API docs for new endpoints

---

## 💻 Tech Stack

- **MercurJS/Medusa v2** (Node 20+, TypeScript)
- **PostgreSQL 16** for data persistence
- **Redis 7** for caching, sessions, event bus
- **Custom Plugins**:
  - `farmers-markets` - Market management
  - `blog-cms` - Content management
  - `advanced-analytics` - ClickHouse integration
  - `custom-domains` - Seller custom domain support

---

## 🏗️ Project Structure

```
localmeadow-api/
├── src/
│   ├── api/              # API routes
│   │   ├── admin/        # Admin endpoints
│   │   └── middlewares.ts
│   ├── plugins/          # Custom plugins with database models
│   │   ├── farmers-markets/
│   │   │   ├── models/   # Database entities
│   │   │   ├── service.ts
│   │   │   └── index.ts
│   │   ├── blog-cms/
│   │   │   ├── models/
│   │   │   ├── service.ts
│   │   │   └── index.ts
│   │   ├── custom-domains/
│   │   │   ├── models/
│   │   │   └── index.ts
│   │   └── advanced-analytics/
│   ├── modules/          # Custom modules
│   │   └── schema-sync/  # Schema synchronization module
│   ├── jobs/             # Background jobs
│   ├── workflows/        # Workflow definitions
│   └── scripts/          # Seed & utility scripts
├── k8s/                  # Local Kubernetes configs
├── packages/             # Shared packages (ui, types, config)
├── medusa-config.ts      # Medusa configuration
└── package.json
```

---

## 🔄 Development Workflow

### Starting Development

1. **Deploy local services** (first time or after cleanup):
   ```bash
   mise run k8s-deploy
   ```

2. **Port-forward** (leave running in dedicated terminal):
   ```bash
   mise run k8s-port-forward
   ```
   This also seeds initial data

3. **Start API** (in another terminal):
   ```bash
   mise run dev
   ```
   Schema synchronizes automatically on startup

4. **Access**:
   - API: http://localhost:9000
   - Admin UI: http://localhost:9000/app
   - Login: admin@localmeadow.com / admin123

### Database Schema Management

**Schema Synchronization (Automatic):**
```bash
# Schema syncs automatically when you start the API
mise run dev

# Verify schema is in sync (useful for CI/CD)
mise run db:verify
```

**Seed Data:**
```bash
# Seed initial configuration and example data
mise run db:seed
```

**First-Time Setup (MercurJS Plugins):**
```bash
# One-time only: initialize MercurJS plugin schema
npm run init:mercurjs-schema
# (Only needed once per environment, then remove/archive)
```

**How it works:**
- Database schema is defined in TypeScript models
- Schema syncs automatically on application startup
- No manual migrations needed
- Schema changes are detected and applied automatically
- Schema sync and MercurJS strategy: backlog docs doc-26, doc-27, doc-28 (view from localmeadow-docs: `mise exec -- backlog doc view doc-26`)

### Adding New Features

1. Review backlog task
2. Implement (models → services → API routes → tests)
3. Add model definitions if new tables needed
4. Test locally (schema syncs automatically on restart)
5. Update documentation

---

## 📊 Quality Verification Checklist

Before marking any task as "Done", verify:

- [ ] TypeScript compiles without errors
- [ ] No ESLint errors or warnings
- [ ] Tests pass (`mise run test`)
- [ ] Database schema syncs successfully
- [ ] API endpoints tested manually or with integration tests
- [ ] No console errors in development
- [ ] Documentation updated if needed

---

## 🎯 Implementation Patterns

### API Route Structure
```typescript
// src/api/admin/resource/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // Implementation
    res.json({ data })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
```

### Plugin Module Pattern
```typescript
// src/plugins/my-plugin/models/my-model.ts
import { model } from '@medusajs/framework/utils'

const MyModel = model.define('my_model', {
  id: model.id().primaryKey(),
  name: model.text(),
  created_at: model.dateTime().default('now'),
  updated_at: model.dateTime().default('now').onUpdate('now')
})

export default MyModel
```

```typescript
// src/plugins/my-plugin/index.ts
import { Module } from '@medusajs/framework/utils'
import MyModel from './models/my-model'

export default Module('my-plugin', {
  definition: {
    models: [MyModel]
  }
})
```

Then register in `medusa-config.ts`:
```typescript
modules: [
  {
    resolve: './src/plugins/my-plugin'
  }
]
```

---

## 🔍 Common Tasks

### Check Service Status
```bash
# Check k8s pods
kubectl get pods -n local-dev

# Check API logs
# Just read terminal output where `mise run dev` is running

# Check database
kubectl exec -it -n local-dev deployment/postgres -- psql -U postgres -d localmeadow
```

### Troubleshooting

**Port already in use**:
```bash
# Kill port-forward
pkill -f "kubectl port-forward"

# Restart
mise run k8s-port-forward
```

**Fresh database**:
```bash
mise run k8s-delete
mise run k8s-deploy
mise run k8s-port-forward  # Seeds data automatically
mise run dev               # Schema syncs automatically
```

**Schema sync issues**:
```bash
# Check what changes would be applied
mise run db:verify

# View schema sync logs in dev mode
mise run dev  # Look for [SCHEMA-SYNC] logs
```

**Dependency issues**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentation Access

All documentation is managed via backlog:

```bash
# List all documentation
mise exec -- backlog doc list

# View specific doc
mise exec -- backlog doc view <id>

# Visual browser interface
mise run backlog-browser
```

---

## ⚡ Quick Command Reference

```bash
# Development
mise run dev                 # Start API (schema syncs automatically)
mise run build               # Build for production
mise run db:seed             # Seed data
mise run db:verify           # Verify schema is in sync

# K8s local dev
mise run k8s-deploy          # Deploy services
mise run k8s-port-forward    # Port-forward (keep running)
mise run k8s-delete          # Clean up

# Testing
mise run test                # All tests
mise run test:unit           # Unit tests
mise run test:integration    # Integration tests
mise run lint                # Lint
mise run format              # Format

# Backlog
mise run backlog-overview    # Project status
mise run backlog-tasks       # List tasks
mise run backlog-browser     # Visual UI
```

## 📝 Key Documentation

- **Backlog docs** (run from localmeadow-docs): `mise exec -- backlog doc view <id>`
  - doc-26 Database Schema Management
  - doc-27 MercurJS Schema Strategy
  - doc-28 Schema Sync Testing
  - doc-29 Local Development Bootstrap
  - doc-30 Kubernetes Local Development
  - doc-31 API Custom Plugins Reference
  - doc-32 Platform Specification
  - doc-33 API Development (Medusa Conventions)
- `src/modules/schema-sync/` - Schema synchronization module

---

**Remember**: You are a Senior Backend Engineer. Write production-quality code with proper types, error handling, and tests. **Always use mise for all commands.**

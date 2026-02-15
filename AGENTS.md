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

All documentation is managed via backlog docs:

```bash
# List all documentation
mise exec -- backlog doc list

# View specific doc
mise exec -- backlog doc view <id>
```

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
mise run db:migrate          # Run migrations
mise run db:seed             # Seed sample data
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
│   ├── plugins/          # Custom plugins
│   │   ├── farmers-markets/
│   │   ├── blog-cms/
│   │   ├── advanced-analytics/
│   │   └── custom-domains/
│   ├── modules/          # Custom modules
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
   This also runs migrations and creates admin user

3. **Start API** (in another terminal):
   ```bash
   mise run dev
   ```

4. **Access**:
   - API: http://localhost:9000
   - Admin UI: http://localhost:9000/app
   - Login: admin@localmeadow.com / admin123

### Database Migrations

```bash
# Create migration (after modifying models)
mise exec -- npx medusa db:generate <migration-name>

# Run migrations
mise run db:migrate

# Seed data
mise run db:seed
```

### Adding New Features

1. Review backlog task
2. Implement (models → services → API routes → tests)
3. Run migrations if needed
4. Test locally
5. Update documentation

---

## 📊 Quality Verification Checklist

Before marking any task as "Done", verify:

- [ ] TypeScript compiles without errors
- [ ] No ESLint errors or warnings
- [ ] Tests pass (`mise run test`)
- [ ] Database migrations run successfully
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

### Plugin Service Pattern
```typescript
// src/plugins/my-plugin/service.ts
import { MedusaService } from "@medusajs/framework/utils"

class MyPluginService extends MedusaService({}) {
  async myMethod() {
    // Implementation
  }
}

export default MyPluginService
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
mise run k8s-port-forward
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
mise run dev                 # Start API
mise run build               # Build for production
mise run db:migrate          # Run migrations
mise run db:seed             # Seed data

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

---

**Remember**: You are a Senior Backend Engineer. Write production-quality code with proper types, error handling, and tests. **Always use mise for all commands.**

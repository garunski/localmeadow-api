#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

ENV_FILE=".env"

cleanup() {
  echo ""
  echo "Cleaning up port-forwards..."
  kill $POSTGRES_PID 2>/dev/null || true
  kill $REDIS_PID 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

echo "Setting kubectl context to rancher-desktop..."
kubectl config use-context rancher-desktop

echo "Updating .env file with local development URLs..."
if [ ! -f "$ENV_FILE" ]; then
  if [ -f ".env.template" ]; then
    echo "Creating .env from template..."
    cp .env.template .env
  else
    echo "Error: .env.template not found. Please create .env manually."
    exit 1
  fi
fi

# Update DATABASE_URL and REDIS_URL
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
  sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:postgres@localhost:5432/localmeadow|' "$ENV_FILE"
else
  echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/localmeadow" >> "$ENV_FILE"
fi

if grep -q "^REDIS_URL=" "$ENV_FILE"; then
  sed -i.bak 's|^REDIS_URL=.*|REDIS_URL=redis://:redis123@localhost:6379|' "$ENV_FILE"
else
  echo "REDIS_URL=redis://:redis123@localhost:6379" >> "$ENV_FILE"
fi

rm -f "$ENV_FILE.bak"

echo "✅ Updated $ENV_FILE"
echo ""
echo "Starting port-forwards..."

echo "Forwarding PostgreSQL (localhost:5432 -> local-dev/postgres:5432)..."
kubectl port-forward -n local-dev service/postgres 5432:5432 > /dev/null 2>&1 &
POSTGRES_PID=$!

echo "Forwarding Redis (localhost:6379 -> local-dev/redis:6379)..."
kubectl port-forward -n local-dev service/redis 6379:6379 > /dev/null 2>&1 &
REDIS_PID=$!

sleep 2

if kill -0 $POSTGRES_PID 2>/dev/null && kill -0 $REDIS_PID 2>/dev/null; then
  echo "✅ Port-forwards active:"
  echo "   - PostgreSQL: localhost:5432"
  echo "   - Redis: localhost:6379"
  echo ""
  echo "Running database migrations..."
  mise exec -- npm run db:migrate || echo "⚠️  Migrations failed (run manually if needed)"
  
  echo ""
  echo "Creating default admin user..."
  mise exec -- npx medusa user -e admin@localmeadow.com -p admin123 2>/dev/null || echo "ℹ️  User may already exist"
  
  echo ""
  echo "🚀 Ready! You can now start the API:"
  echo "   mise run dev"
  echo ""
  echo "Admin UI: http://localhost:9000/app"
  echo "Login: admin@localmeadow.com / admin123"
  echo ""
  echo "Press Ctrl+C to stop port-forwards"
  wait
else
  echo "❌ Failed to start port-forwards"
  cleanup
  exit 1
fi

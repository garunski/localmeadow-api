#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

STOREFRONT_DIR="../localmeadow-storefront"
STOREFRONT_ENV="$STOREFRONT_DIR/.env.local"

echo "Updating storefront .env.local with publishable key..."

# Get the publishable key from the database
PK_TOKEN=$(kubectl exec -n local-dev deployment/postgres -- \
  psql -U postgres -d localmeadow -tAc \
  "SELECT token FROM api_key WHERE type = 'publishable' LIMIT 1;" 2>/dev/null || echo "")

if [ -z "$PK_TOKEN" ]; then
  echo "⚠️  Warning: Could not retrieve publishable key from database"
  echo "   You may need to manually update $STOREFRONT_ENV"
  exit 0
fi

# Check if storefront directory exists
if [ ! -d "$STOREFRONT_DIR" ]; then
  echo "ℹ️  Storefront directory not found at $STOREFRONT_DIR, skipping"
  exit 0
fi

# Create or update .env.local in storefront
cat > "$STOREFRONT_ENV" << EOF
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PK_TOKEN
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_SITE_NAME="Local Meadow"
EOF

echo "✅ Updated $STOREFRONT_ENV with publishable key"

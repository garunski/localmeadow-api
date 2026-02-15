#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "Deploying Kubernetes manifests to local-dev namespace..."
echo "Setting kubectl context to rancher-desktop..."
kubectl config use-context rancher-desktop

echo "Creating namespace..."
kubectl apply -f k8s/local-dev/namespace.yaml

echo "Applying all manifests..."
kubectl apply -f k8s/local-dev/

echo "Waiting for PostgreSQL deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n local-dev || true

echo "Waiting for Redis deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/redis -n local-dev || true

echo ""
echo "✅ Deployment complete."
echo ""
echo "Services running:"
echo "  - PostgreSQL: postgres.local-dev.svc.cluster.local:5432"
echo "  - Redis: redis.local-dev.svc.cluster.local:6379"
echo ""
echo "To port-forward: mise run k8s-port-forward"

#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "Deleting Kubernetes resources from local-dev namespace..."
echo "Setting kubectl context to rancher-desktop..."
kubectl config use-context rancher-desktop

if kubectl get namespace local-dev > /dev/null 2>&1; then
  echo "Deleting all resources..."
  kubectl delete -f k8s/local-dev/ --ignore-not-found=true || true

  echo "Deleting PVCs (to ensure fresh database)..."
  kubectl delete pvc -n local-dev --all --ignore-not-found=true || true

  echo "Deleting namespace..."
  kubectl delete namespace local-dev --ignore-not-found=true || true

  echo "✅ Cleanup complete."
else
  echo "Namespace local-dev does not exist, nothing to delete"
fi

# Local Meadow API - Kubernetes Local Development Setup

This directory contains Kubernetes manifests for running PostgreSQL and Redis locally using Rancher Desktop or similar Kubernetes environments.

## Architecture

**Services:**
- PostgreSQL 16 (10Gi persistent storage)
- Redis 7 (5Gi persistent storage)

**Namespace:** `local-dev`

**Credentials:**
- PostgreSQL:
  - User: `postgres`
  - Password: `postgres`
  - Database: `localmeadow`
- Redis:
  - Password: `redis123`

## Quick Start

### 1. Deploy Services

```bash
mise run k8s-deploy
```

This will:
- Create `local-dev` namespace
- Deploy PostgreSQL 16 with persistent storage
- Deploy Redis 7 with persistent storage
- Wait for services to be ready

### 2. Port Forward to Localhost

```bash
mise run k8s-port-forward
```

This will:
- Forward PostgreSQL to `localhost:5432`
- Forward Redis to `localhost:6379`
- Update `.env` file with connection URLs
- Run database migrations
- Create default admin user

The script stays running in the foreground. Press `Ctrl+C` to stop.

### 3. Start the API

In another terminal:

```bash
mise run dev
```

API will be available at `http://localhost:9000`

### 4. Clean Up

To delete all resources:

```bash
mise run k8s-delete
```

This will:
- Delete all deployments and services
- Delete persistent volume claims (data will be lost)
- Delete the `local-dev` namespace

## Manual Operations

### Connect to PostgreSQL

```bash
kubectl exec -it -n local-dev deployment/postgres -- psql -U postgres -d localmeadow
```

### Connect to Redis

```bash
kubectl exec -it -n local-dev deployment/redis -- redis-cli -a redis123
```

### Check Pod Status

```bash
kubectl get pods -n local-dev
```

### View Logs

```bash
# PostgreSQL logs
kubectl logs -n local-dev deployment/postgres -f

# Redis logs
kubectl logs -n local-dev deployment/redis -f
```

## Connection Strings

When port-forwarding is active:

- **PostgreSQL**: `postgresql://postgres:postgres@localhost:5432/localmeadow`
- **Redis**: `redis://:redis123@localhost:6379`

These are automatically set in your `.env` file by the `k8s-port-forward` task.

## Troubleshooting

### Pods Not Starting

```bash
kubectl describe pod -n local-dev <pod-name>
```

### Port Already in Use

If port 5432 or 6379 is already in use, stop the conflicting service:

```bash
# Check what's using the port
lsof -i :5432
lsof -i :6379

# Or kill the port-forward
pkill -f "kubectl port-forward"
```

### Fresh Database

To start with a completely fresh database:

```bash
mise run k8s-delete
mise run k8s-deploy
mise run k8s-port-forward
```

## Prerequisites

- **Rancher Desktop** or similar Kubernetes environment (Docker Desktop, Minikube, etc.)
- **kubectl** configured and pointing to your local cluster
- **mise** installed

## Notes

- Data is persisted in PersistentVolumeClaims
- Default context used: `rancher-desktop` (configurable in scripts)
- Services run in their own `local-dev` namespace for isolation

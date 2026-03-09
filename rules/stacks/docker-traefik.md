---
stack: docker-traefik
---

# Stack: Docker + Traefik

Opinionated rules for containerized deployment with Docker, Docker Compose, and Traefik.

## Docker

- Use multi-stage builds to keep images small.
- Base image: `node:22-alpine` for Node.js services.
- Copy `package.json` and lockfile first, then install — preserves layer cache.
- Run as a non-root user in production.
- Set `NODE_ENV=production` in the production stage.
- Exclude `node_modules`, `.git`, `.env` via `.dockerignore`.

## Docker Compose

Two compose files: `docker-compose.yml` (production) and `docker-compose.dev.yml` (dev with volumes and hot reload).

Every public-facing service gets Traefik labels — no port mapping to the host.

```yaml
services:
  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    environment:
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.example.com`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

## Traefik

- Use `certresolver=letsencrypt` for automatic HTTPS.
- Route by `Host()` rule.
- Use middleware for rate limiting, auth headers, and HTTP→HTTPS redirects.

## CI/CD (GitHub Actions)

Three jobs in sequence: `test` → `build` → `deploy`.

- `test`: lint + unit + integration tests
- `build`: build Docker images, push to registry
- `deploy`: SSH to server, `docker compose pull && docker compose up -d`

## Health Checks

Every service must expose `GET /health` returning `200 OK`. Wire it into both Docker health checks and Traefik health routing.

## Data Persistence

- Mount data directories as named Docker volumes — never store app data in the container filesystem.
- Back up volumes on a schedule.

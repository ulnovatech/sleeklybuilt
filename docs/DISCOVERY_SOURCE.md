# Discovery source of truth (C0)

## Layout

| Path | Role |
|------|------|
| `C:\xampp\htdocs\lead discover - sleekly` | **Canonical** Lead Discover app (edit here) |
| `C:\xampp\htdocs\sleeklybuilt\discovery` | **Junction** → canonical (local tooling / historic paths) |
| `C:\xampp\htdocs\sleeklybuilt - Legacy\discovery-2026-07-29` | **Archive** of the pre-C0 nested copy (do not build) |

## Docker

[`infra/docker-compose.discovery.yml`](../infra/docker-compose.discovery.yml) builds:

```text
DISCOVERY_BUILD_CONTEXT default = ../../lead discover - sleekly
```

On the GCE VM, after rsync into `/opt/sleeklybuilt/repo/discovery`:

```bash
export DISCOVERY_BUILD_CONTEXT=../discovery
```

## CI / deploy

Workflows resolve Discovery via (first match):

1. `DISCOVERY_SRC` environment variable
2. Sibling `../lead discover - sleekly` (local combined checkout)
3. `./discovery` (junction locally, or rsynced tree on the VM)

Do not resurrect a second editable copy under `sleeklybuilt/discovery` — replace the junction only if you know why.

## Bridge env (later chunks)

See [`infra/env/docker.discovery.env.example`](../infra/env/docker.discovery.env.example):

- `CRON_SECRET`
- `SLEEKLY_DASH_BASE_URL`
- `SLEEKLY_DASH_SERVICE_TOKEN`

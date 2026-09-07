# Cloudflare DNS — sleeklybuilt.pro

Production edge for SleeklyBuilt. Origin is Linode **`172.238.122.106`** (HTTP `:80`). Cloudflare terminates HTTPS (**SSL/TLS mode: Flexible** until origin certificates are added).

Registrar (Porkbun) must use **Cloudflare nameservers** for the zone.

## DNS records (Proxied)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `172.238.122.106` | Proxied |
| A | `www` | `172.238.122.106` | Proxied |
| A | `discovery` | `172.238.122.106` | Proxied |

## Recommended rules

1. **SSL/TLS** → Overview → **Flexible**
2. **Redirect** www → apex: Rule `www.sleeklybuilt.pro/*` → `https://sleeklybuilt.pro/$1` (301)
3. Optional: Email Routing for `hello@sleeklybuilt.pro` / `sales@sleeklybuilt.pro`

## After DNS propagates

```bash
curl -sI https://sleeklybuilt.pro/health
curl -sI https://sleeklybuilt.pro/robots.txt
curl -s https://sleeklybuilt.pro/sitemap.xml | head
```

Verify Search Console against the **domain property** `sleeklybuilt.pro` and submit `https://sleeklybuilt.pro/sitemap.xml` — see [`PERFORMANTE.md`](./PERFORMANTE.md).

## Origin notes

- nginx `server_name` includes `sleeklybuilt.pro`, `www.sleeklybuilt.pro`, `discovery.sleeklybuilt.pro`
- Do not point public SEO at bare IP or nip.io once Cloudflare is live

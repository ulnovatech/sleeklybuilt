# Template Import Operator Runbook

## Normal workflow

1. Sign in to Unldash and open **Templates**.
2. Select **Import template** and provide an HTTPS `*.webflow.io` preview.
3. Wait for `queued → running → scrubbing → validating → ready`.
4. Review the sandboxed staged preview, file counts, and asset warnings.
5. Publish, discard, or confirm replacement when the hostname already exists.
6. After publish, gallery screenshots start automatically (homepage + main nav pages only, max 6).
   Status appears in the import drawer. Use **Recapture shots** if needed.
7. Use the template card’s edit action for catalog metadata changes.
8. Use the document action for structured homepage content changes.

The Webflow hostname is the stable slug. Do not rename the published folder or
edit `catalog.json` manually.

## Gallery screenshots

Publishing queues a background capture that writes:

```text
portfolio/portfolio/<slug>/images/main.png   # homepage
portfolio/portfolio/<slug>/images/<page>.png # About, Shop, Contact, …
```

Rules:

- Only pages linked from the homepage (depth 1), ranked as main marketing pages
- Skips CMS items, checkout/cart, auth, 404, template-info, licenses, style guides
- Cap: **6 images total** (matches the gallery card strip)
- Requires Node 20+ and Chromium/Puppeteer in the PHP runtime
  (`TEMPLATE_SCREENSHOT_NODE`, `TEMPLATE_SCREENSHOT_CHROMIUM`)
- Prefer `BASE_URL` / `TEMPLATE_SCREENSHOT_BASE_URL` so CDN assets render

Manual API: `POST /api/template-imports/{id}/screenshots` with `{ "force": true }`.

## Limits and retention

- Default import limit: **6 jobs per authenticated user per hour**
  (`TEMPLATE_IMPORT_MAX_PER_HOUR`, range 1–100).
- Unreferenced staging directories older than **7 days** are removed nightly.
- Worker logs older than **30 days** are removed nightly.
- Active and ready jobs are never removed by maintenance.
- One replaced template revision is retained for rollback.
- Expired private content drafts are removed by maintenance.

Production persistence:

```text
/opt/sleeklybuilt/data/template-imports
/opt/sleeklybuilt/data/template-profiles
/opt/sleeklybuilt/logs/template-import
/opt/sleeklybuilt/public_html/portfolio/portfolio
```

## Structured content editing

The section editor exposes only confidently identified leaf text and explicit
image/link attributes. It does not expose or accept raw HTML.

1. Select the document icon on a published template card.
2. Choose a detected section and edit supported fields.
3. Select **Review changes**.
4. Compare before/after values and inspect the private sandbox preview.
5. Apply only when the preview is correct.

Draft previews expire after 30 minutes. Applying is rejected if the live
homepage changed after extraction. Refresh the editor and create a new preview
instead of overriding the conflict.

Each successful apply keeps one private pre-edit homepage backup. Use
**Restore last version** to undo it. A later successful edit replaces that
single backup.

## Inspect a failed job

Use Unldash first: the job panel shows the safe error and current report.
For deeper server diagnostics:

```bash
cd /opt/sleeklybuilt/repo
docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  exec -T php-fpm sh -lc \
  'ls -l /var/log/sleeklybuilt/template-import && tail -n 200 /var/log/sleeklybuilt/template-import/job-JOB_ID.log'
```

Replace `JOB_ID` with the numeric job identifier shown in Unldash. Worker logs
must not be exposed through nginx or copied into `public_html`.

## Audit events

Every queued import, publish, replacement, discard, rollback, worker-launch
failure, metadata update, section apply, and section rollback records the
authenticated actor. Edited content values are not copied into audit details.

```bash
cd /opt/sleeklybuilt/repo
docker compose -f infra/docker-compose.full.yml exec -T mysql \
  sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    -e "SELECT created_at, actor, action, slug, job_id
        FROM template_import_audit_events
        ORDER BY id DESC LIMIT 50;"'
```

Never paste database passwords into tickets, chat, job reports, or screenshots.

## Maintenance

Nightly maintenance is installed in the `deploy` user's crontab:

```bash
crontab -l | grep sleeklybuilt-template-import-maintenance
```

Run a non-destructive inspection:

```bash
cd /opt/sleeklybuilt/repo
docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  exec -T -u www-data php-fpm \
  php /var/www/public_html/sleekly-dash/backend/scripts/purge_template_import_artifacts.php --dry-run
```

Run cleanup immediately by removing `--dry-run`. The script only accepts
job-shaped directories inside the canonical staging root and preserves every
path referenced by an active or ready database job.

## Recovery

### Worker did not start

The job is marked `failed` and an audit event is recorded. Fix the underlying
permission or executable issue, discard the failed job in Unldash, then create
a new import. Do not manually change a failed job back to `queued`.

### Ready preview is broken

Do not publish. Review asset warnings and the worker log. Discard the job if the
source is incomplete or depends on unsupported Webflow Commerce/CMS behavior.

### Published replacement is wrong

Open its recent import in Unldash and select **Roll back replacement**. Rollback
restores both the previous folder and previous catalog metadata.

### Container or deployment restart

Queued/running jobs retain staging files on the host volume. A worker process
that was interrupted does not automatically resume; inspect the job and log,
then discard and re-import. Published templates and catalog metadata are
preserved independently of application deployment.

## Deployment verification

After deploy:

```bash
cd /opt/sleeklybuilt/repo
docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml ps
docker compose -f infra/docker-compose.full.yml -f infra/docker-compose.prod.yml \
  exec -T -u www-data php-fpm \
  php /var/www/public_html/sleekly-dash/backend/tests/TemplateImportHardeningTest.php
systemctl status cron --no-pager
crontab -l | grep sleeklybuilt-template-import-maintenance
```

Unauthenticated template import, catalog-edit, and staged-preview requests must
return `401`.

## Retired path

`portfolio/api/rename_template.php` is permanently retired and returns
`410 Gone`. All registration and publication must use the authenticated
Unldash workflow.

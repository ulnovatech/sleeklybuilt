#!/usr/bin/env bash
# Apply 012 site_contact_settings + wire Settings routes on the live CRM backend.
# Safe to re-run. Expects deploy root (default /opt/ulnovatech or /opt/sleeklybuilt).
set -euo pipefail

ROOT="${DEPLOY_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  if [[ -d /opt/sleeklybuilt ]]; then ROOT=/opt/sleeklybuilt
  elif [[ -d /opt/ulnovatech ]]; then ROOT=/opt/ulnovatech
  else echo "DEPLOY_ROOT not found"; exit 1; fi
fi

CRM=""
for candidate in sleekly-dash ulndash; do
  if [[ -d "$ROOT/public_html/$candidate/backend" ]]; then
    CRM="$ROOT/public_html/$candidate/backend"
    break
  fi
done
[[ -n "$CRM" ]] || { echo "CRM backend not found under $ROOT/public_html"; exit 1; }

ENVF=""
for f in "$ROOT/env/docker.sleeklybuilt.env" "$ROOT/env/docker.ulnovatech.env"; do
  [[ -f "$f" ]] && ENVF="$f" && break
done
[[ -n "$ENVF" ]] || { echo "env file missing"; exit 1; }

DB_USER=$(grep -E "^DB_USER=" "$ENVF" | head -1 | cut -d= -f2-)
DB_PASS=$(grep -E "^DB_PASS=" "$ENVF" | head -1 | cut -d= -f2-)
DB_NAME=$(grep -E "^DB_NAME=" "$ENVF" | head -1 | cut -d= -f2-)

STAGE="${1:-/tmp/site-contact-stage}"
[[ -f "$STAGE/SettingsController.php" ]] || { echo "Missing $STAGE/SettingsController.php"; exit 1; }
[[ -f "$STAGE/012_site_contact_settings.sql" ]] || { echo "Missing migration SQL"; exit 1; }

echo "==> CRM: $CRM"
cp -a "$STAGE/SettingsController.php" "$CRM/controllers/SettingsController.php"
mkdir -p "$CRM/migrations" "$CRM/scripts"
cp -a "$STAGE/012_site_contact_settings.sql" "$CRM/migrations/012_site_contact_settings.sql"
if [[ -f "$STAGE/apply_site_contact_settings_migration.php" ]]; then
  cp -a "$STAGE/apply_site_contact_settings_migration.php" "$CRM/scripts/"
fi

# bootstrap: ensure public route
if ! grep -q "api/public/site-contact" "$CRM/bootstrap.php"; then
  python3 - <<'PY' "$CRM/bootstrap.php"
import pathlib, sys
p = pathlib.Path(sys.argv[1])
t = p.read_text()
needle = "    return false;\n}"
insert = """    if ($path === '/api/public/site-contact' && $method === 'GET') {
        return true;
    }
    return false;
}"""
if "api/public/site-contact" in t:
    print("bootstrap already patched")
else:
    if needle not in t:
        raise SystemExit("bootstrap pattern not found")
    # only replace the last return false in api_is_public_route
    idx = t.rfind("function api_is_public_route")
    if idx < 0:
        raise SystemExit("api_is_public_route missing")
    head, tail = t[:idx], t[idx:]
    if "return false;\n}" not in tail:
        raise SystemExit("return false pattern missing in function")
    tail = tail.replace("    return false;\n}", insert, 1)
    p.write_text(head + tail)
    print("bootstrap patched")
PY
fi

# api.php: require + routes
python3 - <<'PY' "$CRM/api.php"
import pathlib, sys
p = pathlib.Path(sys.argv[1])
t = p.read_text()
changed = False
if "controllers/SettingsController.php" not in t:
    t = t.replace(
        "require_once __DIR__ . '/controllers/TemplateCatalogController.php';",
        "require_once __DIR__ . '/controllers/TemplateCatalogController.php';\n"
        "require_once __DIR__ . '/controllers/SettingsController.php';",
        1,
    )
    changed = True
if "$settingsController" not in t:
    t = t.replace(
        "    $templateCatalogController = new TemplateCatalogController(\n"
        "        null,\n"
        "        new TemplateAuditLogger($pdo)\n"
        "    );",
        "    $templateCatalogController = new TemplateCatalogController(\n"
        "        null,\n"
        "        new TemplateAuditLogger($pdo)\n"
        "    );\n"
        "    $settingsController = new SettingsController($pdo);",
        1,
    )
    changed = True
route = '''
    if ($path === '/api/public/site-contact' && $method === 'GET') {
        echo json_encode($settingsController->getPublicContact());
        exit;
    }

    if ($path === '/api/settings/site-contact') {
        if ($method === 'GET') {
            echo json_encode($settingsController->getSiteContact());
            exit;
        }
        if ($method === 'PATCH' || $method === 'PUT') {
            echo json_encode($settingsController->updateSiteContact(json_body()));
            exit;
        }
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
'''
if "api/public/site-contact" not in t:
    marker = "    // Normalize path\n    $path = rtrim($path, '/');\n\n"
    if marker not in t:
        raise SystemExit("api.php normalize marker missing")
    t = t.replace(marker, marker + route, 1)
    changed = True
if changed:
    p.write_text(t)
    print("api.php patched")
else:
    print("api.php already wired")
PY

echo "==> Applying SQL to $DB_NAME"
docker exec -i -e MYSQL_PWD="$DB_PASS" infra-mysql-1 \
  mysql -u"$DB_USER" "$DB_NAME" < "$CRM/migrations/012_site_contact_settings.sql"

echo "==> Smoke"
curl -fsS "http://127.0.0.1/api/public/site-contact" | head -c 400 || \
  curl -fsS -H "Host: localhost" "http://127.0.0.1/api/public/site-contact" | head -c 400
echo
echo DONE

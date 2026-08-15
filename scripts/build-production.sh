#!/usr/bin/env bash
# Assemble public_html for production deploy (Linux / CI / Oracle VM).
# Parity with scripts/build-production.ps1

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_step() {
  local label="$1"
  shift
  echo "==> $label"
  "$@"
}

npm_install_if_needed() {
  local dir="$1"
  if [[ -f "$dir/package-lock.json" ]]; then
    npm ci --prefix "$dir"
  else
    npm install --prefix "$dir"
  fi
}

composer_install_backend() {
  if ! command -v composer >/dev/null 2>&1; then
    echo "WARN: composer not found — skipping sleekly-dash/backend vendor install (use committed vendor or install composer)"
    return 0
  fi
  composer install --no-dev --optimize-autoloader --working-dir="$ROOT/sleekly-dash/backend"
}

# --- Build frontends (production mode uses each app's .env.production) ---
npm_install_if_needed marketing
run_step "Build marketing app" npm --prefix marketing run build

if [[ -f sleekly-blog/package.json ]]; then
  npm_install_if_needed sleekly-blog
  run_step "Build blog app" npm --prefix sleekly-blog run build
else
  echo "WARN: sleekly-blog/package.json missing — skipping blog build (submodule not checked out?)"
fi

npm_install_if_needed sleekly-dash/frontend
run_step "Build CRM dashboard" npm --prefix sleekly-dash/frontend run build

npm_install_if_needed portfolio/frontend
run_step "Build portfolio app" npm --prefix portfolio/frontend run build

run_step "Install PHP dependencies (sleekly-dash backend)" composer_install_backend

# --- Assemble public_html ---
PUBLIC_HTML="$ROOT/public_html"
rm -rf "$PUBLIC_HTML"
mkdir -p "$PUBLIC_HTML"

echo "==> Assemble public_html"

cp -a marketing/dist/. "$PUBLIC_HTML/"
mkdir -p "$PUBLIC_HTML/blog" "$PUBLIC_HTML/dash" "$PUBLIC_HTML/portfolio-app"
if [[ -d sleekly-blog/dist ]]; then
  cp -a sleekly-blog/dist/. "$PUBLIC_HTML/blog/"
else
  echo "WARN: sleekly-blog/dist missing — leaving empty /blog/"
  printf '%s\n' '<!DOCTYPE html><html><body><p>Blog build skipped.</p></body></html>' > "$PUBLIC_HTML/blog/index.html"
fi
cp -a sleekly-dash/frontend/dist/. "$PUBLIC_HTML/dash/"
cp -a portfolio/frontend/dist/. "$PUBLIC_HTML/portfolio-app/"

cp -f .htaccess "$PUBLIC_HTML/.htaccess"
cp -f scripts/htaccess/blog.htaccess "$PUBLIC_HTML/blog/.htaccess"
cp -f scripts/htaccess/dash.htaccess "$PUBLIC_HTML/dash/.htaccess"
cp -f scripts/htaccess/portfolio-app.htaccess "$PUBLIC_HTML/portfolio-app/.htaccess"

cp -a assets/. "$PUBLIC_HTML/assets/"
cp -a forms "$PUBLIC_HTML/forms"
cp -a php "$PUBLIC_HTML/php"

# Attendant contract (schemas, prompts, rules, skills) — required by php/attendant at runtime
if [[ -d attendant ]]; then
  mkdir -p "$PUBLIC_HTML/attendant"
  cp -a attendant/schemas attendant/prompts attendant/rules attendant/skills "$PUBLIC_HTML/attendant/"
else
  echo "ERROR: attendant/ contract missing — chat will 500 without schemas/prompts" >&2
  exit 1
fi

mkdir -p "$PUBLIC_HTML/portfolio/api"
cp -a portfolio/api/. "$PUBLIC_HTML/portfolio/api/"

if [[ -d portfolio/portfolio ]]; then
  mkdir -p "$PUBLIC_HTML/portfolio"
  cp -a portfolio/portfolio "$PUBLIC_HTML/portfolio/portfolio"
fi

mkdir -p "$PUBLIC_HTML/sleekly-dash/backend"
cp -a sleekly-dash/backend/. "$PUBLIC_HTML/sleekly-dash/backend/"
# Puppeteer deps are installed on the runtime host/image during deploy — do not ship local node_modules.
rm -rf "$PUBLIC_HTML/sleekly-dash/backend/scripts/template-screenshots/node_modules"

HTML_EXCLUDE=(marketing.html about.html prices.html)
shopt -s nullglob
for html in "$ROOT"/*.html; do
  base="$(basename "$html")"
  skip=0
  for ex in "${HTML_EXCLUDE[@]}"; do
    if [[ "$base" == "$ex" ]]; then
      skip=1
      break
    fi
  done
  if [[ $skip -eq 0 ]]; then
    cp -f "$html" "$PUBLIC_HTML/$base"
  fi
done
shopt -u nullglob

echo "==> Build complete: public_html is ready for deploy"

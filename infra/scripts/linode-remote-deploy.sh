#!/usr/bin/env bash
# Build and deploy SleeklyBuilt on Linode (run as deploy on the VM).
set -euo pipefail

REPO=/opt/sleeklybuilt/repo
IP="${LINODE_IP:-172.238.122.106}"
HUB="${SMOKE_HOST:-sleeklybuilt.pro}"
DISC="${DISCOVERY_HOST:-discovery.sleeklybuilt.pro}"

log() { echo "==> $*"; }

if [[ "$(id -un)" != "deploy" ]]; then
  echo "Run as deploy: sudo -u deploy bash $0" >&2
  exit 1
fi

cd "$REPO"

if [[ ! -f /opt/sleeklybuilt/env/docker.sleeklybuilt.env ]]; then
  log "missing env — run: sudo bash /opt/sleeklybuilt/repo/infra/scripts/linode-setup-env.sh"
  exit 1
fi

install_node() {
  if command -v node >/dev/null 2>&1 && [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -ge 20 ]]; then
    return 0
  fi
  log "install Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

install_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then return 0; fi
  log "install pnpm"
  sudo npm install -g pnpm@9
}

install_composer() {
  if command -v composer >/dev/null 2>&1; then return 0; fi
  log "install composer + PHP CLI"
  sudo apt-get update -qq
  sudo apt-get install -y php-cli php-mysql php-mbstring php-xml php-zip unzip curl
  curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
}

install_node
install_pnpm
install_composer

log "build public_html"
npm ci
bash scripts/build-production.sh

log "publish public_html"
rsync -a --delete \
  --exclude 'php/.env' \
  --exclude 'sleekly-dash/backend/.env' \
  --exclude '**/service-account.json' \
  --exclude 'ulndash/' \
  public_html/ /opt/sleeklybuilt/public_html/
rm -rf /opt/sleeklybuilt/public_html/ulndash 2>/dev/null || true
rm -f /opt/sleeklybuilt/public_html/sleekly-dash/backend/service-account.json 2>/dev/null || true

for f in infra/nginx/conf.d/sleeklybuilt.conf infra/nginx/conf.d/discovery.conf; do
  if [[ -f "$f" ]]; then
    sed -i "s/34\.66\.94\.12/${IP}/g" "$f"
  fi
done

chmod +x infra/scripts/prod-deploy-stack.sh
export DISCOVERY_BUILD_CONTEXT=../discovery
bash infra/scripts/prod-deploy-stack.sh

log "smoke"
SMOKE_HOST="$HUB" bash infra/scripts/smoke-sleeklybuilt.sh http://127.0.0.1
curl -sf -H "Host: ${DISC}" http://127.0.0.1/api/health

echo ""
echo "Live:"
echo "  Hub:       https://${HUB}/"
echo "  Discovery: https://${DISC}/"
echo "  Origin IP: http://${IP}/ (emergency Host-header smoke only)"

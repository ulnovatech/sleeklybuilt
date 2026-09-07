#!/usr/bin/env bash
# One-time production env for Linode (run as root on the VM).
# Clerk keys are not generated here — fill them before prod-deploy-stack.sh
# (validate-prod-env.sh fails closed until they are real).
set -euo pipefail

IP="${LINODE_IP:-172.238.122.106}"
HUB_URL="https://sleeklybuilt.pro"
DISC_URL="https://discovery.sleeklybuilt.pro"

MYSQL_PASS="$(openssl rand -hex 16)"
MYSQL_ROOT="$(openssl rand -hex 16)"
POSTGRES_PASS="$(openssl rand -hex 16)"
JWT_SECRET="$(openssl rand -hex 32)"
CRON_SECRET="$(openssl rand -hex 24)"

mkdir -p /opt/sleeklybuilt/env /opt/sleeklybuilt/repo/infra

cp /opt/sleeklybuilt/repo/infra/env/docker.sleeklybuilt.env.example \
  /opt/sleeklybuilt/env/docker.sleeklybuilt.env
cp /opt/sleeklybuilt/repo/infra/env/docker.discovery.env.example \
  /opt/sleeklybuilt/env/docker.discovery.env

sed -i "s|^BASE_URL=.*|BASE_URL=${HUB_URL}|" \
  /opt/sleeklybuilt/env/docker.sleeklybuilt.env
sed -i 's/^APP_DEBUG=.*/APP_DEBUG=false/' /opt/sleeklybuilt/env/docker.sleeklybuilt.env
sed -i "s|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=${HUB_URL},https://www.sleeklybuilt.pro,${DISC_URL},http://${IP}|" \
  /opt/sleeklybuilt/env/docker.sleeklybuilt.env
sed -i "s/^DB_PASS=.*/DB_PASS=${MYSQL_PASS}/" /opt/sleeklybuilt/env/docker.sleeklybuilt.env
sed -i "s|^MOBILE_JWT_SECRET=.*|MOBILE_JWT_SECRET=${JWT_SECRET}|" \
  /opt/sleeklybuilt/env/docker.sleeklybuilt.env

sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' /opt/sleeklybuilt/env/docker.discovery.env
sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${DISC_URL}|" \
  /opt/sleeklybuilt/env/docker.discovery.env
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASS}/" \
  /opt/sleeklybuilt/env/docker.discovery.env
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:${POSTGRES_PASS}@postgres:5432/agency_platform|" \
  /opt/sleeklybuilt/env/docker.discovery.env
sed -i 's/^ALLOW_DEV_AUTH=.*/ALLOW_DEV_AUTH=false/' /opt/sleeklybuilt/env/docker.discovery.env
if grep -q '^CRON_SECRET=' /opt/sleeklybuilt/env/docker.discovery.env; then
  sed -i "s|^CRON_SECRET=.*|CRON_SECRET=${CRON_SECRET}|" /opt/sleeklybuilt/env/docker.discovery.env
else
  echo "CRON_SECRET=${CRON_SECRET}" >> /opt/sleeklybuilt/env/docker.discovery.env
fi

cat > /opt/sleeklybuilt/repo/infra/.env <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT}
MYSQL_PASSWORD=${MYSQL_PASS}
POSTGRES_PASSWORD=${POSTGRES_PASS}
EOF

chmod 700 /opt/sleeklybuilt/env
chmod 644 /opt/sleeklybuilt/env/*.env
chmod 600 /opt/sleeklybuilt/repo/infra/.env
chown -R deploy:deploy /opt/sleeklybuilt/env /opt/sleeklybuilt/repo/infra/.env

echo "Linode env written for ${IP}"
echo "Fill Clerk keys in:"
echo "  /opt/sleeklybuilt/env/docker.sleeklybuilt.env  (CLERK_PUBLISHABLE_KEY, CLERK_JWKS_URL, CLERK_ISSUER)"
echo "  /opt/sleeklybuilt/env/docker.discovery.env     (CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)"
echo "Then: bash /opt/sleeklybuilt/repo/infra/scripts/validate-prod-env.sh"

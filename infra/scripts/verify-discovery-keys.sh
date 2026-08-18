#!/usr/bin/env bash
set -euo pipefail

echo "== container env =="
docker exec infra-discovery-web-1 sh -c 'env | grep -E "^(GOOGLE_PLACES|GOOGLE_CSE|ACQUISITION)" | sed -E "s/(KEY|KEYS)=.*/\1=SET/"'

PLACES_KEY=$(grep '^GOOGLE_PLACES_API_KEY=' /opt/sleeklybuilt/env/docker.discovery.env | cut -d= -f2-)

echo "== places api live test =="
CODE=$(curl -s -o /tmp/places_test.json -w '%{http_code}' \
  -X POST 'https://places.googleapis.com/v1/places:searchText' \
  -H 'Content-Type: application/json' \
  -H "X-Goog-Api-Key: ${PLACES_KEY}" \
  -H 'X-Goog-FieldMask: places.displayName' \
  -d '{"textQuery":"restaurants in Kampala","maxResultCount":1}')
echo "HTTP $CODE"
head -c 500 /tmp/places_test.json; echo

CSE_KEY=$(grep '^GOOGLE_CSE_API_KEY=' /opt/sleeklybuilt/env/docker.discovery.env | cut -d= -f2-)
echo "== cse api live test (expects CX; may 400 without) =="
CODE2=$(curl -s -o /tmp/cse_test.json -w '%{http_code}' \
  "https://www.googleapis.com/customsearch/v1?key=${CSE_KEY}&q=test")
echo "HTTP $CODE2"
head -c 300 /tmp/cse_test.json; echo

rm -f /tmp/places_test.json /tmp/cse_test.json /tmp/inject-discovery-keys.sh /tmp/verify-discovery-keys.sh

#!/bin/sh
# Usage: frontend/scripts/check-nginx.sh [base-url]  (stack must be running)
B=${1:-http://localhost:3000}; fail=0
chk() { # path expected_status header_regex
  out=$(curl -sI "$B$1"); st=$(echo "$out" | head -1 | awk '{print $2}')
  if [ "$st" != "$2" ] || { [ -n "$3" ] && ! echo "$out" | grep -qiE "$3"; }; then echo "FAIL $1 (status $st, want $2 / $3)"; fail=1; else echo "ok   $1 -> $st"; fi
}
chk / 200 'cache-control: no-cache'
chk /some/route 200 'cache-control: no-cache'
chk /index.html 200 'cache-control: no-cache'
chk /sw.js 200 'cache-control: no-cache'
chk /manifest.webmanifest 200 'content-type: application/manifest\+json'
chk /manifest.webmanifest 200 'cache-control: no-cache'
chk /missing.js 404
chk /registerSW.js 404
chk /foo.png 404
chk /assets/missing.png 404
for f in $(curl -s "$B/" | grep -oE '/assets/[^"]+\.(js|css)' | sort -u); do chk "$f" 200 'cache-control: public, max-age=31536000, immutable'; done
for f in $EXTRA_ASSETS; do chk "/assets/$f" 200 'cache-control: public, max-age=31536000, immutable'; done
# API proxy: routed paths answer, unknown /api paths 404 (needs the backends up)
D=00000000-0000-4000-8000-000000000001
api() { st=$(curl -s -o /dev/null -w '%{http_code}' "$B$2" -H "X-Device-Id: $D"); if [ "$st" = "$3" ]; then echo "ok   $1 $2 -> $st"; else echo "FAIL $1 $2 (status $st, want $3)"; fail=1; fi; }
api GET /api/settings 200
api GET /api/stats 200
api GET /api/nope 404
# rate limit: a burst from one IP must hit 429
n=$(for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}\n' "$B/api/settings" -H "X-Device-Id: $D"; done | grep -c 429)
if [ "$n" -gt 0 ]; then echo "ok   rate limit -> $n x 429"; else echo "FAIL rate limit never returned 429"; fail=1; fi
exit $fail

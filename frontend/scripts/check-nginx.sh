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
exit $fail

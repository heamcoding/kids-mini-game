#!/bin/sh
# Regenerate the self-hosted font subsets in src/fonts/ (run after adding new Korean text; fonts.test.ts tells you).
# Needs: node, npm, python3 (a throwaway venv with fonttools + brotli is created in a temp dir).
# Sources are the OFL-licensed TTFs from the @expo-google-fonts/* packages (same fonts Google Fonts serves).
set -e
cd "$(dirname "$0")/.."
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
node scripts/collectCharset.mjs > src/fonts/charset.txt
(cd "$T" && npm pack @expo-google-fonts/jua@0.4.1 @expo-google-fonts/noto-sans-kr@0.4.4 >/dev/null 2>&1 \
  && for f in *.tgz; do mkdir "${f%.tgz}" && tar xzf "$f" -C "${f%.tgz}"; done)
python3 -m venv "$T/venv" && "$T/venv/bin/pip" -q install fonttools brotli
sub() { # ttf out
  "$T/venv/bin/pyftsubset" "$1" --text-file=src/fonts/charset.txt --unicodes='U+0020-007E' \
    --flavor=woff2 --layout-features='*' --output-file="src/fonts/$2"
}
sub "$T"/expo-google-fonts-jua-*/package/400Regular/Jua_400Regular.ttf jua-400.woff2
for w in 400Regular:400 500Medium:500 700Bold:700; do
  sub "$T/expo-google-fonts-noto-sans-kr-0.4.4/package/${w%%:*}/NotoSansKR_${w%%:*}.ttf" "noto-sans-kr-${w##*:}.woff2"
done
cp "$T"/expo-google-fonts-jua-*/package/LICENSE_FONT src/fonts/OFL-Jua.txt
cp "$T"/expo-google-fonts-noto-sans-kr-*/package/LICENSE_FONT src/fonts/OFL-NotoSansKR.txt
ls -l src/fonts/*.woff2

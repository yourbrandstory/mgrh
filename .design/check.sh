#!/usr/bin/env bash
# usage: bash .design/check.sh mgrh_exact_design/pages/02-about-us.dc.html /about about
set -e
DESIGN="$1"; ROUTE="$2"; NAME="$3"
BASE="http://localhost:3000"
for W in 1440 1280; do
  node .design/signature.mjs file "$DESIGN" "$W" > ".design/sig-$NAME-d-$W.json" 2>/dev/null
  node .design/signature.mjs url "$BASE$ROUTE" "$W" > ".design/sig-$NAME-l-$W.json" 2>/dev/null
  echo "================ $NAME @ $W"
  python .design/cmp.py ".design/sig-$NAME-d-$W.json" ".design/sig-$NAME-l-$W.json"
done

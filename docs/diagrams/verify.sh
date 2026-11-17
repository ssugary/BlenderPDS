#!/usr/bin/env bash
# Confere todo nome de classe/interface dos classDiagrams contra o código real.
# Uso: docs/diagrams/verify.sh
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/docs/diagrams/src"
JAVA="$ROOT/framework/backend-starter/src/main/java $ROOT/apps/design-editor/backend/src/main/java"
TS="$ROOT/framework/core/src $ROOT/apps/design-editor/web/src $ROOT/framework/react-kit/src"

missing=0
checked=0

for diagram in "$SRC"/b*.mmd; do
    [ -e "$diagram" ] || continue
    names=$(grep -oE '^\s*class[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$diagram" | awk '{print $2}')
    names="$names $(grep -oE '[A-Za-z_][A-Za-z0-9_]*[[:space:]]*(<\|--|\.\.\|>|\*--|o--|-->|\.\.>|<-->)[[:space:]]*[A-Za-z_][A-Za-z0-9_]*' "$diagram" | sed -E 's/[[:space:]]*(<\|--|\.\.\|>|\*--|o--|-->|\.\.>|<-->)[[:space:]]*.*//')"
    names="$names $(grep -oE '(<\||\.\.|--|o--|-->|\.\.>)[[:space:]]*[A-Za-z_][A-Za-z0-9_]*' "$diagram" | sed -E 's/.*[[:space:]]//')"
    for name in $(echo "$names" | tr ' ' '\n' | sort -u); do
        case "$name" in ''|class|direction|classDef|cssClass|note|for) continue;; esac
        checked=$((checked + 1))
        found=$(grep -rEl "(class|interface|enum|record)[[:space:]]+$name([[:space:]<{]|$)" $JAVA 2>/dev/null | head -1)
        if [ -z "$found" ]; then
            found=$(grep -rEl "(export[[:space:]]+)?(abstract[[:space:]]+)?(class|interface|type)[[:space:]]+$name\b|(export[[:space:]]+)?const[[:space:]]+$name\b" $TS 2>/dev/null | head -1)
        fi
        if [ -z "$found" ]; then
            echo "NAO EXISTE: $name  (em $(basename "$diagram"))"
            missing=$((missing + 1))
        fi
    done
done

echo "Nomes verificados: $checked"
echo "Nomes inexistentes: $missing"
[ "$missing" -eq 0 ]

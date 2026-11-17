#!/usr/bin/env bash
# The framework must not know a single domain operation kind (P1.6): kinds are beans
# registered by the application. Test sources are excluded on purpose — fixtures such as
# the starter's TestKindsConfiguration exist to exercise the protocol.
set -euo pipefail

cd "$(dirname "$0")/.."

if grep -RInE "add_object|remove_object|set_transform|change_color|mesh_edit" framework/ \
        --include=*.java --include=*.ts \
        --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=test --exclude-dir=target; then
    echo "ERRO: literal de kind de domínio encontrado em framework/" >&2
    exit 1
fi

echo "ok: nenhum literal de kind de domínio em framework/"

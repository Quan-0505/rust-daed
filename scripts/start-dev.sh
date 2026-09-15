#!/bin/bash
set -e

mkdir -p /var/lib/daed

# Find installed binary
DAED_BIN="/usr/bin/daed"
DAED_CONF="/etc/daed"
DAED_WEB="/usr/share/daed/web"

if [ ! -f "$DAED_BIN" ]; then
  DAED_BIN="/opt/daed/usr/bin/daed"
  DAED_CONF="/var/lib/daed"
  DAED_WEB="/opt/daed/usr/share/daed/web"
  if [ ! -f "$DAED_BIN" ]; then
    echo "[start-dev] Extracting rust-daed-x86.apk to /opt/daed..."
    mkdir -p /opt/daed
    if [ -f /tmp/pkg/rust-daed-x86.apk ]; then
      tar -zxvf /tmp/pkg/rust-daed-x86.apk -C /opt/daed > /dev/null
    fi
  fi
fi

mkdir -p "$DAED_CONF"

# Ensure daed daemon running on 127.0.0.1:2023
if ! pgrep -f "daed run" > /dev/null; then
  echo "[start-dev] Launching daed daemon ($DAED_BIN on 127.0.0.1:2023)..."
  "$DAED_BIN" run -c "$DAED_CONF" --listen 127.0.0.1:2023 --web-root "$DAED_WEB" > /var/log/daed.log 2>&1 &
  sleep 1
fi

echo "[start-dev] Starting Vite dev server on 0.0.0.0:3000..."
exec npx vite --host 0.0.0.0 --port 3000

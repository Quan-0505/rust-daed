#!/usr/bin/env bash
set -euo pipefail
# Build real CPU variants and original APKs. APK v3 conversion uses the SDK workflow.
exec bash "$(dirname "$0")/build-release.sh" "${1:?Pass a new absolute output directory}"

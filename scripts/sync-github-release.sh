#!/usr/bin/env bash
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
version=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["version"])' "$repo/source/upstream.json")
tag="v$version"
assets=${1:?Pass the build output assets directory}
# Keep incomplete uploads in a draft until all SDK conversions and checks pass.
gh release view "$tag" --repo Quan-0505/rust-daed >/dev/null 2>&1 || \
 gh release create "$tag" --repo Quan-0505/rust-daed --draft --title "Rust daed $version" --notes-file "$repo/source/UPSTREAM-20261016.md"
for name in rust-daed-r2s.apk rust-daed-r3s.apk rust-daed-r4s.apk rust-daed-x86.apk \
 "rust-daed_${version}-linux-x86_64_v2_sse.deb" "rust-daed_${version}-linux-x86_64_v3_avx2.deb"; do
 test -s "$assets/$name"
 gh release upload "$tag" "$assets/$name" --repo Quan-0505/rust-daed
 done
gh workflow run repack-apk-v3.yml --repo Quan-0505/rust-daed -f tag="$tag" -f version="$version" -f release=25.12

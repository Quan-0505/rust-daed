#!/usr/bin/env bash
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath -m "$1")
version=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["version"])' "$repo/source/upstream.json")
ui=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["ui"]["revision"][:12])' "$repo/source/upstream.json")
core=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["core"]["revision"][:12])' "$repo/source/upstream.json")
export PATH="$HOME/.cargo/bin:/usr/local/go/bin:$PATH"
export CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-2}
export CARGO_PROFILE_RELEASE_LTO=false
export CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1
mkdir -p "$out/bin" "$out/geo"
python3 "$repo/scripts/prepare-sources.py" "$out/ui"
ui="$out/ui"
pnpm --dir "$ui" install --frozen-lockfile
pnpm --dir "$ui" build --filter daed
pnpm --dir "$ui" --filter daed check-types
cp -a "$ui/apps/web/dist" "$out/web"
cd "$ui/DaeNext"
cargo fetch --locked
export DAE_DAEMON_VERSION="daed rust-native product version=v$version ui=dc4af0e4d9e8 core=f40c3494c776+sticky features=native-ebpf,jemalloc,boringssl profile=release,lto-off"
cache=${RUST_RELEASE_CACHE:-/build/rust-daed-$version}
for level in v2 v3; do
  DAE_DAEMON_VERSION="daed rust-native product version=v$version ui=$ui core=$core+sticky+sipa-rawip features=native-ebpf,jemalloc,boringssl profile=release,lto-off" \
  CARGO_TARGET_DIR="$cache-$level" RUSTFLAGS="-C target-feature=+crt-static -C target-cpu=x86-64-$level" \
    cargo build --locked --release -p dae-daemon --bin daed --target x86_64-unknown-linux-gnu
  cp "$cache-$level/x86_64-unknown-linux-gnu/release/daed" "$out/bin/daed-amd64-$level"
done
  DAE_DAEMON_VERSION="daed rust-native product version=v$version ui=$ui core=$core+sticky+sipa-rawip features=native-ebpf,jemalloc,boringssl profile=release,lto-off" \
  CARGO_TARGET_DIR="$cache-arm64" RUSTFLAGS='-C target-feature=+crt-static -C target-cpu=generic' \
  CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc \
  CC_aarch64_unknown_linux_gnu=aarch64-linux-gnu-gcc CXX_aarch64_unknown_linux_gnu=aarch64-linux-gnu-g++ \
  AR_aarch64_unknown_linux_gnu=aarch64-linux-gnu-ar \
  cargo build --locked --release -p dae-daemon --bin daed --target aarch64-unknown-linux-gnu
cp "$cache-arm64/aarch64-unknown-linux-gnu/release/daed" "$out/bin/daed-arm64"
for kind in geoip geosite; do
  curl -fLsS --connect-timeout 15 --max-time 120 --retry 2 "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/$kind.dat" -o "$out/geo/$kind.dat" || \
    curl -fLsS --connect-timeout 15 --max-time 120 --retry 2 "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/$kind.dat" -o "$out/geo/$kind.dat"
done
file "$out"/bin/*
"$out/bin/daed-amd64-v2" --version
python3 "$repo/scripts/package-release.py" "$out" "$version"

#!/usr/bin/env bash
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath "$1")
version=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["version"])' "$repo/source/upstream.json")
ui=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["ui"]["revision"][:12])' "$repo/source/upstream.json")
core=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["core"]["revision"][:12])' "$repo/source/upstream.json")
cache=${RUST_RELEASE_CACHE:-/build/rust-daed-$version}
export PATH="$HOME/.cargo/bin:/usr/local/bin:$PATH"
export CARGO_TARGET_DIR="$cache-v2" CARGO_BUILD_JOBS=1
export CARGO_PROFILE_RELEASE_LTO=false CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1
export RUSTFLAGS='-C target-feature=+crt-static -C target-cpu=x86-64-v2'
export DAE_DAEMON_VERSION="daed rust-native product version=v$version ui=$ui core=$core+sticky+sipa-rawip features=native-ebpf,jemalloc,boringssl profile=release,lto-off"
pnpm --dir "$out/ui" --filter daed exec vitest run src/apis/resources/logs_query.test.ts --maxWorkers=1
export RUST_RELEASE_OUTPUT="$out" RUST_RELEASE_REPO="$repo"
# No production data or network namespace is used by runtime/API tests.
unshare --mount --net --fork bash -ec '
 mount --make-rprivate /
 mount -t tmpfs tmpfs /run/netns
 mount -t bpf bpf /sys/fs/bpf
 ip link set lo up
 cd "$RUST_RELEASE_OUTPUT/ui/DaeNext"
 cargo test --locked --offline --release --target x86_64-unknown-linux-gnu -p dae-outbound-core --lib
 cargo test --locked --offline --release --target x86_64-unknown-linux-gnu -p dae-daemon --test service_contract --test daed_product --test reload_owner_handoff -- --test-threads=1
 python3 "$RUST_RELEASE_REPO/scripts/validate-api.py" --binary "$RUST_RELEASE_OUTPUT/bin/daed-amd64-v2" --web "$RUST_RELEASE_OUTPUT/web" --report "$RUST_RELEASE_OUTPUT/api-report.json"
'

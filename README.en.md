# rust-daed

Rust-native daed with sticky-ip, pinned DaedNext UI and DaeNext engine.

[简体中文](README.md) · [Releases](https://github.com/Quan-0505/rust-daed/releases/latest)

[Version 3.2.2](https://github.com/Quan-0505/rust-daed/releases/tag/v3.2.2) pins UI `76ad4577501b` and DaeNext `d0c477e62617`, including listener publication and socket ownership continuity fixes. Sticky-ip, SIPA RAWIP and BPF LPM retry compatibility are retained.

The full Linux build passed. Three Debian amd64 hosts passed live deployment validation, including an existing Rust upgrade and two Go KDAE migrations: preserved account/configuration state, service restart and readiness, reload requests, web assets, UDP/TCP DNS and real HTTPS forwarding. ARM64 packages were cross-built and package-verified; ARM64 hardware acceptance is not claimed.

For Go migration, use a separate Rust state directory and preserve the Go database. After stopping the old daemon and verifying ownership, remove its leftover `dae0`/`daens` runtime objects before Rust starts. Keep explicit config/state paths in the systemd override for future upgrades.

Production builds retain the upstream default native Aya/eBPF, jemalloc and BoringSSL features. The real upstream UI is installed under `/usr/share/daed/web`; the development mock dashboard at this repository root is not shipped.

Two Debian packages use separately compiled x86-64-v2 and x86-64-v3 binaries. Four canonical OpenWrt 25.12 APKs are actual SDK-built APK v3; `*-v2.apk` files preserve the original format for matching APK v2 systems. No tar archive is relabelled as v3.

The service listens on port 2023 and stores private state under `/etc/daed`. Go KDAE and Rust daed share program paths/ports and cannot run together. Back up your own state before switching. Linux BTF, TC/eBPF, veth and complete `ip`/`tc` tools are required.

Build on Linux with stable Rust, nightly/rust-src, bpf-linker, clang/LLVM/libelf, CMake, Perl, pkg-config, C/C++ and ARM64 cross compilers, Node.js 24, pnpm 10.24, Python 3, curl and dpkg-deb:

```sh
bash scripts/build-release.sh /absolute/path/to/new-output-directory
# Optional validation; requires root / namespace privileges.
bash scripts/test-release.sh /absolute/path/to/new-output-directory
```

`source/upstream.json` pins source commits, patch hashes and CPU baselines. Source preparation refuses an existing destination. Builds use two jobs, static CRT, one codegen unit and LTO disabled. The Linux CI build validates all package payloads; the SDK workflow converts canonical APK assets to v3. Only public source, web assets and geodata are packaged; no accounts, subscriptions, nodes, passwords, tokens, databases or device backups are included. See [LICENSE](LICENSE).

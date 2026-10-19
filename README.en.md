# rust-daed

Rust-native daed with sticky-ip, pinned DaedNext UI and DaeNext engine.

[简体中文](README.md) · [Releases](https://github.com/Quan-0505/rust-daed/releases/latest)

Version 3.2.1 keeps the UI `dc4af0e4d9e8` and core `f40c3494c776` pinned by v3.2.0, and adds an eBPF parser adjustment for ZTE SIPA RAWIP WAN egress plus more resilient BPF LPM route-map population under transient memory pressure. The first E5 ARM64 candidate passed 10 daemon restarts and 3 OpenWrt soft reboots, retaining 15 NodeBabyLink routes and restoring HTTPS access; one restart needed about 15 seconds for proxy egress to recover. F50 hardware has not been validated. See the [v3.2.1 release notes](https://github.com/Quan-0505/rust-daed/releases/tag/v3.2.1).

Production builds retain the upstream default native Aya/eBPF, jemalloc and BoringSSL features. The real upstream UI is installed under `/usr/share/daed/web`; the development mock dashboard at this repository root is not shipped.

Two Debian packages use separately compiled x86-64-v2 and x86-64-v3 binaries. Four canonical OpenWrt 25.12 APKs are actual SDK-built APK v3; `*-v2.apk` files preserve the original format for matching APK v2 systems. No tar archive is relabelled as v3.

The service listens on port 2023 and stores private state under `/etc/daed`. Go KDAE and Rust daed share program paths/ports and cannot run together. Back up your own state before switching. Linux BTF, TC/eBPF, veth and complete `ip`/`tc` tools are required.

Build on Linux with stable Rust, nightly/rust-src, bpf-linker, clang/LLVM/libelf, CMake, Perl, pkg-config, C/C++ and ARM64 cross compilers, Node.js 24, pnpm 10.24, Python 3, curl and dpkg-deb:

```sh
bash scripts/build-release.sh /absolute/path/to/new-output-directory
# Optional validation; requires root / namespace privileges.
bash scripts/test-release.sh /absolute/path/to/new-output-directory
```

`source/upstream.json` pins source commits, patch hash and CPU baselines. Source preparation refuses an existing destination. Builds use two jobs, static CRT, one codegen unit and LTO disabled. The SDK workflow converts canonical APK assets to v3 while archiving the originals. Only public source, web assets and geodata are packaged; no accounts, subscriptions, nodes, passwords, tokens, databases or device backups are included. See [LICENSE](LICENSE).

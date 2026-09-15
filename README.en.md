<div align="center">

# rust-daed

**daed (DaedNext, Rust-native) all-in-one transparent proxy installer package · with sticky-ip enhancements**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v3.1.2-orange.svg)](https://github.com/Quan-0505/rust-daed/releases/tag/v3.1.2)

Tracks the upstream mainline (latest DaedNext/DaeNext) + deep **sticky-ip** customization. Built on [DaedNext](https://github.com/ksong008/DaedNext) (the Rust version of the daed Web) + [DaeNext](https://github.com/ksong008/DaeNext) (the Rust-native dae engine) + [Aya](https://github.com/aya-rs/aya) (pure-Rust eBPF), it ports and integrates the **sticky-ip** smart connection pinning and DNS-drift prevention mechanism.

</div>

**English** &nbsp;|&nbsp; **[简体中文](./README.md)**

---

## ✨ Features

- 🖥 **daed Web panel**: deep integration of the official front-end static assets, driving the native daemon (`:2023`) through the GraphQL / REST API
- 🦀 **Full-stack pure-Rust native engine**: dae-daemon, data-path scheduling, the DNS module and the eBPF loader are all Rust (Aya + nightly)
- 📌 **sticky-ip smart connection pinning**: intelligently pins the resolved IP of a node domain within its TTL, eliminating the frequent reconnects caused by DNS dynamic-resolution drift (ported from kdae, fully covered by 4 unit tests)
- 🔄 **Seamless reload generation switch**: the GenerationSwap hot-swap mechanism keeps existing connections from being dropped during configuration hot reloads
- ⚡ **resident user-space data plane**: a deeply tuned high-concurrency asynchronous TCP/UDP stack and memory allocator, dramatically cutting small-packet latency on soft routers
- 🔐 **BoringSSL / AWS-LC TLS stack**: native support for modern cipher suites, with integrated post-quantum cryptography (PQXDH / Kyber) hardening
- 🛡️ **Dual package-format support**: fully compatible with OpenWrt 25.12+ (apk v3), legacy OpenWrt 24.x/23.x (apk v2) and Debian/Ubuntu (deb)

## ⚡ Latest features and evolution of the DaedNext / Rust native engine

Compared with the original upstream architecture, the **Rust native engine** deeply integrated into this project includes a large number of optimizations purpose-built for high-performance gateways and soft routers:

| Module | Key evolution and optimization features |
|---|---|
| **Kernel and Aya eBPF data plane** | • Uses pure Rust (the Aya framework) to drive eBPF bytecode loading and kernel Map mapping, with no external C/LLVM runtime dependency<br>• The kernel data plane drops its bitfields dependency and adopts single-writer response binding, making the packet-loss state fully observable<br>• tproxy drop-event peak shaving and rate limiting plus monotonic nanosecond timestamp protection eliminate race-condition packet loss at the `fast_sock` stage under bursty high-concurrency traffic |
| **Sticky-IP pinning mechanism** | • Intercepts the domain names resolved by outbound protocols and automatically writes the preferred IP into a thread-safe, high-efficiency cache pool (default 300s TTL)<br>• Degrades gracefully to a fallback IP on network failure and self-heals by resetting once the network recovers, thoroughly solving the session interruptions caused by CDN scheduling<br>• Fully covers every transport layer of `dae-outbound-stream` (Shadowsocks 2022, gRPC, Mux, XHTTP, Reality, Meek, etc.) |
| **Seamless generation reload (GenerationSwap)** | • When the routing generation changes, existing live flows are automatically kept alive gracefully and seamlessly until the session terminates naturally<br>• New flows switch seamlessly to the latest generation's configuration and node-group routing rules, eliminating the global momentary outage caused by traditional service restarts |
| **DNS engine and RFC compliance hardening** | • Strictly enforces `ipversion_prefer` (IPv4 / IPv6 preference policy) on every distribution path, preventing unintended IPv6 route detours<br>• Fully implements the **RFC 2308 negative caching** specification, whole-message TTL, and CNAME-only NODATA classification<br>• Improves the asynchronous reclamation of multiplexed DoQ (DNS-over-QUIC) / DoH connections, avoiding connection-resource leaks |
| **User-space resident and memory architecture** | • A zero-copy scheduling design optimized for embedded router environments, greatly reducing lock contention from context switches across CPU cores<br>• Resident set size is significantly lower than comparable implementations, with no fragmentation growth under long-term high load |

## 📦 Installer package selection and release assets (Release Assets)

This project provides prebuilt binary installer packages for all architectures, covering modern/generic x86_64 CPUs and various soft-router devices (such as NanoPi R2S/R3S/R4S, x86_64):
- **Debian / Ubuntu / PVE**: provides `deb` packages (with a built-in systemd unit file; both a generic SSE4.2 build and an AVX2-optimized build are available).
- **OpenWrt 25.12+**: provides standard `apk v3` packages (based on apk-tools 3.x / the ADB container format).
- **OpenWrt 24.x / 23.x / Alpine**: provides legacy `apk v2` packages (traditional tar format).

You can go straight to the [Releases page](https://github.com/Quan-0505/rust-daed/releases) to obtain the separately compiled artifacts for each architecture.

## 🚀 Quick start

```sh
# Debian / Ubuntu (standard amd64 SSE4.2 generic / AVX2 optimized)
sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v2_sse.deb
# or install the AVX2 build for modern CPUs:
# sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v3_avx2.deb
sudo systemctl enable --now daed

# OpenWrt 25.12+ (apk v3 / apk-tools 3.x)
apk add --allow-untrusted ./rust-daed_3.1.2-<device>-v3.apk

# OpenWrt 24.x / 23.x / Alpine (apk v2 legacy tar package)
apk add --allow-untrusted ./rust-daed_3.1.2-<device>-v2.apk

# enable and start the service
/etc/init.d/daed enable && /etc/init.d/daed start

# open the Web admin panel
http://<router-IP>:2023
```

## 📋 System requirements

x86_64 / aarch64 Linux, kernel ≥ 5.8 with **BTF** enabled (`CONFIG_DEBUG_INFO_BTF=y`); `iproute2 ≥ 6.7`; root privileges.
dae's eBPF data plane additionally requires the kernel to have **veth** and **clsact** enabled (`NET_SCH_INGRESS` / `NET_CLS_ACT` / `NET_CLS_BPF`), and needs the host tools `tc` / `bpftool` / `ipset` (on OpenWrt these can be installed with `apk add tc-full bpftool-minimal ip-full ipset`).

⚠️ **BTF is a shared prerequisite for both**: the Go version ([daed-kdae](https://github.com/Quan-0505/daed-kdae)) and the Rust version ([rust-daed](https://github.com/Quan-0505/rust-daed)) both depend on kernel BTF symbols and the veth/clsact features. Most official OpenWrt firmware does not enable `CONFIG_DEBUG_INFO_BTF` by default, and on such firmware neither of them can start — you must compile the kernel yourself or use firmware that already enables it, [Quan-0505/OpenWrt](https://github.com/Quan-0505/OpenWrt) (which ships with BTF, veth, clsact and a complete low-level toolchain built in).

### ⚠️ Choosing a package format (apk v3 for OpenWrt 25.12, apk v2 for legacy environments)

Starting with **OpenWrt 25.12, apk-tools 3.x is used** and the package format is upgraded to **apk v3** (ADB container: the file begins with the `ADB` magic; it is neither tar nor gzip, so an error when unpacking it with the traditional `tar` or apk2 tools is expected behavior). Legacy systems (24.x, 23.x, Alpine, etc.) instead use the traditional tar-format **apk v2**. This release provides packages strictly according to the format specification:

```sh
# OpenWrt 25.12+ (apk v3)
scp rust-daed_3.1.2-R4S-v3.apk root@192.168.2.1:/tmp/
ssh root@192.168.2.1 'apk add --allow-untrusted /tmp/rust-daed_3.1.2-R4S-v3.apk'

# OpenWrt 24.x / 23.x / Alpine (apk v2)
scp rust-daed_3.1.2-R2S-v2.apk root@192.168.2.1:/tmp/
ssh root@192.168.2.1 'apk add --allow-untrusted /tmp/rust-daed_3.1.2-R2S-v2.apk'
```

| Target environment | Package manager | Recommended package |
|---|---|---|
| OpenWrt 25.12+ (apk-tools 3) | `apk` | ✅ `rust-daed_3.1.2-<device>-v3.apk` (apk v3, ADB container format) |
| OpenWrt 24.x / 23.x / Alpine | `apk` | ✅ `rust-daed_3.1.2-<device>-v2.apk` (apk v2, traditional tar format) |
| Debian / Ubuntu / PVE host | `dpkg` | ✅ `rust-daed_3.1.2-linux-x86_64_v2_sse.deb` / `_v3_avx2.deb` |

Verified on real hardware (NanoPi R4S / OpenWrt 25.12.5 / apk-tools 3.0.5 / `aarch64_generic`):

```text
(1/1) Upgrading daed (3.1.0-r2 -> 3.1.2-r1)
  Executing daed-3.1.2-r1.post-upgrade
OK: 144.5 MiB in 305 packages
```

Repackaging is handled by the repository's `workflow_dispatch` workflow **Repack apk as OpenWrt 25.12 (apk v3)** (it repackages with apk-tools 3 from the OpenWrt 25.12 SDK and rewrites the v2 script hooks into OpenWrt's `postinst`/`prerm`) — just rerun it once whenever you upgrade the upstream binaries.

> Note: this package and [daed-kdae](https://github.com/Quan-0505/daed-kdae) (the Go-engine version) provide the same `/usr/bin/daed` and `/etc/init.d/daed`, so **you can install only one of the two**; whichever is installed later overwrites the earlier one.

## 🔧 Source code and patches (sticky-ip)

The upstream ksong008/DaeNext is split into three core outbound crates. The sticky module lives in the low-level shared crate (`dae-outbound-core`), and the upper-layer transport protocols (`dae-outbound-stream`) all establish connections through `sticky_connect`:

| File | Description |
|---|---|
| `patches/sticky-ip-full.patch` | Complete patch (git apply; covers 8 modified source files) |
| `patches/APPLY-STICKY.md` | Patch integration steps and unit-test verification guidance |
| `source/sticky.rs` | Standalone source implementation of the sticky module (including 4 unit tests) |

Commands to apply and verify:

```sh
cd DaeNext && git apply patches/sticky-ip-full.patch
cargo test -p dae-outbound sticky::tests   # 4/4 tests pass
```

## 📂 Repository contents

| Directory / file | Description |
|---|---|
| `patches/` | ★ Complete sticky-ip source patch (8 files) and application guide |
| `source/` | Standalone sticky module (including the source of its 4 unit tests) |
| `scripts/` | Container startup control scripts, APK auto-packaging and environment adaptation tools |
| `src/` | Interactive debugging workbench front-end project (React + Tailwind + Lucide) |
| `README.md` | Main project documentation (format follows daed-kdae) |

## 📄 License

[GNU Affero General Public License v3.0](LICENSE). Upstream DaedNext / DaeNext are MIT/AGPL-3.0, and sticky-ip is ported from the AGPL-3.0-licensed [olicesx/outbound](https://github.com/olicesx/outbound).

---
*For the Go version (kdae engine), see [daed-kdae](https://github.com/Quan-0505/daed-kdae).*

<div align="center">

# rust-daed

**daed（DaedNext，Rust 原生）透明代理安装包 · 含 sticky-ip 增强**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v3.1.1--sticky-orange.svg)](https://github.com/Quan-0505/rust-daed/releases/tag/v3.1.1-sticky)

基于 [DaedNext](https://github.com/ksong008/DaedNext)（Rust 版 daed）+ [DaeNext](https://github.com/ksong008/DaeNext)（Rust 原生 dae 引擎），移植 **sticky-ip** 特性。

</div>

---

## ✨ 特性

- 🦀 **Rust 原生引擎**：dae-daemon / datapath / DNS / eBPF 全 Rust（Aya + nightly）
- 📌 **sticky-ip**：节点域名 TTL 内固定解析 IP，防 DNS 漂移（移植自 kdae，4 单测覆盖）
- ⚡ **resident 用户态数据面**：TCP/UDP 栈 + 内存分配器可调优
- 🔄 **reload 保留存量连接**（GenerationSwap 不断流）
- 🔐 **boringssl** TLS 栈（含后量子密码补丁）

## 📦 安装包（[v3.1.1-sticky Release](https://github.com/Quan-0505/rust-daed/releases/tag/v3.1.1-sticky)，deb + apk 统一发布）

| 平台 / 设备 | 文件 | 架构 |
|---|---|---|
| Debian/Ubuntu x86_64 | `rust-daed-x86.deb` | amd64 |
| OpenWrt X86 软路由 | `rust-daed-x86.apk` | x86_64 |
| NanoPi R4S | `rust-daed-r4s.apk` | aarch64_cortex-a72 |
| NanoPi R3S | `rust-daed-r3s.apk` | aarch64_cortex-a53 |
| NanoPi R2S | `rust-daed-r2s.apk` | aarch64_cortex-a53 |

## 🚀 快速开始

```sh
# Debian / Ubuntu
sudo dpkg -i rust-daed-x86.deb
# OpenWrt 25.12（apk v3 / apk-tools 3）
apk add --allow-untrusted ./rust-daed-<设备>.apk
/etc/init.d/daed enable && /etc/init.d/daed start
# Web 面板: http://<机器IP>:2023
```

## 📋 系统要求

x86_64 / aarch64 Linux，内核 ≥ 5.8 且启用 **BTF**；root 权限。

dae 的 eBPF 数据面还要求内核开启 **veth**、**clsact**（`NET_SCH_INGRESS` / `NET_CLS_ACT` / `NET_CLS_BPF`），
并需要宿主工具 `tc` / `bpftool` / `ipset`（OpenWrt 上：`apk add tc-full bpftool-minimal ip-full ipset`）。

### ⚠️ 包格式兼容性（重要）

OpenWrt **25.12 起使用 apk-tools 3.x**，包格式为 **apk v3**（ADB 容器；既不是 tar 也不是 gzip，用 `tar`/apk2 工具打不开是正常的）。

本 Release 中现有的 `rust-daed-*.apk` 是 **apk v2 格式**，在 apk-tools 3 上安装会直接报错：

```text
ERROR: ./rust-daed-r4s.apk: v2 package format error
```

| 目标环境 | 包管理 | 可用产物 |
|---|---|---|
| OpenWrt 25.12（apk-tools 3） | `apk` | ❌ 现有 apk 为 v2，需等待 **v3 重打包**；可先用内置 daed 的固件 [Quan-0505/OpenWrt](https://github.com/Quan-0505/OpenWrt) |
| Debian / Ubuntu | `dpkg` | ✅ `rust-daed-x86.deb` |
| Alpine / apk-tools 2.x 环境 | `apk` | ✅ 现有 `rust-daed-*.apk` |

## 🔧 源码补丁（sticky-ip）

| 文件 | 说明 |
|---|---|
| `patches/sticky-ip-full.patch` | 完整补丁（git apply，8 文件） |
| `patches/APPLY-STICKY.md` | 应用与验证说明 |
| `source/sticky.rs` | sticky 模块源码（含 4 单测） |

```sh
cd DaeNext && git apply patches/sticky-ip-full.patch
cargo test -p dae-outbound sticky::tests   # 4/4 通过
```

## 📄 许可

[GNU Affero General Public License v3.0](LICENSE)。上游 DaedNext MIT/AGPL-3.0，sticky-ip 移植自 AGPL-3.0 的 [olicesx/outbound](https://github.com/olicesx/outbound)。

---
*Go 版（kdae 引擎）见 [daed-kdae](https://github.com/Quan-0505/daed-kdae)。*
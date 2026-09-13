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

### ⚠️ 包格式（OpenWrt 25.12 用 apk v3）

OpenWrt **25.12 起使用 apk-tools 3.x**，包格式为 **apk v3**（ADB 容器：文件头为 `ADB`；既不是 tar 也不是 gzip，用 `tar`/apk2 工具打不开是正常的）。

本 Release 的 `rust-daed-r2s/r3s/r4s/x86.apk` 已重打包为 **apk v3**，可直接安装：

```sh
scp rust-daed-r4s.apk root@192.168.2.1:/tmp/
ssh root@192.168.2.1 'apk add --allow-untrusted /tmp/rust-daed-r4s.apk'
```

| 目标环境 | 包管理 | 用哪个文件 |
|---|---|---|
| OpenWrt 25.12+（apk-tools 3） | `apk` | ✅ `rust-daed-<device>.apk`（apk v3，架构 `aarch64_generic` / `x86_64`） |
| Alpine 或 apk-tools 2.x 旧环境 | `apk` | `rust-daed-<device>-v2.apk`（保留的 v2 原件） |
| Debian / Ubuntu | `dpkg` | ✅ `rust-daed-x86.deb` |

已在真机验证（NanoPi R4S / OpenWrt 25.12.5 / apk-tools 3.0.5 / `aarch64_generic`）：

```text
(1/1) Upgrading daed (3.1.0-r2 -> 3.1.1-r1)
  Executing daed-3.1.1-r1.post-upgrade
OK: 144.5 MiB in 305 packages
```

重打包由仓库内 `workflow_dispatch` 流程 **Repack apk as OpenWrt 25.12 (apk v3)** 完成（用 OpenWrt 25.12 SDK 的 apk-tools 3 重新打包，v2 的脚本钩子改写成 OpenWrt 的 `postinst`/`prerm`）——升级上游二进制时重跑一次即可。

> 注意：本包与 [daed-kdae](https://github.com/Quan-0505/daed-kdae)（Go 引擎版）提供相同的 `/usr/bin/daed` 与 `/etc/init.d/daed`，**两者只能装一个**，后装的会覆盖先装的。

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

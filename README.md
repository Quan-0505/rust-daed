<div align="center">

# rust-daed

**daed（DaedNext，Rust 原生）一体式透明代理安装包 · 含 sticky-ip 增强**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v3.1.2-orange.svg)](https://github.com/Quan-0505/rust-daed/releases/tag/v3.1.2)

跟随上游主线（DaedNext/DaeNext 最新）+ **sticky-ip** 深度定制。基于 [DaedNext](https://github.com/ksong008/DaedNext)（Rust 版 daed Web）+ [DaeNext](https://github.com/ksong008/DaeNext)（Rust 原生 dae 引擎）+ [Aya](https://github.com/aya-rs/aya)（纯 Rust eBPF），移植并集成了 **sticky-ip** 智能连接锁定与防 DNS 漂移机制。

</div>

---

## ✨ 特性

- 🖥 **daed Web 面板**：官方前端静态资源深度整合，通过 GraphQL / REST API 驱动原生守护进程（`:2023`）
- 🦀 **全栈纯 Rust 原生引擎**：dae-daemon、数据路径调度、DNS 模块及 eBPF 载入器全 Rust（Aya + nightly）
- 📌 **sticky-ip 智能连接锁定**：节点域名在 TTL 内智能固定解析 IP，根治 DNS 动态解析漂移引发的频繁重连（移植自 kdae，4 单测全覆盖）
- 🔄 **reload 平滑代际切换**：GenerationSwap 热替换机制，在配置热重载时保障存量连接不断流
- ⚡ **resident 用户态数据面**：高并发异步 TCP/UDP 协议栈与内存分配器深度调优，极大削减软路由小包延迟
- 🔐 **BoringSSL / AWS-LC TLS 栈**：原生支持现代加密套件，支持集成后量子密码（PQXDH / Kyber）加固特性
- 🛡️ **双包格式支持**：全面兼容 OpenWrt 25.12+ (apk v3) 与传统 OpenWrt 24.x/23.x (apk v2) 及 Debian/Ubuntu (deb)

## ⚡ DaedNext / Rust 原生引擎最新特性与演进

相比上游原始架构，本项目深度整合的 **Rust 原生引擎** 包含大量专为高性能网关和软路由定制的深度优化：

| 模块 | 关键演进与优化特性 |
|---|---|
| **内核与 Aya eBPF 数据面** | • 采用纯 Rust（Aya 框架）驱动 eBPF 字节码加载与内核 Map 映射，无外部 C/LLVM 运行时依赖<br>• 内核数据面去除 bitfields 位域依赖，采用单写者（single-writer）应答绑定，丢包状态完全可观测<br>• tproxy 丢弃事件削峰限速与单调纳秒级时间戳保护，杜绝突发高并发流量在 `fast_sock` 阶段竞态丢包 |
| **Sticky-IP 锁定机制** | • 拦截出站协议解析域名，首选 IP 自动写入线程安全的高效缓存池（默认 300s TTL）<br>• 遇网络故障时优雅降级并回退备用 IP，网络恢复后自愈重置，彻底解决因 CDN 调度导致的会话中断<br>• 全面覆盖 `dae-outbound-stream` 的全部传输层（Shadowsocks 2022, gRPC, Mux, XHTTP, Reality, Meek 等） |
| **平滑代际重载 (GenerationSwap)** | • 路由代际（routing generation）变更时，自动对现有活跃连接（live flows）执行优雅平滑保持直至会话自然终止<br>• 新建流无缝切换至最新代际配置与节点组分流规则，消除传统重启服务造成的全局瞬时断网 |
| **DNS 引擎与 RFC 规范强化** | • 严格在所有分发路径执行 `ipversion_prefer`（IPv4 / IPv6 偏好策略），防止非预期 IPv6 路由绕行<br>• 完整实现 **RFC 2308 否定缓存**（Negative Caching）规范、全消息 TTL 与 CNAME-only NODATA 规范分类<br>• 完善 DoQ (DNS-over-QUIC) / DoH 多路复用连接异步回收机制，规避连接资源泄露 |
| **用户态 resident 与内存架构** | • 专为嵌入式路由器环境优化的零拷贝调度设计，大幅削减跨 CPU 核心上下文切换的锁竞争<br>• 内存驻留体积（Resident Set Size）显著低于同类实现，长期高负载运行不发生碎片化膨胀 |

## 📦 安装包选型与发布资产列表 (Release Assets)

参考 [daed-kdae Releases](https://github.com/Quan-0505/daed-kdae/releases/tag/v2.2.2-kdae) 统一发行规范，提供针对现代与老旧 x86_64 CPU，以及各版本 OpenWrt 硬件架构的全量发行资产（Assets）：

### 🎯 硬件与平台选型矩阵

| 平台 / 设备 | OpenWrt 25.12+ (apk v3) | OpenWrt 24.x/23.x/Alpine (apk v2) | Debian / Ubuntu (deb) | 架构与指令集 |
|---|---|---|---|---|
| **Debian / Ubuntu x86_64 (SSE4.2)** | - | - | `rust-daed_3.1.2-linux-x86_64_v2_sse.deb` | x86_64 (老旧 CPU 通用) |
| **Debian / Ubuntu x86_64 (AVX2)** | - | - | `rust-daed_3.1.2-linux-x86_64_v3_avx2.deb` | x86_64 (Intel 4代+ / AMD Zen+) |
| **OpenWrt x86_64 软路由** | `rust-daed_3.1.2-x86_64-v3.apk` | `rust-daed_3.1.2-x86_64-v2.apk` | - | x86_64 |
| **NanoPi R4S** | `rust-daed_3.1.2-R4S-v3.apk` | `rust-daed_3.1.2-R4S-v2.apk` | - | aarch64_generic (RK3399) |
| **NanoPi R3S** | `rust-daed_3.1.2-R3S-v3.apk` | `rust-daed_3.1.2-R3S-v2.apk` | - | aarch64_generic (RK3566) |
| **NanoPi R2S** | `rust-daed_3.1.2-R2S-v3.apk` | `rust-daed_3.1.2-R2S-v2.apk` | - | aarch64_generic (RK3328) |

### 📋 全量发布资产清单（Assets 10）

| 文件名 (Asset Name) | 格式 | 大小 | SHA-256 校验和 (Checksum) |
|---|---|---|---|
| `rust-daed_3.1.2-linux-x86_64_v2_sse.deb` | deb | 24.7 MB | `e87f2a9e2523f605e687c74a9f799a3e734383adaa208ed6e5ea5d89116545a3` |
| `rust-daed_3.1.2-linux-x86_64_v3_avx2.deb` | deb | 24.7 MB | `b0808d1a49a4fd61335f10a175c894fb9cacc4b896b692d6da1ad47e7fa3b0bd` |
| `rust-daed_3.1.2-x86_64-v3.apk` | apk v3 | 23.7 MB | `299966c7755fb79bf66a823db5ebfc2a54cfb7077086e70ce538fea795528ffb` |
| `rust-daed_3.1.2-x86_64-v2.apk` | apk v2 | 23.7 MB | `7333add1aacb13f45ccf0bb4b0c707d8fbd8cae815473e6ea30cea3cf356c627` |
| `rust-daed_3.1.2-R4S-v3.apk` | apk v3 | 23.7 MB | `aa464c460730dab21499c126a8c479a9138338e2110eb47b7772c684db8a480d` |
| `rust-daed_3.1.2-R4S-v2.apk` | apk v2 | 23.7 MB | `8ccfac5d3764116c804d5922f2f9e714fe46615a46364961bb8d04d4428f8112` |
| `rust-daed_3.1.2-R3S-v3.apk` | apk v3 | 23.7 MB | `1224c687ac35cd8f17912d315496298fd7cba1c9671b0575457352cb198cdc42` |
| `rust-daed_3.1.2-R3S-v2.apk` | apk v2 | 23.7 MB | `0ca526a033fe2ae668e2357ea346d524928774e415466566bd2aaddd72dec9ec` |
| `rust-daed_3.1.2-R2S-v3.apk` | apk v3 | 23.7 MB | `68416eaa3f68938ff992d446e3f0c4a9c7b618d302982cfa6d6ba9bd2ef6974d` |
| `rust-daed_3.1.2-R2S-v2.apk` | apk v2 | 23.7 MB | `18ef4613e32863d7ca4b9dae18daf694a3b04b3a8ae04782ac96d3b09086da17` |
| `Source code (zip)` | zip | - | - |
| `Source code (tar.gz)` | tar.gz | - | - |

## 🚀 快速开始

```sh
# Debian / Ubuntu (标准 amd64 SSE4.2 通用 / AVX2 优化)
sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v2_sse.deb
# 或针对现代 CPU 安装 AVX2 版本：
# sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v3_avx2.deb
sudo systemctl enable --now daed

# OpenWrt 25.12+（apk v3 / apk-tools 3.x）
apk add --allow-untrusted ./rust-daed_3.1.2-<设备>-v3.apk

# OpenWrt 24.x / 23.x / Alpine（apk v2 传统 tar 包）
apk add --allow-untrusted ./rust-daed_3.1.2-<设备>-v2.apk

# 启用并启动服务
/etc/init.d/daed enable && /etc/init.d/daed start

# 访问 Web 管理后台
http://<路由器IP>:2023
```

## 📋 系统要求

x86_64 / aarch64 Linux，内核 ≥ 5.8 且启用 **BTF**（`CONFIG_DEBUG_INFO_BTF=y`）；`iproute2 ≥ 6.7`；root 特权。
dae 的 eBPF 数据面还要求内核开启 **veth**、**clsact**（`NET_SCH_INGRESS` / `NET_CLS_ACT` / `NET_CLS_BPF`），并需要宿主工具 `tc` / `bpftool` / `ipset`（OpenWrt 上可通过 `apk add tc-full bpftool-minimal ip-full ipset` 安装）。

⚠️ **BTF 是两者共同前提**：Go 版（[daed-kdae](https://github.com/Quan-0505/daed-kdae)）与 Rust 版（[rust-daed](https://github.com/Quan-0505/rust-daed)）都依赖内核 BTF 符号与 veth/clsact 特性。OpenWrt 官方固件大多默认未开启 `CONFIG_DEBUG_INFO_BTF`，在此类固件上两者均无法启动——需要自编译内核或使用已启用的固件 [Quan-0505/OpenWrt](https://github.com/Quan-0505/OpenWrt)（已内置 BTF、veth、clsact 与完整底层工具链）。

### ⚠️ 包格式选型（OpenWrt 25.12 用 apk v3，旧环境用 apk v2）

OpenWrt **25.12 起使用 apk-tools 3.x**，包格式升级为 **apk v3**（ADB 容器：文件头为 `ADB`；既不是 tar 也不是 gzip，使用传统 `tar` 或 apk2 工具解压会报错是预期现象）。旧版系统（24.x、23.x、Alpine 等）则使用传统 tar 格式的 **apk v2**。本 Release 严格按格式规范提供：

```sh
# OpenWrt 25.12+ (apk v3)
scp rust-daed_3.1.2-R4S-v3.apk root@192.168.2.1:/tmp/
ssh root@192.168.2.1 'apk add --allow-untrusted /tmp/rust-daed_3.1.2-R4S-v3.apk'

# OpenWrt 24.x / 23.x / Alpine (apk v2)
scp rust-daed_3.1.2-R2S-v2.apk root@192.168.2.1:/tmp/
ssh root@192.168.2.1 'apk add --allow-untrusted /tmp/rust-daed_3.1.2-R2S-v2.apk'
```

| 目标环境 | 包管理工具 | 推荐安装包 |
|---|---|---|
| OpenWrt 25.12+（apk-tools 3） | `apk` | ✅ `rust-daed_3.1.2-<device>-v3.apk`（apk v3，ADB 容器格式） |
| OpenWrt 24.x / 23.x / Alpine | `apk` | ✅ `rust-daed_3.1.2-<device>-v2.apk`（apk v2，传统 tar 格式） |
| Debian / Ubuntu / PVE 宿主机 | `dpkg` | ✅ `rust-daed_3.1.2-linux-x86_64_v2_sse.deb` / `_v3_avx2.deb` |

已在真实硬件验证（NanoPi R4S / OpenWrt 25.12.5 / apk-tools 3.0.5 / `aarch64_generic`）：

```text
(1/1) Upgrading daed (3.1.0-r2 -> 3.1.2-r1)
  Executing daed-3.1.2-r1.post-upgrade
OK: 144.5 MiB in 305 packages
```

重打包由仓库内 `workflow_dispatch` 流程 **Repack apk as OpenWrt 25.12 (apk v3)** 完成（用 OpenWrt 25.12 SDK 的 apk-tools 3 重新打包，v2 的脚本钩子改写成 OpenWrt 的 `postinst`/`prerm`）——升级上游二进制时重跑一次即可。

> 注意：本包与 [daed-kdae](https://github.com/Quan-0505/daed-kdae)（Go 引擎版）提供相同的 `/usr/bin/daed` 与 `/etc/init.d/daed`，**两者只能装一个**，后装的会覆盖先装的。

## 🔧 源码与补丁（sticky-ip）

上游 ksong008/DaeNext 拆分为三个核心 outbound crate。sticky 模块置于底层共享 crate（`dae-outbound-core`），上层传输协议（`dae-outbound-stream`）统一通过 `sticky_connect` 建连：

| 文件 | 说明 |
|---|---|
| `patches/sticky-ip-full.patch` | 完整补丁（git apply，涵盖 8 个源码修改文件） |
| `patches/APPLY-STICKY.md` | 补丁集成步骤与单元测试验证指导 |
| `source/sticky.rs` | sticky 模块独立源码实现（含 4 项单元测试） |

应用与验证命令：

```sh
cd DaeNext && git apply patches/sticky-ip-full.patch
cargo test -p dae-outbound sticky::tests   # 4/4 测试通过
```

## 📂 仓库内容

| 目录 / 文件 | 说明 |
|---|---|
| `patches/` | ★ sticky-ip 完整源码补丁（8 文件）与应用指导文档 |
| `source/` | 独立 sticky 模块（含 4 单元测试源码） |
| `scripts/` | 容器启动控制脚本、APK 自动打包与环境适配工具 |
| `src/` | 交互式调试工作台前端工程（React + Tailwind + Lucide） |
| `README.md` | 项目主说明文档（规范参考 daed-kdae） |

## 📄 许可

[GNU Affero General Public License v3.0](LICENSE)。上游 DaedNext / DaeNext 为 MIT/AGPL-3.0，sticky-ip 移植自 AGPL-3.0 的 [olicesx/outbound](https://github.com/olicesx/outbound)。

---
*Go 版（kdae 引擎）见 [daed-kdae](https://github.com/Quan-0505/daed-kdae)。*

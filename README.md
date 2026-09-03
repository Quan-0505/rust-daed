# rust-daed

**daed（DaedNext，Rust 原生）+ sticky-ip 增强版安装包**

- 产品壳 + Web 面板：ksong008/DaedNext（Rust 版 daed，REST API）
- 引擎：ksong008/DaeNext（Rust 原生 dae core）
- 版本：**v3.1.1-sticky**（在官方核心上移植了 kdae 的 sticky-ip 特性）
- 架构：linux/amd64（x86_64）

## 特性

- **sticky-ip**：节点地址为域名时，TTL（5 分钟）内固定使用同一解析 IP，避免 DNS 轮询导致的连接漂移（移植自 Go kdae 的 olicesx/outbound stickyip）
- Rust 原生 eBPF（Aya）、resident 用户态 TCP/UDP 栈、boringssl TLS
- reload（GenerationSwap）保留存量连接

## 安装（Debian/Ubuntu x86_64）

```bash
# 从 Release 下载 daed_3.1.1-sticky_amd64.deb
sudo dpkg -i daed_3.1.1-sticky_amd64.deb
# 浏览器访问 http://<机器IP>:2023 → 登录 → 配置订阅
```

## 系统要求

- x86_64 Linux（Debian/Ubuntu）
- 内核 ≥ 5.8 且支持 BTF（`ls /sys/kernel/btf/vmlinux` 存在）
- root 权限（eBPF 必需）

## 源码补丁

sticky-ip 实现在 `crates/dae-outbound/src/sticky.rs`（新增模块 + 8 处节点建连点接入）。
## 源码

本构建的 sticky-ip 改动（相对 ksong008/DaeNext 官方源码）：

| 文件 | 说明 |
|---|---|
| `patches/sticky-ip-full.patch` | **完整补丁**（git apply 即可，8 个文件：sticky.rs 新增 + lib.rs + 6 处建连点） |
| `patches/APPLY-STICKY.md` | 补丁应用与验证说明 |
| `source/sticky.rs` | sticky 模块源码全文（含 4 个单测） |

应用补丁：`cd DaeNext && git apply patches/sticky-ip-full.patch`

验证：`cargo test -p dae-outbound sticky::tests`（4/4 通过）
## License

本项目以 [GNU Affero General Public License v3.0](LICENSE) 发布。

> 许可证说明：
> - 本仓库构建/分发 daed（DaedNext）安装包；上游 [DaedNext](https://github.com/ksong008/DaedNext) 为 **MIT / AGPL-3.0** 双许可
> - sticky-ip 特性移植自 Go 版 kdae 的 [olicesx/outbound](https://github.com/olicesx/outbound)（AGPL-3.0），因此本仓库采用 AGPL-3.0
> - 使用与再分发请遵循对应上游许可证

## 安装包

**x86 Linux (Debian/Ubuntu)**：[`daed_3.1.1-sticky_amd64.deb`](https://github.com/Quan-0505/rust-daed/releases/download/v3.1.1-sticky/daed_3.1.1-sticky_amd64.deb)
（`sudo dpkg -i` 安装，Web 面板 :2023）

**OpenWrt 25.12**（apk，见 [v3.1.1-sticky-openwrt Release](https://github.com/Quan-0505/rust-daed/releases/tag/v3.1.1-sticky-openwrt)）：

| 设备 | 包 |
|---|---|
| X86 软路由 | `daed-3.1.1-r1.openwrt-x86_64-jemalloc.apk` |
| NanoPi R4S（RK3399） | `daed-3.1.1-r1.openwrt-aarch64_cortex-a72-jemalloc.apk` |
| NanoPi R3S（RK3566）/ R2S（RK3328） | `daed-3.1.1-r1.openwrt-aarch64_cortex-a53-jemalloc.apk`（通用） |

```sh
apk add --allow-untrusted ./daed-3.1.1-r1.openwrt-<架构>-jemalloc.apk
/etc/init.d/daed enable && /etc/init.d/daed start
# Web 面板: http://<路由器IP>:2023
```

> 静态链接（crt-static）不依赖 libc；含 web + geoip/geosite + init 脚本 + uci 配置

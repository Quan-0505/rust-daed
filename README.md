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
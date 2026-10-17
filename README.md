# rust-daed

Rust 原生 daed + sticky-ip，基于固定版本的 DaedNext 管理界面和 DaeNext 引擎。

[English](README.en.md) · [安装包](https://github.com/Quan-0505/rust-daed/releases/latest)

## v3.2.1 (SIPA 兼容候选)

基于 2026-10-16 锁定的上游界面 `dc4af0e4d9e8` 与引擎 `f40c3494c776`，保留 sticky-ip 域名地址缓存，并增加针对 F50 SIPA RAWIP IPv4 出口帧的兼容补丁。包含日志查询重试、错误显示与筛选隔离，以及 DNS、订阅、日志工作线程、TLS、Meek、QUIC 和 UDP 缓冲处理更新。[源码与更新记录](source/UPSTREAM-20261018.md)

`v3.2.1` 目前是兼容候选版本：eBPF 偏移解析单测和源码 CI 已通过，完整 ARM64 发布包及 F50/E5 实机流量验证仍待完成。F50 需要使用 veth 网络命名空间；升级前需确认各设备内核的 BTF、TC/eBPF 和 veth 能力。

生产构建采用上游默认功能：Aya/eBPF、jemalloc、BoringSSL。Web 文件安装到 `/usr/share/daed/web`，使用最新上游界面；仓库根目录的开发演示页面不进入安装包。

## 安装包

- Debian/Ubuntu：`rust-daed_3.2.1-linux-x86_64_v2_sse.deb` 或 `rust-daed_3.2.1-linux-x86_64_v3_avx2.deb`。两种 CPU 基线分别编译。
- OpenWrt 25.12：`rust-daed-r2s.apk`、`rust-daed-r3s.apk`、`rust-daed-r4s.apk`、`rust-daed-x86.apk`，实际为 SDK 生成的 APK v3。
- 对应的 `*-v2.apk` 是 APK v2 归档，仅用于匹配的旧 APK 工具链，不能安装到要求 v3 的系统。

访问 `http://设备IP:2023` 创建或使用自己的账号。服务数据保存在 `/etc/daed`，不随安装包分发。Rust 与 [Go KDAE](https://github.com/Quan-0505/daed-kdae) 使用同一程序路径与端口，不能同时运行；切换前备份自己的程序、数据库与设置。

需要 Linux 内核 BTF、TC/eBPF、veth 支持和完整 `ip`/`tc` 工具。安装包格式正确并不代表设备内核具备这些功能。升级和安装测试以发布说明中实际列出的平台为准。

## 从源码构建

Linux 构建机需要 Rust stable、nightly + rust-src、bpf-linker、clang/LLVM、libelf、CMake、Perl、pkg-config、GNU C/C++、ARM64 交叉编译器、Node.js 24、pnpm 10.24、Python 3、curl 和 dpkg-deb。

```sh
bash scripts/build-release.sh /absolute/path/to/new-output-directory
# Optional validation; requires root / namespace privileges.
bash scripts/test-release.sh /absolute/path/to/new-output-directory
```

`source/upstream.json` 固定版本、源码提交、补丁 SHA256 和 CPU 基线。准备脚本拒绝覆盖已有源码目录；构建默认两个任务，关闭 LTO，生成独立 amd64-v2/v3 与 ARM64 程序，以及 2 个 DEB 和 4 个原始 APK。`.github/workflows/build-release.yml` 会在 Linux CI 构建并校验这些包；正式发布前由 `.github/workflows/repack-apk-v3.yml` 使用 OpenWrt SDK 转换 v3。

`patches/sticky-ip-full.patch` 与 `source/sticky.rs` 保留 sticky-ip 改动及单元测试；上游许可证与归属保留。项目许可见 [LICENSE](LICENSE)。源码与安装包只使用公开物料，不包含订阅、节点、密码、令牌、数据库或设备备份。

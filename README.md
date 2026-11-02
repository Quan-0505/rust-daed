# rust-daed

Rust 原生 daed + sticky-ip，基于固定版本的 DaedNext 管理界面和 DaeNext 引擎。

[English](README.en.md) · [安装包](https://github.com/Quan-0505/rust-daed/releases/latest)

## v3.2.2

[下载 v3.2.2](https://github.com/Quan-0505/rust-daed/releases/tag/v3.2.2)。固定 DaedNext 界面 `76ad4577501b`、DaeNext 引擎 `d0c477e62617`，包含监听器发布、socket cookie 所有权连续性和回滚处理更新，并保留 sticky-ip、SIPA RAWIP 与 BPF LPM 重试兼容补丁。

已在三台 Debian amd64 主机完成实机验证，包括现有 Rust 升级和两台 Go KDAE 迁移：账户及配置保留、服务重启与就绪、重载请求、Web 资源、UDP/TCP DNS、真实 HTTPS 转发。ARM64 包完成交叉编译与包校验，未据此宣称 ARM64 实机验收。F50 仍需使用 veth 网络命名空间。

生产构建采用上游默认功能：Aya/eBPF、jemalloc、BoringSSL。Web 文件安装到 `/usr/share/daed/web`，使用最新上游界面；仓库根目录的开发演示页面不进入安装包。

## 安装包

- Debian/Ubuntu：提供 `rust-daed_3.2.2-linux-x86_64_v2_sse.deb` 和 `rust-daed_3.2.2-linux-x86_64_v3_avx2.deb`。两种 CPU 基线分别编译。
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

## 2026-11-02 上游同步

当前固定界面源码为 `76ad4577501b`，DaeNext 引擎为 `d0c477e62617`，包含监听器发布、socket cookie 连续性及回滚处理更新。保留 sticky-ip、SIPA RAWIP 和 BPF LPM 兼容补丁。[完整构建与 Linux 校验](https://github.com/Quan-0505/rust-daed/actions/runs/41465457117)已通过。Go 迁移应使用独立 Rust 数据目录，保留原始 Go 数据库；停止旧服务后确认归属，再清理旧引擎残留的 `dae0`／`daens` 网络对象，避免名称冲突。明确设置 systemd 的配置目录和数据库路径，并保留该覆盖配置。

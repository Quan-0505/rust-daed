# rust-daed

Rust 原生 daed + sticky-ip，基于固定版本的 DaedNext 管理界面和 DaeNext 引擎。

[English](README.en.md) · [安装包](https://github.com/Quan-0505/rust-daed/releases/latest)

## v3.2.2 上游同步候选版

同步 DaeNext 引擎至 `b42d9b20f385`，保留当前 DaedNext 界面 `dc4af0e4d9e8`、sticky-ip 缓存、F50 SIPA RAWIP 兼容和 LPM 内存重试补丁。上游更新涉及 eBPF 附着后端、能力检测和 Aya 加载器元数据；兼容补丁已重新生成并锁定哈希。完整构建与检查由候选工作流验证。[源码与更新记录](source/UPSTREAM-20261022.md)

`v3.2.2` 目前是候选版本；完成完整发布构建、上游测试和固件集成验证前，不视为已发布或设备实测。F50 需要使用 veth 网络命名空间；升级前需确认各设备内核的 BTF、TC/eBPF 和 veth 能力。

生产构建采用上游默认功能：Aya/eBPF、jemalloc、BoringSSL。Web 文件安装到 `/usr/share/daed/web`，使用最新上游界面；仓库根目录的开发演示页面不进入安装包。

## 安装包

- Debian/Ubuntu：候选构建成功后提供 `rust-daed_3.2.2` 对应的 x86-64 v2/v3 安装包。两种 CPU 基线分别编译。
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

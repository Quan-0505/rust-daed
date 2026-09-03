# 应用 sticky-ip 补丁（DaeNext）

本补丁在 ksong008/DaeNext（`work/boringssl` @ 103b3244ff57 验证）上新增 sticky-ip 特性：
节点地址为域名时，TTL（300s）内固定使用同一解析 IP，避免 DNS 轮询导致连接漂移
（移植自 Go kdae 的 olicesx/outbound `dialer/stickyip`）。

## 文件改动

| 文件 | 改动 |
|---|---|
| `crates/dae-outbound/src/sticky.rs` | **新增**：全局 sticky 缓存（OnceLock<Mutex<HashMap>>）+ `sticky_resolve`/`sticky_connect` + 4 个单测 |
| `crates/dae-outbound/src/lib.rs` | 注册 `pub mod sticky;` |
| `crates/dae-outbound/src/shared_transport/dataplane.rs` | 3 处节点建连 → `sticky_connect` |
| `crates/dae-outbound/src/shared_transport/grpc.rs` | 1 处 |
| `crates/dae-outbound/src/shared_transport/meek.rs` | 1 处 |
| `crates/dae-outbound/src/shared_transport/mux.rs` | 1 处 |
| `crates/dae-outbound/src/shared_transport/reality.rs` | 1 处 |
| `crates/dae-outbound/src/shared_transport/xhttp/http1.rs` | 1 处 |

## 应用

```bash
# 在 DaeNext 源码树根目录（确保工作区干净）
git apply /path/to/sticky-ip-full.patch
# 或
patch -p1 < /path/to/sticky-ip-full.patch
```

## 验证

```bash
cargo test -p dae-outbound sticky::tests        # 4 个单测
# 完整构建（参考 DaedNext Makefile）
VERSION=v3.1.1 DAED_SKIP_WEB_BUILD=1 make
```

## 说明

- 只替换了 shared_transport（节点间共享传输）的建连点；目标地址拨号在 dae-resident-tcp，
  不在本补丁范围
- 单测覆盖：IP 直通 / 域名缓存稳定 / 不同端点独立 key / IPv6 host:port 拆分
- 实测环境：Debian 13 + Rust 1.98（nightly + rust-src）+ bpf-linker 0.10.3

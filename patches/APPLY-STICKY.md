# 应用 sticky-ip 补丁

本补丁在 ksong008/DaeNext `work/boringssl` @ **218bdf72**（2026-09-10）验证。

## 架构说明（上游 2026-09 重构后）

上游已把 outbound 层拆分为三个 crate：
- `dae-outbound`（协议层）
- `dae-outbound-stream`（传输层：grpc/mux/meek/reality/xhttp/shadowsocks…）
- `dae-outbound-core`（共享层，被前两者依赖）← **sticky 模块所在**

## 文件改动

| 文件 | 改动 |
|---|---|
| `crates/dae-outbound-core/src/sticky.rs` | **新增**：全局 sticky 缓存（OnceLock<Mutex<HashMap>>）+ 4 单测 |
| `crates/dae-outbound-core/src/lib.rs` | 注册 `pub mod sticky;` |
| `dae-outbound-stream/src/xhttp/http1.rs` | 节点建连 → `sticky_connect` |
| `dae-outbound-stream/src/meek.rs` | 1 处 |
| `dae-outbound-stream/src/mux.rs` | 1 处 |
| `dae-outbound-stream/src/grpc.rs` | 1 处 |
| `dae-outbound-stream/src/shared_transport/reality.rs` | 1 处 |
| `dae-outbound-stream/src/http_proxy/dataplane.rs` | 1 处（proxy 参数） |
| `dae-outbound-stream/src/socks5/dataplane.rs` | 1 处（proxy 参数） |
| `dae-outbound-stream/src/shadowsocks/aead.rs` | 1 处（server 参数） |
| `dae-outbound-stream/src/shadowsocks/ss2022_tcp_dataplane/exchanges.rs` | 1 处（server 参数） |

> `dae-outbound/src/shared_transport/dataplane.rs` 的 3 处为测试专用（`cfg(test)`），未改。

## 应用

```sh
git apply patches/sticky-ip-full.patch
cargo test -p dae-outbound-core sticky::tests   # 4/4 通过
```

## 语义

节点地址为域名时，TTL（300s）内固定使用同一解析 IP；IP 直通；不同端点独立缓存 key。
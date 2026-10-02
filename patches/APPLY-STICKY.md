# 应用 sticky-ip 补丁

本补丁在 ksong008/DaeNext `work/boringssl` @ **6d93185f26d4**（2026-09-28）验证。

## 架构说明（上游 2026-09 重构后）

上游把 outbound 层拆分为三个 crate：
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

## 常见问题

**升级后 `systemctl reload daed` 报 "Job type reload is not applicable"**

原因：机器上存在旧的自定义 unit `/etc/systemd/system/daed.service`，其优先级高于包安装的 `/usr/lib/systemd/system/daed.service`，导致新版 unit 的 `ExecReload` / `ExecStartPre validate` / `wait-ready` 不生效。

处理：
```sh
systemctl cat daed | head -1        # 确认 FragmentPath
cp -a /etc/systemd/system/daed.service /root/daed.service.bak
rm -f /etc/systemd/system/daed.service
systemctl daemon-reload             # 无需重启服务，当前进程不受影响
systemctl show daed -p CanReload    # 应为 yes
```
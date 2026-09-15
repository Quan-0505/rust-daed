import { PatchFileItem, ProxyNode, ReleasePackage } from '../types';

export const INITIAL_NODES: ProxyNode[] = [
  {
    id: 'node-hk-1',
    name: 'HK Edge 01 (BGP Premium)',
    group: 'Hong Kong High-Speed',
    protocol: 'xhttp',
    endpoint: 'hk1.proxy-node.net:443',
    isDomain: true,
    latencyMs: 18,
    status: 'online',
    activeStreams: 42,
    tlsBackend: 'boringssl'
  },
  {
    id: 'node-sg-1',
    name: 'SG Anycast Cluster',
    group: 'Singapore Low-Latency',
    protocol: 'grpc',
    endpoint: 'sgp.speededge.org:8443',
    isDomain: true,
    latencyMs: 34,
    status: 'online',
    activeStreams: 28,
    tlsBackend: 'boringssl'
  },
  {
    id: 'node-jp-1',
    name: 'JP Tokyo Reality Gateway',
    group: 'Japan Direct',
    protocol: 'reality',
    endpoint: 'jp-tyo.anytls.io:443',
    isDomain: true,
    latencyMs: 46,
    status: 'online',
    activeStreams: 19,
    tlsBackend: 'boringssl'
  },
  {
    id: 'node-us-1',
    name: 'US Silicon Valley MUX',
    group: 'US West Coast',
    protocol: 'mux',
    endpoint: 'us-sfo.daenext.dev:443',
    isDomain: true,
    latencyMs: 142,
    status: 'online',
    activeStreams: 9,
    tlsBackend: 'boringssl'
  },
  {
    id: 'node-ip-direct',
    name: 'Direct Fiber Endpoint (Raw IPv4)',
    group: 'Dedicated Transit',
    protocol: 'shadowsocks-aead',
    endpoint: '103.21.244.15:8388',
    isDomain: false,
    latencyMs: 22,
    status: 'online',
    activeStreams: 64,
    tlsBackend: 'standard'
  },
  {
    id: 'node-ss2022',
    name: 'SS2022 High-Throughput',
    group: 'Gaming Optimized',
    protocol: 'ss2022',
    endpoint: '198.51.100.8:9000',
    isDomain: false,
    latencyMs: 27,
    status: 'online',
    activeStreams: 33,
    tlsBackend: 'boringssl'
  }
];

export const RELEASE_PACKAGES: ReleasePackage[] = [
  // --- Debian / Ubuntu x86_64 (deb) ---
  {
    id: 'pkg-deb-sse',
    name: 'Debian / Ubuntu x86_64 (SSE4.2/v2)',
    device: '通用 x86_64 宿主机 / PVE（老旧 CPU 通用）',
    arch: 'x86_64 (SSE4.2)',
    format: 'deb',
    filename: 'rust-daed_3.1.2-linux-x86_64_v2_sse.deb',
    size: '24.7 MB',
    description: '标准 debian 包，集成 systemd 单元与自动网络转发。适用于老旧 x86_64 CPU 及通用 Linux 宿主机。',
    installCommand: 'sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v2_sse.deb && sudo systemctl enable --now daed',
    targetOs: 'Linux Debian 12 / Ubuntu 24.04 / PVE',
    status: 'verified',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-linux-x86_64_v2_sse.deb',
    sha256: 'e87f2a9e2523f605e687c74a9f799a3e734383adaa208ed6e5ea5d89116545a3'
  },
  {
    id: 'pkg-deb-avx2',
    name: 'Debian / Ubuntu x86_64 (AVX2/v3)',
    device: '现代 x86_64 宿主机 / PVE（Intel 4代+ / AMD Zen+）',
    arch: 'x86_64 (AVX2)',
    format: 'deb',
    filename: 'rust-daed_3.1.2-linux-x86_64_v3_avx2.deb',
    size: '24.7 MB',
    description: '针对现代 CPU（AVX2 向量指令集）高度优化，Rust 原生加密与高并发吞吐性能更强。',
    installCommand: 'sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v3_avx2.deb && sudo systemctl enable --now daed',
    targetOs: 'Linux Debian 12 / Ubuntu 24.04 / PVE',
    status: 'verified',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-linux-x86_64_v3_avx2.deb',
    sha256: 'b0808d1a49a4fd61335f10a175c894fb9cacc4b896b692d6da1ad47e7fa3b0bd'
  },

  // --- OpenWrt 25.12+ (apk v3 / ADB 容器格式) ---
  {
    id: 'pkg-x86-v3',
    name: 'x86_64 软路由 (apk v3)',
    device: '通用 x86_64 软路由',
    arch: 'x86_64',
    format: 'apk v3',
    filename: 'rust-daed_3.1.2-x86_64-v3.apk',
    size: '23.7 MB',
    description: '适用于 OpenWrt 25.12+（apk-tools 3.x / ADB 容器格式），支持 x86_64 多核软路由硬件。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-x86_64-v3.apk',
    targetOs: 'OpenWrt 25.12+ (apk v3)',
    status: 'verified',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-x86_64-v3.apk',
    sha256: '299966c7755fb79bf66a823db5ebfc2a54cfb7077086e70ce538fea795528ffb'
  },
  {
    id: 'pkg-r4s-v3',
    name: 'NanoPi R4S (apk v3)',
    device: 'NanoPi R4S (RK3399)',
    arch: 'aarch64_generic',
    format: 'apk v3',
    filename: 'rust-daed_3.1.2-R4S-v3.apk',
    size: '23.7 MB',
    description: '适用于 OpenWrt 25.12+（apk-tools 3.x / ADB 容器格式），针对 Cortex-A72 RK3399 架构。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-R4S-v3.apk',
    targetOs: 'OpenWrt 25.12+ (apk v3)',
    status: 'verified',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-R4S-v3.apk',
    sha256: 'aa464c460730dab21499c126a8c479a9138338e2110eb47b7772c684db8a480d'
  },
  {
    id: 'pkg-r3s-v3',
    name: 'NanoPi R3S (apk v3)',
    device: 'NanoPi R3S (RK3566)',
    arch: 'aarch64_generic',
    format: 'apk v3',
    filename: 'rust-daed_3.1.2-R3S-v3.apk',
    size: '23.7 MB',
    description: '适用于 OpenWrt 25.12+（apk-tools 3.x / ADB 容器格式），针对 Cortex-A53 RK3566 架构。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-R3S-v3.apk',
    targetOs: 'OpenWrt 25.12+ (apk v3)',
    status: 'verified',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-R3S-v3.apk',
    sha256: '1224c687ac35cd8f17912d315496298fd7cba1c9671b0575457352cb198cdc42'
  },
  {
    id: 'pkg-r2s-v3',
    name: 'NanoPi R2S (apk v3)',
    device: 'NanoPi R2S (RK3328)',
    arch: 'aarch64_generic',
    format: 'apk v3',
    filename: 'rust-daed_3.1.2-R2S-v3.apk',
    size: '23.7 MB',
    description: '适用于 OpenWrt 25.12+（apk-tools 3.x / ADB 容器格式），针对 Cortex-A53 RK3328 架构。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-R2S-v3.apk',
    targetOs: 'OpenWrt 25.12+ (apk v3)',
    status: 'verified',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-R2S-v3.apk',
    sha256: '68416eaa3f68938ff992d446e3f0c4a9c7b618d302982cfa6d6ba9bd2ef6974d'
  },

  // --- OpenWrt 24.x / 23.x / Alpine (apk v2 / 传统 tar.gz 格式) ---
  {
    id: 'pkg-x86-v2',
    name: 'x86_64 软路由 (apk v2)',
    device: '通用 x86_64 软路由',
    arch: 'x86_64',
    format: 'apk v2',
    filename: 'rust-daed_3.1.2-x86_64-v2.apk',
    size: '23.7 MB',
    description: '适用于传统 OpenWrt 24.x / 23.x 及 Alpine Linux（传统 tar.gz 封包格式）。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-x86_64-v2.apk',
    targetOs: 'OpenWrt 24.x / 23.x / Alpine (apk v2)',
    status: 'stable',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-x86_64-v2.apk',
    sha256: '7333add1aacb13f45ccf0bb4b0c707d8fbd8cae815473e6ea30cea3cf356c627'
  },
  {
    id: 'pkg-r4s-v2',
    name: 'NanoPi R4S (apk v2)',
    device: 'NanoPi R4S (RK3399)',
    arch: 'aarch64_generic',
    format: 'apk v2',
    filename: 'rust-daed_3.1.2-R4S-v2.apk',
    size: '23.7 MB',
    description: '适用于传统 OpenWrt 24.x / 23.x 及 Alpine Linux（传统 tar.gz 封包格式）。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-R4S-v2.apk',
    targetOs: 'OpenWrt 24.x / 23.x / Alpine (apk v2)',
    status: 'stable',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-R4S-v2.apk',
    sha256: '8ccfac5d3764116c804d5922f2f9e714fe46615a46364961bb8d04d4428f8112'
  },
  {
    id: 'pkg-r3s-v2',
    name: 'NanoPi R3S (apk v2)',
    device: 'NanoPi R3S (RK3566)',
    arch: 'aarch64_generic',
    format: 'apk v2',
    filename: 'rust-daed_3.1.2-R3S-v2.apk',
    size: '23.7 MB',
    description: '适用于传统 OpenWrt 24.x / 23.x 及 Alpine Linux（传统 tar.gz 封包格式）。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-R3S-v2.apk',
    targetOs: 'OpenWrt 24.x / 23.x / Alpine (apk v2)',
    status: 'stable',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-R3S-v2.apk',
    sha256: '0ca526a033fe2ae668e2357ea346d524928774e415466566bd2aaddd72dec9ec'
  },
  {
    id: 'pkg-r2s-v2',
    name: 'NanoPi R2S (apk v2)',
    device: 'NanoPi R2S (RK3328)',
    arch: 'aarch64_generic',
    format: 'apk v2',
    filename: 'rust-daed_3.1.2-R2S-v2.apk',
    size: '23.7 MB',
    description: '适用于传统 OpenWrt 24.x / 23.x 及 Alpine Linux（传统 tar.gz 封包格式）。',
    installCommand: 'apk add --allow-untrusted ./rust-daed_3.1.2-R2S-v2.apk',
    targetOs: 'OpenWrt 24.x / 23.x / Alpine (apk v2)',
    status: 'stable',
    downloadUrl: 'https://github.com/Quan-0505/rust-daed/releases/download/v3.1.2/rust-daed_3.1.2-R2S-v2.apk',
    sha256: '18ef4613e32863d7ca4b9dae18daf694a3b04b3a8ae04782ac96d3b09086da17'
  }
];

export const PATCH_FILES: PatchFileItem[] = [
  {
    path: 'crates/dae-outbound-core/src/sticky.rs',
    crate: 'dae-outbound-core',
    changesCount: 132,
    description: 'Primary module: Introduces OnceLock<Mutex<HashMap>> global thread-safe cache with 300s TTL and 4 test cases.',
    codeDiff: `+pub fn sticky_resolve(endpoint: &str) -> String {
+    if endpoint.parse::<SocketAddr>().is_ok() {
+        return endpoint.to_string();
+    }
+    let (host, port) = split_host_port(endpoint);
+    if host.parse::<std::net::IpAddr>().is_ok() {
+        return endpoint.to_string();
+    }
+    let key = endpoint.to_string();
+    let now = Instant::now();
+    {
+        let map = cache().lock().unwrap();
+        if let Some(entry) = map.get(&key) {
+            if entry.expires_at > now {
+                return entry.addr.clone();
+            }
+        }
+    }
+    // Resolve and cache the first address for STICKY_TTL (300s)
+    ...
+}`
  },
  {
    path: 'crates/dae-outbound-core/src/lib.rs',
    crate: 'dae-outbound-core',
    changesCount: 1,
    description: 'Exported sticky module via pub mod sticky;',
    codeDiff: `@@ -1,3 +1,4 @@
+pub mod sticky;
 pub mod alive;
 pub mod annotation;`
  },
  {
    path: 'crates/dae-outbound-stream/src/xhttp/http1.rs',
    crate: 'dae-outbound-stream',
    changesCount: 2,
    description: 'Replaced direct TcpStream::connect with dae_outbound_core::sticky::sticky_connect in xhttp packet exchange.',
    codeDiff: `-    let mut stream = TcpStream::connect(endpoint)
+    let mut stream = dae_outbound_core::sticky::sticky_connect(endpoint)`
  },
  {
    path: 'crates/dae-outbound-stream/src/grpc.rs',
    crate: 'dae-outbound-stream',
    changesCount: 2,
    description: 'Applied sticky_connect to gRPC hunk exchange pipeline to prevent connection drops across HTTP/2 multiplexing.',
    codeDiff: `-    let mut stream = TcpStream::connect(endpoint)
+    let mut stream = dae_outbound_core::sticky::sticky_connect(endpoint)`
  },
  {
    path: 'crates/dae-outbound-stream/src/mux.rs',
    crate: 'dae-outbound-stream',
    changesCount: 2,
    description: 'Applied sticky_connect to MUX frame exchange.',
    codeDiff: `-    let mut stream = TcpStream::connect(endpoint)
+    let mut stream = dae_outbound_core::sticky::sticky_connect(endpoint)`
  },
  {
    path: 'crates/dae-outbound-stream/src/shared_transport/reality.rs',
    crate: 'dae-outbound-stream',
    changesCount: 2,
    description: 'Applied sticky_connect to Reality mutation exchange.',
    codeDiff: `-    let mut stream = TcpStream::connect(endpoint)
+    let mut stream = dae_outbound_core::sticky::sticky_connect(endpoint)`
  },
  {
    path: 'crates/dae-outbound-stream/src/shadowsocks/aead.rs',
    crate: 'dae-outbound-stream',
    changesCount: 2,
    description: 'Applied sticky_connect to Shadowsocks AEAD TCP exchange.',
    codeDiff: `-    let mut stream = TcpStream::connect(server)
+    let mut stream = dae_outbound_core::sticky::sticky_connect(server)`
  },
  {
    path: 'crates/dae-outbound-stream/src/shadowsocks/ss2022_tcp_dataplane/exchanges.rs',
    crate: 'dae-outbound-stream',
    changesCount: 2,
    description: 'Applied sticky_connect to SS2022 TCP dataplane exchanges.',
    codeDiff: `-    let mut stream = TcpStream::connect(server)
+    let mut stream = dae_outbound_core::sticky::sticky_connect(server)`
  }
];

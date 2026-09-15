export interface StickyEntry {
  endpoint: string;
  host: string;
  port: string;
  addr: string;
  expiresAt: number; // Unix timestamp in ms
  createdAt: number;
  hitCount: number;
  isPassthrough: boolean;
}

export type OutboundProtocol = 
  | 'xhttp' 
  | 'meek' 
  | 'mux' 
  | 'grpc' 
  | 'reality' 
  | 'socks5' 
  | 'shadowsocks-aead' 
  | 'ss2022';

export interface ProxyNode {
  id: string;
  name: string;
  group: string;
  protocol: OutboundProtocol;
  endpoint: string; // e.g. "hk1.proxy-node.net:443" or "103.21.244.2:8443"
  isDomain: boolean;
  latencyMs: number;
  status: 'online' | 'degraded' | 'offline';
  resolvedAddr?: string;
  stickyTtlSec?: number;
  activeStreams: number;
  tlsBackend: 'boringssl' | 'standard';
}

export interface EngineStats {
  state: 'running' | 'reloading' | 'stopped';
  generation: number;
  uptimeSeconds: number;
  activeConnections: number;
  totalResolvedQueries: number;
  stickyCacheHits: number;
  stickyCacheMisses: number;
  ebpfLoaded: boolean;
  btfVerified: boolean;
  residentMemoryMb: number;
  kernelVersion: string;
  residentDatapath: 'Aya + Nightly' | 'eBPF Ingress';
}

export interface ReleasePackage {
  id: string;
  name: string;
  device: string;
  arch: string;
  format: 'apk v3' | 'apk v2' | 'deb';
  filename: string;
  size: string;
  description: string;
  installCommand: string;
  targetOs: string;
  status: 'verified' | 'stable';
  downloadUrl?: string;
  sha256?: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  rustSourceTest: string;
  description: string;
  passed: boolean;
  executionMs: number;
  details: string;
}

export interface PatchFileItem {
  path: string;
  crate: string;
  changesCount: number;
  description: string;
  codeDiff: string;
}

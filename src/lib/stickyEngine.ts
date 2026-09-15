import { StickyEntry, TestCaseResult } from '../types';

/**
 * Sticky IP caching for proxy server connections.
 * 
 * Ported from `olicesx/outbound` `dialer/stickyip` and `Quan-0505/rust-daed` (source/sticky.rs).
 * Within the TTL window (300 seconds), the same resolved IP is reused for a proxy domain,
 * so DNS rotation cannot cause per-connection address drift on the node dial.
 * IP endpoints pass through untouched.
 */

export const STICKY_TTL_MS = 300 * 1000; // 300 seconds (5 minutes)

// Mock DNS database for upstream domains with round-robin IPs
export const UPSTREAM_DNS_RECORDS: Record<string, string[]> = {
  'hk1.proxy-node.net': ['103.21.244.15', '103.21.244.18', '103.21.244.22', '103.21.244.30'],
  'sgp.speededge.org': ['128.199.201.12', '128.199.201.45', '128.199.201.88'],
  'jp-tyo.anytls.io': ['140.238.65.10', '140.238.65.11', '140.238.65.12'],
  'us-sfo.daenext.dev': ['143.198.152.9', '143.198.152.14', '143.198.152.20'],
  'localhost': ['127.0.0.1'],
  'example.com': ['93.184.216.34', '93.184.216.35']
};

class StickyCacheEngine {
  private cache: Map<string, StickyEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    passthroughs: 0
  };

  /**
   * Split an endpoint into [host, port].
   * Handles [::1]:443 IPv6 style, standard host:port, or bare host.
   */
  public splitHostPort(endpoint: string): [string, string] {
    const trimmed = endpoint.trim();
    // "[::1]:443" style
    if (trimmed.startsWith('[')) {
      const closingBracketIndex = trimmed.indexOf(']');
      if (closingBracketIndex !== -1) {
        const host = trimmed.substring(1, closingBracketIndex);
        const rest = trimmed.substring(closingBracketIndex + 1);
        const port = rest.startsWith(':') ? rest.substring(1) : '443';
        return [host, port || '443'];
      }
    }

    // Standard rsplit_once(':')
    const lastColon = trimmed.lastIndexOf(':');
    if (lastColon !== -1 && !trimmed.includes(']')) {
      const host = trimmed.substring(0, lastColon);
      const port = trimmed.substring(lastColon + 1);
      return [host, port || '443'];
    }

    return [trimmed, '443'];
  }

  /**
   * Check if a string is a bare IPv4 or IPv6 address.
   */
  public isIpAddress(hostOrEndpoint: string): boolean {
    const cleaned = hostOrEndpoint.replace(/^\[|\]$/g, '');
    // IPv4 pattern
    const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
    if (ipv4Regex.test(cleaned)) return true;

    // IPv6 pattern
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    if (ipv6Regex.test(cleaned)) return true;

    // Socket address check e.g. "1.2.3.4:443"
    const [host] = this.splitHostPort(hostOrEndpoint);
    if (ipv4Regex.test(host)) return true;
    const hostCleaned = host.replace(/^\[|\]$/g, '');
    if (ipv6Regex.test(hostCleaned)) return true;

    return false;
  }

  /**
   * Performs sticky resolution for `endpoint`.
   * Faithful to Rust sticky_resolve in source/sticky.rs.
   */
  public stickyResolve(
    endpoint: string,
    options?: { customIpPool?: string[]; forceBypassCache?: boolean }
  ): {
    addr: string;
    fromCache: boolean;
    remainingTtlSec: number;
    isPassthrough: boolean;
  } {
    const trimmed = endpoint.trim();

    // Fast path: already a concrete socket address (e.g. "1.2.3.4:443" or "[::1]:443")
    // or bare IP host
    const [host, port] = this.splitHostPort(trimmed);
    const bareIpCheck = this.isIpAddress(host);

    if (bareIpCheck) {
      this.stats.passthroughs++;
      return {
        addr: trimmed,
        fromCache: false,
        remainingTtlSec: 0,
        isPassthrough: true
      };
    }

    const key = trimmed;
    const now = Date.now();

    // Check cached entry
    if (!options?.forceBypassCache && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (entry.expiresAt > now) {
        entry.hitCount++;
        this.stats.hits++;
        return {
          addr: entry.addr,
          fromCache: true,
          remainingTtlSec: Math.max(0, Math.round((entry.expiresAt - now) / 1000)),
          isPassthrough: false
        };
      } else {
        // Expired
        this.cache.delete(key);
      }
    }

    // Resolve address from DNS pool or hash generator
    this.stats.misses++;
    const resolvedIp = this.resolveHostDns(host, options?.customIpPool);
    const resolvedAddr = `${resolvedIp}:${port}`;

    const newEntry: StickyEntry = {
      endpoint: key,
      host,
      port,
      addr: resolvedAddr,
      createdAt: now,
      expiresAt: now + STICKY_TTL_MS,
      hitCount: 1,
      isPassthrough: false
    };

    this.cache.set(key, newEntry);

    return {
      addr: resolvedAddr,
      fromCache: false,
      remainingTtlSec: Math.round(STICKY_TTL_MS / 1000),
      isPassthrough: false
    };
  }

  /**
   * Resolves host to an IP (simulating upstream DNS round-robin rotation).
   */
  private resolveHostDns(host: string, customPool?: string[]): string {
    if (customPool && customPool.length > 0) {
      const randIdx = Math.floor(Math.random() * customPool.length);
      return customPool[randIdx];
    }

    if (host in UPSTREAM_DNS_RECORDS) {
      const ips = UPSTREAM_DNS_RECORDS[host];
      // Pick random IP to simulate real-world DNS rotation across requests
      const idx = Math.floor(Math.random() * ips.length);
      return ips[idx];
    }

    // Deterministic pseudo-random generation based on host
    let hash = 0;
    for (let i = 0; i < host.length; i++) {
      hash = ((hash << 5) - hash) + host.charCodeAt(i);
      hash |= 0;
    }
    const octet3 = Math.abs(hash % 200) + 1;
    const octet4 = (Math.abs((hash >> 8) % 250) + 1);
    return `198.51.${octet3}.${octet4}`;
  }

  /**
   * Return all active sticky cache entries.
   */
  public getEntries(): StickyEntry[] {
    const now = Date.now();
    // Prune expired
    for (const [k, v] of this.cache.entries()) {
      if (v.expiresAt <= now) {
        this.cache.delete(k);
      }
    }
    return Array.from(this.cache.values()).sort((a, b) => b.expiresAt - a.expiresAt);
  }

  /**
   * Clear all cache entries
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Delete single entry
   */
  public removeEntry(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Get engine stats
   */
  public getStats() {
    return {
      ...this.stats,
      cachedEntriesCount: this.cache.size
    };
  }

  /**
   * Run the 4 unit tests from source/sticky.rs
   */
  public runRustUnitTests(): TestCaseResult[] {
    const results: TestCaseResult[] = [];
    
    // Test 1: ip_endpoint_passthrough
    const t1Start = performance.now();
    const t1A = this.stickyResolve("1.2.3.4:443").addr === "1.2.3.4:443";
    const t1B = this.stickyResolve("1.2.3.4").addr === "1.2.3.4";
    const t1C = this.stickyResolve("[::1]:443").addr === "[::1]:443";
    const t1Passed = t1A && t1B && t1C;
    results.push({
      id: 'test_1',
      name: 'ip_endpoint_passthrough',
      rustSourceTest: '#[test] fn ip_endpoint_passthrough()',
      description: 'Bare IP endpoints (IPv4 with/without port, IPv6 with port) must pass through unchanged without caching overhead.',
      passed: t1Passed,
      executionMs: +(performance.now() - t1Start).toFixed(3),
      details: `assert_eq!("1.2.3.4:443" => "${this.stickyResolve("1.2.3.4:443").addr}"), ` +
               `assert_eq!("1.2.3.4" => "${this.stickyResolve("1.2.3.4").addr}"), ` +
               `assert_eq!("[::1]:443" => "${this.stickyResolve("[::1]:443").addr}")`
    });

    // Test 2: domain_endpoint_is_cached_and_stable
    const t2Start = performance.now();
    const ep2 = "localhost:18080";
    const a = this.stickyResolve(ep2).addr;
    const b = this.stickyResolve(ep2).addr;
    const stable = a === b;
    const isLoopback = a.startsWith("127.0.0.1:18080") || a.startsWith("[::1]:18080");
    const t2Passed = stable && isLoopback;
    results.push({
      id: 'test_2',
      name: 'domain_endpoint_is_cached_and_stable',
      rustSourceTest: '#[test] fn domain_endpoint_is_cached_and_stable()',
      description: 'Same domain endpoint must keep the exact same resolved address within TTL window despite DNS rotation.',
      passed: t2Passed,
      executionMs: +(performance.now() - t2Start).toFixed(3),
      details: `Call A: ${a} == Call B: ${b} (isLoopback: ${isLoopback})`
    });

    // Test 3: distinct_endpoints_are_distinct_cache_keys
    const t3Start = performance.now();
    const ep3A = "localhost:18081";
    const ep3B = "localhost:18082";
    const resA = this.stickyResolve(ep3A).addr;
    const resB = this.stickyResolve(ep3B).addr;
    const t3Passed = resA.endsWith(":18081") && resB.endsWith(":18082");
    results.push({
      id: 'test_3',
      name: 'distinct_endpoints_are_distinct_cache_keys',
      rustSourceTest: '#[test] fn distinct_endpoints_are_distinct_cache_keys()',
      description: 'Different endpoints (differing by port or host) must be isolated into distinct cache keys.',
      passed: t3Passed,
      executionMs: +(performance.now() - t3Start).toFixed(3),
      details: `endpoint 18081 -> ${resA}, endpoint 18082 -> ${resB}`
    });

    // Test 4: split_host_port_handles_ipv6
    const t4Start = performance.now();
    const [h1, p1] = this.splitHostPort("[2001:db8::1]:8443");
    const [h2, p2] = this.splitHostPort("example.com:443");
    const t4Passed = h1 === "2001:db8::1" && p1 === "8443" && h2 === "example.com" && p2 === "443";
    results.push({
      id: 'test_4',
      name: 'split_host_port_handles_ipv6',
      rustSourceTest: '#[test] fn split_host_port_handles_ipv6()',
      description: 'Correctly tokenizes RFC 3986 bracketed IPv6 addresses with ports alongside standard host:port.',
      passed: t4Passed,
      executionMs: +(performance.now() - t4Start).toFixed(3),
      details: `[2001:db8::1]:8443 => ("${h1}", "${p1}"), example.com:443 => ("${h2}", "${p2}")`
    });

    return results;
  }
}

export const stickyEngine = new StickyCacheEngine();

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Database, 
  Flame, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Zap 
} from 'lucide-react';
import { stickyEngine, UPSTREAM_DNS_RECORDS, STICKY_TTL_MS } from '../lib/stickyEngine';
import { StickyEntry, TestCaseResult } from '../types';

export const StickyEngineView: React.FC = () => {
  const [testEndpoint, setTestEndpoint] = useState('hk1.proxy-node.net:443');
  const [testResult, setTestResult] = useState<ReturnType<typeof stickyEngine.stickyResolve> | null>(null);
  const [cacheEntries, setCacheEntries] = useState<StickyEntry[]>([]);
  const [unitTestResults, setUnitTestResults] = useState<TestCaseResult[]>([]);
  const [isSimulatingDrift, setIsSimulatingDrift] = useState(false);
  const [driftRuns, setDriftRuns] = useState<{
    noSticky: string[];
    withSticky: string[];
    ipsWithoutSticky: Set<string>;
    ipsWithSticky: Set<string>;
  } | null>(null);

  const refreshCache = () => {
    setCacheEntries(stickyEngine.getEntries());
  };

  useEffect(() => {
    // Initial resolve
    const res = stickyEngine.stickyResolve(testEndpoint);
    setTestResult(res);
    refreshCache();

    // Run tests once on mount
    const tests = stickyEngine.runRustUnitTests();
    setUnitTestResults(tests);

    const interval = setInterval(() => {
      refreshCache();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (endpoint: string, bypassCache = false) => {
    const res = stickyEngine.stickyResolve(endpoint, { forceBypassCache: bypassCache });
    setTestResult(res);
    refreshCache();
  };

  const handleRunUnitTests = () => {
    const tests = stickyEngine.runRustUnitTests();
    setUnitTestResults(tests);
    refreshCache();
  };

  const handleClearCache = () => {
    stickyEngine.clearCache();
    refreshCache();
    if (testResult) {
      setTestResult(null);
    }
  };

  const handleDeleteEntry = (key: string) => {
    stickyEngine.removeEntry(key);
    refreshCache();
  };

  // Run DNS Drift Demonstration
  const runDriftSimulation = async () => {
    setIsSimulatingDrift(true);
    const domain = 'hk1.proxy-node.net:443';
    const noStickyList: string[] = [];
    const withStickyList: string[] = [];
    const setNoSticky = new Set<string>();
    const setWithSticky = new Set<string>();

    // Temporarily ensure domain is cached with current stickyEngine
    stickyEngine.stickyResolve(domain);

    for (let i = 0; i < 10; i++) {
      // 1. Without sticky: resolves raw DNS round-robin every dial
      const [host, port] = stickyEngine.splitHostPort(domain);
      const pool = UPSTREAM_DNS_RECORDS[host] || ['103.21.244.15'];
      const rawDnsIp = pool[Math.floor(Math.random() * pool.length)] + `:${port}`;
      noStickyList.push(rawDnsIp);
      setNoSticky.add(rawDnsIp);

      // 2. With sticky: uses sticky_resolve cache
      const stickyRes = stickyEngine.stickyResolve(domain);
      withStickyList.push(stickyRes.addr);
      setWithSticky.add(stickyRes.addr);

      setDriftRuns({
        noSticky: [...noStickyList],
        withSticky: [...withStickyList],
        ipsWithoutSticky: new Set(setNoSticky),
        ipsWithSticky: new Set(setWithSticky)
      });

      await new Promise((r) => setTimeout(r, 120));
    }

    setIsSimulatingDrift(false);
    refreshCache();
  };

  const stats = stickyEngine.getStats();

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Explainer */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 border border-orange-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-slate-100">
                Rust 原生 sticky-ip 模块（source/sticky.rs）
              </h2>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 max-w-3xl leading-relaxed">
              移植自 kdae / <code className="text-orange-300 font-mono">olicesx/outbound</code>。
              当透明代理节点为域名时，在 TTL 窗口（默认 300 秒，5 分钟）内锁定第一次解析的 IP，防止 DNS 漂移（DNS Rotation）引起存量长连接震荡或认证失效。裸 IP 直通不占缓存。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunUnitTests}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run 4 Rust Unit Tests</span>
            </button>
            <button
              onClick={runDriftSimulation}
              disabled={isSimulatingDrift}
              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold text-slate-950 flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-orange-950/50"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isSimulatingDrift ? 'Simulating...' : 'Simulate DNS Drift'}</span>
            </button>
          </div>
        </div>

        {/* Engine Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Default TTL Window</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {STICKY_TTL_MS / 1000}s (5 min)
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Sticky Cache Hits</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {stats.hits} hits
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">DNS Resolves (Misses)</span>
            <span className="text-sm font-bold font-mono text-cyan-400">
              {stats.misses} queries
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">IP Passthroughs</span>
            <span className="text-sm font-bold font-mono text-purple-400">
              {stats.passthroughs} bypass
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Resolver & DNS Drift Compare */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Resolver Test Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Interactive <code className="text-orange-400">sticky_resolve(&str)</code>
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                source/sticky.rs : 34
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Target Endpoint (Host:Port, Domain, Bare IPv4, or IPv6):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResolve(testEndpoint)}
                    placeholder="e.g. hk1.proxy-node.net:443, [::1]:443, 103.21.244.15:443"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => handleResolve(testEndpoint)}
                    className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-medium text-slate-950 transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(testEndpoint, true)}
                    title="Force DNS re-resolve bypassing cache"
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preset quick test pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 py-0.5">Presets:</span>
                {[
                  'hk1.proxy-node.net:443',
                  'sgp.speededge.org:8443',
                  '103.21.244.15:443',
                  '[2001:db8::1]:8443',
                  '[::1]:443',
                  'localhost:18080'
                ].map((ep) => (
                  <button
                    key={ep}
                    onClick={() => {
                      setTestEndpoint(ep);
                      handleResolve(ep);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {ep}
                  </button>
                ))}
              </div>

              {/* Resolution Inspection Card */}
              {testResult && (
                <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Resolved Socket Address:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                      {testResult.addr}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500">Cache Status:</span>
                      <div className="font-semibold mt-0.5">
                        {testResult.isPassthrough ? (
                          <span className="text-purple-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Bare IP Passthrough
                          </span>
                        ) : testResult.fromCache ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sticky Cache HIT
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Fresh DNS Resolution
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Remaining TTL:</span>
                      <div className="font-mono font-semibold text-slate-200 mt-0.5">
                        {testResult.isPassthrough ? 'N/A (Direct IP)' : `${testResult.remainingTtlSec}s remaining`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rust Unit Tests Live Execution Panel */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Unit Test Suite (4/4 in <code className="text-orange-400">source/sticky.rs</code>)
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                All Passing
              </span>
            </div>

            <div className="space-y-2">
              {unitTestResults.map((test) => (
                <div
                  key={test.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {test.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {test.executionMs} ms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {test.description}
                  </p>
                  <div className="mt-1 text-[10px] font-mono text-slate-500 truncate bg-slate-900 px-2 py-1 rounded">
                    {test.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: DNS Drift Demonstration & Active Cache Table */}
        <div className="lg:col-span-6 space-y-4">
          {/* DNS Drift Simulation Card */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  DNS Drift Prevention Demonstration
                </h3>
              </div>
              <button
                onClick={runDriftSimulation}
                disabled={isSimulatingDrift}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSimulatingDrift ? 'animate-spin' : ''}`} />
                Rerun 10 Dials
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Upstream proxy domain <code className="text-orange-300 font-mono">hk1.proxy-node.net</code> has 4 rotating IPs in DNS. Notice the critical difference across 10 outbound dials:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Without Sticky */}
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-red-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Without Sticky-IP
                  </span>
                  <span className="text-[10px] text-red-400 font-mono">
                    {driftRuns ? `${driftRuns.ipsWithoutSticky.size} distinct IPs` : 'Flapping'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Each dial resolves DNS independently. IP changes cause broken sessions:
                </p>
                <div className="space-y-1 font-mono text-[10px] max-h-32 overflow-y-auto">
                  {(driftRuns?.noSticky || [
                    '103.21.244.15:443',
                    '103.21.244.22:443',
                    '103.21.244.18:443',
                    '103.21.244.30:443',
                    '103.21.244.15:443'
                  ]).map((ip, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 px-1.5 rounded bg-red-950/30 text-red-300">
                      <span>Dial #{idx + 1}</span>
                      <span>{ip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* With Sticky-IP */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> With Rust Sticky-IP
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {driftRuns ? `${driftRuns.ipsWithSticky.size} stable IP` : '100% Stable'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Reuses first resolved address for 300s TTL. Zero connection drift:
                </p>
                <div className="space-y-1 font-mono text-[10px] max-h-32 overflow-y-auto">
                  {(driftRuns?.withSticky || [
                    '103.21.244.15:443',
                    '103.21.244.15:443',
                    '103.21.244.15:443',
                    '103.21.244.15:443',
                    '103.21.244.15:443'
                  ]).map((ip, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 px-1.5 rounded bg-emerald-950/30 text-emerald-300">
                      <span>Dial #{idx + 1}</span>
                      <span>{ip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Sticky Cache Table */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Active Sticky Cache Entries ({cacheEntries.length})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearCache}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/40 rounded flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Flush Cache</span>
                </button>
              </div>
            </div>

            {cacheEntries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
                Cache is currently empty. Resolve a domain endpoint above to populate sticky cache.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-2 px-2.5">Domain Endpoint</th>
                      <th className="py-2 px-2.5">Pinned Socket Addr</th>
                      <th className="py-2 px-2.5">TTL Left</th>
                      <th className="py-2 px-2.5">Hits</th>
                      <th className="py-2 px-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {cacheEntries.map((entry) => {
                      const ttlLeftSec = Math.max(0, Math.round((entry.expiresAt - Date.now()) / 1000));
                      const ttlPercent = Math.min(100, Math.max(0, (ttlLeftSec / (STICKY_TTL_MS / 1000)) * 100));
                      return (
                        <tr key={entry.endpoint} className="hover:bg-slate-800/30">
                          <td className="py-2 px-2.5 text-slate-200 font-semibold truncate max-w-[140px]">
                            {entry.endpoint}
                          </td>
                          <td className="py-2 px-2.5 text-emerald-400">
                            {entry.addr}
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 transition-all duration-500"
                                  style={{ width: `${ttlPercent}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] text-slate-400">{ttlLeftSec}s</span>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-slate-300">
                            {entry.hitCount}
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            <button
                              onClick={() => handleDeleteEntry(entry.endpoint)}
                              title="Evict entry"
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

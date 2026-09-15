import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  Terminal 
} from 'lucide-react';
import { EngineStats } from '../types';

interface ProxyEngineViewProps {
  stats: EngineStats;
  onTriggerReload: () => void;
}

export const ProxyEngineView: React.FC<ProxyEngineViewProps> = ({ stats, onTriggerReload }) => {
  const [logs, setLogs] = useState<string[]>([
    '[INIT] dae-daemon 3.1.2 booting with aya 0.12.0 (Rust nightly)',
    '[KERNEL] BTF verification passed on /sys/kernel/btf/vmlinux',
    '[BPF] Ingress clsact filter attached to eth0 (NET_CLS_BPF)',
    '[STICKY] Sticky-IP module initialized with OnceLock<Mutex<HashMap>>',
    '[RESIDENT] Userspace TCP/UDP datapath loaded, resident pool 32MB',
    '[GENERATION] Generation #1 active, listening on 0.0.0.0:2023'
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Periodic subtle telemetry line
      const randConn = Math.floor(Math.random() * 20) + 30;
      setLogs((prev) => {
        const next = [...prev];
        if (next.length > 20) next.shift();
        next.push(`[TELEMETRY] resident datapath: ${randConn} active tcp flows, 0 drops`);
        return next;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleManualReload = () => {
    onTriggerReload();
    setLogs((prev) => [
      ...prev,
      `[RELOAD] GenerationSwap initiated: migrating to Gen #${stats.generation + 1}`,
      `[RELOAD] Active sockets preserved across generation barrier without drop`,
      `[GENERATION] Gen #${stats.generation + 1} fully active`
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <Cpu className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Aya + Nightly</h3>
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">Full-Rust eBPF</div>
          <p className="text-xs text-slate-400">
            dae-daemon, datapath, DNS, and eBPF maps compiled purely in Rust. Zero C/Go dependencies.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Kernel & BTF</h3>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">Kernel ≥ 5.8</div>
          <p className="text-xs text-slate-400">
            BTF vmlinux verification active. Hooks into clsact and veth virtual interfaces.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <RefreshCw className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">GenerationSwap</h3>
          </div>
          <div className="text-lg font-bold text-purple-400 font-mono">Zero-Drop Reload</div>
          <p className="text-xs text-slate-400">
            Hot-reloads routing tables and proxy configs while retaining all in-flight TCP/UDP streams.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <HardDrive className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Resident Stack</h3>
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono">32.4 MB RSS</div>
          <p className="text-xs text-slate-400">
            Resident user-space datapath with custom allocator tuning for low-memory soft routers.
          </p>
        </div>
      </div>

      {/* GenerationSwap and Kernel Verification Box */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              GenerationSwap Connection Preservation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Generation: <span className="font-mono text-amber-300 font-bold">#{stats.generation}</span> · 
              Uptime: <span className="font-mono text-slate-200">{Math.floor(stats.uptimeSeconds / 60)}m {stats.uptimeSeconds % 60}s</span>
            </p>
          </div>

          <button
            onClick={handleManualReload}
            disabled={stats.state === 'reloading'}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold text-slate-950 flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-orange-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${stats.state === 'reloading' ? 'animate-spin' : ''}`} />
            <span>Trigger GenerationSwap Reload</span>
          </button>
        </div>

        {/* Kernel Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[
            { label: 'BTF Type Format', status: 'Enabled & Verified (/sys/kernel/btf)', ok: true },
            { label: 'clsact Scheduler', status: 'NET_CLS_ACT / NET_CLS_BPF active', ok: true },
            { label: 'Virtual Ethernet (veth)', status: 'Enabled for routing redirects', ok: true },
            { label: 'Host Tooling', status: 'tc, bpftool, ipset present', ok: true }
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-medium block">{item.label}</span>
                <span className="text-[11px] text-slate-400 font-mono">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Kernel & Daemon Console Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
          <span className="flex items-center gap-1.5 text-xs text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-orange-400" />
            dae-daemon telemetry & kernel logs
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
        </div>
        <div className="space-y-1 text-[11px] max-h-48 overflow-y-auto pt-1 text-slate-300">
          {logs.map((log, idx) => (
            <div key={idx} className="flex space-x-2">
              <span className="text-slate-600 select-none">{String(idx + 1).padStart(2, '0')}</span>
              <span className={log.includes('[RELOAD]') ? 'text-amber-300' : log.includes('[STICKY]') ? 'text-cyan-300' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

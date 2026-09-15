import React from 'react';
import { Activity, Cpu, RotateCw, ShieldCheck, Terminal } from 'lucide-react';
import { EngineStats } from '../types';

interface HeaderProps {
  stats: EngineStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTriggerReload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  activeTab,
  setActiveTab,
  onTriggerReload
}) => {
  const tabs = [
    { id: 'live', label: '原生 daed 控制台 (Live APK)', badge: 'LIVE' },
    { id: 'sticky', label: 'Sticky-IP 模拟引擎', badge: 'Core' },
    { id: 'nodes', label: '节点与传输协议', badge: `${stats.activeConnections} active` },
    { id: 'dataplane', label: 'eBPF 监控', badge: 'Aya+Nightly' },
    { id: 'packages', label: 'Release Assets 发布清单', badge: '10 Assets' },
    { id: 'patch', label: '源码与补丁', badge: '8 files' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-orange-400/30">
              <span className="text-xl font-black text-slate-950 tracking-tighter">🦀</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">rust-daed</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-950/80 text-orange-400 border border-orange-800/60">
                  v3.1.2
                </span>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  sticky-ip active
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                DaedNext / DaeNext Rust 原生透明代理 · OpenWrt 25.12 apk v3
              </p>
            </div>
          </div>

          {/* Quick Stats & Generation Action */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-4 px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>BTF: <strong className="text-emerald-400">Verified</strong></span>
              </div>
              <div className="w-px h-3 bg-slate-800"></div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>eBPF: <strong className="text-slate-100">clsact</strong></span>
              </div>
              <div className="w-px h-3 bg-slate-800"></div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Gen: <strong className="text-amber-300 font-mono">#{stats.generation}</strong></span>
              </div>
            </div>

            <button
              onClick={onTriggerReload}
              title="Trigger connection-preserving GenerationSwap reload"
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-xs font-medium text-slate-200 border border-slate-700/80 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 text-orange-400 ${stats.state === 'reloading' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">GenerationSwap</span>
              <span>Reload</span>
            </button>

            <div className="flex items-center px-2 py-1 bg-slate-800/50 rounded border border-slate-800 text-[11px] font-mono text-slate-400">
              <Terminal className="w-3 h-3 mr-1 text-slate-500" />
              :2023
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Check, Copy, Layers, ShieldCheck } from 'lucide-react';
import { PATCH_FILES } from '../lib/mockData';

export const PatchViewer: React.FC = () => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedPatch = PATCH_FILES[selectedFileIdx];

  const handleCopyDiff = (diff: string) => {
    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upstream Architecture Diagram / Card */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-orange-400">
          <Layers className="w-5 h-5" />
          <h2 className="text-sm font-bold text-slate-100">
            DaeNext 架构层级 & 补丁嵌入点（patches/APPLY-STICKY.md）
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          上游 ksong008/DaeNext 拆分为三个核心 outbound crate。sticky 模块置于底层共享 crate（<code>dae-outbound-core</code>），上层传输协议（<code>dae-outbound-stream</code>）统一通过 <code>sticky_connect</code> 建连：
        </p>

        {/* Architecture Crate Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">协议层</span>
            <div className="text-sm font-mono font-bold text-slate-200">dae-outbound</div>
            <p className="text-[11px] text-slate-400">
              规则路由、分流选择器与高层代理会话调度
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">传输层（已打补丁）</span>
            <div className="text-sm font-mono font-bold text-slate-200">dae-outbound-stream</div>
            <p className="text-[11px] text-slate-400">
              grpc / mux / meek / reality / xhttp / shadowsocks 建连拦截
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-orange-500/40 space-y-1 bg-orange-950/10">
            <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">核心共享层（新增 sticky 模块）</span>
            <div className="text-sm font-mono font-bold text-orange-300">dae-outbound-core</div>
            <p className="text-[11px] text-slate-300">
              OnceLock&lt;Mutex&lt;HashMap&gt;&gt; 缓存 + 300s TTL + 4 单测
            </p>
          </div>
        </div>
      </div>

      {/* Diff Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Patched Files (8)</span>
            <span className="text-orange-400 font-mono">sticky-ip-full.patch</span>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {PATCH_FILES.map((file, idx) => {
              const isSelected = selectedFileIdx === idx;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500/40 text-slate-100 shadow-md'
                      : 'bg-slate-900/50 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="truncate font-semibold text-slate-200">{file.path.split('/').pop()}</span>
                    <span className="text-orange-400 text-[10px]">+{file.changesCount}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                    {file.path}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diff Viewer */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold font-mono text-orange-400">
                  {selectedPatch.path}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPatch.description}
                </p>
              </div>

              <button
                onClick={() => handleCopyDiff(selectedPatch.codeDiff)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Diff'}</span>
              </button>
            </div>

            {/* Syntax Code block */}
            <pre className="mt-3 p-3 rounded-lg bg-slate-900/90 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800/80 text-slate-200">
              {selectedPatch.codeDiff.split('\n').map((line, lidx) => {
                let colorClass = 'text-slate-300';
                if (line.startsWith('+')) colorClass = 'text-emerald-400 bg-emerald-950/30';
                else if (line.startsWith('-')) colorClass = 'text-rose-400 bg-rose-950/30';
                else if (line.startsWith('@')) colorClass = 'text-cyan-400';
                return (
                  <div key={lidx} className={`px-1 rounded-sm ${colorClass}`}>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono text-[11px]">
              cargo test -p dae-outbound-core sticky::tests (4/4 passed)
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

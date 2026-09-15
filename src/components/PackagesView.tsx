import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown,
  ChevronUp,
  Copy, 
  Download, 
  ExternalLink, 
  FileArchive, 
  Grid, 
  HardDrive, 
  Hash, 
  Info, 
  List, 
  Package, 
  Search, 
  ShieldCheck, 
  Terminal 
} from 'lucide-react';
import { RELEASE_PACKAGES } from '../lib/mockData';

export const PackagesView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState<'all' | 'apk v3' | 'apk v2' | 'deb'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [assetsOpen, setAssetsOpen] = useState<boolean>(true);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter packages based on format and search query
  const filteredPackages = RELEASE_PACKAGES.filter((pkg) => {
    const matchesFormat = filterFormat === 'all' || pkg.format === filterFormat;
    const matchesSearch = searchQuery === '' || 
      pkg.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.sha256 && pkg.sha256.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFormat && matchesSearch;
  });

  const generateChecksumsText = () => {
    return RELEASE_PACKAGES.map((pkg) => `${pkg.sha256}  ${pkg.filename}`).join('\n');
  };

  return (
    <div className="space-y-6">
      {/* GitHub Release Post Card */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        {/* Release Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="p-1.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <Package className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                rust-daed v3.1.2
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-medium">
                Latest
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                Tag: v3.1.2
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center space-x-2 font-mono pt-1">
              <span className="font-sans text-slate-300 font-semibold">Quan-0505</span>
              <span>released this on Sep 15, 2026</span>
              <span>•</span>
              <a
                href="https://github.com/Quan-0505/rust-daed/commits/v3.1.2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>commit v3.1.2</span>
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(generateChecksumsText(), 'all-checksums')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
              title="复制全部 10 个发布资产的 SHA256 校验和"
            >
              {copiedId === 'all-checksums' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Hash className="w-3.5 h-3.5 text-orange-400" />
              )}
              <span>{copiedId === 'all-checksums' ? '已复制 SHA256' : '复制 SHA256 校验列表'}</span>
            </button>

            <a
              href="https://github.com/Quan-0505/rust-daed/releases/tag/v3.1.2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub Release 页面</span>
            </a>
          </div>
        </div>

        {/* Release Notes Body */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <span className="text-orange-400 font-mono">README.md</span>
              <span>•</span>
              <span>daed（DaedNext，Rust 原生）一体式透明代理安装包 · 含 sticky-ip 增强</span>
            </div>
            <p className="text-slate-400">
              跟随上游主线（DaedNext/DaeNext 最新，218 commits 更新）+ <strong className="text-orange-300">sticky-ip</strong> 深度定制。基于 DaedNext（Rust 版 daed Web）+ DaeNext（Rust 原生 dae 引擎）+ Aya（纯 Rust eBPF），移植并集成了 sticky-ip 智能连接锁定与防 DNS 漂移机制。
            </p>
          </div>

          {/* Upstream & Sticky-IP updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span>⚡ 上游核心 218 commits 同步</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>内存管理重构：allocator worker flush、系统分配器主动 trim</li>
                <li>UDP/TCP 主动回收：空闲缓冲回收、会话准入限流保护</li>
                <li>协议修复：SSR SS2022 线格式、AnyTLS 认证/padding、Juicity 隔离</li>
                <li>关停修复：协议 owner 快速取消与 shutdown 等待者唤醒</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
              <div className="font-semibold text-orange-400 flex items-center gap-1.5">
                <span>📌 sticky-ip 深度适配新架构</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>适配上游拆出的 dae-outbound-stream / dae-outbound-core 架构</li>
                <li>sticky 状态模块移至底层 core，接入 9 处出站传输建连点</li>
                <li>TTL 内智能锁定节点首选 IP，彻底避免 CDN 调度与 DNS 漂移导致的频繁重连</li>
                <li>4 项单元测试（并发锁定、TTL 过期、故障降级、自愈重置）全部通过</li>
              </ul>
            </div>
          </div>

          {/* Guidelines Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
              <span>🎯 硬件与平台选型矩阵（参考 daed-kdae 统一发行规范）</span>
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">平台 / 设备</th>
                    <th className="py-2.5 px-3">OpenWrt 25.12+ (apk v3)</th>
                    <th className="py-2.5 px-3">OpenWrt 24.x/23.x/Alpine (apk v2)</th>
                    <th className="py-2.5 px-3">Debian / Ubuntu (deb)</th>
                    <th className="py-2.5 px-3">架构与指令集</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                      Debian / Ubuntu x86_64 (SSE4.2)
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-blue-400">rust-daed_3.1.2-linux-x86_64_v2_sse.deb</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">x86_64 (老旧 CPU 通用)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                      Debian / Ubuntu x86_64 (AVX2)
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-blue-400">rust-daed_3.1.2-linux-x86_64_v3_avx2.deb</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">x86_64 (Intel 4代+ / AMD Zen+)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                      OpenWrt x86_64 软路由
                    </td>
                    <td className="py-2.5 px-3 text-orange-400">rust-daed_3.1.2-x86_64-v3.apk</td>
                    <td className="py-2.5 px-3 text-amber-400">rust-daed_3.1.2-x86_64-v2.apk</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-slate-400">x86_64</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                      NanoPi R4S
                    </td>
                    <td className="py-2.5 px-3 text-orange-400">rust-daed_3.1.2-R4S-v3.apk</td>
                    <td className="py-2.5 px-3 text-amber-400">rust-daed_3.1.2-R4S-v2.apk</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">aarch64_generic (RK3399)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                      NanoPi R3S
                    </td>
                    <td className="py-2.5 px-3 text-orange-400">rust-daed_3.1.2-R3S-v3.apk</td>
                    <td className="py-2.5 px-3 text-amber-400">rust-daed_3.1.2-R3S-v2.apk</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">aarch64_generic (RK3566)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                      NanoPi R2S
                    </td>
                    <td className="py-2.5 px-3 text-orange-400">rust-daed_3.1.2-R2S-v3.apk</td>
                    <td className="py-2.5 px-3 text-amber-400">rust-daed_3.1.2-R2S-v2.apk</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">aarch64_generic (RK3328)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Install */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>🚀 快速开始与安装命令</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-blue-400 font-semibold font-sans">Debian / Ubuntu (deb)</div>
                <div className="text-slate-400">sudo dpkg -i rust-daed_3.1.2-linux-x86_64_v2_sse.deb</div>
                <div className="text-slate-500"># 或 AVX2: rust-daed_3.1.2-linux-x86_64_v3_avx2.deb</div>
                <div className="text-cyan-300">sudo systemctl enable --now daed</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-orange-400 font-semibold font-sans">OpenWrt 25.12+ (apk v3)</div>
                <div className="text-slate-400">apk add --allow-untrusted ./rust-daed_3.1.2-&lt;device&gt;-v3.apk</div>
                <div className="text-cyan-300">/etc/init.d/daed enable && /etc/init.d/daed start</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-amber-400 font-semibold font-sans">OpenWrt 24.x/23.x (apk v2)</div>
                <div className="text-slate-400">apk add --allow-untrusted ./rust-daed_3.1.2-&lt;device&gt;-v2.apk</div>
                <div className="text-cyan-300">/etc/init.d/daed enable && /etc/init.d/daed start</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
              <span>Web 面板地址：</span>
              <code className="text-amber-300 font-mono">http://&lt;机器IP&gt;:2023</code>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">内核需 ≥ 5.8 且开启 BTF (`CONFIG_DEBUG_INFO_BTF=y`)</span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Style Assets Container */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {/* Assets Section Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setAssetsOpen(!assetsOpen)}
              className="flex items-center space-x-2 text-sm font-bold text-slate-100 hover:text-orange-400 transition-colors cursor-pointer"
            >
              {assetsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              <span>Assets</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold border border-slate-700">
                {RELEASE_PACKAGES.length + 2}
              </span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline font-mono">
              (10 个编译发行包 + 2 个源码包)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="筛选文件名 / 架构 / 哈希..."
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 w-48 font-mono"
              />
            </div>

            {/* Format Filter Tabs */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setFilterFormat('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterFormat === 'all'
                    ? 'bg-orange-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterFormat('deb')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterFormat === 'deb'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                deb (2)
              </button>
              <button
                onClick={() => setFilterFormat('apk v3')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterFormat === 'apk v3'
                    ? 'bg-orange-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                apk v3 (4)
              </button>
              <button
                onClick={() => setFilterFormat('apk v2')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterFormat === 'apk v2'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                apk v2 (4)
              </button>
            </div>

            {/* Layout switch: List (GitHub standard) vs Grid */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-slate-800 text-orange-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="GitHub 风格列表"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-orange-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="卡片网格"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Assets Content */}
        {assetsOpen && (
          <div>
            {viewMode === 'list' ? (
              /* GitHub Native Style Assets Table */
              <div className="divide-y divide-slate-800/70">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* File info */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <Package className={`w-4 h-4 flex-shrink-0 ${
                        pkg.format === 'deb' ? 'text-blue-400' : pkg.format === 'apk v3' ? 'text-orange-400' : 'text-amber-400'
                      }`} />
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <a
                            href={pkg.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs font-semibold text-blue-400 hover:underline hover:text-blue-300 truncate"
                            title={`点击直链下载 ${pkg.filename}`}
                          >
                            {pkg.filename}
                          </a>
                          <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded font-medium ${
                            pkg.format === 'apk v3'
                              ? 'bg-orange-950/80 text-orange-400 border border-orange-800/50'
                              : pkg.format === 'apk v2'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              : 'bg-blue-950/80 text-blue-400 border border-blue-800/50'
                          }`}>
                            {pkg.format}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                            {pkg.arch}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-0.5 truncate">
                          {pkg.description}
                        </div>
                      </div>
                    </div>

                    {/* Metadata, Hashes & Actions */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0 pt-1 sm:pt-0">
                      {/* SHA256 Pill */}
                      {pkg.sha256 && (
                        <div className="relative group">
                          <button
                            onClick={() => copyToClipboard(pkg.sha256!, `${pkg.id}-sha`)}
                            className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center space-x-1 transition-colors cursor-pointer"
                            title={`SHA256: ${pkg.sha256}\n点击复制完整哈希`}
                          >
                            <Hash className="w-3 h-3 text-slate-500" />
                            <span>{pkg.sha256.slice(0, 8)}...</span>
                            {copiedId === `${pkg.id}-sha` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* File Size */}
                      <span className="text-xs font-mono text-slate-300 w-16 text-right font-medium">
                        {pkg.size}
                      </span>

                      {/* Copy Install Command */}
                      <button
                        onClick={() => copyToClipboard(pkg.installCommand, `${pkg.id}-cmd`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer"
                        title={`复制安装命令:\n${pkg.installCommand}`}
                      >
                        {copiedId === `${pkg.id}-cmd` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Terminal className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>

                      {/* Download Link */}
                      <a
                        href={pkg.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40 transition-colors cursor-pointer"
                        title={`下载 ${pkg.filename}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}

                {/* GitHub Standard Source Code Archives */}
                <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors bg-slate-950/40">
                  <div className="flex items-center space-x-3">
                    <FileArchive className="w-4 h-4 text-slate-400" />
                    <div>
                      <a
                        href="https://github.com/Quan-0505/rust-daed/archive/refs/tags/v3.1.2.zip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-semibold text-blue-400 hover:underline"
                      >
                        Source code (zip)
                      </a>
                      <span className="text-[10px] text-slate-400 block">
                        rust-daed v3.1.2 Release 源代码打包 (zip)
                      </span>
                    </div>
                  </div>
                  <a
                    href="https://github.com/Quan-0505/rust-daed/archive/refs/tags/v3.1.2.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                </div>

                <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors bg-slate-950/40">
                  <div className="flex items-center space-x-3">
                    <FileArchive className="w-4 h-4 text-slate-400" />
                    <div>
                      <a
                        href="https://github.com/Quan-0505/rust-daed/archive/refs/tags/v3.1.2.tar.gz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-semibold text-blue-400 hover:underline"
                      >
                        Source code (tar.gz)
                      </a>
                      <span className="text-[10px] text-slate-400 block">
                        rust-daed v3.1.2 Release 源代码打包 (tar.gz)
                      </span>
                    </div>
                  </div>
                  <a
                    href="https://github.com/Quan-0505/rust-daed/archive/refs/tags/v3.1.2.tar.gz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                  </a>
                </div>
              </div>
            ) : (
              /* Bento Grid Cards View */
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-950/50">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`p-1.5 rounded-lg ${
                            pkg.format === 'deb' ? 'bg-blue-950 text-blue-400 border border-blue-800/50' :
                            pkg.format === 'apk v3' ? 'bg-orange-950 text-orange-400 border border-orange-800/50' :
                            'bg-amber-950 text-amber-400 border border-amber-800/50'
                          }`}>
                            <HardDrive className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">{pkg.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{pkg.arch}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                          pkg.format === 'deb' ? 'bg-blue-950 text-blue-400 border border-blue-800/50' :
                          pkg.format === 'apk v3' ? 'bg-orange-950 text-orange-400 border border-orange-800/50' :
                          'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}>
                          {pkg.format}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 leading-snug">
                        {pkg.description}
                      </p>

                      <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex justify-between items-center">
                        <span className="truncate max-w-[170px] text-slate-200 font-semibold">{pkg.filename}</span>
                        <span className="text-orange-400 font-bold">{pkg.size}</span>
                      </div>

                      {pkg.sha256 && (
                        <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between p-1.5 rounded bg-slate-950/70 border border-slate-800/70">
                          <span className="truncate max-w-[210px]" title={pkg.sha256}>
                            SHA256: {pkg.sha256.slice(0, 16)}...
                          </span>
                          <button
                            onClick={() => copyToClipboard(pkg.sha256!, `${pkg.id}-sha-grid`)}
                            className="p-0.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            title="复制完整 SHA256"
                          >
                            {copiedId === `${pkg.id}-sha-grid` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono mb-1">安装命令:</span>
                        <div className="relative">
                          <pre className="p-2 rounded-lg bg-slate-950 text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                            {pkg.installCommand}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(pkg.installCommand, `${pkg.id}-cmd-grid`)}
                            className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="复制命令"
                          >
                            {copiedId === `${pkg.id}-cmd-grid` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <a
                        href={pkg.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        <span>下载 {pkg.filename}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 运行前提与系统要求 (Aligned with daed-kdae specification) */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-amber-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-bold text-slate-100">
            运行前提与内核要求（daed-kdae 规格要求）
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <h4 className="font-bold text-orange-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> 内核与驱动模块
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>内核版本 ≥ 5.8 且启用 <strong>BTF</strong>（<code>CONFIG_DEBUG_INFO_BTF=y</code>）</li>
              <li>内核网络模块：<strong>veth</strong> 与 <strong>clsact</strong>（<code>NET_SCH_INGRESS</code> / <code>NET_CLS_ACT</code> / <code>NET_CLS_BPF</code>）</li>
              <li>系统网络工具库：<code>iproute2 ≥ 6.7</code></li>
              <li>宿主基础工具：<code>tc</code> / <code>bpftool</code> / <code>ipset</code></li>
            </ul>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> 部署与冲突注意事项
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-relaxed">
              <li>
                <strong>BTF 是共同前提：</strong>官方 OpenWrt 固件多默认未开启，需自编译内核或使用已启用的固件（如 <a href="https://github.com/Quan-0505/OpenWrt" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Quan-0505/OpenWrt</a>）。
              </li>
              <li>
                <strong>唯一服务覆盖提示：</strong>本包与 <a href="https://github.com/Quan-0505/rust-daed" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">rust-daed</a>（Rust 引擎版）都提供 <code>/usr/bin/daed</code> 与 <code>/etc/init.d/daed</code>，两者只能装一个，后装的会覆盖先装的。
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

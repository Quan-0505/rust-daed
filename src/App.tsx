import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { LiveDaedView } from './components/LiveDaedView';
import { StickyEngineView } from './components/StickyEngineView';
import { NodeManagerView } from './components/NodeManagerView';
import { ProxyEngineView } from './components/ProxyEngineView';
import { PackagesView } from './components/PackagesView';
import { PatchViewer } from './components/PatchViewer';
import { EngineStats } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('live');
  const [stats, setStats] = useState<EngineStats>({
    state: 'running',
    generation: 1,
    uptimeSeconds: 840,
    activeConnections: 196,
    totalResolvedQueries: 1420,
    stickyCacheHits: 1184,
    stickyCacheMisses: 236,
    ebpfLoaded: true,
    btfVerified: true,
    residentMemoryMb: 32.4,
    kernelVersion: '6.6.21-openwrt',
    residentDatapath: 'Aya + Nightly'
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
        activeConnections: Math.max(150, prev.activeConnections + (Math.floor(Math.random() * 5) - 2))
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTriggerReload = () => {
    setStats((prev) => ({
      ...prev,
      state: 'reloading'
    }));
    setToastMessage('GenerationSwap in progress: swapping config without terminating streams...');

    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        state: 'running',
        generation: prev.generation + 1
      }));
      setToastMessage(`GenerationSwap completed! Generation #${stats.generation + 1} active.`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* App Header */}
      <Header
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerReload={handleTriggerReload}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast alert for GenerationSwap */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-lg bg-orange-950/90 border border-orange-600/40 text-xs text-orange-200 flex items-center justify-between shadow-lg"
            >
              <span>{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-orange-400 hover:text-orange-200 font-bold ml-3"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content with Motion Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'live' && <LiveDaedView />}
            {activeTab === 'sticky' && <StickyEngineView />}
            {activeTab === 'nodes' && <NodeManagerView />}
            {activeTab === 'dataplane' && (
              <ProxyEngineView stats={stats} onTriggerReload={handleTriggerReload} />
            )}
            {activeTab === 'packages' && <PackagesView />}
            {activeTab === 'patch' && <PatchViewer />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-orange-400">rust-daed</span>
            <span>·</span>
            <span>DaedNext + DaeNext (Aya + Nightly) + sticky-ip</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Ported from <code className="text-slate-400">olicesx/outbound</code></span>
            <span>·</span>
            <span className="text-slate-400">AGPL-3.0 License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;

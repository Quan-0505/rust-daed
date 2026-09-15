import React, { useState } from 'react';
import { 
  Lock, 
  Plus, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Wifi 
} from 'lucide-react';
import { INITIAL_NODES } from '../lib/mockData';
import { OutboundProtocol, ProxyNode } from '../types';
import { stickyEngine } from '../lib/stickyEngine';

export const NodeManagerView: React.FC = () => {
  const [nodes, setNodes] = useState<ProxyNode[]>(INITIAL_NODES);
  const [testingLatency, setTestingLatency] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterProtocol, setFilterProtocol] = useState<string>('all');

  // Form states
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeEndpoint, setNewNodeEndpoint] = useState('');
  const [newNodeProtocol, setNewNodeProtocol] = useState<OutboundProtocol>('xhttp');
  const [newNodeGroup, setNewNodeGroup] = useState('Custom Nodes');

  const handleTestAllLatency = async () => {
    setTestingLatency(true);
    const updated = [...nodes];
    for (let i = 0; i < updated.length; i++) {
      // Simulate real ping check
      await new Promise((r) => setTimeout(r, 60));
      const jitter = Math.floor(Math.random() * 8) - 4;
      updated[i].latencyMs = Math.max(12, updated[i].latencyMs + jitter);
      
      // Update sticky resolution
      if (updated[i].isDomain) {
        const res = stickyEngine.stickyResolve(updated[i].endpoint);
        updated[i].resolvedAddr = res.addr;
        updated[i].stickyTtlSec = res.remainingTtlSec;
      } else {
        updated[i].resolvedAddr = updated[i].endpoint;
      }
    }
    setNodes(updated);
    setTestingLatency(false);
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newNodeEndpoint.trim()) return;

    const isDomain = !stickyEngine.isIpAddress(newNodeEndpoint);
    let resolvedAddr = newNodeEndpoint;
    let stickyTtl = 0;
    if (isDomain) {
      const res = stickyEngine.stickyResolve(newNodeEndpoint);
      resolvedAddr = res.addr;
      stickyTtl = res.remainingTtlSec;
    }

    const newNode: ProxyNode = {
      id: `custom-${Date.now()}`,
      name: newNodeName.trim(),
      group: newNodeGroup.trim() || 'Custom Nodes',
      protocol: newNodeProtocol,
      endpoint: newNodeEndpoint.trim(),
      isDomain,
      latencyMs: Math.floor(Math.random() * 40) + 20,
      status: 'online',
      activeStreams: 0,
      resolvedAddr,
      stickyTtlSec: stickyTtl,
      tlsBackend: 'boringssl'
    };

    setNodes([newNode, ...nodes]);
    setNewNodeName('');
    setNewNodeEndpoint('');
    setShowAddModal(false);
  };

  const filteredNodes = filterProtocol === 'all' 
    ? nodes 
    : nodes.filter(n => n.protocol === filterProtocol);

  return (
    <div className="space-y-6">
      {/* Node Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-orange-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100">Outbound Proxy Nodes</h2>
            <p className="text-xs text-slate-400">
              dae-outbound-stream transports patched with <code className="text-orange-300 font-mono">sticky_connect</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter */}
          <select
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Protocols</option>
            <option value="xhttp">xhttp</option>
            <option value="grpc">gRPC</option>
            <option value="reality">Reality</option>
            <option value="mux">MUX</option>
            <option value="shadowsocks-aead">Shadowsocks AEAD</option>
            <option value="ss2022">SS2022</option>
          </select>

          <button
            onClick={handleTestAllLatency}
            disabled={testingLatency}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${testingLatency ? 'animate-spin' : ''}`} />
            <span>{testingLatency ? 'Checking...' : 'Check Latency'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-slate-950 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const isDomain = node.isDomain;
          const resolved = node.resolvedAddr || (isDomain ? stickyEngine.stickyResolve(node.endpoint).addr : node.endpoint);

          return (
            <div
              key={node.id}
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              {/* Header: Name + Group */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {node.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{node.group}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    {node.latencyMs} ms
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {node.activeStreams} streams
                  </span>
                </div>
              </div>

              {/* Endpoint & Sticky-IP info */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Endpoint:</span>
                  <span className="text-slate-200 truncate max-w-[180px]" title={node.endpoint}>
                    {node.endpoint}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Dial IP:</span>
                  <span className="text-emerald-400 font-bold truncate max-w-[180px]">
                    {resolved}
                  </span>
                </div>
              </div>

              {/* Badges: Protocol, Sticky-IP status, BoringSSL */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-medium uppercase border border-slate-700">
                  {node.protocol}
                </span>

                {isDomain ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Sticky-IP (300s TTL)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-medium flex items-center gap-1">
                    Direct IP Passthrough
                  </span>
                )}

                {node.tlsBackend === 'boringssl' && (
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-blue-400" />
                    BoringSSL (PQ-TLS)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Add Outbound Proxy Node
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Node Name:</label>
                <input
                  type="text"
                  required
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g. Frankfurt Low-Latency XHTTP"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Server Endpoint (Domain or IP:Port):
                </label>
                <input
                  type="text"
                  required
                  value={newNodeEndpoint}
                  onChange={(e) => setNewNodeEndpoint(e.target.value)}
                  placeholder="e.g. fra.speededge.org:443 or 104.21.5.8:8443"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-orange-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Domain addresses will automatically attach to the Rust sticky-ip cache with 300s TTL.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Protocol:</label>
                  <select
                    value={newNodeProtocol}
                    onChange={(e) => setNewNodeProtocol(e.target.value as OutboundProtocol)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="xhttp">xhttp (HTTP/1.1)</option>
                    <option value="grpc">gRPC</option>
                    <option value="reality">Reality</option>
                    <option value="mux">MUX</option>
                    <option value="shadowsocks-aead">Shadowsocks AEAD</option>
                    <option value="ss2022">Shadowsocks 2022</option>
                    <option value="meek">Meek</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Group:</label>
                  <input
                    type="text"
                    value={newNodeGroup}
                    onChange={(e) => setNewNodeGroup(e.target.value)}
                    placeholder="Custom Nodes"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-semibold cursor-pointer"
                >
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

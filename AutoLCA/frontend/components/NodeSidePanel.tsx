"use client";

import React, { useState } from "react";
import { X, ChevronRight, Activity, Settings, Database, Terminal, BarChart2, Globe, Layers } from "lucide-react";

type NodeSidePanelProps = {
  node: any;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
};

export function NodeSidePanel({ node, onClose, onUpdate }: NodeSidePanelProps) {
  const [activeTab, setActiveTab] = useState<"mfa" | "lci" | "lcia" | "metadata">("mfa");
  const [dbSearchQuery, setDbSearchQuery] = useState("");
  const [dbResults, setDbResults] = useState<any[]>([]);

  if (!node) return null;

  const data = node.data || {};
  const mfa = data.mfa_parameters || {};
  const lci = data.lci_parameters || {};
  const lcia = data.lcia_impacts || {};
  const meta = data.metadata || {};

  const handleDbSearch = async () => {
    if (!dbSearchQuery) return;
    // Call the fast FastAPI bridge we just built
    try {
        const res = await fetch(`/api/search-db?query=${dbSearchQuery}`);
        if (res.ok) {
            const result = await res.json();
            setDbResults(result.exchanges || []);
        }
    } catch(e) { console.error(e) }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[500px] bg-[hsl(220,14%,8%)] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            {data.label || "Process Node"}
          </h2>
          <p className="text-[10px] text-gray-500 font-mono">NODE ID: {node.id}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Database Search Binding Form */}
      <div className="p-4 bg-black/40 border-b border-white/5 flex gap-2">
         <input 
            type="text"
            placeholder="Search Database (e.g. Steel, low-alloy)"
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[hsl(142,76%,36%)]"
            value={dbSearchQuery}
            onChange={(e) => setDbSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDbSearch()}
         />
         <button onClick={handleDbSearch} className="bg-[hsl(142,76%,36%)] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[hsl(142,76%,46%)] transition-colors">Bind</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto">
        <button onClick={() => setActiveTab("mfa")} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === "mfa" ? "text-blue-500 border-b-2 border-blue-500 bg-white/5" : "text-gray-500 hover:text-white"}`}>
          <Layers className="w-3 h-3" /> MFA
        </button>
        <button onClick={() => setActiveTab("lci")} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === "lci" ? "text-[hsl(142,76%,60%)] border-b-2 border-[hsl(142,76%,60%)] bg-white/5" : "text-gray-500 hover:text-white"}`}>
          <Database className="w-3 h-3" /> LCI
        </button>
        <button onClick={() => setActiveTab("lcia")} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === "lcia" ? "text-red-400 border-b-2 border-red-400 bg-white/5" : "text-gray-500 hover:text-white"}`}>
          <BarChart2 className="w-3 h-3" /> LCIA
        </button>
        <button onClick={() => setActiveTab("metadata")} className={`flex-1 min-w-[100px] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === "metadata" ? "text-yellow-500 border-b-2 border-yellow-500 bg-white/5" : "text-gray-500 hover:text-white"}`}>
          <Globe className="w-3 h-3" /> Meta
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: MFA TOOLS */}
        {activeTab === "mfa" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mass Balance & Stocks</h3>
            <div className="grid gap-3">
               <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block uppercase font-black">Import Flows (kg)</span>
                  <input type="number" value={mfa.import_flows_kg || 0} onChange={(e) => onUpdate(node.id, { mfa_parameters: { ...mfa, import_flows_kg: parseFloat(e.target.value)} })} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-blue-400 font-mono w-full mt-1" />
               </div>
               <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block uppercase font-black">Internal / Export Flows (kg)</span>
                  <div className="flex gap-2 mt-1">
                     <input type="number" value={mfa.internal_flows_kg || 0} placeholder="Internal" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white font-mono w-1/2" />
                     <input type="number" value={mfa.export_flows_kg || 0} placeholder="Export" className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-red-400 font-mono w-1/2" />
                  </div>
               </div>
               <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block uppercase font-black">Stocks & Reserves (kg)</span>
                  <input type="range" min="0" max="10000" value={mfa.stocks_reserves_kg || 0} onChange={(e) => onUpdate(node.id, { mfa_parameters: { ...mfa, stocks_reserves_kg: parseFloat(e.target.value)} })} className="w-full mt-2" />
                  <div className="text-right text-xs font-mono text-gray-400 mt-1">{mfa.stocks_reserves_kg || 0} kg</div>
               </div>
            </div>
          </div>
        )}

        {/* TAB 2: LCI INVENTORY */}
        {activeTab === "lci" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inputs & Outputs</h3>
               <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-[hsl(142,76%,60%)]">{lci.flow_classification || "Technosphere"}</span>
            </div>
            
            <div className="space-y-4">
               <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Energy & Material Inputs</h4>
                  <div className="p-3 bg-black/40 border-l-2 border-green-500 rounded space-y-2">
                      <div className="flex justify-between items-center"><span className="text-xs text-white">Electricity (Grid)</span><span className="text-xs text-green-400 font-mono">15.4 kWh</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-white">Raw Materials</span><span className="text-xs text-green-400 font-mono">2.1 kg</span></div>
                  </div>
               </div>
               <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Emissions & Waste Outputs</h4>
                  <div className="p-3 bg-black/40 border-l-2 border-red-500 rounded space-y-2">
                      <div className="flex justify-between items-center"><span className="text-xs text-white">CO2 to Air</span><span className="text-xs text-red-400 font-mono">5.2 kg</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-white">Solid Waste</span><span className="text-xs text-red-400 font-mono">0.4 kg</span></div>
                  </div>
               </div>
               <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block uppercase font-black">Allocation Method</span>
                  <select value={lci.allocation_method || "Physical"} onChange={(e) => onUpdate(node.id, { lci_parameters: { ...lci, allocation_method: e.target.value } })} className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white w-full mt-1">
                     <option>Physical</option>
                     <option>Economic</option>
                     <option>System Expansion</option>
                     <option>Allocation cut-off</option>
                  </select>
               </div>
            </div>
          </div>
        )}

        {/* TAB 3: LCIA DASHBOARD */}
        {activeTab === "lcia" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Impact Categories</h3>
            <div className="grid gap-2">
               {Object.entries(lcia).map(([key, val]: [string, any], idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center group hover:border-red-400 transition-all">
                     <span className="text-[10px] text-white font-bold w-2/3 truncate" title={key}>{key}</span>
                     <div className="text-right flex items-center gap-2">
                        {/* Mini bar chart representation */}
                        <div className="h-1.5 w-12 bg-black rounded-full overflow-hidden flex-shrink-0"><div className="h-full bg-red-400" style={{ width: `${Math.min(100, Math.max(5, (val / 20) * 100))}%`}}></div></div>
                        <span className="text-xs text-red-400 font-mono font-black">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                     </div>
                  </div>
               ))}
               {Object.keys(lcia).length === 0 && <p className="text-[10px] text-gray-600 italic">No LCIA scores available.</p>}
            </div>
          </div>
        )}

        {/* TAB 4: METADATA */}
        {activeTab === "metadata" && (
           <div className="space-y-4 animate-in fade-in duration-300">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedigree Matrix & Quality</h3>
             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                   <span className="text-[10px] text-gray-500 block uppercase font-black">Geography</span>
                   <select value={meta.geography || "GLO"} onChange={(e) => onUpdate(node.id, { metadata: { ...meta, geography: e.target.value } })} className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white w-full mt-1">
                      <option>GLO</option><option>RER</option><option>RoW</option><option>Local</option><option>CN</option>
                   </select>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                   <span className="text-[10px] text-gray-500 block uppercase font-black">Uncertainty</span>
                   <select value={meta.uncertainty_distribution || "Lognormal"} onChange={(e) => onUpdate(node.id, { metadata: { ...meta, uncertainty_distribution: e.target.value } })} className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white w-full mt-1">
                      <option>Lognormal</option><option>Normal</option><option>Triangular</option><option>Uniform</option>
                   </select>
                </div>
             </div>
             <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                <span className="text-[10px] text-white block uppercase font-black">DQI Pedigree Matrix Data</span>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Reliability</span><span className="font-mono text-yellow-500">1</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Completeness</span><span className="font-mono text-yellow-500">2</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Geo Correlation</span><span className="font-mono text-yellow-500">1</span></div>
             </div>
           </div>
        )}
      </div>

    </div>
  );
}


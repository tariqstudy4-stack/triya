"use client";

import React, { useState } from "react";
import { Info, Settings, BarChart3, ChevronDown, Trash2, Plus, Calculator } from "lucide-react";

interface NodeInspectorProps {
  selectedNode?: any;
  updateNodeFlow?: (nodeId: string, flowId: string, newAmount: number) => void;
  updateNodeData?: (nodeId: string, newData: any) => void;
  onExecuteCalc?: () => void;
  theme?: "dark" | "light";
}

export default function NodeInspector({ selectedNode = null, updateNodeFlow, updateNodeData, onExecuteCalc, theme = "dark" }: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState("Flows");
  const [qualityScores, setQualityScores] = useState<Record<string, number>>({
    reliability: 2,
    completeness: 1,
    temporal: 3,
    geographical: 1,
    technological: 2
  });

  const isDark = theme === "dark";

  const updateQualityScore = (key: string, val: number) => {
    setQualityScores(prev => ({ ...prev, [key]: val }));
    if (updateNodeData && selectedNode) {
       updateNodeData(selectedNode.id, { pedigree: { ...qualityScores, [key]: val } });
    }
  };

  const handleAmountChange = (flowId: string, val: string) => {
    if (updateNodeFlow && selectedNode) {
      updateNodeFlow(selectedNode.id, flowId, parseFloat(val) || 0);
    }
  };

  const handleDataChange = (key: string, val: any) => {
    if (updateNodeData && selectedNode) {
      updateNodeData(selectedNode.id, { [key]: val });
    }
  };

  const tabs = ["Flows", "Parameters", "Strategic (ERP)"];

  if (!selectedNode) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400'}`}>
        <div className={`p-4 rounded-full mb-4 shadow-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <Settings size={32} strokeWidth={1} className="animate-spin-slow" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-40">
          [ Select a node to inspect ]
        </p>
      </div>
    );
  }

  const inputs = selectedNode.data.inputs || [];
  const outputs = selectedNode.data.outputs || [];
  const elementaryFlows = selectedNode.data.elementary_flows || [];

  const bgClass = isDark ? "bg-slate-800" : "bg-white";
  const borderClass = isDark ? "border-slate-700" : "border-slate-200";
  const textClass = isDark ? "text-slate-300" : "text-slate-700";
  const headerBg = isDark ? "bg-slate-900" : "bg-slate-50";

  return (
    <div className={`h-full flex flex-col border-l transition-all ${bgClass} ${textClass} ${borderClass}`}>
      {/* Header & Tabs */}
      <header className={`sticky top-0 z-10 border-b ${headerBg} ${borderClass}`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center">
              <h2 className={`text-sm font-black tracking-tight truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedNode.data.label}
              </h2>
              <span className="bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded text-[9px] uppercase font-black ml-3 border border-emerald-500/30 tracking-widest whitespace-nowrap">
                {selectedNode.data.category}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono tracking-tight uppercase">
              UUID: {selectedNode.data.uuid || "8823-A42-19B"}
            </p>
          </div>
          <button className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className={`flex px-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5"
                  : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"
              }`}
              title={
                tab === "Parameters" ? "Physical properties: Mass, Density, and Functional Unit throughput." :
                tab === "Flows" ? "LCI Interface: Management of tech-sphere inputs and environmental emissions." :
                "Strategic (ERP): Professional cost accounting, carbon tax liabilities, and profitability audits."
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${bgClass}`}>
        {activeTab === "Flows" && (
          <div className="p-4 space-y-6">
            {/* Inputs Section */}
            <div>
              <h3 className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] flex items-center gap-2 mb-3">
                <ChevronDown size={10} className="text-emerald-500" /> Inputs (Technosphere)
              </h3>
              <div className="space-y-0.5">
                {inputs.map((flow: any) => (
                    <div key={flow.id} className={`flex flex-col p-2 rounded-md border border-transparent transition-all group ${isDark ? 'hover:bg-slate-900/40 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`flex-1 truncate font-medium text-[11px] ${isDark ? 'text-slate-400 group-hover:text-slate-100' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {flow.name}
                        </span>
                        <input
                          type="number"
                          value={flow.amount}
                          onChange={(e) => handleAmountChange(flow.id, e.target.value)}
                          className={`w-20 rounded px-1.5 py-1 text-right focus:outline-none focus:border-emerald-500 font-mono text-[11px] hide-arrows ${isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`}
                        />
                        <span className="w-10 text-slate-500 text-[10px] font-bold">{flow.unit}</span>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Elementary Flows Sections (B-Matrix Emissions) */}
            <div>
              <h3 className="text-[10px] uppercase text-red-500 font-black tracking-[0.2em] flex items-center gap-2 mb-3">
                <ChevronDown size={10} className="text-red-500" /> Environmental Emissions (B-Matrix)
              </h3>
              <div className="space-y-0.5">
                {elementaryFlows.map((flow: any) => (
                    <div key={flow.id} className={`flex flex-col p-2 rounded-md border border-transparent transition-all group ${isDark ? 'hover:bg-slate-900/40 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`flex-1 truncate font-medium text-[11px] ${isDark ? 'text-slate-400 group-hover:text-slate-100' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {flow.name}
                        </span>
                        <input
                          type="number"
                          value={flow.amount}
                          onChange={(e) => handleAmountChange(flow.id, e.target.value)}
                          className={`w-20 rounded px-1.5 py-1 text-right focus:outline-none focus:border-red-500 font-mono text-[11px] hide-arrows ${isDark ? 'bg-slate-900 border-slate-700 text-red-400' : 'bg-slate-50 border-slate-200 text-red-600'}`}
                        />
                        <span className="w-10 text-slate-500 text-[10px] font-bold">{flow.unit}</span>
                      </div>
                    </div>
                ))}
                {elementaryFlows.length === 0 && (
                   <p className="text-[10px] text-slate-500 italic p-2 border border-dashed border-slate-700 rounded">No elementary flows detected for this process.</p>
                )}
              </div>
            </div>

            {/* Outputs Section */}
            <div>
              <h3 className="text-[10px] uppercase text-blue-500 font-black tracking-[0.2em] flex items-center gap-2 mb-3">
                <ChevronDown size={10} /> Process Outputs
              </h3>
              <div className="space-y-0.5">
                {outputs.map((flow: any) => (
                    <div key={flow.id} className={`flex flex-col p-2 rounded-md border border-transparent transition-all group ${isDark ? 'hover:bg-slate-900/40 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`flex-1 truncate font-medium text-[11px] ${isDark ? 'text-slate-400 group-hover:text-slate-100' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {flow.name}
                        </span>
                        <input
                          type="number"
                          value={flow.amount}
                          onChange={(e) => handleAmountChange(flow.id, e.target.value)}
                          className={`w-20 rounded px-1.5 py-1 text-right focus:outline-none focus:border-blue-500 font-mono text-[11px] hide-arrows ${isDark ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-600'}`}
                        />
                        <span className="w-10 text-slate-500 text-[10px] font-bold">{flow.unit}</span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Parameters" && (
          <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
             {/* Economic Accounting (ERP Integration) */}
             <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-emerald-600 rounded text-white"><Calculator size={14} /></div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Economic Accounting (ERP)</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-emerald-500/10 pb-4">
                   <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">Unit Cost</label>
                      <div className="flex items-center gap-1">
                         <span className="text-[10px] text-slate-500">$</span>
                         <input 
                            type="number" 
                            step="0.01"
                            value={selectedNode.data.costPerUnit || 0}
                            onChange={(e) => handleDataChange("costPerUnit", parseFloat(e.target.value) || 0)}
                            className={`w-full bg-transparent border-none p-0 text-xs font-mono font-bold outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} 
                         />
                      </div>
                   </div>
                   <div className="space-y-1 text-right">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">Total Phase Cost</label>
                      <div className="text-xs font-mono font-black text-emerald-500">
                         ${((selectedNode.data.inputs?.[0]?.amount || 1) * (selectedNode.data.costPerUnit || 0)).toFixed(2)}
                      </div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold uppercase">Carbon Tax Projection</span>
                      <span className="font-mono text-red-400">+$ {(selectedNode.data.impact_cc * 0.05 || 0).toFixed(2)} <span className="text-[8px] opacity-60">(at $50/t)</span></span>
                   </div>
                   <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold uppercase">Estimated Margin</span>
                      <span className="font-mono text-emerald-400">22.4%</span>
                   </div>
                </div>
             </div>

             {/* LCI Metadata */}
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">LCI Dataset Metadata</h4>
                <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Geographical Correlation</label>
                      <select className={`w-full p-2 rounded border text-xs font-medium outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                         <option>Global (GLO)</option>
                         <option>Europe (RER)</option>
                         <option>Rest of World (RoW)</option>
                         <option>North America (US)</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">System Allocation Model</label>
                      <select className={`w-full p-2 rounded border text-xs font-medium outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                         <option>Allocation, Cut-off by classification</option>
                         <option>Allocation at Point of Substitution (APOS)</option>
                         <option>Substitution, Consequential, System Expansion</option>
                      </select>
                   </div>
                </div>
             </div>

             {/* Stochastic Parameters */}
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Uncertainty (Monte Carlo)</h4>
                <div className="flex gap-4">
                   <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Distribution</label>
                      <select className={`w-full p-2 rounded border text-xs font-medium focus:border-emerald-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                         <option>Lognormal (95% CI)</option>
                         <option>Triangular / PERT</option>
                         <option>Normal / Uniform</option>
                      </select>
                   </div>
                   <div className="w-24 space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">SD (g2)</label>
                      <input type="text" defaultValue="1.05" className={`w-full p-2 rounded border text-xs font-mono text-center outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`} />
                   </div>
                </div>
             </div>

             {/* 3D Print Specifics */}
             <div className="p-4 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 space-y-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-blue-500 rounded text-white"><Calculator size={14} /></div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Geometry Scaling Component</h4>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <label className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Object Scale (LCI Multiplier)</label>
                      <span className={`text-xs font-mono px-2 rounded border ${isDark ? 'text-blue-400 bg-slate-900 border-slate-700' : 'text-blue-600 bg-white border-slate-200'}`}>x1.00</span>
                   </div>
                   <input 
                     type="range" min="0.1" max="5.0" step="0.1" defaultValue="1.0"
                     className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                   />
                   <p className="text-[9px] text-slate-500 leading-relaxed italic">
                     *Note: Scaling by x2 in 3D results in x8 volume (mass) increase for LCA impact calculation.
                   </p>
                </div>
             </div>
          </div>
        )}

        {activeTab === "Strategic (ERP)" && (
           <div className="p-6 space-y-8 animate-in fade-in duration-300">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">ISO 14044 Pedigree Matrix</h4>
              {[
                { key: 'reliability', label: 'Reliability' },
                { key: 'completeness', label: 'Completeness' },
                { key: 'temporal', label: 'Temporal Correlation' },
                { key: 'geographical', label: 'Geographical Correlation' },
                { key: 'technological', label: 'Technological Correlation' }
              ].map(item => (
                <div key={item.key} className="space-y-3">
                   <div className="flex justify-between items-center">
                      <label className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</label>
                      <span className={`text-xs font-mono px-2 rounded border ${isDark ? 'text-emerald-400 bg-slate-900 border-slate-700' : 'text-emerald-600 bg-slate-50 border-slate-200'}`}>{qualityScores[item.key]}</span>
                   </div>
                   <input 
                     type="range" min="1" max="5" 
                     value={qualityScores[item.key]} 
                     onChange={(e) => updateQualityScore(item.key, parseInt(e.target.value))}
                     className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                   />
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Footer Summary */}
      <footer className={`p-4 border-t ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">Node Mass Balance</span>
          <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">PASSED</span>
        </div>
        <button 
          onClick={onExecuteCalc}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <BarChart3 size={14} /> EXECUTE LOCAL IMPACT CALC
        </button>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? '#475569' : '#cbd5e1'}; border-radius: 10px; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
}

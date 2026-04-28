"use client";

import React, { useState } from "react";
import { Info, Settings, BarChart3, ChevronDown, Trash2, Plus, Calculator, Brain, AlertTriangle, ShieldCheck, Globe } from "lucide-react";

interface NodeInspectorProps {
  selectedNode?: any;
  updateNodeFlow?: (nodeId: string, flowId: string, newAmount: number) => void;
  updateNodeData?: (nodeId: string, newData: any) => void;
  onExecuteCalc?: () => void;
  theme?: "dark" | "light";
}

export default function NodeInspector({ selectedNode = null, updateNodeFlow, updateNodeData, onExecuteCalc, theme = "dark" }: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState("Flows");
  const [aiResults, setAiResults] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [qualityScores, setQualityScores] = useState<Record<string, number>>({
    reliability: 2, completeness: 1, temporal: 3, geographical: 1, technological: 2
  });

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-slate-800" : "bg-white";
  const borderClass = isDark ? "border-slate-700" : "border-slate-200";
  const textClass = isDark ? "text-slate-300" : "text-slate-700";
  const headerBg = isDark ? "bg-slate-900" : "bg-slate-50";

  const handleAiAudit = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedNode.id, 
          label: selectedNode.data.label,
          current_cost: selectedNode.data.costPerUnit || 0
        })
      });
      const data = await res.json();
      const verdict = data.verdict ?? data.consultant_verdict;
      const paragraphs =
        typeof verdict === "string"
          ? verdict.split(/\n\n+/).filter(Boolean).slice(0, 5)
          : [];
      setAiResults({
        ...data,
        ai_insights: data.ai_insights ?? paragraphs,
        consultant_verdict: data.consultant_verdict ?? (paragraphs.length ? "OK" : undefined),
        regulatory_risk: data.regulatory_risk ?? 0.35,
      });
    } catch (e) { console.error("AI Audit failed", e); }
    setIsAiLoading(false);
  };

  const updateQualityScore = (key: string, val: number) => {
    const newScores = { ...qualityScores, [key]: val };
    setQualityScores(newScores);
    if (updateNodeData && selectedNode) {
       updateNodeData(selectedNode.id, { pedigree: newScores });
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
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5"
                  : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"
              }`}
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
                        <div className="flex flex-col items-end">
                          <input
                            type="number"
                            value={flow.amount}
                            onChange={(e) => handleAmountChange(flow.id, e.target.value)}
                            className={`w-20 rounded px-1.5 py-1 text-right focus:outline-none focus:border-emerald-500 font-mono text-[11px] hide-arrows ${isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`}
                          />
                          {flow.formula && (
                            <span className="text-[8px] font-mono text-slate-500 mt-0.5 truncate max-w-[80px]" title={flow.formula}>
                              f: {flow.formula}
                            </span>
                          )}
                        </div>
                        <span className="w-10 text-slate-500 text-[10px] font-bold">{flow.unit}</span>
                      </div>
                      {/* Formula Edit Field (Deep Parse Mode) */}
                      <input 
                        type="text"
                        placeholder="fx: amount formula..."
                        value={flow.formula || ""}
                        onChange={(e) => {
                          const newInputs = inputs.map((i: any) => i.id === flow.id ? { ...i, formula: e.target.value } : i);
                          handleDataChange("inputs", newInputs);
                        }}
                        className={`mt-1 w-full bg-transparent border-b border-dashed border-slate-700 text-[10px] font-mono outline-none focus:border-emerald-500/50 py-0.5 ${isDark ? 'text-slate-500 focus:text-emerald-400' : 'text-slate-400'}`}
                      />
                    </div>
                ))}
              </div>
            </div>

            {/* Environmental Emissions (B-Matrix) */}
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
              </div>
            </div>
          </div>
        )}
        {activeTab === "Parameters" && (
          <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
             {/* Deep Parse Parameters */}
             <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-indigo-600 rounded text-white shadow-lg shadow-indigo-900/20"><Plus size={14} /></div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Process Parameters & Formulas</h4>
                </div>
                
                <div className="space-y-3">
                   {Object.entries(selectedNode.data.parameters || {}).map(([key, val]: [string, any]) => (
                     <div key={key} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{key}</span>
                           <span className="text-[9px] text-slate-500 font-mono italic">Process Variable</span>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Static Value</label>
                              <input 
                                 type="number"
                                 value={typeof val === 'object' ? val.value : val}
                                 onChange={(e) => {
                                    const newParams = { ...selectedNode.data.parameters };
                                    if (typeof val === 'object') newParams[key] = { ...val, value: parseFloat(e.target.value) || 0 };
                                    else newParams[key] = parseFloat(e.target.value) || 0;
                                    handleDataChange("parameters", newParams);
                                 }}
                                 className={`w-full bg-transparent border-b border-slate-700 p-1 text-xs font-mono font-bold outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                              />
                           </div>
                           <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-bold text-slate-600 uppercase">Formula Override</label>
                              <input 
                                 type="text"
                                 placeholder="e.g. mass * 0.5"
                                 value={typeof val === 'object' ? (val.formula || "") : ""}
                                 onChange={(e) => {
                                    const newParams = { ...selectedNode.data.parameters };
                                    if (typeof val === 'object') newParams[key] = { ...val, formula: e.target.value };
                                    else newParams[key] = { value: val, formula: e.target.value };
                                    handleDataChange("parameters", newParams);
                                 }}
                                 className={`w-full bg-transparent border-b border-slate-700 p-1 text-xs font-mono outline-none ${isDark ? 'text-indigo-400 focus:border-indigo-500' : 'text-slate-900'}`}
                              />
                           </div>
                        </div>
                     </div>
                   ))}
                   
                   {Object.keys(selectedNode.data.parameters || {}).length === 0 && (
                      <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-[10px] text-slate-500 italic">
                         No parameters extracted from database for this process.
                      </div>
                   )}
                </div>
             </div>

             {/* Economic Accounting (Legacy) */}
             <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-emerald-600 rounded text-white"><Calculator size={14} /></div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Economic Accounting (ERP)</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">Unit Cost</label>
                      <input 
                         type="number" step="0.01" value={selectedNode.data.costPerUnit || 0}
                         onChange={(e) => handleDataChange("costPerUnit", parseFloat(e.target.value) || 0)}
                         className={`w-full bg-transparent border-none p-0 text-xs font-mono font-bold outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} 
                      />
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "Strategic (ERP)" && (
           <div className="p-6 space-y-8 animate-in fade-in duration-300">
              {/* AI Strategic Advisory Panel */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${isAiLoading ? 'opacity-50' : 'opacity-100'} ${isDark ? 'bg-slate-900/50 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'}`}>
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-900/20"><Brain size={18} /></div>
                       <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500">AI Strategic Advisory</h4>
                    </div>
                    <button 
                       onClick={handleAiAudit}
                       disabled={isAiLoading}
                       className="text-[9px] font-black uppercase px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                       {isAiLoading ? "AUDITING..." : "RUN AUDIT"}
                    </button>
                 </div>

                  {aiResults ? (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                       {aiResults.consultant_verdict === "HEURISTIC_OVERRIDE" && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                             <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                             <p className="text-[9px] font-bold text-amber-500 leading-tight uppercase">
                                PROXY MODE: Using pre-computed heuristics. Add an API Key for real-time strategic reasoning.
                             </p>
                          </div>
                       )}
                       
                       <div className="space-y-2">
                          {aiResults.ai_insights.map((ins: string, i: number) => (
                             <div key={i} className="flex gap-2 text-[11px] leading-relaxed group">
                                <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{ins}</span>
                             </div>
                          ))}
                       </div>

                       {/* Data Quality Matrix Summary */}
                       {selectedNode.data.quality_profile && (
                          <div className="space-y-2 border-t border-emerald-500/10 pt-4">
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Inventory Verification Status</h5>
                             <div className="grid grid-cols-1 gap-1">
                                {Object.entries(selectedNode.data.quality_profile).map(([flow, q]: [any, any]) => (
                                   <div key={flow} className="flex justify-between items-center text-[9px] font-bold">
                                      <span className="text-slate-400">{flow}</span>
                                      <span className={`px-1.5 py-0.5 rounded border ${q === 'verified' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                                         {String(q).toUpperCase()}
                                      </span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}

                       <div className={`p-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                          <div className="flex items-center gap-2">
                             <AlertTriangle size={14} className={aiResults.regulatory_risk > 0.7 ? 'text-red-500' : 'text-amber-500'} />
                             <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">Regulatory Risk Score</span>
                          </div>
                          <span className={`text-xs font-mono font-black ${aiResults.regulatory_risk > 0.7 ? 'text-red-500' : 'text-amber-500'}`}>
                             {(aiResults.regulatory_risk * 100).toFixed(0)}%
                          </span>
                       </div>
                    </div>
                 ) : (
                    <p className="text-[10px] text-slate-500 italic text-center py-4 border border-dashed border-slate-700 rounded-xl">
                       Trigger AI Audit to generate regulatory insights and strategic cost data.
                    </p>
                 )}
              </div>

              <div className="space-y-4 border-t border-emerald-500/10 pt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">GHG Protocol Scope 3 Classification</h4>
                  <select 
                     value={selectedNode.data.scope3_category || 1}
                     onChange={(e) => handleDataChange("scope3_category", parseInt(e.target.value))}
                     className={`w-full p-2.5 rounded-lg border text-[11px] font-black uppercase outline-none transition-all focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                  >
                     {[
                        "Purchased Goods & Services", "Capital Goods", "Fuel & Energy Related", "Upstream Transport", 
                        "Waste in Ops", "Business Travel", "Employee Commuting", "Upstream Leased Assets", 
                        "Downstream Transport", "Processing Sold Products", "Use of Sold Products", 
                        "End-of-Life (Sold Products)", "Downstream Leased Assets", "Franchises", "Investments"
                     ].map((cat, i) => (
                        <option key={i} value={i + 1}>{i + 1}. {cat}</option>
                     ))}
                  </select>
              </div>

              {/* Compliance & Geography Section */}
              <div className="space-y-6 border-t border-emerald-500/10 pt-6">
                 <div className="flex items-center gap-2">
                    <Globe size={14} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Compliance & Geography</h4>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Location</label>
                       <select 
                         value={selectedNode.data.location || "GLO"}
                         onChange={(e) => handleDataChange("location", e.target.value)}
                         className={`w-full p-3 rounded-xl border text-[11px] font-bold outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                       >
                          <option value="GLO">GLO (Global)</option>
                          <option value="RER">RER (Europe)</option>
                          <option value="US">US (United States)</option>
                          <option value="IN">IN (India)</option>
                          <option value="CN">CN (China)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Allocation Rule</label>
                       <select 
                         value={selectedNode.data.allocation_method || "Mass"}
                         onChange={(e) => handleDataChange("allocation_method", e.target.value)}
                         className={`w-full p-3 rounded-xl border text-[11px] font-bold outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                       >
                          <option value="Mass">Mass (Physical)</option>
                          <option value="Economic">Economic (Value)</option>
                          <option value="Energy">Energy (Caloric)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data Year</label>
                       <input 
                         type="number"
                         value={selectedNode.data.data_year || new Date().getFullYear()}
                         onChange={(e) => handleDataChange("data_year", parseInt(e.target.value))}
                         className={`w-full p-3 rounded-xl border text-[11px] font-mono font-bold outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DQI Score (1-5)</label>
                       <select 
                         value={selectedNode.data.dqi_score || 3}
                         onChange={(e) => handleDataChange("dqi_score", parseInt(e.target.value))}
                         className={`w-full p-3 rounded-xl border text-[11px] font-bold outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-amber-500' : 'bg-slate-50 border-slate-200 text-amber-600'}`}
                       >
                          {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} - {v === 1 ? 'Excellent' : v === 5 ? 'Poor' : 'Standard'}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 border-t border-emerald-500/10 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Pedigree Matrix (DQI) - ISO 14044</h4>
                {['reliability', 'completeness', 'temporal', 'geographical', 'technological'].map(key => (
                   <div key={key} className="space-y-2">
                       <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">{key}</span>
                       <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map(val => (
                             <button
                                key={val}
                                onClick={() => updateQualityScore(key, val)}
                                className={`py-2 text-[10px] font-black rounded-md transition-all border ${
                                   (selectedNode.data.pedigree?.[key] || qualityScores[key]) === val
                                   ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                   : isDark ? 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-900'
                                }`}
                             >
                                {val}
                             </button>
                          ))}
                       </div>
                   </div>
                ))}
              </div>
           </div>
        )}
      </div>

      <footer className={`p-4 border-t ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <button onClick={onExecuteCalc} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95">
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

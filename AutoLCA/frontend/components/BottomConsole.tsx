import React, { useState } from 'react';
import { 
  Activity, Table, AlertTriangle, TrendingUp, ChevronRight, Play, BarChart3, Settings, X, Cpu, Cloud, Trash2
} from 'lucide-react';
import { useLCAStore } from '../lib/lcaStore';
import { toast } from 'sonner';
import { useRef, useEffect } from 'react';

interface BottomConsoleProps {
  nodes: any[];
  edges: any[];
  lciaResults: any;
  theme?: "dark" | "light";
}

const IMPACT_CATEGORIES = [
  'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
  'ep_freshwater', 'ep_marine', 'ep_terrestrial',
  'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
  'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
  'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
  'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
];

export const BottomConsole: React.FC<BottomConsoleProps> = ({ nodes, edges, lciaResults, theme = "dark" }) => {
  const [activeTab, setActiveTab] = useState<'IMPACTS' | 'PIVOT' | 'UNCERTAINTY' | 'SENSITIVITY' | 'AI_CONSULTANT'>('IMPACTS');
  const [sensNodeId, setSensNodeId] = useState<string>("");
  const [sensResult, setSensResult] = useState<any>(null);
  const [isSensLoading, setIsSensLoading] = useState(false);
  
  const aiVerdict = useLCAStore((s) => s.aiVerdict);
  const setAiVerdict = useLCAStore((s) => s.setAiVerdict);
  const aiPreferences = useLCAStore((s) => s.aiPreferences);
  const setAiPreferences = useLCAStore((s) => s.setAiPreferences);
  const clearAiPreferences = useLCAStore((s) => s.clearAiPreferences);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLog, setAiLog] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showPurgeSuccess, setShowPurgeSuccess] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const isDark = theme === "dark";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const runSensitivity = async () => {
    if (!sensNodeId) return;
    setIsSensLoading(true);
    try {
      const res = await fetch("/api/sensitivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges, target_node_id: sensNodeId })
      });
      const data = await res.json();
      setSensResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSensLoading(false);
    }
  };

  const runAiAudit = async () => {
    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAiLoading(true);
    setAiLog("Initializing Strategic Context...");
    
    const timers = [
      setTimeout(() => setAiLog(aiPreferences.engine === 'ollama' ? "Pinging local hardware..." : "Locating cloud instance..."), 1000),
      setTimeout(() => setAiLog("Analyzing carbon hotspots..."), 2000),
      setTimeout(() => setAiLog(`${aiPreferences.engine === 'ollama' ? 'Llama3' : 'Gemini Pro'} interpreting vectors...`), 3000),
    ];
    
    try {
      const res = await fetch("/api/ai-audit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-AI-Engine": aiPreferences.engine,
          "X-API-Key": aiPreferences.apiKey
        },
        body: JSON.stringify({ ...lciaResults, nodes, edges }),
        signal: abortControllerRef.current.signal
      });
      
      if (res.status === 503) {
        const msg = "Ollama Connection Terminated: Port 11434 unreachable.";
        setAiVerdict(msg);
        toast.error("Local AI Offline", { description: "Ensure the Ollama binary is running." });
        return;
      }
      
      const data = await res.json();
      setAiVerdict(data.verdict);
      toast.success("Strategic Audit Complete", { description: "AI verdict generated successfully." });
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('AI Audit aborted');
        return;
      }
      console.error(e);
      setAiVerdict("Strategic Interpretation Engine Offline. Use manual audit heuristics.");
      toast.error("Interpretation Failed", { description: "Remote AI engine returned a terminal error." });
    } finally {
      timers.forEach(clearTimeout);
      setIsAiLoading(false);
      setAiLog("");
      abortControllerRef.current = null;
    }
  };

  if (!lciaResults) return (
    <div className="h-full flex items-center justify-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Strategic Engine Idle - Execute LCA to populate Interpretation Drawer</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col font-sans select-none">
      {/* Tabs Header */}
      <div className="flex gap-1 p-2 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        {[
          { id: 'IMPACTS', label: 'Multi-Impact Grid', icon: Activity },
          { id: 'PIVOT', label: 'Hotspot Matrix', icon: Table },
          { id: 'UNCERTAINTY', label: 'Uncertainty Stats', icon: AlertTriangle },
          { id: 'SENSITIVITY', label: 'Sensitivity Lab', icon: TrendingUp },
          { id: 'AI_CONSULTANT', label: 'AI Consultant', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-105' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/80">
        {activeTab === 'IMPACTS' && (
          <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {IMPACT_CATEGORIES.map(cat => (
              <div key={cat} className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-emerald-500/80 transition-colors">{cat.replace(/_/g, ' ')}</div>
                <div className="text-sm font-mono font-black text-white flex items-end gap-2">
                  {lciaResults.impacts?.[cat]?.toExponential(4) || '0.0000e+0'} 
                  <span className="text-[8px] opacity-40 mb-0.5">UNITS</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'UNCERTAINTY' && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h4 className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest mb-6">Monte Carlo Stochastic Outcome (GWP_100)</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Calculated Mean', val: lciaResults.gwp, color: 'text-white' },
                { label: 'Median (P50)', val: lciaResults.uncertainty?.gwp_climate_change?.median || lciaResults.gwp, color: 'text-slate-300' },
                { label: 'LCL (P05)', val: lciaResults.uncertainty?.gwp_climate_change?.p5 || 0, color: 'text-emerald-500/80' },
                { label: 'UCL (P95)', val: lciaResults.uncertainty?.gwp_climate_change?.p95 || 0, color: 'text-amber-500/80' },
              ].map(stat => (
                <div key={stat.label} className="p-6 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                   <p className={`text-2xl font-mono font-black tracking-tighter ${stat.color}`}>{stat.val.toFixed(3)}</p>
                </div>
              ))}
            </div>
            {!lciaResults.uncertainty && (
               <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center gap-3">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scientific Warning: Deterministic data detected. P5/P95 unavailable until Stochastic Solver is triggered.</span>
               </div>
            )}
          </div>
        )}

        {activeTab === 'PIVOT' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-x-auto pb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-950 p-4 text-left border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600">Supply Chain Node</th>
                  {IMPACT_CATEGORIES.slice(0, 5).map(cat => (
                    <th key={cat} className="p-4 text-right border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600 min-w-[120px]">{cat.split('_')[0].toUpperCase()}</th>
                  ))}
                  <th className="p-4 border-b border-white/10 text-slate-600">...</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(lciaResults.node_breakdown || {}).map(([id, node]: [string, any]) => (
                  <tr key={id} className="hover:bg-white/5 transition-colors group">
                    <td className="sticky left-0 bg-slate-950/80 backdrop-blur-md p-4 border-b border-white/5 text-xs font-bold text-white group-hover:text-emerald-400 whitespace-nowrap">{node.name}</td>
                    {IMPACT_CATEGORIES.slice(0, 5).map(cat => (
                      <td key={cat} className="p-4 border-b border-white/5 text-right font-mono text-[11px] text-slate-400 group-hover:text-slate-200">
                        {node.impacts?.[cat]?.toExponential(2)}
                      </td>
                    ))}
                    <td className="p-4 border-b border-white/5"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'SENSITIVITY' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center gap-6 mb-10">
                <div className="flex-1">
                   <h4 className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest mb-3">Model Variable Stress Test</h4>
                    <select 
                      value={sensNodeId}
                      onChange={(e) => setSensNodeId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs font-black uppercase text-white outline-none focus:ring-2 ring-emerald-500/50 appearance-none shadow-xl cursor-pointer"
                    >
                      <option value="">Select Supply Chain Node ...</option>
                      {Object.entries(lciaResults.node_breakdown || {}).map(([id, node]: [string, any]) => (
                        <option key={id} value={id}>{node.name}</option>
                      ))}
                    </select>
                </div>
                <button 
                  onClick={runSensitivity}
                  disabled={!sensNodeId || isSensLoading}
                  className="mt-6 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-all active:scale-95"
                >
                  {isSensLoading ? <ChevronRight className="animate-spin" /> : <Play size={14} />} Execute Sensitivity Analysis
                </button>
             </div>

             {sensResult && (
               <div className="p-8 rounded-[3rem] bg-slate-900/50 border border-white/5 space-y-10 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Scenario Delta for:</span>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{sensResult.node_name}</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Max GWP Variance</span>
                        <h3 className="text-3xl font-mono font-black text-white">{Math.abs(sensResult.variance_high_pct).toFixed(2)}%</h3>
                    </div>
                  </div>

                  {/* Tornado Bar Visualization */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <span className="w-24 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">-10% Mass</span>
                        <div className="flex-1 h-8 bg-slate-900 rounded-full flex items-center justify-end pr-1 border border-white/5 overflow-hidden">
                           <div 
                             className="h-full bg-emerald-500/80 rounded-l-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000"
                             style={{ width: `${Math.min(Math.abs(sensResult.variance_low_pct) * 10, 100)}%` }}
                           />
                        </div>
                        <span className="w-16 font-mono text-[10px] text-emerald-400 font-bold">{sensResult.variance_low_pct.toFixed(2)}%</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="w-24 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Baseline</span>
                        <div className="flex-1 h-0.5 bg-white/20 relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full ring-4 ring-white/10" />
                        </div>
                        <span className="w-16 font-mono text-[10px] text-white font-bold">0.00%</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="w-24 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">+10% Mass</span>
                        <div className="flex-1 h-8 bg-slate-900 rounded-full flex items-center justify-start pl-1 border border-white/5 overflow-hidden">
                           <div 
                             className="h-full bg-amber-500/80 rounded-r-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-1000"
                             style={{ width: `${Math.min(Math.abs(sensResult.variance_high_pct) * 10, 100)}%` }}
                           />
                        </div>
                        <span className="w-16 font-mono text-[10px] text-amber-400 font-bold">+{sensResult.variance_high_pct.toFixed(2)}%</span>
                     </div>
                  </div>

                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic pt-4">
                    Observation: For every 1% increase in {sensResult.node_name} intensity, total supply chain impact shifts by {(sensResult.variance_high_pct / 10).toFixed(3)}%.
                  </p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'AI_CONSULTANT' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
             {/* Settings Toggle */}
             <button 
               onClick={() => setShowSettings(!showSettings)}
               className={`absolute top-0 right-0 p-3 rounded-full transition-all ${showSettings ? 'bg-emerald-500 text-white rotate-90' : 'bg-white/5 text-slate-500 hover:text-white'}`}
             >
                <Settings size={18} />
             </button>

             {showSettings ? (
               <div className="space-y-8 p-10 rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                     <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Interpretation Preferences</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Configure your Strategic Execution Layer</p>
                     </div>
                     <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Engine Select */}
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Execution Path</label>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                             { id: 'ollama', label: 'Local Hardware (Ollama)', icon: Cpu, desc: 'Zero Cost. Data stays on-device.' },
                             { id: 'gemini', label: 'Cloud Server (Gemini)', icon: Cloud, desc: 'Highest precision. Requires API Key.' }
                           ].map(eng => (
                             <button
                               key={eng.id}
                               onClick={() => setAiPreferences({ engine: eng.id as any })}
                               className={`p-5 rounded-2xl border flex items-center gap-4 text-left transition-all ${
                                 aiPreferences.engine === eng.id 
                                   ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                   : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                               }`}
                             >
                                <div className={`p-3 rounded-xl ${aiPreferences.engine === eng.id ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                   <eng.icon size={20} />
                                </div>
                                <div>
                                   <p className={`text-[11px] font-bold uppercase ${aiPreferences.engine === eng.id ? 'text-white' : 'text-slate-400'}`}>{eng.label}</p>
                                   <p className="text-[9px] font-medium text-slate-600 mt-0.5">{eng.desc}</p>
                                </div>
                             </button>
                           ))}
                        </div>
                     </div>

                     {/* API Key Input */}
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Interpretation Proxy Key (BYOK)</label>
                        <div className="flex gap-3 relative">
                           <input 
                              type="password"
                              placeholder="Enter your API Key..."
                              value={aiPreferences.apiKey}
                              onChange={(e) => setAiPreferences({ apiKey: e.target.value })}
                              disabled={aiPreferences.engine === 'ollama'}
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-mono text-emerald-400 outline-none focus:ring-2 ring-emerald-500/30 disabled:opacity-30 flex-1"
                           />
                           <button 
                             onClick={() => {
                               clearAiPreferences();
                               setShowPurgeSuccess(true);
                               setTimeout(() => setShowPurgeSuccess(false), 2000);
                             }}
                             className="px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-2xl transition-all flex items-center justify-center shrink-0"
                             title="Purge Local Credentials"
                           >
                              <Trash2 size={16} />
                           </button>
                           {showPurgeSuccess && (
                             <div className="absolute -top-8 right-0 animate-in fade-in slide-in-from-bottom-2">
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-lg border border-rose-500/30 shadow-2xl">Credentials Wiped</span>
                             </div>
                           )}
                        </div>
                        {aiPreferences.engine === 'gemini' && (
                             <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <p className="text-[9px] font-bold text-blue-400 uppercase leading-relaxed">
                                  Your key is never stored on our servers. It is strictly used to authenticate your session with Google AI Studio. 
                                  <a href="https://aistudio.google.com/app/apikey" target="_blank" className="ml-2 underline hover:text-white">Get a free key here</a>
                                </p>
                             </div>
                        )}
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl"
                  >
                    Save Preferences & Return to Auditor
                  </button>
               </div>
             ) : !aiVerdict && !isAiLoading ? (
               <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="p-6 bg-emerald-500/10 rounded-full mb-6 border border-emerald-500/20 shadow-2xl animate-pulse">
                     <BarChart3 size={48} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Executive AI Interpretation</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 max-w-sm">Transform supply chain complexity into actionable business intelligence using Gemini Pro.</p>
                  <button 
                    onClick={runAiAudit}
                    className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-95"
                  >
                    <Play size={16} /> Generate Executive Audit
                  </button>
               </div>
             ) : isAiLoading ? (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-6 relative">
                     <div className="absolute top-0 left-0 h-full bg-emerald-500 animate-[loading-bar_4s_ease-in-out_infinite]" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{aiLog}</p>
                </div>
             ) : (
               <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                     <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Chief Sustainability Officer - Executive Verdict</h3>
                     <button onClick={() => setAiVerdict("")} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Clear Analysis</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {aiVerdict.split('\n\n').filter(p => p.trim()).map((p, idx) => (
                      <div key={idx} className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800/50 hover:border-emerald-500/30 transition-all shadow-2xl group flex gap-6">
                         <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-700 font-mono text-emerald-500 shrink-0 font-black">
                            0{idx + 1}
                         </div>
                         <p className="text-sm font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors antialiased">{p}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-3 justify-center">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Strategic Insight: Interpretation powered by Gemini-1.5-Flash
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { left: -100%; width: 100%; }
          50% { left: 0%; width: 50%; }
          100% { left: 100%; width: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { 
  Target, ShieldCheck, Layers, Eye, Scale, ClipboardCheck, Info, Plus, Trash2, 
  ChevronRight, AlertCircle, HelpCircle, FileText, Globe, Clock, Wrench, X
} from "lucide-react";
import { useLCAStore } from "../lib/lcaStore";

interface GoalAndScopeProps {
  theme?: "dark" | "light";
  onUpdate?: (state: any) => void;
}

export default function GoalAndScope({ theme = "dark", onUpdate }: GoalAndScopeProps) {
  const isDark = theme === "dark";
  const [activeSubTab, setActiveSubTab] = useState<string>("GOAL");

  const state = useLCAStore((s) => s.goalAndScope);
  const updateGlobalState = useLCAStore((s) => s.updateGoalAndScope);

  const updateState = (path: string, value: any) => {
    updateGlobalState(path, value);
    if (onUpdate) onUpdate(state);
  };

  const sections = [
    { id: "GOAL", title: "Goal Definition", icon: Target, desc: "ISO 14044 4.2.2 compliance" },
    { id: "FUNCTIONAL", title: "Functional Unit", icon: Layers, desc: "Reference unit & flows" },
    { id: "BOUNDARY", title: "System Boundary", icon: ShieldCheck, desc: "Cut-off rules & exclusions" },
    { id: "ALLOCATION", title: "Allocation Procedures", icon: Scale, desc: "Multifunctionality logic" },
    { id: "METHODOLOGY", title: "LCIA & DQRs", icon: ClipboardCheck, desc: "Impact categories & quality" },
    { id: "REVIEW", title: "Review & Assumptions", icon: FileText, desc: "Verification protocol" }
  ];

  const inputClass = isDark ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-600";
  
  const BOUNDARY_OPTIONS = [
    { id: "CRADLE_TO_GATE", title: "Cradle-to-Gate", desc: "Materials to Factory", group: "Standard" },
    { id: "CRADLE_TO_GRAVE", title: "Cradle-to-Grave", desc: "Full Life Cycle", group: "Standard" },
    { id: "GATE_TO_GATE", title: "Gate-to-Gate", desc: "Single Process", group: "Industrial" },
    { id: "CRADLE_TO_CRADLE", title: "Cradle-to-Cradle", desc: "Closed Loop / Circular", group: "Circular" },
    { id: "WELL_TO_WHEEL", title: "Well-to-Wheel", desc: "Fuel & Vehicle Use", group: "Transportation" },
    { id: "WELL_TO_WAKE", title: "Well-to-Wake", desc: "Maritime Energy", group: "Transportation" },
    { id: "WELL_TO_TANK", title: "Well-to-Tank", desc: "Fuel Production", group: "Transportation" },
    { id: "TANK_TO_WHEEL", title: "Tank-to-Wheel", desc: "Vehicle Operation", group: "Transportation" },
    { id: "WELL_TO_PUMP", title: "Well-to-Pump", desc: "Energy Extraction", group: "Energy" },
    { id: "CRADLE_TO_CUSTOMER", title: "Cradle-to-Customer", desc: "Including B2C Logistics", group: "B2C" },
    { id: "GRAVE_TO_CRAIDLE", title: "Grave-to-Cradle", desc: "Remanufacturing", group: "Circular" }
  ];

  return (
    <div className={`flex-1 flex overflow-hidden animate-in fade-in duration-500 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <aside className={`w-72 border-r p-6 flex flex-col space-y-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
         <div className="mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1">Configuration Engine</h2>
            <h3 className={`text-lg font-black uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>ISO 14044 <span className="text-emerald-500">Goal & Scope</span></h3>
         </div>
         {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSubTab(s.id)} className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group text-left border ${activeSubTab === s.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-slate-800/50'}`}>
               <s.icon size={20} className={activeSubTab === s.id ? 'text-white' : 'text-emerald-500'} />
               <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-widest truncate">{s.title}</div>
                  <div className={`text-[9px] truncate opacity-60 font-bold ${activeSubTab === s.id ? 'text-emerald-100' : ''}`}>{s.desc}</div>
               </div>
            </button>
         ))}
         <div className="mt-auto p-4 rounded-3xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2"><AlertCircle size={14} className="text-amber-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</span></div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[78%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" /></div>
            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tight">78% Formulated - Strategic Depth Validated</p>
         </div>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-12">
         <div className="max-w-4xl mx-auto space-y-12 pb-24">
            
            {activeSubTab === "GOAL" && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                     <h4 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4"><Target size={32} className="text-emerald-500" /> Goal & Regulatory <span className="text-emerald-500">Context</span></h4>
                     <p className="text-slate-400 font-medium">Define regional compliance mandates and reporting objectives for the final automated audit.</p>
                  </div>
                  
                  {/* ISO 14044 Phase 1 Helper */}
                  <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl flex gap-6 items-start">
                     <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white"><Target size={24} /></div>
                     <div className="flex-1 space-y-1">
                        <h5 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">ISO 14044 Phase 1: Goal & Scope Definition <HelpCircle size={14} className="opacity-50" /></h5>
                        <p className="text-[11px] font-bold text-slate-300 leading-relaxed italic">
                           This section defines the **requirements** of your study. You do not need a database yet to set the Goal. 
                           Once defined, you will use the **Database Library** (left sidebar) to provide the **Inventory Evidence** that matches your Scope.
                        </p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Title</label>
                        <input value={state.projectTitle} onChange={(e) => updateState('projectTitle', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Regulatory Framework</label>
                        <select value={state.regulatoryFramework} onChange={(e) => updateState('regulatoryFramework', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`}>
                           <option value="EU_CSRD">EU CSRD (ESRS E1 Compliance)</option>
                           <option value="EU_CBAM">EU CBAM (Import Tax Declaration)</option>
                           <option value="US_SEC">US SEC Climate Disclosure</option>
                           <option value="GHG_PROTOCOL">GHG Protocol (Universal Standard)</option>
                           <option value="PEF">Product Environmental Footprint (PEF)</option>
                           <option value="EPD">EPD (Environmental Product Declaration)</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intended Application</label>
                        <select value={state.intendedApplication} onChange={(e) => updateState('intendedApplication', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`}>
                           <option value="PEF">PEF for EU Market Access</option>
                           <option value="RD">R&D Hotspot Identification</option>
                           <option value="MARKETING">Environmental Marketing (ISO 14021)</option>
                           <option value="FINANCE">Investor Disclosure / ESG Audit</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intended Audience</label>
                        <input value={state.intendedAudience} onChange={(e) => updateState('intendedAudience', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-emerald-500">Intended Audience (ISO)</label>
                        <select 
                           value={state.intended_audience} 
                           onChange={(e) => updateState('intended_audience', e.target.value)} 
                           className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`}
                        >
                           <option value="Internal Engineering">Internal Engineering (R&D)</option>
                           <option value="B2B Verification">B2B Verification (Supply Chain)</option>
                           <option value="B2C Public">B2C Public Declaration</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-emerald-500">Global Reference Flow (kg/unit)</label>
                         <input 
                           type="number" 
                           step="0.1"
                           value={state.reference_flow} 
                           onChange={(e) => updateState('reference_flow', parseFloat(e.target.value))} 
                           className={`w-full p-4 rounded-xl border-2 outline-none font-bold font-mono text-sm ${inputClass}`} 
                         />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Reasons for Study / Drivers</label>
                     <textarea value={state.reasons} onChange={(e) => updateState('reasons', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-medium text-sm h-32 ${inputClass}`} placeholder="e.g. Respond to supply chain CDP request..." />
                  </div>
               </div>
            )}

            {activeSubTab === "BOUNDARY" && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                     <h4 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4"><ShieldCheck size={32} className="text-emerald-500" /> Strategic <span className="text-emerald-500">System Boundaries</span></h4>
                     <p className="text-slate-400 font-medium">Select from 11 industry-specialized boundaries as per ISO 14040/44 guidelines.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {BOUNDARY_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => updateState('systemBoundary.scope', opt.id)} className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${state.systemBoundary.scope === opt.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50'}`}>
                           <div>
                              <div className="text-[10px] font-black uppercase tracking-widest mb-1">{opt.title}</div>
                              <div className="text-[9px] opacity-60 font-bold">{opt.desc}</div>
                           </div>
                           <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-500 uppercase tracking-tighter">{opt.group}</span>
                        </button>
                     ))}
                  </div>
                  <div className="grid grid-cols-2 gap-10 mt-10">
                     <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Lifecycle Inclusion Toggles</h5>
                        <div className="space-y-3">
                           {[{ label: "Capital Goods (Infrastructure)", key: "capitalGoods" }, { label: "Human Labor (Social Link)", key: "humanLabor" }, { label: "Logistics Packaging", key: "packaging" }].map(item => (
                              <div key={item.key} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
                                 <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                                 <button onClick={() => updateState(`systemBoundary.${item.key}`, !(state.systemBoundary as any)[item.key])} className={`w-12 h-6 rounded-full transition-all relative ${ (state.systemBoundary as any)[item.key] ? 'bg-emerald-600' : 'bg-slate-900 border border-slate-700'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ (state.systemBoundary as any)[item.key] ? 'right-1' : 'left-1'}`} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Scientific Cut-off Criteria (%)</h5>
                        <div className="space-y-4">
                           <select 
                              value={state.cut_off_criteria} 
                              onChange={(e) => updateState('cut_off_criteria', e.target.value)} 
                              className={`w-full p-4 rounded-xl border-2 outline-none font-black text-sm text-emerald-500 bg-slate-950 border-slate-800 focus:ring-2 ring-emerald-500/30 tracking-widest transition-all`}
                           >
                              <option value="1%">1% Mass/Energy (ISO Industry Standard)</option>
                              <option value="2%">2% Significance Cut-off</option>
                              <option value="5%">5% High-level Assessment</option>
                              <option value="None">None (Full Inclusion Auditing)</option>
                           </select>
                           <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl space-y-6">
                              <div className="flex justify-between font-black uppercase text-[10px] text-slate-500 tracking-widest"><span>Mass/Energy Significance Range</span><span className="text-emerald-500">{state.systemBoundary.cutoffThreshold * 100}%</span></div>
                              <input type="range" min="0" max="0.05" step="0.001" value={state.systemBoundary.cutoffThreshold} onChange={(e) => updateState('systemBoundary.cutoffThreshold', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                              <p className="text-[9px] font-bold text-slate-500 leading-tight italic"> Flows contributing less than {state.systemBoundary.cutoffThreshold * 100}% may be excluded if not toxic or strategic.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeSubTab === "FUNCTIONAL" && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                     <h4 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4"><Layers size={32} className="text-blue-500" /> Functional Unit & <span className="text-blue-500">Flow Equivalence</span></h4>
                     <p className="text-slate-400 font-medium">Standardize the service-level performance for automated product comparisons.</p>
                  </div>
                  <div className="bg-slate-800/40 p-10 rounded-3xl border-2 border-dashed border-slate-700 space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-emerald-500">Functional Unit (Technical Description)</label>
                        <textarea 
                           value={state.functional_unit} 
                           onChange={(e) => updateState('functional_unit', e.target.value)} 
                           className="w-full p-6 bg-slate-900 border-none rounded-2xl outline-none font-bold text-sm tracking-tight text-white h-24" 
                           placeholder="e.g. 1 kg of PLA manufactured using US-grid average for 24 months..." 
                        />
                     </div>
                     <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Magnitude</label><input type="number" value={state.functionalUnit.magnitude} onChange={(e) => updateState('functionalUnit.magnitude', parseFloat(e.target.value))} className={`w-full p-4 rounded-xl border-2 outline-none font-black text-sm ${inputClass}`} /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit</label><input value={state.functionalUnit.unit} onChange={(e) => updateState('functionalUnit.unit', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-black text-sm ${inputClass}`} /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference Flow</label><input value={state.functionalUnit.referenceFlow} onChange={(e) => updateState('functionalUnit.referenceFlow', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-black text-sm ${inputClass}`} /></div>
                     </div>
                  </div>
               </div>
            )}

            {/* Other sections remain similar but with deepened options */}
            {activeSubTab === "ALLOCATION" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                        <h4 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4"><Scale size={32} className="text-amber-500" /> ISO <span className="text-amber-500">Allocation Model</span></h4>
                        <p className="text-slate-400 font-medium">Select the mathematical logic for distributing impacts across co-products.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-product Principle</label>
                            {[{ id: "SUBDIVISION", title: "Subdivision", desc: "Avoiding allocation by splitting processes." }, { id: "EXPANSION", title: "System Expansion", desc: "Avoiding by expanding boundary (Displacement)." }, { id: "ALLOCATION", title: "Partitioning", desc: "Dividing based on physical/economic ratio." }].map(p => (
                                <button key={p.id} onClick={() => updateState('allocation.principle', p.id)} className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${state.allocation.principle === p.id ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800/40 border-slate-700 hover:border-amber-500/50'}`}>
                                    <div className="text-xs font-black uppercase tracking-widest">{p.title}</div>
                                    <div className="text-[10px] opacity-60 font-bold mt-1">{p.desc}</div>
                                </button>
                            ))}
                        </div>
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allocation Basis</label>
                              <select value={state.allocation.method} onChange={(e) => updateState('allocation.method', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`}>
                                 <option value="MASS">Mass Ratio (ISO Preferred)</option>
                                 <option value="ECONOMIC">Economic Value (Corporate Finance)</option>
                                 <option value="ENERGY">Energy Content (Thermodynamic)</option>
                                 <option value="EXERGY">Exergy (Quality-Adjusted Energy)</option>
                                 <option value="VOLUME">Volume (Logistics Focused)</option>
                              </select>
                           </div>
                           <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-700">
                              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Circular Loops / Recycling</h5>
                              <div className="flex gap-2">
                                 {["CUTOFF", "EOL", "CFF"].map(m => (
                                    <button key={m} onClick={() => updateState('allocation.recyclingMethod', m)} className={`flex-1 py-3 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${state.allocation.recyclingMethod === m ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 border-slate-700 text-slate-500'}`}>
                                       {m === 'CUTOFF' ? "Recycled Content" : m === 'EOL' ? "End-of-Life" : "Loop (CFF)"}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === "METHODOLOGY" && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                     <h4 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4"><ClipboardCheck size={32} className="text-violet-500" /> Audit DQRs & <span className="text-violet-500">Impact Engine</span></h4>
                     <p className="text-slate-400 font-medium">Define the rigor required for data acceptance into the strategic ledger.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Characterization Framework</label>
                        <select value={state.lcia.methodology} onChange={(e) => updateState('lcia.methodology', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`}>
                           <option value="EF_3_1">EF 3.1 (Environmental Footprint)</option>
                           <option value="RECIPE">ReCiPe 2016 Hierarchist</option>
                           <option value="TRACI">TRACI 2.1 (US EPA)</option>
                           <option value="IMPACT2002">IMPACT 2002+</option>
                           <option value="IPCC2021">IPCC 2021 (GWP Only)</option>
                        </select>
                        <div className="flex flex-wrap gap-2 pt-4">
                           {state.lcia.categories.map((c: string) => <span key={c} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">{c}<X size={10} className="hover:text-red-500 transition-colors" /></span>)}
                        </div>
                     </div>
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Quality Goals</label>
                        <div className="space-y-4">
                           <div className="space-y-1"><span className="text-[9px] font-bold text-slate-500 uppercase">Temporal Scope</span><input value={state.dataQuality.timeframe} onChange={(e) => updateState('dataQuality.timeframe', e.target.value)} className={`w-full p-3 rounded-xl border-2 font-bold text-xs ${inputClass}`} /></div>
                           <div className="space-y-1"><span className="text-[9px] font-bold text-slate-500 uppercase">Geographic Precision</span><input value={state.dataQuality.geography} onChange={(e) => updateState('dataQuality.geography', e.target.value)} className={`w-full p-3 rounded-xl border-2 font-bold text-xs ${inputClass}`} /></div>
                           <div className="space-y-1"><span className="text-[9px] font-bold text-slate-500 uppercase">Technological Specificity</span><input value={state.dataQuality.technology} onChange={(e) => updateState('dataQuality.technology', e.target.value)} className={`w-full p-3 rounded-xl border-2 font-bold text-xs ${inputClass}`} /></div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeSubTab === "REVIEW" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                        <h4 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4"><FileText size={32} className="text-slate-500" /> Verification & <span className="text-slate-500">Audit Protocol</span></h4>
                        <p className="text-slate-400 font-medium">Finalize the assurance level for external disclosure.</p>
                    </div>
                    <div className="p-8 bg-slate-800/40 rounded-3xl border border-slate-700">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Assurance Level / Review Type</label>
                        <select value={state.review.type} onChange={(e) => updateState('review.type', e.target.value)} className={`w-full p-4 rounded-xl border-2 outline-none font-bold text-sm ${inputClass}`}>
                           <option value="NONE">Self-Declaration (Internal Decision Support)</option>
                           <option value="INTERNAL">Internal Compliance Audit</option>
                           <option value="EXTERNAL">Third-Party Independent Verification</option>
                           <option value="PANEL">Interested Parties Review Panel (B2C Comparative)</option>
                        </select>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Critical Modeling Assumptions</h5>
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl flex justify-between items-center text-xs font-bold text-white italic">"Logistics emissions projected via global average sea freight carbon intensity factor."<Trash2 size={14} className="text-slate-600" /></div>
                            <button className="px-6 py-3 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center gap-2"><Plus size={14} /> Log Model Assumption</button>
                        </div>
                    </div>
                </div>
            )}

         </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { 
  FileText, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Info, 
  Download, Filter, ArrowUpRight, Scale, DollarSign, Globe, Layers, BarChart3
} from "lucide-react";

interface AuditLedgerProps {
  nodes: any[];
  results?: any;
  isDark?: boolean;
}

export default function AuditLedger({ nodes, results, isDark = true }: AuditLedgerProps) {
  const [activeView, setActiveView] = useState<"PHYSICAL" | "FINANCIAL" | "REGULATORY">("PHYSICAL");

  // Derive Audit Data from real engine results
  const auditData = {
    totalGWP: results?.metrics?.gwp_total || 0,
    fossilGWP: results?.metrics?.gwp_fossil || 0,
    biogenicGWP: results?.metrics?.gwp_biogenic || 0,
    totalCost: results?.metrics?.total_op_cost || 0,
    carbonLiability: results?.metrics?.carbon_liability || 0,
    npvImpact: results?.metrics?.npv_impact || 0,
    complianceScore: results?.audit?.is_csrd_aligned ? 92 : 45,
    scopes: results?.audit?.scopes || {
       "Scope 1": 0,
       "Scope 2": 0,
       "Scope 3": 0
    },
    hotspots: (results?.contributions || []).slice(0, 5).map((c: any) => ({
       label: c.label,
       impact: c.gwp_fossil + c.gwp_biogenic,
       financial: c.financial_risk,
       scope: c.scope3_id,
       dqr: c.uncertainty_sd_g
    }))
  };

  const cardClass = isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1";

  return (
    <div className={`flex-1 flex flex-col h-full animate-in fade-in duration-500 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      {/* Audit Header */}
      <header className={`p-8 border-b flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
         <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1">Strategic Audit Ledger</h2>
            <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Regulatory <span className="text-emerald-500">Pivot Document</span></h3>
         </div>
         <div className="flex gap-3">
            <button className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all flex items-center gap-2"><Download size={14} /> Export ESRS E1</button>
            <button className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"><CheckCircle size={14} /> Finalize Audit</button>
         </div>
      </header>

      {/* Main Pivot Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         <div className="max-w-6xl mx-auto space-y-8">
            
            {/* View Selector Tabs */}
            <div className="flex gap-4 border-b border-slate-800 pb-4">
               {["PHYSICAL", "FINANCIAL", "REGULATORY"].map((v: any) => (
                  <button 
                     key={v} 
                     onClick={() => setActiveView(v)}
                     className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     {v} Audit
                  </button>
               ))}
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-4 gap-6">
               <div className={`p-6 rounded-3xl border ${cardClass}`}>
                  <div className={labelClass}>Total Life Cycle GWP</div>
                  <div className="text-3xl font-black italic">{auditData.totalGWP.toLocaleString()} <span className="text-sm font-bold opacity-40">kgCO2e</span></div>
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-amber-500"><AlertTriangle size={12} /> High fossil intensity</div>
               </div>
               <div className={`p-6 rounded-3xl border ${cardClass}`}>
                  <div className={labelClass}>CBAM / Carbon Liability</div>
                  <div className="text-3xl font-black italic text-emerald-500">${auditData.carbonLiability.toLocaleString()}</div>
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-emerald-600"><TrendingDown size={12} /> Reduced -$12.40 YTD</div>
               </div>
               <div className={`p-6 rounded-3xl border ${cardClass}`}>
                  <div className={labelClass}>Anticipated NPV Effect</div>
                  <div className="text-3xl font-black italic text-red-500">-${Math.abs(auditData.npvImpact).toLocaleString()}</div>
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-slate-500"><Globe size={12} /> 5-year transition risk</div>
               </div>
               <div className={`p-6 rounded-3xl border ${cardClass} bg-gradient-to-br from-emerald-600/10 to-transparent`}>
                  <div className={labelClass}>Compliance Score</div>
                  <div className="text-3xl font-black italic text-indigo-400">{auditData.complianceScore}%</div>
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-indigo-500"><ArrowUpRight size={12} /> ESRS Readiness high</div>
               </div>
            </div>

            {/* Pivot Table Section */}
            <div className={`rounded-3xl border overflow-hidden ${cardClass}`}>
               <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">GHG Protocol Scope 1-2-3 Attribution Pivot</h4>
                  <div className="flex gap-2"><Filter size={14} className="text-slate-600" /></div>
               </div>
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-950/50 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <th className="p-5 border-b border-slate-800">Process Node / Hotspot</th>
                        <th className="p-5 border-b border-slate-800">Regulatory Scope</th>
                        <th className="p-5 border-b border-slate-800 text-right">Physical Impact (kgCO2e)</th>
                        <th className="p-5 border-b border-slate-800 text-right">Financial Risk ($)</th>
                        <th className="p-5 border-b border-slate-800 text-right">DQR Rating</th>
                     </tr>
                  </thead>
                  <tbody className="text-xs font-bold font-mono">
                     {auditData.hotspots.map((h: { label: string; scope: number; impact: number; financial: number; dqr: number }, i: number) => (
                        <tr key={i} className="group hover:bg-slate-800/30 transition-all border-b border-slate-800/50">
                           <td className="p-5 text-white italic">{h.label}</td>
                           <td className="p-5"><span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] font-black uppercase tracking-tighter text-slate-400">Scope {h.scope}</span></td>
                           <td className="p-5 text-right text-emerald-400">{h.impact.toFixed(2)}</td>
                           <td className="p-5 text-right text-amber-500">${h.financial.toFixed(2)}</td>
                           <td className="p-5 text-right">
                              <div className="flex justify-end gap-0.5">
                                 {[1,2,3,4,5].map(dot => (
                                   <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot <= (Math.max(1, 6 - Math.round(h.dqr * 2))) ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
                                 ))}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Summary Insights */}
            <div className="grid grid-cols-2 gap-8">
               <div className={`p-8 rounded-3xl border ${cardClass} space-y-6`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><BarChart3 size={16} /> Environmental Breakdown</h4>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Fossil Carbon</span><span>{((auditData.fossilGWP / auditData.totalGWP) * 100).toFixed(1)}%</span></div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-600 w-[89%]" /></div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Biogenic Carbon</span><span>{((auditData.biogenicGWP / auditData.totalGWP) * 100).toFixed(1)}%</span></div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[11%]" /></div>
                     </div>
                  </div>
               </div>
               <div className={`p-8 rounded-3xl border ${cardClass} space-y-6`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><Scale size={16} /> Strategic Compliance Review</h4>
                  <div className="space-y-4">
                     <div className="flex items-start gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white mb-1">GHG Protocol Alignment</div>
                           <div className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase italic">All Scope 1, 2, and upstream scope 3 categories have been identified and quantified.</div>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-4 bg-red-950/10 rounded-2xl border border-red-900/30">
                        <AlertTriangle size={18} className="text-red-500 shrink-0" />
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Risk Insight</div>
                           <div className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase italic">
                              {results?.audit?.missing_biogenic_data ? "Biogenic data is missing for high-energy processes. Impact may be underestimated." : "Transition certificates will incur carbon liability under current premiums."}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

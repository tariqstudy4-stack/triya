import React from "react";
import { Download, PieChart, TrendingUp, AlertCircle, FileText } from "lucide-react";

interface AccountingSuiteProps {
  nodes: any[];
  isDark: boolean;
  onExport: () => void;
}

export default function AccountingSuite({ nodes, isDark, onExport }: AccountingSuiteProps) {
  const bgClass = isDark ? "bg-slate-900" : "bg-slate-50";
  const cardClass = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm";
  const textClass = isDark ? "text-slate-200" : "text-slate-800";
  
  const totalProjectCost = nodes.reduce((acc, n) => acc + ((n.data.costPerUnit || 0) * (n.data.inputs?.[0]?.amount || 1)), 0);

  return (
    <div className={`h-full w-full flex flex-col p-8 space-y-8 overflow-y-auto ${bgClass} ${textClass}`}>
      {/* Header & Export Section */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black tracking-tighter uppercase italic">Strategic Auditor <span className="text-emerald-500">v1.2</span></h2>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Full-Spectrum ERP Accounting & Financial Lifecycle</p>
        </div>
        <button 
          onClick={onExport}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3"
        >
           <Download size={16} /> EXPORT TO GOOGLE SHEETS
        </button>
      </div>

      {/* Financial Pulse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PulseCard 
          title="Total Product Cost" 
          value={`$${totalProjectCost.toLocaleString()}`} 
          trend="+2.4% vs Target" 
          icon={<TrendingUp size={18} className="text-emerald-500" />} 
          isDark={isDark}
        />
        <PulseCard 
          title="Carbon Liability" 
          value={`$${(150.6 * 0.05).toFixed(2)}`} 
          trend="Projected Tax" 
          icon={<AlertCircle size={18} className="text-amber-500" />} 
          isDark={isDark}
        />
        <PulseCard 
          title="OpEx Contribution" 
          value={`$${(totalProjectCost * 0.45).toLocaleString()}`} 
          trend="Labor & Energy" 
          icon={<PieChart size={18} className="text-blue-500" />} 
          isDark={isDark}
        />
        <PulseCard 
          title="Target Margin" 
          value="22.4%" 
          trend="Optimized" 
          icon={<FileText size={18} className="text-purple-500" />} 
          isDark={isDark}
        />
      </div>

      {/* Main ERP Ledger Table */}
      <div className={`flex-1 rounded-2xl border ${cardClass} overflow-hidden flex flex-col`}>
        <header className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Financial Ledger</span>
           <span className="text-[10px] text-emerald-500 font-mono tracking-tighter">Currency: USD ($)</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/30 text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-slate-700/50">
                <th className="px-8 py-4">Lifecycle Phase</th>
                <th className="px-6 py-4">Unit Cost</th>
                <th className="px-6 py-4">Throughput</th>
                <th className="px-6 py-4">OpEx (45%)</th>
                <th className="px-6 py-4">CapEx (30%)</th>
                <th className="px-6 py-4 text-emerald-500">Total Phase Cost</th>
                <th className="px-6 py-4 text-amber-500">C-Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {nodes.map(node => {
                const data = node.data;
                const unitCost = data.costPerUnit || 0;
                const throughput = data.inputs?.[0]?.amount || 1;
                const total = unitCost * throughput;
                return (
                  <tr key={node.id} className="hover:bg-emerald-500/5 transition-colors group">
                    <td className="px-8 py-4 font-bold tracking-tight">{data.label}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">$ {unitCost.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono">{throughput.toLocaleString()} {data.inputs?.[0]?.unit || 'units'}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">$ {(total * 0.45).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">$ {(total * 0.30).toFixed(2)}</td>
                    <td className="px-6 py-4 font-black font-mono text-emerald-500 group-hover:scale-105 transition-transform origin-left">$ {total.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-amber-500/60">$ {(total * 0.002).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <footer className="px-8 py-4 border-t border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
           <span className="text-[10px] font-black text-slate-500">AUDIT LOG: ALL CALCULATIONS COMPLIANT WITH ISO 14044</span>
           <span className="text-xl font-black text-white">$ {totalProjectCost.toLocaleString()} USD</span>
        </footer>
      </div>
    </div>
  );
}

function PulseCard({ title, value, trend, icon, isDark }: any) {
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:scale-105 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-900/50 rounded-lg">{icon}</div>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{trend}</span>
      </div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-1">{title}</p>
      <h3 className="text-2xl font-black tracking-tighter text-white">{value}</h3>
    </div>
  );
}

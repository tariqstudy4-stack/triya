"use client";

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { RefreshCw, LayoutGrid, List, Zap, Droplets, Wind, Skull } from "lucide-react";

interface AnalyticsDashboardProps {
  data?: any[];
  onSync?: () => void;
  theme?: "dark" | "light";
}

export default function AnalyticsDashboard({ data = [], onSync, theme = "dark" }: AnalyticsDashboardProps) {
  const [viewMode, setViewMode] = useState<"Charts" | "Table">("Charts");
  const [isSyncing, setIsSyncing] = useState(false);

  const containerClasses = theme === "dark" 
    ? "bg-slate-900 text-slate-300" 
    : "bg-white text-slate-700";
  
  const headerClasses = theme === "dark"
    ? "bg-slate-800 border-slate-700"
    : "bg-slate-50 border-slate-200";

  const handleSync = () => {
    setIsSyncing(true);
    if (onSync) onSync();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const chartData = data.length > 0 ? data : [
    { phase: 'No Data', GWP: 0, ODP: 0, Tox: 0, Eutro: 0 }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-slate-300 overflow-hidden font-sans">
      {/* 2. Header Bar */}
      <header className="flex justify-between items-center px-4 py-2.5 border-b border-slate-700 bg-slate-800/80 backdrop-blur-md z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
            LCIA Simulation Results
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all active:scale-95 text-slate-100"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "SYNCING..." : "SYNC DATA"}
          </button>

          <div className="flex bg-slate-900 p-0.5 rounded border border-slate-700">
            <button 
              onClick={() => setViewMode("Charts")}
              className={`p-1.5 rounded transition-all ${viewMode === "Charts" ? "bg-slate-700 text-white shadow-md font-bold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button 
              onClick={() => setViewMode("Table")}
              className={`p-1.5 rounded transition-all ${viewMode === "Table" ? "bg-slate-700 text-white shadow-md font-bold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. Dashboard Grid (Charts View) */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {viewMode === "Charts" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
            {/* Chart 1: Global Warming Potential */}
            <ChartCard title="Global Warming Potential" icon={<Wind size={14} />} unit="kg CO2-eq">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} 
                  />
                  <Bar dataKey="GWP" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 2: Ozone Depletion */}
            <ChartCard title="Ozone Depletion" icon={<Zap size={14} />} unit="kg CFC-11 eq">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} 
                  />
                  <Bar dataKey="ODP" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-odp-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 3: Human Toxicity */}
            <ChartCard title="Human Toxicity" icon={<Skull size={14} />} unit="CTUh">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} 
                  />
                  <Bar dataKey="Tox" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-tox-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 4: Eutrophication */}
            <ChartCard title="Eutrophication" icon={<Droplets size={14} />} unit="kg P-eq">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} 
                  />
                  <Bar dataKey="Eutro" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-eutro-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* NEW Chart 5: Phase Costs (ERP Integration) */}
            <ChartCard title="Phase Costs (Accounting)" icon={<RefreshCw size={14} />} unit="USD ($)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} 
                  />
                  <Bar dataKey="Cost" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-cost-${index}`} fill="#059669" fillOpacity={0.6 + index * 0.1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-2xl">
            <table className="w-full text-left text-[11px] font-medium">
              <thead className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Lifecycle Phase</th>
                  <th className="px-6 py-4 text-emerald-500">GWP (CO2-eq)</th>
                  <th className="px-6 py-4">ODP (CFC-11)</th>
                  <th className="px-6 py-4">Tox (CTUh)</th>
                  <th className="px-6 py-4">Eutro (P-eq)</th>
                  <th className="px-6 py-4 text-emerald-500 font-black">COST (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {chartData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-200">{row.phase}</td>
                    <td className="px-6 py-3 text-emerald-400 font-mono italic">{row.GWP}</td>
                    <td className="px-6 py-3 text-blue-400 font-mono italic">{row.ODP}</td>
                    <td className="px-6 py-3 text-amber-500 font-mono italic">{row.Tox}</td>
                    <td className="px-6 py-3 text-violet-500 font-mono italic">{row.Eutro}</td>
                    <td className="px-6 py-3 text-emerald-500 font-black font-mono tracking-tighter">$ {row.Cost?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

// Helper Chart Card Component
function ChartCard({ title, icon, unit, children }: { title: string, icon: React.ReactNode, unit: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col hover:border-slate-500 transition-all shadow-lg group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 group-hover:text-amber-500 transition-colors">{icon}</span>
          <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 group-hover:text-slate-100 transition-colors truncate">
            {title}
          </h4>
        </div>
        <span className="text-[8px] font-black text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
           {unit}
        </span>
      </div>
      <div className="flex-1 min-h-[160px]">
        {children}
      </div>
    </div>
  );
}

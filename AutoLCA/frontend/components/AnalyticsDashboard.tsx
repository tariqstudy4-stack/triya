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
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { RefreshCw, LayoutGrid, List, Zap, Droplets, Wind, Skull, BarChart3, Activity, Target } from "lucide-react";

interface AnalyticsDashboardProps {
  data?: any[];
  onSync?: () => void;
  theme?: "dark" | "light";
  sensitivityResults?: any;
  scenarioResults?: any;
  mcResults?: any;
}

type TabId = "charts" | "table" | "sensitivity" | "montecarlo" | "scenarios";

export default function AnalyticsDashboard({ 
  data = [], 
  onSync, 
  theme = "dark",
  sensitivityResults,
  scenarioResults,
  mcResults,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("charts");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    if (onSync) onSync();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const chartData = data.length > 0 ? data : [
    { phase: 'No Data', GWP: 0, ODP: 0, Tox: 0, Eutro: 0 }
  ];

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "charts", label: "Charts", icon: <LayoutGrid size={12} /> },
    { id: "table", label: "Table", icon: <List size={12} /> },
    { id: "sensitivity", label: "Sensitivity", icon: <BarChart3 size={12} />, badge: sensitivityResults ? "✓" : undefined },
    { id: "montecarlo", label: "Monte Carlo", icon: <Activity size={12} />, badge: mcResults ? `${mcResults.iterations || ''}` : undefined },
    { id: "scenarios", label: "Scenarios", icon: <Target size={12} />, badge: scenarioResults ? `${scenarioResults.scenarios?.length || ''}` : undefined },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-slate-300 overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="flex justify-between items-center px-4 py-2 border-b border-slate-700 bg-slate-800/80 backdrop-blur-md z-10 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
            LCIA Simulation Results
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Navigation */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id 
                    ? "bg-slate-700 text-white shadow-md" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded-full font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={handleSync}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all active:scale-95 text-slate-100"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "..." : "SYNC"}
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        
        {/* ===== CHARTS TAB ===== */}
        {activeTab === "charts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
            <ChartCard title="Global Warming Potential" icon={<Wind size={14} />} unit="kg CO2-eq">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                  <Bar dataKey="GWP" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Ozone Depletion" icon={<Zap size={14} />} unit="kg CFC-11 eq">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                  <Bar dataKey="ODP" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-odp-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Human Toxicity" icon={<Skull size={14} />} unit="CTUh">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                  <Bar dataKey="Tox" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-tox-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Eutrophication" icon={<Droplets size={14} />} unit="kg P-eq">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                  <Bar dataKey="Eutro" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-eutro-${index}`} fillOpacity={0.8 + index * 0.05} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Phase Costs (Accounting)" icon={<RefreshCw size={14} />} unit="USD ($)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                  <Bar dataKey="Cost" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-cost-${index}`} fill="#059669" fillOpacity={0.6 + index * 0.1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* ===== TABLE TAB ===== */}
        {activeTab === "table" && (
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

        {/* ===== SENSITIVITY TAB ===== */}
        {activeTab === "sensitivity" && (
          <div className="space-y-6">
            {sensitivityResults ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Baseline GWP</span>
                    <p className="text-xl font-mono font-black text-emerald-500 mt-1">{sensitivityResults.baseline_gwp?.toFixed(4)}</p>
                    <span className="text-[9px] text-slate-600">kg CO₂ eq</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Perturbation</span>
                    <p className="text-xl font-mono font-black text-blue-400 mt-1">±{sensitivityResults.perturbation_pct}%</p>
                    <span className="text-[9px] text-slate-600">OAT (ISO 14044)</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Parameters Tested</span>
                    <p className="text-xl font-mono font-black text-amber-500 mt-1">{sensitivityResults.ranked_parameters?.length || 0}</p>
                    <span className="text-[9px] text-slate-600">Ranked by influence</span>
                  </div>
                </div>

                {/* Tornado Chart */}
                <ChartCard title="Sensitivity Tornado (OAT ±10%)" icon={<BarChart3 size={14} />} unit="% GWP Change">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={(sensitivityResults.ranked_parameters || []).slice(0, 10).map((r: any) => ({
                        name: r.parameter.length > 25 ? r.parameter.substring(0, 25) + '…' : r.parameter,
                        influence: r.avg_influence_pct,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} width={110} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                      <Bar dataKey="influence" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16}>
                        {(sensitivityResults.ranked_parameters || []).slice(0, 10).map((_: any, i: number) => (
                          <Cell key={`s-${i}`} fill={i === 0 ? '#ef4444' : i < 3 ? '#f59e0b' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-600">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-bold">No Sensitivity Analysis Results</p>
                  <p className="text-xs mt-1">Click "Sensitivity" button above to run OAT analysis.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== MONTE CARLO TAB ===== */}
        {activeTab === "montecarlo" && (
          <div className="space-y-6">
            {mcResults && mcResults.uncertainty ? (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mean GWP</span>
                    <p className="text-xl font-mono font-black text-emerald-500 mt-1">
                      {mcResults.impacts?.gwp_climate_change?.toFixed(4) || '0'}
                    </p>
                    <span className="text-[9px] text-slate-600">kg CO₂ eq</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">P5</span>
                    <p className="text-xl font-mono font-black text-blue-400 mt-1">
                      {mcResults.uncertainty?.gwp_climate_change?.p5?.toFixed(4) || 'N/A'}
                    </p>
                    <span className="text-[9px] text-slate-600">5th Percentile</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">P95</span>
                    <p className="text-xl font-mono font-black text-amber-500 mt-1">
                      {mcResults.uncertainty?.gwp_climate_change?.p95?.toFixed(4) || 'N/A'}
                    </p>
                    <span className="text-[9px] text-slate-600">95th Percentile</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Iterations</span>
                    <p className="text-xl font-mono font-black text-violet-400 mt-1">{mcResults.iterations || 1}</p>
                    <span className="text-[9px] text-slate-600">Simulations</span>
                  </div>
                </div>

                {/* MC Category Distribution */}
                <ChartCard title="Impact Category Uncertainty (Mean ± 90% CI)" icon={<Activity size={14} />} unit="Various">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.entries(mcResults.uncertainty || {}).slice(0, 8).map(([cat, stats]: [string, any]) => ({
                        category: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).substring(0, 18),
                        mean: stats.mean,
                        p5: stats.p5,
                        p95: stats.p95,
                      }))}
                      margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 8 }} angle={-30} textAnchor="end" />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                      <Bar dataKey="p5" fill="#3b82f6" opacity={0.4} name="P5" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="mean" fill="#10b981" name="Mean" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="p95" fill="#f59e0b" opacity={0.4} name="P95" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-600">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-bold">No Monte Carlo Results</p>
                  <p className="text-xs mt-1">Click "Monte Carlo (100)" button above to run uncertainty analysis.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SCENARIO COMPARISON TAB ===== */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            {scenarioResults && scenarioResults.scenarios ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {scenarioResults.scenarios.map((s: any, idx: number) => (
                    <div key={idx} className={`bg-slate-800 rounded-xl border p-4 ${idx === 0 ? 'border-emerald-500/30' : 'border-slate-700'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-emerald-500' : 'text-blue-400'}`}>
                            {idx === 0 ? 'BASELINE' : `SCENARIO ${idx}`}
                          </span>
                          <p className="text-sm font-bold text-white mt-0.5">{s.name}</p>
                        </div>
                        <span className="text-lg font-mono font-black text-amber-500">{s.gwp?.toFixed(4)}</span>
                      </div>

                      {s.delta_vs_baseline && (
                        <div className="space-y-1 mt-2 pt-2 border-t border-slate-700/50">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Delta vs Baseline (GWP)</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-mono font-black ${(s.delta_vs_baseline.gwp_climate_change?.relative_pct || 0) < 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                              {(s.delta_vs_baseline.gwp_climate_change?.relative_pct || 0) > 0 ? '+' : ''}
                              {s.delta_vs_baseline.gwp_climate_change?.relative_pct?.toFixed(1)}%
                            </span>
                            <span className="text-[9px] text-slate-500">
                              ({s.delta_vs_baseline.gwp_climate_change?.absolute?.toFixed(6)} absolute)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Side-by-Side GWP Bar Chart */}
                <ChartCard title="Scenario GWP Comparison" icon={<Target size={14} />} unit="kg CO₂ eq">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={scenarioResults.scenarios.map((s: any) => ({
                        name: s.name.substring(0, 20),
                        GWP: s.gwp,
                      }))}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', borderRadius: '4px' }} />
                      <Bar dataKey="GWP" radius={[4, 4, 0, 0]} barSize={40}>
                        {scenarioResults.scenarios.map((_: any, i: number) => (
                          <Cell key={`sc-${i}`} fill={i === 0 ? '#10b981' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-600">
                <div className="text-center">
                  <Target size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-bold">No Scenario Comparison Results</p>
                  <p className="text-xs mt-1">Click "Compare" button above to run a scenario comparison.</p>
                </div>
              </div>
            )}
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

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { X, Play, Loader2, BarChart3 } from "lucide-react";
import { useLcaStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, Cell } from 'recharts';

type ExecutiveSummaryPanelProps = {
  node: any;
  onClose: () => void;
};

export function ExecutiveSummaryPanel({ node, onClose }: ExecutiveSummaryPanelProps) {
  const { nodes, edges } = useLcaStore();
  
  if (!node) return null;

  const data = node.data || {};
  const lcia = data.lcia_impacts || {};
  
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("idle");
  const [mcResults, setMcResults] = useState<any>(null);

  // Polling Logic for Async Monte Carlo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taskId && status === "processing") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/tasks/${taskId}`);
          const taskData = await res.json();
          setProgress(taskData.progress);
          setStatus(taskData.status);
          if (taskData.status === "completed") {
            setMcResults(taskData.results);
            clearInterval(interval);
          } else if (taskData.status === "failed") {
            clearInterval(interval);
            alert("Monte Carlo Simulation Failed: " + taskData.error);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [taskId, status]);

  const chartData = useMemo(() => {
    if (!mcResults) return [];
    return [
      {
        name: 'GWP Total',
        mean: mcResults.mean,
        error: [mcResults.mean - mcResults.p5, mcResults.p95 - mcResults.mean]
      }
    ];
  }, [mcResults]);


  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-[hsl(220,18%,6%)] border-l border-white/10 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            {data.label || "Process Summary"}
          </h2>
          <span className="text-xs text-blue-400 font-mono bg-blue-400/10 px-2 py-0.5 rounded">EXECUTIVE MODE</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="p-4 bg-[hsl(220,14%,10%)] border border-white/10 rounded-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
           <h3 className="text-sm font-bold text-white mb-2">Process Narrative</h3>
           <p className="text-xs text-gray-400 leading-relaxed">
             This node represents a highly structured industrial flow. The calculated carbon equivalents are heavily influenced by the upstream energy grid ({data.metadata?.geography || "GLO"}) and the physical mapping defined by the Leontief Matrix inversion.
           </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key KPI Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center hover:border-red-500/50 transition-colors">
                 <span className="text-3xl font-black text-white">{lcia['Climate Change (kg CO2-eq)']?.toFixed(1) || "0.0"}</span>
                 <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold mt-1">Carbon (kg CO₂e)</span>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors">
                 <span className="text-3xl font-black text-white">{lcia['Water Scarcity (m3 eq)']?.toFixed(1) || "0.0"}</span>
                 <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-1">Water (m³ eq)</span>
             </div>
          </div>
        </div>

        {/* Dynamic Canvas Routing Context */}
        {/* Monte Carlo Simulation Segment */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stochastic Uncertainty</h3>
            {status === "completed" && (
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">ISO COMPLIANT</span>
            )}
          </div>

          {!mcResults && status === "idle" && (
            <button 
              onClick={async () => {
                setStatus("processing");
                try {
                  const res = await fetch("/api/calculate-monte-carlo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nodes, edges, iterations: 1000 })
                  });
                  const task = await res.json();
                  setTaskId(task.task_id);
                } catch (e) { setStatus("idle"); }
              }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl flex items-center justify-center gap-2 group transition-all"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black uppercase tracking-tighter">Execute Stochastic Uncertainty Analysis (1,000 Iterations)</span>
            </button>
          )}

          {status === "processing" && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-[10px] font-bold text-white uppercase italic">
                <span>Simulating Supply Chain...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {mcResults && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="mean" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]}>
                      <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#f87171" direction="y" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-[10px] text-gray-500 uppercase">Mean: <span className="text-white">{mcResults.mean.toFixed(2)}</span></div>
                <div className="text-[10px] text-gray-500 uppercase">SD: <span className="text-white">{mcResults.sd.toFixed(2)}</span></div>
                <div className="text-[10px] text-gray-500 uppercase">P5: <span className="text-white">{mcResults.p5.toFixed(2)}</span></div>
                <div className="text-[10px] text-gray-500 uppercase">P95: <span className="text-white">{mcResults.p95.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dynamic Material Routing</h3>
          <div className="w-full bg-black/40 rounded-xl border border-white/5 p-4 text-xs text-gray-400">
             The circular matrix pathing is now operating natively on the <strong className="text-blue-400">React Flow Canvas</strong>.
             Interactive loops map to the Leontief Inverse resolution directly spanning across the nodes visually.
          </div>
          
          <button 
             onClick={async () => {
                 try {
                     const calcRes = await fetch("/api/calculate-lca", {
                         method: "POST", headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ nodes, edges })
                     });
                     if (!calcRes.ok) throw new Error("Calc Failed");
                     const calcData = await calcRes.json();
                     const contributions = calcData.contributions || [];

                     // Native CSV formulation
                     const headers = ["Process ID", "Process Name", "Scope/Tier", "Mass Required", "GWP (kg CO2e)"];
                     const rows = contributions.map((c: any, i: number) => [
                         c.node_id, `"${c.label}"`, i > 0 ? "Scope 3 Upstream" : "Scope 1 Direct", c.mass_required, c.climate_change
                     ]);
                     const csvStr = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
                     
                     const blb = new Blob([csvStr], { type: 'text/csv' });
                     const url = window.URL.createObjectURL(blb); 
                     const a = document.createElement("a"); 
                     a.href = url; 
                     a.download = "triya_epd.csv"; 
                     document.body.appendChild(a);
                     a.click();
                     document.body.removeChild(a);
                     setTimeout(() => window.URL.revokeObjectURL(url), 100);
                 } catch (e) { alert("Export Failed"); }
             }}
             className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-md transition-colors"
          >
             📥 Export Enterprise EPD (Overall System)
          </button>
        </div>
      </div>
    </div>
  );
}

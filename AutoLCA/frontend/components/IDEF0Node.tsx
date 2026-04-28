"use client";

import { memo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Boxes, Database, Zap, AlertTriangle, Layers, Beaker } from "lucide-react";

/**
 * IDEF0 Node — Industrial LCA Process Node with 4-handle semantics:
 *   Top: Control (standards, regulations, constraints)
 *   Left: Input (raw materials, energy)
 *   Right: Output (product, waste, emissions)
 *   Bottom: Mechanism (equipment, human resources)
 * 
 * Supports the 3-layer data model:
 *   Layer 0: Database baseline (from ingested LCI)
 *   Layer 1: User customization (overrides, formulas)
 *   Layer 2: Computed output (resolved amounts)
 */
export const Idef0Node = memo(function Idef0Node({ data }: NodeProps | any) {
  const isBalanced = data.massBalanceStatus?.is_balanced ?? true;
  const gwp = data.gwp ?? data.lcia_impacts?.['gwp_climate_change'] ?? 0;
  const exchangeCount = (data.exchanges?.length || 0) + (data.inputs?.length || 0) + (data.outputs?.length || 0);
  const isLibrary = data.processId || data.is_library;
  const hasOverrides = data._layerOverrides && Object.keys(data._layerOverrides).length > 0;
  const module = data.module || "A1-A3";
  
  // Module color coding per EN 15804
  const moduleColor = (() => {
    if (module.startsWith("A1") || module.startsWith("A2") || module.startsWith("A3") || module === "A1-A3") return "border-emerald-500/60 shadow-emerald-500/10";
    if (module.startsWith("A4") || module.startsWith("A5")) return "border-sky-500/60 shadow-sky-500/10";
    if (module.startsWith("B")) return "border-amber-500/60 shadow-amber-500/10";
    if (module.startsWith("C")) return "border-rose-500/60 shadow-rose-500/10";
    if (module === "D") return "border-purple-500/60 shadow-purple-500/10";
    return "border-zinc-700";
  })();

  return (
    <div className={`w-80 bg-zinc-950/95 border-2 rounded-2xl shadow-2xl transition-all duration-300 group relative backdrop-blur-sm ${moduleColor} ${!isBalanced ? 'ring-2 ring-rose-500/30' : ''}`}>
      
      {/* ── Control Handle (Top) ── */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] uppercase font-black text-zinc-600 tracking-[0.3em]">Control</div>
      <Handle
        type="target"
        position={Position.Top}
        id="control"
        style={{ width: 10, height: 10, background: '#10b981', border: '2px solid #09090b', borderRadius: '2px', top: -5 }}
      />

      {/* ── Input Handle (Left) ── */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-[7px] uppercase font-black text-zinc-600 tracking-widest -rotate-90">Input</div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ width: 10, height: 10, background: '#38bdf8', border: '2px solid #09090b', borderRadius: '2px', left: -5 }}
      />

      {/* ── Node Header ── */}
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLibrary ? (
            <Database size={12} className="text-emerald-500 opacity-80" />
          ) : (
            <Beaker size={12} className="text-amber-500 opacity-80" />
          )}
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {module}
          </span>
          {hasOverrides && (
            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
              L1
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-zinc-600">
            #{(data.processId || data.uuid || data.id || "").toString().substring(0, 6)}
          </span>
          {isLibrary && (
            <Layers size={10} className="text-emerald-500/50" />
          )}
        </div>
      </div>

      {/* ── Process Name ── */}
      <div className="px-5 pb-2">
        <h3 className="text-sm font-black text-zinc-100 leading-tight uppercase tracking-tight antialiased line-clamp-2">
          {data.processName || data.label || "Unnamed Process"}
        </h3>
        {data.location && (
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
            {typeof data.location === 'object' ? data.location.value : data.location}
          </span>
        )}
      </div>

      {/* ── Metrics Bar ── */}
      <div className="mx-3 mb-2 p-2.5 bg-zinc-900/80 rounded-xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-950 rounded-lg border border-white/5">
            <Zap size={11} className="text-zinc-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">GWP</span>
            <span className="text-[12px] font-mono font-black text-zinc-300 leading-none">
              {gwp > 0 ? gwp.toFixed(3) : "—"}
              <span className="text-[7px] font-sans text-zinc-600 ml-1">kgCO₂e</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">Flows</span>
            <span className="text-[11px] font-mono font-bold text-zinc-400 leading-none">{exchangeCount}</span>
          </div>
          
          {!isBalanced && (
            <div className="flex items-center gap-1 text-rose-600">
              <AlertTriangle size={10} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {/* ── Layer Indicator Strip ── */}
      <div className="mx-3 mb-3 flex gap-1">
        <div className={`flex-1 h-1 rounded-full ${isLibrary ? 'bg-emerald-500/40' : 'bg-zinc-800'}`} title="L0: Database" />
        <div className={`flex-1 h-1 rounded-full ${hasOverrides ? 'bg-amber-500/40' : 'bg-zinc-800'}`} title="L1: Customized" />
        <div className={`flex-1 h-1 rounded-full ${gwp > 0 ? 'bg-blue-500/40' : 'bg-zinc-800'}`} title="L2: Computed" />
      </div>

      {/* ── Output Handle (Right) ── */}
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-[7px] uppercase font-black text-zinc-600 tracking-widest rotate-90">Output</div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ width: 10, height: 10, background: '#f97316', border: '2px solid #09090b', borderRadius: '2px', right: -5 }}
      />

      {/* ── Mechanism Handle (Bottom) ── */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] uppercase font-black text-zinc-600 tracking-[0.3em]">Mechanism</div>
      <Handle
        type="target"
        position={Position.Bottom}
        id="mechanism"
        style={{ width: 10, height: 10, background: '#a855f7', border: '2px solid #09090b', borderRadius: '2px', bottom: -5 }}
      />
    </div>
  );
});

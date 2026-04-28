"use client";

import { memo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { AlertTriangle, Boxes, Database, Zap } from "lucide-react";

export const ProcessNode = memo(function ProcessNode({ data }: NodeProps | any) {
  // --- Core LCA States ---
  const isBalanced = data.massBalanceStatus?.is_balanced ?? true;
  const lcia = data.lcia_impacts ?? {};
  const totalGWP = lcia['Climate Change (kg CO2-eq)'] ?? 0;
  
  // Minimalist Category Decorators (Desaturated)
  const categoryIconColor = (cat: string) => {
    switch (cat) {
      case "Energy": return "text-zinc-400";
      case "Transport": return "text-zinc-500";
      default: return "text-zinc-400";
    }
  };

  return (
    <div className={`w-72 bg-zinc-950 border-2 rounded-xl shadow-2xl transition-all duration-300 group ${isBalanced ? 'border-zinc-800 hover:border-zinc-700' : 'border-rose-900'}`}>
      
      {/* Node Sidebar Decorator (Minimalist) */}
      {!isBalanced && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-900 rounded-l-xl" />
      )}

      {/* --- Node Header: Technical Metadata --- */}
      <div className="px-5 pt-4 pb-1 flex items-center justify-between font-sans">
         <div className={`flex items-center gap-2 ${categoryIconColor(data.category)}`}>
            <Boxes size={14} className="opacity-60" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">{data.category || "PROCESS"}</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono font-bold text-zinc-600 tracking-tighter">#{data.uuid?.substring(0, 5) || "MOCK"}</span>
         </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="px-5 pb-3">
        {/* Title: High-Contrast Monochromatic */}
        <h3 className="text-base font-black text-zinc-100 leading-tight uppercase tracking-tight antialiased">
          {data.label || "Unnamed Instance"}
        </h3>
        
        {/* Verification Status (Desaturated) */}
        <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            <Database size={8} className="opacity-40" />
            <span>ISO 14044 Inventified</span>
        </div>
      </div>

      {/* --- Performance Metrics: Industrial Grid --- */}
      <div className="mx-3 mb-3 p-3 bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-1.5 bg-zinc-950 rounded border border-white/5">
               <Zap size={12} className="text-zinc-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">Impact Vector</span>
               <span className="text-[13px] font-mono font-black text-zinc-300 leading-none">
                 {totalGWP > 0 ? totalGWP.toFixed(2) : "DET."}
                 <span className="text-[8px] font-sans text-zinc-600 uppercase ml-1">kgCO₂e</span>
               </span>
            </div>
         </div>
         
         {!isBalanced && (
            <div className="flex items-center gap-1 text-rose-700">
               <AlertTriangle size={12} strokeWidth={3} />
               <span className="text-[8px] font-black leading-none uppercase">IMBALANCED</span>
            </div>
         )}
      </div>

      {/* --- Connection Handles: Heavy Duty Monochromatic --- */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ width: 8, height: 8, background: '#3f3f46', border: '2px solid #09090b', borderRadius: '1px' }}
        className="!left-[-5px]"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ width: 8, height: 8, background: '#52525b', border: '2px solid #09090b', borderRadius: '1px' }}
        className="!right-[-5px]"
      />
      
      <style jsx>{`
        .antialiased {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
});

"use client";

import { memo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

export const IDEF0Node = memo(function IDEF0Node({ data }: NodeProps) {
    const processName = (data.processName as string) ?? (data.label as string) ?? "Unknown Process";

    // New structure
    const technosphere = (data.technosphere as any[]) || [];
    const elementary = (data.elementary as any[]) || [];
    const scope = (data.scope as any) || {};
    const variables = (data.variables as Record<string, any>) || {};
    const allocation = (data.allocation as any) || {};

    // Fallback/Legacy support
    const exchanges = (data.exchanges as any[]) || [];

    const getFlows = (type: string) => {
        if (technosphere.length > 0) return technosphere.filter(f => f.flowType === type);
        return exchanges.filter(ex => ex.flow_type === type);
    };

    const inputs = getFlows('input');
    const outputs = getFlows('output');
    const controls = getFlows('control');
    const mechanisms = getFlows('mechanism');

    return (
        <div className="px-6 py-4 rounded-xl border border-white/5 bg-[hsl(220,14%,8%)/0.8] backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.3)] min-w-[240px] relative font-mono group transition-all hover:border-[hsl(142,76%,36%)] ring-1 ring-white/5 hover:ring-[hsl(142,76%,36%,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
            {/* Functional Unit Badge */}
            {scope.functionalUnit && (
                <div className="absolute -top-3 left-4 bg-[hsl(220,14%,12%)] border border-white/20 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest shadow-lg">
                    {scope.functionalUnit} @ {scope.location || 'GLO'}
                </div>
            )}

            {/* Feature Indicators */}
            <div className="absolute top-2 right-2 flex gap-1.5">
                {allocation.method && allocation.method !== 'none' && (
                    <div title={`Allocation: ${allocation.method}`} className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                )}
                {Object.keys(variables).length > 0 && (
                    <div title={`${Object.keys(variables).length} Local Variables`} className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                )}
            </div>

            {/* Top Handle: Control (Target) */}
            <Handle
                type="target"
                position={Position.Top}
                id="control"
                className="!w-3 !h-3 !bg-gray-500 !border-2 !border-black hover:!bg-white"
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-gray-600 whitespace-nowrap tracking-widest">
                Control
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
                {/* Left Handle: Input (Target) */}
                <Handle
                    type="target"
                    position={Position.Left}
                    id="input"
                    className="!w-3 !h-3 !bg-[hsl(142,76%,36%)] !border-2 !border-black hover:!bg-white"
                />

                {/* Center: Process Name */}
                <div className="text-center py-2 px-4 border-y border-white/5 w-full">
                    <div className="text-sm font-black text-white uppercase tracking-wider line-clamp-2">
                        {processName}
                    </div>
                </div>

                {/* Resolved Output Badge */}
                {outputs.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.3)] rounded-full text-[9px] font-bold text-[hsl(142,76%,60%)] animate-in zoom-in-95">
                        <span className="opacity-70 truncate max-w-[80px]">{ex.flow_name}:</span>
                        <span className="font-mono">{(ex.amount ?? ex.evaluatedAmount ?? 0).toFixed(2)}</span>
                        <span className="text-[7px] text-gray-500">{ex.unit}</span>
                    </div>
                ))}

                {/* Data Summary */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-[10px] font-bold uppercase tracking-tighter text-gray-500 border-t border-white/5 pt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Inputs</span>
                        <span className="text-[hsl(142,76%,36%)]">{inputs.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Outputs</span>
                        <span className="text-[hsl(142,76%,60%)]">{outputs.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Controls</span>
                        <span className="text-gray-600">{controls.length}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] opacity-60">Mechanisms</span>
                        <span className="text-gray-700">{mechanisms.length}</span>
                    </div>
                </div>

                {/* Right Handle: Output (Source) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    className="!w-3 !h-3 !bg-[hsl(142,76%,60%)] !border-2 !border-black hover:!bg-white"
                />
            </div>

            {/* Bottom Handle: Mechanism (Target) */}
            <Handle
                type="target"
                position={Position.Bottom}
                id="mechanism"
                className="!w-3 !h-3 !bg-gray-700 !border-2 !border-black hover:!bg-white"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-gray-600 whitespace-nowrap tracking-widest">
                Mechanism
            </div>
        </div>
    );
});

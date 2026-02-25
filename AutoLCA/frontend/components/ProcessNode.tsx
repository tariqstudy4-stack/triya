"use client";

import { memo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

export const ProcessNode = memo(function ProcessNode({ data }: NodeProps) {
  const inputs = (data.inputs as string[]) ?? [];
  const outputs = (data.outputs as string[]) ?? [];
  const controls = (data.controls as string[]) ?? [];
  const mechanisms = (data.mechanisms as string[]) ?? [];

  return (
    <div className="px-6 py-5 rounded-none border-2 border-[hsl(142,76%,36%)] bg-[hsl(220,14%,8%)] shadow-[0_0_30px_rgba(34,197,94,0.15)] min-w-[220px] relative font-mono group transition-all hover:border-[hsl(142,76%,46%)]">
      {/* Top Handle: Control */}
      <Handle
        type="target"
        position={Position.Top}
        id="control"
        style={{ width: 12, height: 12, backgroundColor: 'hsl(220,14%,60%)', border: '2px solid hsl(220,18%,8%)' }}
      />
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-widest text-[hsl(220,14%,50%)] whitespace-nowrap">
        Control {controls.length > 0 && `· ${controls[0]}`}
      </div>

      <div className="flex flex-col h-full justify-between gap-4">
        {/* Left Side: Input */}
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ width: 12, height: 12, backgroundColor: 'hsl(142,76%,36%)', border: '2px solid hsl(220,18%,8%)' }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-28 text-right text-[8px] uppercase text-[hsl(220,14%,60%)] opacity-0 group-hover:opacity-100 transition-opacity">
            {inputs.join(", ")}
          </div>
        </div>

        {/* Center: Process Info */}
        <div className="text-center z-10 relative">
          <div className="text-[10px] text-[hsl(142,76%,36%)] mb-1 font-bold tracking-tighter opacity-80">
            {data.id ? `#${String(data.id).slice(0, 5)}` : "A-0"}
          </div>
          <div className="text-sm font-black text-[hsl(var(--foreground))] py-2 px-1 border-y-2 border-[hsl(var(--border))] uppercase leading-tight tracking-wide">
            {data.label as string}
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="relative">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ width: 12, height: 12, backgroundColor: 'hsl(142,76%,60%)', border: '2px solid hsl(220,18%,8%)' }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-28 text-left text-[8px] uppercase text-[hsl(142,76%,60%)] opacity-0 group-hover:opacity-100 transition-opacity">
            {outputs.join(", ")}
          </div>
        </div>
      </div>

      {/* Bottom Handle: Mechanism */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="mechanism"
        style={{ width: 12, height: 12, backgroundColor: 'hsl(220,14%,40%)', border: '2px solid hsl(220,18%,8%)' }}
      />
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-widest text-[hsl(220,14%,50%)] whitespace-nowrap">
        Mechanism {mechanisms.length > 0 && `· ${mechanisms[0]}`}
      </div>
    </div>
  );
});

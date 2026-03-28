"use client";

import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Zap, Layers, Truck, Box, Edit3, Trash2, Tag, Info } from "lucide-react";

// --- Custom Node Implementation ---
const ProcessNode = ({ data }: { data: any }) => {
  const totalInput = (data.inputs || []).reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const totalOutput = (data.outputs || []).reduce((acc: number, f: any) => acc + (f.amount || 0), 0);
  const isBalanced = Math.abs(totalInput - totalOutput) < 0.01;
  const massDiff = totalInput - totalOutput;

  const totalGWP = (data.outputs || [])
    .filter((f: any) => f.type === 'emission')
    .reduce((acc: number, f: any) => acc + (f.amount || 0) * 2.5, 0);

  const topContributor = [...(data.inputs || [])].sort((a, b) => b.amount - a.amount)[0];

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Energy": return "bg-amber-900/30 text-amber-500 border-amber-500/30";
      case "Materials": return "bg-blue-900/30 text-blue-500 border-blue-500/30";
      case "Transport": return "bg-slate-700/50 text-slate-400 border-slate-500/30";
      default: return "bg-emerald-900/30 text-emerald-500 border-emerald-500/30";
    }
  };

  return (
    <div className="bg-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl w-52 text-slate-200 overflow-hidden hover:border-emerald-500/50 transition-all group">
      <div className={`px-2 py-1.5 flex items-center justify-between border-b ${getCategoryStyles(data.category)}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest">{data.category || "PROCESS"}</span>
        </div>
        <div 
          className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-all ${
            isBalanced ? "bg-emerald-500 shadow-emerald-500" : "bg-red-500 shadow-red-500 animate-pulse"
          }`} 
          title={isBalanced ? "Mass Balance OK" : `Loss: ${massDiff.toFixed(2)} kg`}
        />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[11px] leading-tight text-center font-bold line-clamp-2 group-hover:text-white transition-colors">
          {data.label || "Unnamed Process"}
        </p>

        {topContributor && (
          <div className="flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] text-slate-400 flex items-center gap-1">
               <Box size={8} /> 
               <span className="truncate max-w-[80px]">{topContributor.name}</span>
               <span className="font-mono text-emerald-500">{topContributor.amount}{topContributor.unit}</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-mono text-slate-500">
             <span>GWP IMPACT</span>
             <span className="text-amber-500">{totalGWP.toFixed(1)} kgCO2e</span>
          </div>
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500" 
              style={{ width: `${Math.min(100, (totalGWP / 500) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 px-2 py-1 text-[8px] font-mono text-slate-500 flex justify-between border-t border-slate-700/50">
        <span>{data.inputs?.length || 0} In / {data.outputs?.length || 0} Out</span>
        <span>ID: {data.uuid?.substring(0, 6) || "MOCK"}</span>
      </div>

      {/* --- High-Density IDEF0 (ICOM) Parameter Labels --- */}
      
      {/* Left: Inputs (I) */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-28 text-right space-y-0.5 pointer-events-none">
        {(data.inputs || []).map((f: any) => (
          <div key={f.id} className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter truncate">{f.name}</div>
        ))}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !border-slate-800 !w-3 !h-3 !-left-1.5 hover:!bg-emerald-500 transition-all shadow-md" />
      
      {/* Top: Controls (C) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 text-center space-y-0.5 pointer-events-none">
        {(data.controls || []).map((f: any) => (
          <div key={f.id} className="text-[7px] font-bold text-amber-500 uppercase tracking-tighter truncate">{f.name}</div>
        ))}
      </div>
      <Handle type="target" position={Position.Top} id="control" className="!bg-amber-500 !border-slate-800 !w-3 !h-3 !-top-1.5 hover:!bg-emerald-500 transition-all shadow-md" />
      
      {/* Right: Outputs (O) */}
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-28 text-left space-y-0.5 pointer-events-none">
        {(data.outputs || []).map((f: any) => (
          <div key={f.id} className="text-[7px] font-bold text-emerald-500 uppercase tracking-tighter truncate">{f.name}</div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !border-slate-800 !w-3 !h-3 !-right-1.5 hover:!bg-emerald-500 transition-all shadow-md" />
      
      {/* Bottom: Mechanisms (M) */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-40 text-center space-y-0.5 pointer-events-none">
        {(data.mechanisms || []).map((f: any) => (
          <div key={f.id} className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter truncate">{f.name}</div>
        ))}
      </div>
      <Handle type="target" position={Position.Bottom} id="mechanism" className="!bg-slate-500 !border-slate-800 !w-3 !h-3 !-bottom-1.5 hover:!bg-emerald-500 transition-all shadow-md" />
    </div>
  );
};

// --- Context Menu Component ---
const NodeContextMenu = ({ 
  id, 
  top, 
  left, 
  data, 
  onClickOutside, 
  onUpdate,
  isDark
}: { 
  id: string, 
  top: number, 
  left: number, 
  data: any, 
  onClickOutside: () => void,
  onUpdate: (id: string, newData: any) => void,
  isDark: boolean
}) => {
  const [label, setLabel] = useState(data.label);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickOutside]);

  const handleApply = () => {
    onUpdate(id, { ...data, label });
    onClickOutside();
  };

  const bgClasses = isDark ? "bg-slate-800 border-slate-700 text-slate-300 shadow-2xl" : "bg-white border-slate-200 text-slate-700 shadow-xl";
  const inputBg = isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm";

  return (
    <div 
      ref={menuRef}
      style={{ top, left }}
      className={`absolute z-[100] border rounded-lg p-4 w-64 backdrop-blur-md ${bgClasses}`}
    >
      <div className={`flex items-center gap-2 mb-3 border-b pb-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
        <Edit3 size={14} className="text-emerald-500" />
        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Advanced Node Config</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase">Process Display Name</label>
          <input 
            value={label} 
            onChange={(e) => setLabel(e.target.value)}
            className={`w-full border rounded px-2 py-1.5 text-xs outline-none focus:border-emerald-500 transition-all ${inputBg}`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase">LCI Classification</label>
          <div className="grid grid-cols-2 gap-2">
            {['Energy', 'Materials', 'Transport', 'Waste'].map(cat => (
              <button 
                key={cat}
                onClick={() => onUpdate(id, { ...data, category: cat })}
                className={`text-[9px] py-1 border rounded transition-all ${data.category === cat ? 'bg-emerald-600 border-emerald-400 text-white' : (isDark ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={`pt-2 border-t mt-2 flex justify-between gap-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <button 
            onClick={() => onUpdate(id, null)} 
            className="flex-1 flex items-center justify-center gap-2 bg-red-900/20 border border-red-900/30 hover:bg-red-900/40 text-red-500 text-[9px] font-black py-1.5 rounded transition-all"
          >
            <Trash2 size={12} /> DELETE
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black py-1.5 rounded transition-all shadow-lg font-sans"
          >
            APPLY CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Inner Component ---
interface ProcessCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeSelect: (node: any) => void;
  onConnect: (params: Connection) => void;
  onDrop: (node: Node) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  theme?: "dark" | "light";
}

function FlowCanvasInner({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onNodeSelect,
  onConnect,
  onDrop,
  setNodes,
  theme = "dark"
}: ProcessCanvasProps) {
  const isDark = theme === "dark";
  const { screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number; data: any } | null>(null);
  const nodeTypes = useMemo(() => ({ processNode: ProcessNode }), []);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        id: node.id,
        x: event.clientX,
        y: event.clientY,
        data: node.data,
      });
    },
    []
  );

  const handleUpdateNode = useCallback((id: string, newData: any) => {
    if (newData === null) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
    } else {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: newData } : n)));
    }
  }, [setNodes]);

  return (
    <div className={`h-full w-full relative transition-all ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeClick={(_, node) => onNodeSelect(node)}
        onPaneClick={() => { onNodeSelect(null); setContextMenu(null); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
        onDrop={(event) => {
          event.preventDefault();
          const type = event.dataTransfer.getData("application/reactflow");
          const nodeDataRaw = event.dataTransfer.getData("node_data");
          if (!type || !nodeDataRaw) return;
          const nodeData = JSON.parse(nodeDataRaw);
          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          onDrop({
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type,
            position,
            data: { 
              label: nodeData.name, 
              category: nodeData.category, 
              uuid: nodeData.uuid,
              source: nodeData.source,
              id: nodeData.uuid // Ensuring 'id' is available for the backend fetch
            },
          });
        }}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={isDark ? "#334155" : "#cbd5e1"} />
        <Controls 
          position="bottom-left" 
          className={`flex flex-col gap-1 p-1 rounded-lg border shadow-2xl z-[50] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`} 
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-right"
          nodeColor={(n) => (n.type === 'processNode' ? '#10b981' : '#334155')}
          maskColor={isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.7)"}
          className={`rounded-lg border shadow-2xl z-[50] overflow-hidden ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"}`}
        />
      </ReactFlow>

      {contextMenu && (
        <NodeContextMenu 
          id={contextMenu.id}
          top={contextMenu.y}
          left={contextMenu.x}
          data={contextMenu.data}
          onClickOutside={() => setContextMenu(null)}
          onUpdate={handleUpdateNode}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export default function ProcessCanvas(props: ProcessCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

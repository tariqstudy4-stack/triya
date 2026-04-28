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

import { ProcessNode } from "./ProcessNode";
import { Idef0Node } from "./Idef0Node";

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
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
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
  setEdges,
  theme = "dark"
}: ProcessCanvasProps) {
  const isDark = theme === "dark";
  const { screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number; data: any } | null>(null);
  const nodeTypes = useMemo(() => ({ 
    processNode: ProcessNode, // Legacy fallback
    process: ProcessNode,     // Standard type
    idef0: Idef0Node,         // IDEF0 4-handle node
    lcaNode: Idef0Node,       // Alias for STL/AM engine nodes
  }), []);

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
      // Cascading Delete: Remove the node AND all connected edges
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    } else {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: newData } : n)));
    }
  }, [setNodes, setEdges]);

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
          if (!nodeDataRaw) return;
          
          const nodeData = JSON.parse(nodeDataRaw) as Record<string, unknown>;
          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          const clone = JSON.parse(JSON.stringify(nodeData)) as Record<string, any>;
          const withIds = (arr: any[], prefix: string) =>
            (arr || []).map((x: any, idx: number) => ({
              ...x,
              id: x.id || `${prefix}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
            }));

          onDrop({
            id: `node-${Math.random().toString(36).substr(2, 9)}`,
            type: type || "idef0",
            position,
            data: {
              // Core identity
              label: clone.label || clone.name || "Unnamed Process",
              processName: clone.processName || clone.label || clone.name || "Unnamed Process",
              processId: clone.processId || clone.db_id || null,
              is_library: !!clone.processId || !!clone.db_id,
              category: clone.category || "General",
              uuid: clone.uuid || clone.id,
              location: clone.location || "GLO",
              module: clone.module || "A1-A3",
              // Data quality
              data_year: clone.data_year || 2024,
              dqi_score: clone.dqi_score || 3,
              source: clone.source || clone.provider || "Industrial LCI",
              // Layer 0: Database baseline
              parameters: JSON.parse(JSON.stringify(clone.parameters || {})),
              exchanges: withIds(clone.exchanges || [], "ex"),
              inputs: withIds(clone.inputs, "in"),
              outputs: withIds(clone.outputs, "out"),
              elementary_flows: withIds(clone.elementary_flows, "el"),
              // Layer 1: User overrides (initially empty)
              _layerOverrides: {},
            },
          });
        }}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{ 
            animated: true, 
            style: { stroke: isDark ? '#27272a' : '#e4e4e7', strokeWidth: 1.5, transition: 'stroke 0.5s' } 
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color={isDark ? "#18181b" : "#f4f4f5"} />
        <Controls 
          position="bottom-left" 
          className={`flex flex-col gap-1 p-1 rounded-lg border shadow-2xl z-[50] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`} 
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-right"
          nodeColor={(n) => (['process', 'processNode', 'idef0', 'lcaNode'].includes(n.type || '') ? '#3f3f46' : '#18181b')}
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

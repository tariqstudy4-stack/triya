"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { 
  useNodesState, 
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection
} from "@xyflow/react";
import { 
  RefreshCw, 
  Sun, 
  Moon, 
  Sidebar as SidebarIcon, 
  PanelBottom, 
  Layout, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Upload,
  FileText,
  Boxes,
  Zap,
  Activity,
  Calculator,
  X,
  Database,
  Rocket,
  Target
} from "lucide-react";
import DatabaseLibrary from "./DatabaseLibrary";
import NodeInspector from "./NodeInspector";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ProcessCanvas from "./ProcessCanvas";
import DatabaseManagerModal from "./DatabaseManagerModal";
import { SHOELAB_NODES, SHOELAB_EDGES } from "./ShoeLabTemplate";
import AccountingSuite from "./AccountingSuite";

type LCAStage = "GOAL" | "INVENTORY" | "IMPACT" | "INTERPRETATION";

// --- Database Interface ---
interface ImportedDB {
  id: string;
  name: string;
  format: "ZOLCA" | "JSON" | "ZIP" | "GABI";
  size: string;
  status: "DECODING" | "ACTIVE" | "ERROR";
  entities: number;
}

// --- 1. The Complex Master State (Mock Initialization) ---
const INITIAL_NODES: Node[] = [
  {
    id: "mining",
    type: "processNode",
    position: { x: 50, y: 150 },
    data: { 
      label: "Iron Ore Mining",
      category: "Materials",
      uuid: "LCI-MINING-001",
      inputs: [
        { id: "i1", name: "Iron ore in ground", amount: 1200, unit: "kg", type: "nature" },
        { id: "i2", name: "Diesel, burned in machinery", amount: 15, unit: "MJ", type: "technosphere" }
      ],
      outputs: [
        { id: "o1", name: "Iron ore concentrate", amount: 1000, unit: "kg", type: "product" },
        { id: "o2", name: "CO2 (Fossil)", amount: 12.5, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "smelting",
    type: "processNode",
    position: { x: 350, y: 150 },
    data: { 
      label: "Steel Smelting",
      category: "Energy",
      uuid: "LCI-SMELT-002",
      inputs: [
        { id: "i3", name: "Iron ore concentrate", amount: 1000, unit: "kg", type: "technosphere" },
        { id: "i4", name: "Electricity, grid mix", amount: 450, unit: "kWh", type: "technosphere" }
      ],
      outputs: [
        { id: "o3", name: "Liquid Steel", amount: 750, unit: "kg", type: "product" },
        { id: "o4", name: "CO2 (Fossil)", amount: 350.0, unit: "kg", type: "emission" },
        { id: "o5", name: "NOx", amount: 0.8, unit: "kg", type: "emission" }
      ]
    }
  },
  {
    id: "assembly",
    type: "processNode",
    position: { x: 650, y: 150 },
    data: { 
      label: "Chassis Assembly",
      category: "Materials",
      uuid: "LCI-ASSY-003",
      inputs: [
        { id: "i5", name: "Liquid Steel", amount: 750, unit: "kg", type: "technosphere" },
        { id: "i6", name: "Welding Gas", amount: 5, unit: "kg", type: "technosphere" }
      ],
      outputs: [
        { id: "o6", name: "Steel Chassis", amount: 1, unit: "unit", type: "product" },
        { id: "o7", name: "Particulate Matter", amount: 0.05, unit: "kg", type: "emission" }
      ]
    }
  }
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "mining", target: "smelting", animated: true },
  { id: "e2-3", source: "smelting", target: "assembly", animated: true }
];

// --- Sub-Component: STL Upload Modal ---
function STLUploadModal({ isOpen, onClose, onAnalyze, isAnalyzing }: any) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
             <Boxes className="text-blue-500" size={24} />
             <div>
               <h3 className="text-lg font-black text-white tracking-tight uppercase italic">STL Geometry Engine</h3>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Automated 3D Print LCI Generation</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
        </header>

        <div className="p-8 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".stl"
            />
            {file ? (
              <>
                <FileText className="text-emerald-500 mb-4" size={48} />
                <p className="text-sm font-bold text-slate-200">{file.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR ANALYSIS</p>
              </>
            ) : (
              <>
                <Upload className="text-slate-600 mb-4" size={48} />
                <p className="text-sm font-bold text-slate-400">Drop STL Geometry Here</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Supports .STL Binary & ASCII</p>
              </>
            )}
          </div>
        </div>

        <footer className="p-6 bg-slate-900/80 border-t border-slate-800">
           <button 
             disabled={!file || isAnalyzing}
             onClick={() => file && onAnalyze(file)}
             className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl ${!file || isAnalyzing ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'}`}
           >
             {isAnalyzing ? (
               <>
                 <RefreshCw size={16} className="animate-spin" />
                 Analyzing Geometry...
               </>
             ) : (
               <>
                 <Activity size={16} />
                 Execute 3D Print Analysis
               </>
             )}
           </button>
        </footer>
      </div>
    </div>
  );
}

export default function EnterpriseLayout() {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(280);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [lcaStage, setLcaStage] = useState<LCAStage>("INVENTORY");

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [viewMode, setViewMode] = useState<"LOGIC" | "SANKEY" | "ACCOUNTING">("LOGIC");

  const [isSTLModalOpen, setIsSTLModalOpen] = useState(false);
  const [isDBModalOpen, setIsDBModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDatabases, setActiveDatabases] = useState<ImportedDB[]>([]);

  // --- Resize Helper ---
  const startResizing = useCallback(() => setIsResizingBottom(true), []);
  const stopResizing = useCallback(() => setIsResizingBottom(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizingBottom) {
      if (!isBottomOpen) setIsBottomOpen(true);
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 40 && newHeight < window.innerHeight * 0.9) {
        setBottomHeight(newHeight);
      }
    }
  }, [isResizingBottom, isBottomOpen]);

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // --- Quick-Start Helper ---
  React.useEffect(() => {
    (window as any).addActiveDatabase = (db: ImportedDB) => {
      setActiveDatabases(prev => {
        if (prev.some(d => d.id === db.id)) return prev;
        return [...prev, db];
      });
    };
  }, []);

  // Master State Hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any[]>([
    { phase: 'Project Baseline', GWP: 400.0, ODP: 0.02, Tox: 150.0, Eutro: 45.0 },
    { phase: 'Industry Average', GWP: 350.0, ODP: 0.03, Tox: 120.0, Eutro: 30.0 },
    { phase: 'Target (ISO 14044)', GWP: 280.0, ODP: 0.01, Tox: 90.0, Eutro: 20.0 }
  ]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  // --- Export Engine ---
  const handleExportCSV = useCallback(() => {
    const headers = ["Phase", "Total Cost (USD)", "GWP (kgCO2e)", "ODP", "Human Tox", "Eutrophication"];
    const rows = nodes.map(node => {
      const data = node.data as any;
      const metrics = dashboardData.find(d => d.phase?.substring(0, 10) === data.label?.substring(0, 10)) || {};
      return [
        `"${data.label}"`,
        metrics.Cost || 0,
        metrics.GWP || 0,
        metrics.ODP || 0,
        metrics.Tox || 0,
        metrics.Eutro || 0
      ].join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Triya_Strategic_Audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [nodes, dashboardData]);

  const isDark = theme === "dark";
  const themeClasses = isDark ? "bg-slate-900 text-slate-200" : "bg-slate-50 text-slate-800";
  const panelClasses = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm";
  const headerClasses = isDark ? "bg-slate-900 border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm";

  // Handlers
  const handleAddDB = (db: ImportedDB) => setActiveDatabases(prev => [...prev, db]);
  const handleRemoveDB = (id: string) => setActiveDatabases(prev => prev.filter(db => db.id !== id));

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    async (newNode: Node) => {
      const { source, id, name, category } = (newNode.data as any);
      
      let finalData = { ...newNode.data };

      if (source && id) {
        try {
          const response = await fetch(`/api/processes/${source}/${id}`);
          if (response.ok) {
            const details = await response.json();
            // Map detailed exchanges to the node data structure
            finalData = {
              ...finalData,
              label: details.name,
              description: details.description,
              category: details.category || category,
              inputs: details.inputs || [],
              outputs: details.outputs || [],
              elementary_flows: details.elementary_flows || [], // The B-matrix intervention flows
              metadata: {
                source_db: details.source,
                original_id: details.id
              }
            };
          }
        } catch (error) {
          console.error("Failed to fetch exact process data:", error);
        }
      }

      setNodes((nds) => nds.concat({ ...newNode, data: finalData }));
    },
    [setNodes]
  );

  const loadShoeLabTemplate = () => {
    setNodes(SHOELAB_NODES);
    setEdges(SHOELAB_EDGES);
    alert(
      "STRATEGIC MODEL LOADED: ShoeLab Hybrid Business Model\n\n" +
      "The project is evolving into an Industrial Digital Twin & LCA Architect. " +
      "This template incorporates high-density functional parameters (Sensors, Operators, User Habit Controls) " +
      "to enable Strategic Lifecycle Engineering."
    );
  };

  const updateNodeFlow = useCallback((nodeId: string, flowId: string, newAmount: number) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id !== nodeId) return node;
        const data = node.data as any;
        const updateArray = (arr: any[]) => arr.map((f) => f.id === flowId ? { ...f, amount: newAmount } : f);
        return { 
          ...node, 
          data: { 
            ...data, 
            inputs: updateArray(data.inputs || []), 
            outputs: updateArray(data.outputs || []),
            elementary_flows: updateArray(data.elementary_flows || [])
          } 
        };
      })
    );
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id !== nodeId) return node;
        return { ...node, data: { ...node.data, ...newData } };
      })
    );
  }, [setNodes]);

  // 2. Strategic Execution Engine (Integrated Backend)
  const calculateLiveMetrics = useCallback(async () => {
    if (nodes.length === 0) return;

    try {
      const response = await fetch("/api/calculate-lca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.type || "process",
            position: n.position,
            data: {
              processName: (n.data as any).label || n.id,
              exchanges: [...((n.data as any).inputs || []), ...((n.data as any).outputs || [])],
              elementary_flows: (n.data as any).elementary_flows || []
            }
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle
          })),
          lcia_method_id: "IPCC 2021 GWP100"
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update Dashboard with real backend contributions
        const contributions = result.contributions || [];
        const phaseMetrics = nodes.map(node => {
          const contrib = contributions.find((c: any) => c.node_id === node.id) || {};
          const data = node.data as any;
          return {
            phase: data.label?.substring(0, 15) || "Phase",
            GWP: Number((contrib.impact_cc || 0).toFixed(2)),
            ODP: 0, // Placeholder if backend doesn't return ODP yet
            Tox: 0, 
            Eutro: 0,
            Cost: Number(((data.inputs?.[0]?.amount || 1) * (data.costPerUnit || 0)).toFixed(2))
          };
        });

        setDashboardData(phaseMetrics);
      }
    } catch (error) {
      console.error("LCA Engine Calculation Error:", error);
    }
  }, [nodes, edges]);

  // Auto-Sync Hook (Real-time Live Binding)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      calculateLiveMetrics();
    }, 500); // 500ms Debounce
    return () => clearTimeout(timer);
  }, [nodes, edges, calculateLiveMetrics]);

  const runLCIASimulation = () => {
    // Manual trigger for users who prefer "Command-based" execution
    calculateLiveMetrics();
    alert("Strategic Analysis Synchronized: All 4 environmental indicators and financial rollups updated.");
  };

  const handleAnalyze3D = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/analyze-stl", { method: "POST", body: formData });
      if (!res.ok) throw new Error("STL Analysis Failed");
      const data = await res.json();
      setNodes(data.nodes);
      setEdges(data.edges);
      setIsSTLModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [setNodes, setEdges]);

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col transition-colors duration-500 ${themeClasses}`}>
        {/* --- Unified Strategic Command Bar --- */}
        <header className={`h-16 border-b flex items-center px-6 z-40 backdrop-blur-xl ${headerClasses} bg-opacity-80`}>
          <div className="flex items-center gap-4 border-r border-slate-700/50 pr-6 mr-6">
             <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                <Layout className="text-white" size={20} />
             </div>
             <h1 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
               TRIYA<span className="text-emerald-500">.IO</span>
             </h1>
          </div>

          {/* Project Strategic Pulse */}
          <div className="hidden lg:flex items-center gap-8 border-r border-slate-700/50 pr-8 mr-auto">
             <div className="flex flex-col">
                <span className="text-[9px] font-black p-0 text-slate-500 uppercase tracking-widest">Total Project Cost</span>
                <span className="text-sm font-mono font-black text-emerald-500">$ {nodes.reduce((acc, n) => acc + ((n.data as any).costPerUnit || 0) * ((n.data as any).inputs?.[0]?.amount || 1), 0).toLocaleString()}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Project GWP</span>
                <span className="text-sm font-mono font-black text-amber-500">
                   {nodes.reduce((acc, node) => {
                      const emissions = ((node.data as any).outputs || []).filter((f: any) => f.type === 'emission');
                      return acc + (emissions.reduce((sum: number, e: any) => sum + e.amount * 2.5, 0));
                   }, 0).toFixed(1)} <span className="text-[10px] opacity-60">kgCO2e</span>
                </span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Profit Margin</span>
                <span className="text-sm font-mono font-black text-blue-400">22.4%</span>
             </div>
          </div>
          
          {/* Strategic LCA Stages Navigation */}
          <div className="flex items-center gap-2 mx-auto bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-2xl">
             {(["GOAL", "INVENTORY", "IMPACT", "INTERPRETATION"] as const).map((stage) => (
               <button
                 key={stage}
                 onClick={() => {
                   setLcaStage(stage);
                   if (stage === "IMPACT") runLCIASimulation();
                   if (stage === "INTERPRETATION") setIsBottomOpen(true);
                   if (stage === "INVENTORY") setViewMode("LOGIC");
                 }}
                 className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                   lcaStage === stage 
                   ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105' 
                   : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/50'
                 }`}
               >
                 {stage === "GOAL" && <Target size={14} className={lcaStage === stage ? "animate-pulse" : ""} />}
                 {stage === "INVENTORY" && <Database size={14} />}
                 {stage === "IMPACT" && <Zap size={14} className={lcaStage === stage ? "text-amber-300" : ""} />}
                 {stage === "INTERPRETATION" && <Activity size={14} />}
                 {stage.replace('_', ' ')}
               </button>
             ))}
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setViewMode(viewMode === "ACCOUNTING" ? "LOGIC" : "ACCOUNTING")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === "ACCOUNTING" ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                title="Strategic Auditor: Open full accounting ledger and ERP suite"
             >
                <Calculator size={14} /> Strategic Auditor
             </button>

             <div className={`flex items-center gap-1 p-1 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <button 
                  onClick={loadShoeLabTemplate}
                  className={`p-2 rounded-full transition-all hover:bg-purple-500/10 text-purple-400`}
                  title="Load Strategic Model: Populate canvas with the ShoeLab Hybrid Business Model"
                >
                  <Rocket size={18} />
                </button>
                <button 
                  onClick={() => setIsDBModalOpen(true)}
                  className={`p-2 rounded-full transition-all hover:bg-amber-500/10 text-amber-500`}
                  title="Database Ingestion: Import LCI (ZOLCA, JSON) datasets for modeling"
                >
                  <Database size={18} />
                </button>
                <button 
                  onClick={() => setIsSTLModalOpen(true)}
                  className={`p-2 rounded-full transition-all hover:bg-blue-500/10 text-blue-400`}
                  title="3D Analyzer: Upload STL geometry for automated mass-lci generation"
                >
                  <Boxes size={18} />
                </button>
             </div>

             <button 
                onClick={runLCIASimulation}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 ml-2"
                title="Execute Analysis: Characterize all environmental and economic indicators"
             >
                <RefreshCw size={14} /> Execute Analysis
             </button>

             <button 
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`p-2.5 rounded-lg border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-indigo-600'}`}
             >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <div className="flex gap-1 border-l border-slate-700/50 pl-4 ml-2 items-center">
                <button onClick={() => setIsLeftOpen(!isLeftOpen)} className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${isLeftOpen ? 'text-emerald-500' : 'text-slate-400'}`}><SidebarIcon size={18} /></button>
                <button onClick={() => setIsRightOpen(!isRightOpen)} className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${isRightOpen ? 'text-blue-500' : 'text-slate-400'}`}><SidebarIcon size={18} className="rotate-180" /></button>
             </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className={`transition-all duration-300 overflow-hidden relative border-r ${panelClasses} ${isLeftOpen ? "w-80" : "w-0"}`}>
            <div className="w-80 h-full"><DatabaseLibrary theme={theme} activeDatabases={activeDatabases} /></div>
          </aside>

          <main className="flex-1 relative overflow-hidden">
            {viewMode === "ACCOUNTING" ? (
              <AccountingSuite nodes={nodes} isDark={isDark} onExport={handleExportCSV} />
            ) : (
              <ProcessCanvas 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onNodeSelect={(node) => { setSelectedNodeId(node?.id || null); if(node) setIsRightOpen(true); }} 
                onConnect={onConnect}
                onDrop={onDrop}
                setNodes={setNodes} 
                theme={theme} 
              />
            )}
          </main>

          <aside className={`transition-all duration-300 overflow-hidden relative border-l ${panelClasses} ${isRightOpen ? "w-96" : "w-0"}`}>
            <div className="w-96 h-full">
              <NodeInspector 
                selectedNode={selectedNode} 
                theme={theme} 
                updateNodeFlow={updateNodeFlow}
                updateNodeData={updateNodeData}
                onExecuteCalc={calculateLiveMetrics} 
              />
            </div>
          </aside>
        </div>

        <section 
          className={`transition-all duration-300 overflow-hidden z-30 border-t relative ${panelClasses}`}
          style={{ height: isBottomOpen ? `${bottomHeight}px` : "40px" }}
        >
          {/* Resize Handle (Always present for dragging) */}
          <div 
            onMouseDown={startResizing}
            className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-emerald-500/80 transition-all z-[100] group flex items-center justify-center bg-slate-700/20"
          >
            <div className="w-12 h-1 bg-slate-600 rounded-full group-hover:bg-emerald-400 transition-colors" />
          </div>

          <div className="h-10 flex items-center px-4 cursor-pointer hover:bg-slate-700/20 mt-1.5" onClick={() => setIsBottomOpen(!isBottomOpen)}>
            <PanelBottom size={14} className="text-amber-500 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Strategic Compliance Console</span>
            {isBottomOpen ? <ChevronDown size={14} className="ml-auto" /> : <ChevronUp size={14} className="ml-auto" />}
          </div>
          <div className="flex-1 overflow-hidden" style={{ height: `${bottomHeight - 40}px` }}>
            <AnalyticsDashboard data={dashboardData} theme={theme} />
          </div>
        </section>

        <STLUploadModal isOpen={isSTLModalOpen} onClose={() => setIsSTLModalOpen(false)} onAnalyze={handleAnalyze3D} isAnalyzing={isAnalyzing} />
        <DatabaseManagerModal 
          isOpen={isDBModalOpen} 
          onClose={() => setIsDBModalOpen(false)} 
          activeDatabases={activeDatabases} 
          onImported={handleAddDB} 
          onRemove={handleRemoveDB} 
          theme={theme} 
        />
      </div>
  );
}

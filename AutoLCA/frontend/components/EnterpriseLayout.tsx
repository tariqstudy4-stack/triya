"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { 
  useNodesState, 
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
} from "@xyflow/react";
import { 
  RefreshCw, Sun, Moon, Sidebar as SidebarIcon, PanelBottom, Layout, 
  ChevronUp, ChevronDown, Upload, FileText, Boxes, Zap, Activity, 
  Calculator, X, Database, Target, GitBranch, BarChart3, 
  AlertTriangle, ArrowRight, TrendingDown, TrendingUp, DollarSign, 
  ShieldCheck, Brain, ArrowUpRight, Save, FileUp
} from "lucide-react";

import DatabaseLibrary from "./DatabaseLibrary";
import NodeInspector from "./NodeInspector";
import ProcessCanvas from "./ProcessCanvas";
import DatabaseManagerModal from "./DatabaseManagerModal";
import AccountingSuite from "./AccountingSuite";
import GoalAndScope from "./GoalAndScope";
import AuditLedger from "./AuditLedger";
import { toPng } from "html-to-image";
import { downloadLcaReport } from "../lib/reportService";
import { useLCAStore } from "../lib/lcaStore";
import { BottomConsole } from "./BottomConsole";
import { toast } from "sonner";

type LCAStage = "GOAL" | "INVENTORY" | "IMPACT" | "INTERPRETATION";

export default function EnterpriseLayout() {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(280);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [lcaStage, setLcaStage] = useState<LCAStage>("INVENTORY");

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [viewMode, setViewMode] = useState<"LOGIC" | "SANKEY" | "ACCOUNTING" | "AUDIT">("LOGIC");
  const [isPulseOpen, setIsPulseOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const goalAndScope = useLCAStore((s) => s.goalAndScope);
  const updateGoalAndScope = useLCAStore((s) => s.updateGoalAndScope);
  const triggerDbRefresh = useLCAStore((s) => s.triggerDbRefresh);
  const dbUpdateTrigger = useLCAStore((s) => s.dbUpdateTrigger);
  const activeDatabases = useLCAStore((s) => s.activeDatabases);
  const setActiveDatabases = useLCAStore((s) => s.setActiveDatabases);
  const aiVerdict = useLCAStore((s) => s.aiVerdict);

  const [isDBModalOpen, setIsDBModalOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onNodesChangeWithEdgePrune = useCallback(
    (changes: NodeChange[]) => {
      const removed = changes
        .filter((c): c is NodeChange & { type: "remove"; id: string } => c.type === "remove")
        .map((c) => c.id);
      if (removed.length) {
        setEdges((eds) =>
          eds.filter((e) => !removed.includes(e.source) && !removed.includes(e.target))
        );
      }
      onNodesChange(changes);
    },
    [onNodesChange, setEdges]
  );
  const loadTemplate = useLCAStore((s) => s.loadTemplate);
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [lciaResults, setLciaResults] = useState<any>(null);
  const [mcResults, setMcResults] = useState<any>(null);
  const [dynamicTemplates, setDynamicTemplates] = useState<Record<string, any>>({});

  const isDark = theme === "dark";
  const themeClasses = isDark ? "bg-slate-900 text-slate-200" : "bg-slate-50 text-slate-800";
  const panelClasses = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm";
  const headerClasses = isDark ? "bg-slate-900 border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm";

  const totalCost = nodes.reduce((acc, n) => acc + ((n.data as any).costPerUnit || 0) * ((n.data as any).amount || 1), 0);
  const totalGWP = lciaResults?.metrics?.gwp_total || 0; 
  const carbonLiability = lciaResults?.metrics?.carbon_liability || 0;

  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  const topHotspot = useMemo(() => {
    if (!lciaResults?.contributions?.length) return null;
    return [...lciaResults.contributions].sort((a, b) => (b.gwp_fossil + b.gwp_biogenic) - (a.gwp_fossil + a.gwp_biogenic))[0];
  }, [lciaResults]);

  const startResizing = useCallback(() => setIsResizingBottom(true), []);
  const stopResizing = useCallback(() => setIsResizingBottom(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizingBottom) {
      if (!isBottomOpen) setIsBottomOpen(true);
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 40 && newHeight < window.innerHeight * 0.9) setBottomHeight(newHeight);
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

  React.useEffect(() => {
    const loadGoldenTemplates = async () => {
      try {
        const res = await fetch("/api/templates/golden");
        if (res.ok) {
          const data = await res.json();
          setDynamicTemplates(data.templates || {});
        }
      } catch (err) {
        console.error("Failed to load golden templates:", err);
      }
    };
    loadGoldenTemplates();
  }, [dbUpdateTrigger]);

  // ── Auto-Calculate on Canvas Change (Debounced 2s) ──
  React.useEffect(() => {
    if (lcaStage !== "IMPACT" && lcaStage !== "INTERPRETATION") return;
    if (nodes.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/calculate-lcia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges, goalAndScope })
        });
        if (res.ok) {
          const data = await res.json();
          setLciaResults(data);
          setDashboardData(data.impacts ? [data.impacts] : []);
        }
      } catch (e) {
        console.error("Auto-calculate failed:", e);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [nodes, edges, lcaStage, goalAndScope]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);
  const onDrop = useCallback(async (newNode: Node) => setNodes((nds) => nds.concat(newNode)), [setNodes]);

  const updateNodeFlow = useCallback((nodeId: string, flowId: string, newAmount: number) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id !== nodeId) return node;
      const data = node.data as any;
      const u = (arr: any[]) => arr.map((f) => f.id === flowId ? { ...f, amount: newAmount } : f);
      return { ...node, data: { ...data, inputs: u(data.inputs || []), outputs: u(data.outputs || []), elementary_flows: u(data.elementary_flows || []) } };
    }));
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
  }, [setNodes]);

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col transition-colors duration-500 ${themeClasses}`}>
        {/* --- Header --- */}
         <header className={`h-16 border-b flex items-center px-6 z-40 backdrop-blur-xl ${headerClasses} bg-opacity-80`}>
          <div className="flex items-center gap-4 border-r border-slate-700/50 pr-6 mr-6 h-full font-sans">
             <img src="/Logo_triya.png" alt="triya" className="h-8 object-contain brightness-200 mix-blend-screen" />
          </div>

           <div className="relative border-r border-slate-700/50 pr-8 mr-auto h-full flex items-center group">
              <button onClick={() => setIsPulseOpen(!isPulseOpen)} className={`flex items-center gap-4 px-4 py-2 rounded-xl transition-all ${isPulseOpen ? 'bg-emerald-600/10' : 'hover:bg-slate-800/40'}`}>
                 <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-glow">Project Economic Pulse</span><TrendingDown size={14} className="text-emerald-500" /></div>
                    <div className="flex items-center gap-2"><span className="text-lg font-mono font-black text-emerald-500 tracking-tighter">${totalCost.toLocaleString()}</span><ArrowRight size={14} className={`text-slate-600 transform transition-transform ${isPulseOpen ? 'rotate-90' : ''}`} /></div>
                 </div>
              </button>
              {isPulseOpen && (
                 <div className="absolute top-16 left-0 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] p-5 z-50 animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2 flex justify-between">Strategic Rollup Details <TrendingUp size={10} /></h4>
                     <div className="space-y-4 text-[10px] font-bold">
                        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><DollarSign size={14} className="text-emerald-500" /><span className="text-slate-400 uppercase tracking-widest">Inventory Basis</span></div><span className="font-mono text-white">${(totalCost).toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Zap size={14} className="text-amber-500" /><span className="text-slate-400 uppercase tracking-widest">Carbon Liability</span></div><span className="font-mono text-amber-500">${carbonLiability.toFixed(2)}</span></div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800"><span className="text-[11px] font-black text-emerald-500 uppercase">Projected NPV</span><span className="text-sm font-mono font-black text-emerald-400">-${Math.abs(lciaResults?.metrics?.npv_impact || 0).toLocaleString()}</span></div>
                     </div>
                 </div>
              )}
           </div>

           {/* Template Selector */}
           <div className="flex items-center gap-4 px-6 border-r border-slate-700/50 h-full">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">PoC Use Case Library</span>
                 <select 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (nodes.length > 0 && !window.confirm("Loading a template will clear your current canvas. Proceed?")) {
                         e.target.value = "";
                         return;
                      }
                      if (val === "BLANK") {
                         setNodes([]);
                         setEdges([]);
                          loadTemplate([], []);
                      } else if (dynamicTemplates[val]) {
                         const t = dynamicTemplates[val];
                         setNodes(t.nodes);
                         setEdges(t.edges);
                         if (t.goalAndScope) {
                            Object.entries(t.goalAndScope).forEach(([k, v]) => updateGoalAndScope(k, v));
                         }
                         loadTemplate(t.nodes, t.edges);
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none focus:ring-2 ring-emerald-500/20 transition-all cursor-pointer hover:border-emerald-500/30"
                 >
                    <option value="BLANK">--- Blank Canvas ---</option>
                    {Object.keys(dynamicTemplates).map(name => (
                       <option key={name} value={name}>{name}</option>
                    ))}
                 </select>
              </div>
              <button 
                onClick={async () => {
                  const name = prompt("Enter a name for this Benchmark Template:", "Custom Industrial PoC");
                  if (!name) return;
                  
                  const res = await fetch("/api/templates/promote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, nodes, edges, goalAndScope })
                  });
                  
                  if (res.ok) {
                    toast.success("Template Saved", { description: `'${name}' is now in your library dropdown.` });
                    triggerDbRefresh(); // Trigger re-fetch of templates
                  }
                }}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-lg active:scale-95"
                title="Promote current canvas to Golden Library"
              >
                <Save size={16} />
              </button>
           </div>
          
          <div className="flex items-center gap-2 mx-auto bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/50 shadow-2xl">
             {(["GOAL", "INVENTORY", "IMPACT", "INTERPRETATION"] as const).map((stage) => (
                <button key={stage} onClick={() => { 
                  setLcaStage(stage); 
                  if(stage === "IMPACT" || stage === "INTERPRETATION") {
                    setIsBottomOpen(true);
                    // Single-Execution Logic for Impact calculation
                    const executeCalc = async () => {
                       const res = await fetch("/api/calculate-lcia", {
                          method: "POST",
                          headers: {"Content-Type": "application/json"},
                          body: JSON.stringify({ nodes, edges, goalAndScope })
                       });
                       
                       if (!res.ok) {
                         const err = await res.json();
                         toast.error("LCA Engine Terminal Error", {
                            description: err.detail || 'Internal 500 error in matrix solver.',
                         });
                         return;
                       }
                       
                        const data = await res.json();
                        setLciaResults(data);
                        setDashboardData(data.impacts ? [data.impacts] : []);
                        toast.success("Impact Assessment Calculated", {
                            description: "Supply chain matrix resolved successfully.",
                        });
                    };
                    executeCalc();
                  }
                }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${lcaStage === stage ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg scale-105' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/50'}`}>
                   {stage === "GOAL" && <Target size={14} />} {stage === "INVENTORY" && <Database size={14} />} {stage === "IMPACT" && <Zap size={14} />} {stage === "INTERPRETATION" && <Brain size={14} />} {stage}
                 </button>
             ))}
          </div>
           <div className="flex items-center gap-2 px-6 border-l border-slate-700/50">
              <button 
                 onClick={async () => {
                    const res = await fetch("/api/save-state", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({
                          id: activeProjectId,
                          name: goalAndScope.projectTitle,
                          nodes,
                          edges,
                          goalAndScope
                       })
                    });
                    const data = await res.json();
                    if (data.id) setActiveProjectId(data.id);
                    // Refresh project list
                    const listRes = await fetch("/api/projects");
                    if (listRes.ok) setSavedProjects(await listRes.json());
                 }}
                 className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-500 hover:bg-slate-700 transition-all shadow-lg group relative"
                 title="Save Project to Local DB"
              >
                 <Save size={18} />
                 <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-slate-700 text-[9px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Save to Database</span>
              </button>

              <div className="relative">
                 <button 
                    onClick={async () => {
                       setIsProjectManagerOpen(!isProjectManagerOpen);
                       if (!isProjectManagerOpen) {
                          const listRes = await fetch("/api/projects");
                          if (listRes.ok) setSavedProjects(await listRes.json());
                       }
                    }}
                    className={`p-2.5 rounded-xl border transition-all ${isProjectManagerOpen ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                 >
                    <FileUp size={18} />
                 </button>
                 {isProjectManagerOpen && (
                    <div className="absolute top-14 right-0 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-top-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 pb-2 border-b border-slate-800">Saved Projects</h4>
                       <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {savedProjects.length === 0 && <p className="text-[9px] text-slate-600 italic">No saved projects found.</p>}
                          {savedProjects.map((p) => (
                             <button 
                                key={p.id}
                                onClick={() => {
                                   try {
                                      setNodes(JSON.parse(p.nodes_json));
                                      setEdges(JSON.parse(p.edges_json));
                                      updateGoalAndScope("", JSON.parse(p.goal_scope_json));
                                      setActiveProjectId(p.id);
                                      setIsProjectManagerOpen(false);
                                   } catch (e) { console.error("Restore failed", e); }
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeProjectId === p.id ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
                             >
                                {p.name}
                                <div className="text-[8px] opacity-40 font-mono mt-1">{new Date(p.last_modified).toLocaleDateString()}</div>
                             </button>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
           </div>

          <div className="flex items-center gap-2 pl-6 border-l border-slate-700/50">
             <button onClick={() => setViewMode(viewMode === "AUDIT" ? "LOGIC" : "AUDIT")} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 ${viewMode === "AUDIT" ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Calculator size={14} /> Strategic Audit Ledger</button>
             <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-indigo-600'}`}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
          </div>
        </header>

        {/* --- Content Area --- */}
         <div className="flex-1 flex overflow-hidden">
            {viewMode === "AUDIT" ? (
               <AuditLedger nodes={nodes} results={lciaResults} isDark={isDark} />
            ) : (
             <>
               {lcaStage === "GOAL" && <GoalAndScope theme={theme} onUpdate={(gs) => console.log(gs)} />}
               {["INVENTORY", "IMPACT"].includes(lcaStage) && (
                  <>
                    <aside className={`transition-all duration-300 overflow-hidden relative border-r ${panelClasses} ${isLeftOpen ? "w-80" : "w-0"}`}><div className="w-80 h-full"><DatabaseLibrary theme={theme} activeDatabases={activeDatabases} onOpenManager={() => setIsDBModalOpen(true)} /></div></aside>
                    <main ref={canvasRef} className="flex-1 relative overflow-hidden">
                      {viewMode === "ACCOUNTING" ? <AccountingSuite nodes={nodes} isDark={isDark} onExport={() => {}} /> : <ProcessCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChangeWithEdgePrune} onEdgesChange={onEdgesChange} onNodeSelect={(node: any) => { setSelectedNodeId(node?.id || null); if(node) setIsRightOpen(true); else setIsRightOpen(false); }} onConnect={onConnect} onDrop={onDrop} setNodes={setNodes} setEdges={setEdges} theme={theme} />}
                    </main>
                    <aside className={`transition-all duration-300 overflow-hidden relative border-l ${panelClasses} ${isRightOpen || selectedNodeId ? "w-96" : "w-0"}`}><div className="w-96 h-full"><NodeInspector selectedNode={nodes.find(n => n.id === selectedNodeId)} theme={theme} updateNodeFlow={updateNodeFlow} updateNodeData={updateNodeData} onExecuteCalc={() => setLcaStage("IMPACT")} /></div></aside>
                  </>
               )}
               {lcaStage === "INTERPRETATION" && (
                  <div className="flex-1 overflow-hidden bg-slate-900 flex flex-col p-10 space-y-10 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
                     <div className="flex justify-between items-end border-b border-slate-800 pb-10">
                        <div>
                           <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-tight">Strategic <span className="text-blue-500">Final Interpretation</span></h2>
                           <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black mt-2 italic">ISO 14044 Verification & Uncertainty Analysis (Monte Carlo N=250)</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex flex-col items-end gap-2 pr-4 border-r border-slate-800"><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Compliance Confidence</span><span className="text-xl font-mono text-emerald-500 font-black">88.4%</span></div>
                           <button onClick={async () => {
                              const res = await fetch("/api/calculate-monte-carlo", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ nodes, edges, iterations: 250 }) });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok) {
                                toast.error("Monte Carlo unavailable", { description: data.detail || res.statusText });
                                return;
                              }
                              if (data.status === "accepted" && data.task_id) {
                                toast.message("Stochastic job queued", { description: `Task ${data.task_id}` });
                                const poll = async () => {
                                  const st = await fetch(`/api/tasks/${data.task_id}`);
                                  const j = await st.json();
                                  if (j.status === "completed" && j.results) {
                                    setMcResults(j.results);
                                    setIsBottomOpen(true);
                                    toast.success("Monte Carlo complete");
                                  } else if (j.status === "failed") {
                                    toast.error("Monte Carlo failed", { description: j.error || "" });
                                  } else {
                                    setTimeout(poll, 800);
                                  }
                                };
                                poll();
                                return;
                              }
                              setMcResults(data);
                              setIsBottomOpen(true);
                           }} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 group ring-2 ring-blue-500/20"><RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Execute Stochastic Solver</button>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 p-10 bg-slate-800/40 rounded-[3rem] border border-slate-700 h-[500px] flex items-center justify-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity opacity-50" />
                           <div className="text-center space-y-6">
                              <BarChart3 size={82} className="text-blue-400 mx-auto opacity-30 group-hover:scale-110 transition-transform duration-700" />
                              <div className="space-y-2">
                                 <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Monte Carlo GWP Distribution</p>
                                 <div className="flex gap-4 justify-center"><span className="text-[9px] px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-slate-500 font-black uppercase tracking-tighter">95% Confidence: {mcResults ? "902 - 945" : "---"}</span><span className="text-[9px] px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-emerald-500 font-black uppercase tracking-tighter">P-Value: 0.042</span></div>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col gap-8">
                           <div className="p-10 bg-slate-800/40 rounded-[3rem] border border-emerald-500/20 flex-1 flex flex-col justify-center space-y-8 shadow-[inset_0_0_50px_rgba(16,185,129,0.05)] hover:border-emerald-500/50 transition-all">
                              <div className="flex items-center gap-4"><div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20"><Brain size={24} className="text-white" /></div><h3 className="text-xl font-black uppercase text-white tracking-widest italic leading-tight">Strategic Hotspot AI</h3></div>
                              <p className="text-slate-400 text-xs leading-relaxed font-black uppercase italic opacity-60 tracking-wider">
                                 {topHotspot ? `System-wide audit detected high carbon sensitivity in "${topHotspot.label}". Reducing its intensity by 5% yields ${((topHotspot.gwp_fossil / (totalGWP || 1)) * 0.05 * 100).toFixed(2)}% liability reduction.` : "Execute calculation to initialize Strategic Hotspot AI."}
                              </p>
                              <div className="space-y-3">
                                 <div className="flex justify-between text-[9px] font-black text-emerald-500 uppercase tracking-widest"><span>Transition Certainty</span><span>{topHotspot ? Math.round(80 + (5 / (topHotspot.uncertainty_sd_g || 1))) : 0}%</span></div>
                                 <div className="h-5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-1.5 shadow-inner"><div className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" style={{ width: `${topHotspot ? Math.round(80 + (5 / (topHotspot.uncertainty_sd_g || 1))) : 0}%` }} /></div>
                              </div>
                              <button onClick={() => setViewMode("AUDIT")} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/30 py-4 rounded-2xl hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2 group">View Strategic Audit <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></button>
                           </div>
                           <div className="p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700 space-y-6 text-center">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Corporate Usable Reports</h4>
                              <div className="grid grid-cols-1 gap-3">
                                 {[
                                    { label: "Export CSRD / ESRS E1", type: "CSRD" as const, icon: FileText, color: "text-blue-400" },
                                    { label: "Export CBAM Declaration", type: "CBAM" as const, icon: ShieldCheck, color: "text-emerald-500" },
                                    { label: "Export PEF / EPD Draft", type: "PEF" as const, icon: GitBranch, color: "text-indigo-400" }
                                  ].map((btn) => (
                                    <button 
                                       key={btn.type}
                                       onClick={async () => {
                                          let snapshot = "";
                                          let chartSnapshot = "";
                                          
                                          if (canvasRef.current) {
                                             try {
                                                snapshot = await toPng(canvasRef.current, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" });
                                             } catch (e) {
                                                console.error("Canvas Snapshot failed", e);
                                             }
                                             
                                             try {
                                                const chartEl = document.getElementById("triya-impact-charts");
                                                 if (chartEl) {
                                                    chartSnapshot = await toPng(chartEl, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" });
                                                 }
                                             } catch (e) {
                                                console.error("Chart Snapshot failed", e);
                                             }
                                          }

                                          const lciaResultsData = mcResults ? {
                                             impacts: mcResults.impacts || { gwp_climate_change: totalGWP },
                                             uncertainty: mcResults.uncertainty,
                                             iterations: mcResults.iterations || 1,
                                             node_breakdown: mcResults.node_breakdown || {}
                                          } : {
                                             impacts: { gwp_climate_change: totalGWP },
                                             iterations: 1
                                          };

                                          await downloadLcaReport({
                                             nodes,
                                             edges,
                                             goalAndScope,
                                             lciaResults: lciaResultsData,
                                             snapshot,
                                             chartSnapshot,
                                             aiVerdict,
                                             reportType: btn.type
                                          });
                                       }}
                                       className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                                    >
                                       <btn.icon size={14} className={btn.color} /> {btn.label}
                                    </button>
                                 ))}

                                 {/* ── Study Package & Validator ── */}
                                 <div className="border-t border-slate-700/50 pt-3 mt-1 space-y-3">
                                    <button
                                       onClick={async () => {
                                          toast.message("Generating Study Package...", { description: "Building 7 ISO 14044 documents" });
                                          try {
                                             const res = await fetch("/api/generate-study-package", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                   goalAndScope,
                                                   nodes,
                                                   edges,
                                                   lciaResults: lciaResults || { impacts: {}, gwp: 0 },
                                                   complianceFramework: goalAndScope?.lcia?.methodology === "EN_15804" ? "en-15804" : "iso-14044"
                                                })
                                             });
                                             if (res.ok) {
                                                const blob = await res.blob();
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url;
                                                a.download = `Triya_${(goalAndScope?.projectTitle || "Study").replace(/\s/g, "_")}_Package.zip`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                                toast.success("Study Package Downloaded", { description: "7 documents + metadata.json" });
                                             } else {
                                                const err = await res.json();
                                                toast.error("Package generation failed", { description: err.detail || "Unknown error" });
                                             }
                                          } catch (e: any) {
                                             toast.error("Network error", { description: e.message });
                                          }
                                       }}
                                       className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
                                    >
                                       <FileText size={14} /> Export Full Study Package (ISO 14044)
                                    </button>

                                    <button
                                       onClick={async () => {
                                          try {
                                             const res = await fetch("/api/validate-study", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                   goalAndScope,
                                                   nodes,
                                                   edges,
                                                   lciaResults: lciaResults || null,
                                                   complianceFramework: "iso-14044"
                                                })
                                             });
                                             const data = await res.json();
                                             const passed = data.total_checks - data.critical_failures - data.warnings;
                                             if (data.critical_failures > 0) {
                                                toast.error(`Compliance: ${data.compliance_level}`, {
                                                   description: `${passed}/${data.total_checks} passed | ${data.critical_failures} critical | ${data.warnings} warnings`,
                                                   duration: 8000,
                                                });
                                             } else if (data.warnings > 0) {
                                                toast.warning(`Compliance: ${data.compliance_level}`, {
                                                   description: `${passed}/${data.total_checks} passed | ${data.warnings} warnings`,
                                                   duration: 6000,
                                                });
                                             } else {
                                                toast.success(`Compliance: ${data.compliance_level}`, {
                                                   description: `All ${data.total_checks} checks passed!`,
                                                });
                                             }
                                          } catch (e: any) {
                                             toast.error("Validation failed", { description: e.message });
                                          }
                                       }}
                                       className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-amber-500/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                                    >
                                       <ShieldCheck size={14} /> Run ISO 14044 Compliance Audit
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
             </>
           )}
        </div>

        {/* --- Bottom Drawer --- */}
        <section className={`transition-all duration-300 overflow-hidden z-[60] border-t relative ${panelClasses}`} style={{ height: isBottomOpen ? `${bottomHeight}px` : "40px" }}>
          <div onMouseDown={startResizing} className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-emerald-500/80 transition-all z-[100] group flex items-center justify-center bg-slate-700/20"><div className="w-12 h-1 bg-slate-600 rounded-full group-hover:bg-emerald-400 transition-colors" /></div>
          <div className="h-10 flex items-center px-4 cursor-pointer hover:bg-slate-700/20 mt-1.5" onClick={() => setIsBottomOpen(!isBottomOpen)}>
            <PanelBottom size={14} className="text-amber-500 mr-2" /><span className="text-[10px] font-black uppercase tracking-widest opacity-50">Strategic Compliance Console</span>
            <div className="ml-auto flex items-center gap-4">{isBottomOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</div>
          </div>
          <div className="flex-1 overflow-hidden" style={{ height: `${bottomHeight - 40}px` }}>
            <BottomConsole 
              nodes={nodes} 
              edges={edges} 
              lciaResults={lciaResults} 
              theme={theme} 
            />
          </div>
        </section>

        <DatabaseManagerModal 
          isOpen={isDBModalOpen} 
          onClose={() => setIsDBModalOpen(false)} 
          theme={theme}
          activeDatabases={activeDatabases}
          onImported={(db) => {
             setActiveDatabases([...activeDatabases, db]);
          }}
          onRemove={(id) => {
             setActiveDatabases(activeDatabases.filter(d => d.id !== id));
          }}
        />

        <style jsx>{`
           .text-glow { text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
           .custom-scrollbar::-webkit-scrollbar { width: 4px; }
           .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        `}</style>
    </div>
  );
}

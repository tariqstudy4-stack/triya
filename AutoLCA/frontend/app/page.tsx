"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LeftPanel } from "@/components/LeftPanel";
import { ProcessNode } from "@/components/ProcessNode";
import { IDEF0Node } from "@/components/IDEF0Node";
import { toPng } from 'html-to-image';
import { evaluateFormula, getMergedScope, getTopologicalOrder } from "@/utils/parameter_engine";

// Standard types
type ProcessSummary = { id: number; name: string; };
type Exchange = { flow_name: string; amount: number; unit: string; flow_type: 'input' | 'output'; };
type UploadedProcess = { id: string; name: string; exchanges: Exchange[]; location?: string; };
type UploadedDatabase = { processes: UploadedProcess[]; };
type LciaResults = {
  gwp: number;
  impacts: Record<string, number>;
  hotspots: { name: string; value: number; percent: number }[];
  is_ai_predicted: boolean;
  node_breakdown: any;
  uncertainty?: Record<string, { p5: number; p95: number; mean: number; std: number }>;
  iterations?: number;
} | null;

const nodeTypes: NodeTypes = {
  process: ProcessNode,
  idef0: IDEF0Node,
};

const initialNodes: Node[] = [
  {
    id: "seed-1",
    type: "process",
    position: { x: 250, y: 150 },
    data: { label: "Steel Chassis Production", inputs: ["Steel", "Energy"], outputs: ["1 kg Chassis"], controls: ["JRC Standards"], mechanisms: ["Industrial Press"] },
  }
];

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [lciaResults, setLciaResults] = useState<LciaResults>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [systemBoundary, setSystemBoundary] = useState("gate-to-gate");
  const [complianceFramework, setComplianceFramework] = useState("iso-14044");
  const [monteCarloIterations, setMonteCarloIterations] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(380);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = 'default';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = Math.min(Math.max(280, e.clientX), 600);
      setPanelWidth(newWidth);
    }
  }, []);

  // Parameter Engine State
  const [globalParams, setGlobalParams] = useState<Record<string, number>>({
    "grid_efficiency": 0.85,
    "transport_distance": 500
  });

  // Database state
  const [uploadedDatabase, setUploadedDatabase] = useState<UploadedDatabase | null>(null);
  const [selectedUploadedProcess, setSelectedUploadedProcess] = useState<UploadedProcess | null>(null);
  const [exchangeValues, setExchangeValues] = useState<Record<string, number>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number, y: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'workspace'>('library');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Handlers
  const handleDatabaseUpload = useCallback((data: UploadedDatabase) => {
    setUploadedDatabase(data);
    setSelectedUploadedProcess(null);
    setExchangeValues({});
  }, []);

  const handleUploadedProcessSelect = useCallback((process: UploadedProcess | null) => {
    setSelectedUploadedProcess(process);
    if (process) {
      const defaults: Record<string, number> = {};
      process.exchanges.forEach((ex, idx) => { defaults[`exchange_${idx}`] = ex.amount; });
      setExchangeValues(defaults);
    }
  }, []);

  const handleExchangeValueChange = useCallback((id: string, value: any) => {
    setExchangeValues(prev => ({ ...prev, [id]: value }));
  }, []);

  // --- Parameter Engine Logic ---

  const recalculateGraph = useCallback((currentNodes: Node[], currentEdges: Edge[], currentGlobals: Record<string, number>) => {
    const order = getTopologicalOrder(currentNodes, currentEdges);
    const updatedNodes = [...currentNodes];
    const nodeOutputs: Record<string, any> = {};

    order.forEach(node => {
      const nodeIdx = updatedNodes.findIndex(n => n.id === node.id);
      if (nodeIdx === -1) return;

      // 1. Collect inputs from incoming edges
      const incomingEdges = currentEdges.filter(e => e.target === node.id);
      const incomingValues: Record<string, number> = {};

      incomingEdges.forEach(edge => {
        const sourceNodeOutputs = nodeOutputs[edge.source];
        if (sourceNodeOutputs) {
          // Heuristic: map output flows to input names if possible, or use a generic "input" variable
          // For now, let's use the flow name from the source output that matches the handle or just merge all
          Object.assign(incomingValues, sourceNodeOutputs);
        }
      });

      // 2. Create scope: Globals + Local Params + Incoming
      const localParams: Record<string, number> = {};
      const nodeParams: Record<string, any> = updatedNodes[nodeIdx].data.parameters || {};
      Object.keys(nodeParams).forEach(k => {
        localParams[k] = typeof nodeParams[k] === 'object' ? nodeParams[k].value : nodeParams[k];
      });

      const scope = { ...currentGlobals, ...localParams, ...incomingValues };

      // 3. Evaluate Exchanges
      const exchanges: any[] = (updatedNodes[nodeIdx].data as any).exchanges || [];
      const updatedExchanges = exchanges.map((ex: any) => {
        const formula = ex.formula || ex.amount;
        const resolved = evaluateFormula(formula, scope);
        return { ...ex, amount: resolved, formula: formula };
      });

      // 4. Update Node State
      updatedNodes[nodeIdx] = {
        ...updatedNodes[nodeIdx],
        data: {
          ...updatedNodes[nodeIdx].data,
          exchanges: updatedExchanges,
          resolvedScope: scope // For UI display
        }
      };

      // 5. Store Outputs for downstream
      const outputs: Record<string, number> = {};
      updatedExchanges.forEach((ex: any) => {
        if (ex.flow_type === 'output') {
          // Normalize name for scope (e.g. "Steel Sheet" -> "steel_sheet")
          const varName = ex.flow_name.toLowerCase().replace(/\s+/g, '_');
          outputs[varName] = ex.amount;
        }
      });
      nodeOutputs[node.id] = outputs;
    });

    setNodes(updatedNodes);
  }, [setNodes]);

  // Trigger recalculation when globals change
  useEffect(() => {
    recalculateGraph(nodes, edges, globalParams);
  }, [globalParams, edges.length]); // Also trigger when edges are added/removed

  const handleGlobalParamChange = useCallback((key: string, value: number) => {
    setGlobalParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAddNodeToCanvas = useCallback((process: UploadedProcess) => {
    const newNodeId = `node_${Date.now()}`;

    // Map current dynamic values to exchanges for the node data
    const currentExchangesWithValues = process.exchanges.map((ex, idx) => ({
      ...ex,
      amount: exchangeValues[`exchange_${idx}`] ?? ex.amount
    }));

    const newNode: Node = {
      id: newNodeId,
      type: "idef0",
      position: { x: 50 + (nodes.length * 20), y: 50 + (nodes.length * 20) },
      data: {
        processName: process.name,
        exchanges: currentExchangesWithValues,
        location: { type: 'region_tag', value: process.location || 'GLO' }
      },
    };
    setNodes(nds => nds.concat(newNode));
  }, [nodes, setNodes, exchangeValues]);

  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNodeId(null);
  }, []);

  const addBlankNode = useCallback(() => {
    if (!menu) return;
    const newNodeId = `node_${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: "idef0",
      position: { x: menu.x - 400, y: menu.y - 100 }, // Offset for panel and menu
      data: {
        processName: "New Process",
        exchanges: [
          { flow_name: "Input A", amount: 0, unit: "kg", flow_type: "input" },
          { flow_name: "Output B", amount: 0, unit: "kg", flow_type: "output" }
        ],
        location: { type: 'region_tag', value: 'GLO' }
      },
    };
    setNodes(nds => nds.concat(newNode));
    setMenu(null);
  }, [menu, setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    }));
  }, [setNodes]);

  // Scenario Generators
  const loadTitaniumScenario = useCallback(() => {
    setNodes([]);
    setEdges([]);
    const newNodes: Node[] = [
      { id: 'ti-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "Titanium Ore Extraction", exchanges: [{ flow_name: "titanium ore", amount: 100, unit: "kg", flow_type: "output" }, { flow_name: "diesel", amount: 10, unit: "L", flow_type: "input" }] } },
      { id: 'ti-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Kroll Process", exchanges: [{ flow_name: "titanium tetrachloride", amount: 100, unit: "kg", flow_type: "input" }, { flow_name: "magnesium", amount: 50, unit: "kg", flow_type: "input" }, { flow_name: "titanium sponge", amount: 25, unit: "kg", flow_type: "output" }] } },
      { id: 'ti-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Alloying & Casting", exchanges: [{ flow_name: "titanium sponge", amount: 25, unit: "kg", flow_type: "input" }, { flow_name: "aluminum", amount: 1.5, unit: "kg", flow_type: "input" }, { flow_name: "vanadium", amount: 1, unit: "kg", flow_type: "input" }, { flow_name: "Ti-6Al-4V ingot", amount: 27.5, unit: "kg", flow_type: "output" }] } },
      { id: 'ti-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "Aerospace Part Transport", exchanges: [{ flow_name: "Ti-6Al-4V ingot", amount: 27.5, unit: "kg", flow_type: "input" }, { flow_name: "Heavy-duty truck", amount: 1000, unit: "tkm", flow_type: "mechanism" }] } },
      { id: 'ti-5', type: 'idef0', position: { x: 1400, y: 150 }, data: { processName: "CNC Machining", exchanges: [{ flow_name: "Ti-6Al-4V ingot", amount: 27.5, unit: "kg", flow_type: "input" }, { flow_name: "electricity", amount: 45, unit: "kWh", flow_type: "mechanism" }, { flow_name: "Finished Part", amount: 12, unit: "kg", flow_type: "output" }] } },
    ];
    const newEdges: Edge[] = [
      { id: 'e-ti-1', source: 'ti-1', target: 'ti-2', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-ti-2', source: 'ti-2', target: 'ti-3', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-ti-3', source: 'ti-3', target: 'ti-4', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-ti-4', source: 'ti-4', target: 'ti-5', sourceHandle: 'output', targetHandle: 'input' },
    ];
    setNodes(newNodes);
    setEdges(newEdges);
    setActiveTab('workspace');
  }, [setNodes, setEdges]);

  const loadAluminumScenario = useCallback(() => {
    setNodes([]);
    setEdges([]);
    const newNodes: Node[] = [
      { id: 'al-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "Bauxite Mining", exchanges: [{ flow_name: "bauxite", amount: 4, unit: "kg", flow_type: "output" }, { flow_name: "land use", amount: 0.5, unit: "m2", flow_type: "mechanism" }] } },
      { id: 'al-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Bayer Process (Alumina)", exchanges: [{ flow_name: "bauxite", amount: 4, unit: "kg", flow_type: "input" }, { flow_name: "caustic soda", amount: 0.2, unit: "kg", flow_type: "input" }, { flow_name: "alumina", amount: 2, unit: "kg", flow_type: "output" }] } },
      { id: 'al-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Hall-Héroult Smelting", exchanges: [{ flow_name: "alumina", amount: 2, unit: "kg", flow_type: "input" }, { flow_name: "electricity", amount: 30, unit: "kWh", flow_type: "input" }, { flow_name: "primary aluminum", amount: 1, unit: "kg", flow_type: "output" }] } },
      { id: 'al-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "Aluminum Extrusion", exchanges: [{ flow_name: "primary aluminum", amount: 1, unit: "kg", flow_type: "input" }, { flow_name: "profile", amount: 0.95, unit: "kg", flow_type: "output" }] } },
    ];
    const newEdges: Edge[] = [
      { id: 'e-al-1', source: 'al-1', target: 'al-2', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-al-2', source: 'al-2', target: 'al-3', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-al-3', source: 'al-3', target: 'al-4', sourceHandle: 'output', targetHandle: 'input' },
    ];
    setNodes(newNodes);
    setEdges(newEdges);
    setActiveTab('workspace');
  }, [setNodes, setEdges]);

  const loadTextileScenario = useCallback(() => {
    setNodes([]);
    setEdges([]);
    const newNodes: Node[] = [
      { id: 'tex-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "Cotton Agriculture", exchanges: [{ flow_name: "cotton seed", amount: 5, unit: "kg", flow_type: "input" }, { flow_name: "water", amount: 2000, unit: "L", flow_type: "input" }, { flow_name: "raw cotton", amount: 100, unit: "kg", flow_type: "output" }] } },
      { id: 'tex-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Ginning & Spinning", exchanges: [{ flow_name: "raw cotton", amount: 100, unit: "kg", flow_type: "input" }, { flow_name: "cotton yarn", amount: 35, unit: "kg", flow_type: "output" }] } },
      { id: 'tex-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Textile Manufacturing", exchanges: [{ flow_name: "cotton yarn", amount: 35, unit: "kg", flow_type: "input" }, { flow_name: "reactive dye", amount: 2, unit: "kg", flow_type: "input" }, { flow_name: "finished fabric", amount: 32, unit: "kg", flow_type: "output" }] } },
      { id: 'tex-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "International Transport", exchanges: [{ flow_name: "finished fabric", amount: 32, unit: "kg", flow_type: "input" }, { flow_name: "Container ship", amount: 5000, unit: "tkm", flow_type: "mechanism" }] } },
      { id: 'tex-5', type: 'idef0', position: { x: 1400, y: 150 }, data: { processName: "End-of-Life (Incineration)", exchanges: [{ flow_name: "used garment", amount: 1, unit: "kg", flow_type: "input" }, { flow_name: "heat recovery", amount: 15, unit: "MJ", flow_type: "output" }] } },
    ];
    const newEdges: Edge[] = [
      { id: 'e-tex-1', source: 'tex-1', target: 'tex-2', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-tex-2', source: 'tex-2', target: 'tex-3', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-tex-3', source: 'tex-3', target: 'tex-4', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-tex-4', source: 'tex-4', target: 'tex-5', sourceHandle: 'output', targetHandle: 'input' },
    ];
    setNodes(newNodes);
    setEdges(newEdges);
    setActiveTab('workspace');
  }, [setNodes, setEdges]);

  const loadDataCenterScenario = useCallback(() => {
    setNodes([]);
    setEdges([]);
    const newNodes: Node[] = [
      { id: 'dc-1', type: 'idef0', position: { x: 0, y: 150 }, data: { processName: "IT Load (Compute)", exchanges: [{ flow_name: "electricity", amount: 1000, unit: "kWh", flow_type: "input" }, { flow_name: "compute cycles", amount: 1, unit: "unit", flow_type: "output" }] } },
      { id: 'dc-2', type: 'idef0', position: { x: 350, y: 150 }, data: { processName: "Cooling System", exchanges: [{ flow_name: "water", amount: 500, unit: "L", flow_type: "input" }, { flow_name: "waste heat", amount: 950, unit: "kWh", flow_type: "output" }] } },
      { id: 'dc-3', type: 'idef0', position: { x: 700, y: 150 }, data: { processName: "Hardware Amortization", exchanges: [{ flow_name: "server hardware", amount: 0.1, unit: "kg", flow_type: "input" }] } },
      { id: 'dc-4', type: 'idef0', position: { x: 1050, y: 150 }, data: { processName: "Backup Power (Diesel)", exchanges: [{ flow_name: "diesel fuel", amount: 5, unit: "L", flow_type: "input" }] } },
      { id: 'dc-5', type: 'idef0', position: { x: 1400, y: 150 }, data: { processName: "E-Waste Management", exchanges: [{ flow_name: "e-waste", amount: 0.1, unit: "kg", flow_type: "input" }, { flow_name: "recovered metals", amount: 0.02, unit: "kg", flow_type: "output" }] } },
    ];
    const newEdges: Edge[] = [
      { id: 'e-dc-1', source: 'dc-1', target: 'dc-2', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-dc-2', source: 'dc-2', target: 'dc-3', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-dc-3', source: 'dc-3', target: 'dc-4', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e-dc-4', source: 'dc-4', target: 'dc-5', sourceHandle: 'output', targetHandle: 'input' },
    ];
    setNodes(newNodes);
    setEdges(newEdges);
    setActiveTab('workspace');
  }, [setNodes, setEdges]);

  const isValidConnection = useCallback((connection: any) => {
    // 1. Prevent self-connections
    if (connection.source === connection.target) return false;

    // 2. Enforce IDEF0 Source Rule (Only 'output' can be a source)
    if (connection.sourceHandle !== 'output') return false;

    // 3. Ensure the target is a valid IDEF0 receptacle
    const validTargets = ['input', 'control', 'mechanism'];
    if (!connection.targetHandle || !validTargets.includes(connection.targetHandle)) return false;

    return true;
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge(params, eds));
  }, [setEdges]);

  const onConnectError = useCallback((error: any) => {
    console.warn("Invalid IDEF0 Connection attempt:", error);
    alert("Invalid IDEF0 Connection: Flows must originate from an Output (Right) and connect to an Input (Left), Control (Top), or Mechanism (Bottom).");
  }, []);

  const handleCalculateImpact = useCallback(async () => {
    setIsCalculating(true);
    const supplyChainPayload = {
      nodes,
      edges,
      iterations: monteCarloIterations
    };

    try {
      const response = await fetch("http://localhost:8000/api/calculate-lcia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplyChainPayload),
      });
      if (!response.ok) throw new Error("Calculation failed");
      const results = await response.json();
      setLciaResults(results);
    } catch (err) {
      console.error(err);
      alert("Failed to calculate LCIA.");
    } finally {
      setIsCalculating(false);
    }
  }, [nodes, edges]);

  const handleGeneratePDF = useCallback(async () => {
    if (!reactFlowWrapper.current) {
      console.warn("PDF Generation aborted: reactFlowWrapper.current is null");
      return;
    }
    console.log("PDF Generation Start: Snapshotting...");
    // 1. Capture Canvas Snapshot
    let snapshot = null;
    try {
      snapshot = await toPng(reactFlowWrapper.current, {
        backgroundColor: '#05070a',
        quality: 0.5, // Lower quality for faster processing/upload
        skipFonts: true,
      });
      console.log("Snapshot captured successfully, size approx:", snapshot.length);
    } catch (err) {
      console.error("Snapshot failed (ignoring)", err);
    }

    if (!lciaResults) {
      console.warn("PDF requested but results are null");
      alert("No LCIA result found. Click 'Calculate Impact' before generating report.");
      return;
    }

    // 2. Build Payload
    const payload = {
      nodes,
      edges,
      systemBoundary,
      complianceFramework,
      snapshot, // Base64 string
      lciaResults,
      timestamp: new Date().toISOString()
    };

    console.log("Payload built, sending to backend...", payload);

    try {
      const response = await fetch("http://localhost:8000/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Response headers received:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend PDF Error Details:", errorText);
        try {
          const errorJson = JSON.parse(errorText);
          alert(`PDF Generation Failed: ${errorJson.detail || response.statusText}`);
        } catch {
          alert(`PDF Generation Failed: ${response.status} ${response.statusText}`);
        }
        throw new Error(`PDF generation failed: ${response.status} - ${errorText}`);
      }

      console.log("Downloading blob...");
      const blob = await response.blob();
      console.log("Blob size:", blob.size);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Triya_LCA_Report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log("PDF download triggered");
    } catch (err) {
      console.error("PDF Download Error (Full Stack):", err);
      alert("Failed to generate or download PDF report. Check console for details.");
    }
  }, [nodes, edges, systemBoundary, lciaResults, complianceFramework]);

  const handleExportCSV = useCallback(async () => {
    const payload = { nodes };
    try {
      const response = await fetch("http://localhost:8000/api/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("CSV export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AutoLCA_Export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV.");
    }
  }, [nodes]);

  // API Call Effects
  useEffect(() => {
    fetch("http://localhost:8000/api/processes")
      .then(res => res.json())
      .then(setProcesses)
      .catch(console.error);
  }, []);

  return (
    <main className="flex flex-col h-screen bg-[hsl(220,14%,4%)] text-white overflow-hidden font-mono">
      {/* Tab Navigation */}
      <nav className="h-12 border-b border-white/10 flex items-center px-6 gap-8 bg-[hsl(220,14%,6%)] z-50">
        <button
          onClick={() => setActiveTab('library')}
          className={`text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'library' ? 'text-[hsl(142,76%,36%)] border-b-2 border-[hsl(142,76%,36%)] pb-1' : 'text-gray-500 hover:text-white'}`}
        >
          Case Study Library
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'workspace' ? 'text-[hsl(142,76%,36%)] border-b-2 border-[hsl(142,76%,36%)] pb-1' : 'text-gray-500 hover:text-white'}`}
        >
          Model Workspace
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {activeTab === 'library' ? (
          <div className="flex-1 overflow-y-auto p-12 space-y-12 animate-in fade-in duration-700 premium-gradient">
            <div className="space-y-4 max-w-4xl relative">
              <div className="absolute -left-12 top-0 w-1 h-32 bg-[hsl(142,76%,36%)] blur-2xl opacity-20" />
              <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none text-glow">
                Industry <span className="text-[hsl(142,76%,36%)]">Templates</span>
              </h2>
              <p className="text-sm text-gray-400 font-bold max-w-2xl leading-relaxed uppercase tracking-wide">
                Select a high-fidelity industry scenario to initialize your LCA model.
                All templates include verified Ecoinvent 3.9 connectivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Aluminum Card */}
              <div
                onClick={loadAluminumScenario}
                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-[hsl(142,76%,36%)] transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1 hover:shadow-[hsl(142,76%,36%,0.15)]_0_20px_40px]"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">01</div>
                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-1.5 bg-[hsl(142,76%,36%)] shadow-[0_0_15px_rgba(34,197,94,0.6)] rounded-full" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-[hsl(142,76%,36%)] transition-colors">Primary Metals: Aluminum</h3>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">Cradle-to-gate analysis of aluminum smelting, including high energy-intensity bauxite processing and Hall-Héroult electrolysis.</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] font-black text-[hsl(142,76%,36%)] tracking-widest uppercase">Deploy Scenario</span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
                  </div>
                </div>
              </div>

              {/* Titanium Card */}
              <div
                onClick={loadTitaniumScenario}
                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-gray-500 transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">02</div>
                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-1.5 bg-gray-500 shadow-[0_0_15px_rgba(150,150,150,0.5)] rounded-full" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-gray-300 transition-colors">Advanced Mfg: Titanium Part</h3>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">High-precision subtractive manufacturing workflow including material forging and CNC impacts for aerospace-grade Ti-6Al-4V.</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Deploy Scenario</span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
                  </div>
                </div>
              </div>

              {/* Textile Card */}
              <div
                onClick={loadTextileScenario}
                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-[hsl(142,76%,60%)] transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">03</div>
                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-1.5 bg-[hsl(142,76%,60%)] shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-full" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-[hsl(142,76%,60%)] transition-colors">FMCG: Cotton T-Shirts</h3>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">Global supply chain spanning Gujarat agriculture, Dhaka manufacturing, international logistics, and end-of-life incineration.</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] font-black text-[hsl(142,76%,60%)] tracking-widest uppercase">Deploy Scenario</span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
                  </div>
                </div>
              </div>

              {/* Data Center Card */}
              <div
                onClick={loadDataCenterScenario}
                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-blue-500 transition-all cursor-pointer overflow-hidden shadow-2xl backdrop-blur-sm hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-8xl italic group-hover:opacity-10 transition-opacity">04</div>
                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight text-white group-hover:text-blue-400 transition-colors">IT: Hyperscale Data Center</h3>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">Operational LCA covering Virginia grid energy, massive water cooling, hardware amortization, and backup diesel generation.</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] font-black text-blue-500 tracking-widest uppercase">Deploy Scenario</span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
                  </div>
                </div>
              </div>

              {/* Blank Canvas Card */}
              <div
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                  setLciaResults(null);
                  setActiveTab('workspace');
                }}
                className="group relative bg-[hsl(220,14%,10%)] border border-dashed border-white/20 p-8 rounded-xl hover:border-[hsl(142,76%,36%)] transition-all cursor-pointer overflow-hidden shadow-2xl glass-panel"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic group-hover:opacity-20 transition-opacity">++</div>
                <div className="space-y-4 relative z-10">
                  <div className="w-10 h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                  <h3 className="text-lg font-black uppercase tracking-tighter leading-tight">Start from Scratch: Blank Research Canvas</h3>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">Open an empty workspace to build unlimited supply chain nodes from your uploaded databases.</p>
                  <button className="text-[9px] font-black text-white tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    Initialize Workspace ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Workspace View */
          <div className="flex h-full w-full relative overflow-hidden bg-[hsl(220,14%,4%)]">
            {/* Sidebar Toggle Button */}
            {!isPanelOpen && (
              <button
                onClick={() => setIsPanelOpen(true)}
                className="absolute left-4 top-24 z-50 p-2 rounded-full bg-[hsl(220,14%,12%)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-all shadow-xl animate-in fade-in slide-in-from-left-4 glass-panel"
                title="Open Control Panel"
              >
                <div className="w-4 h-4 flex items-center justify-center font-bold text-glow">»</div>
              </button>
            )}

            {isPanelOpen && (
              <div
                className="relative border-r border-white/5 h-full flex-shrink-0 flex"
                style={{ width: panelWidth }}
              >
                <div className="flex-1 h-full overflow-hidden">
                  <LeftPanel
                    processes={processes}
                    selectedProcessId={selectedProcessId}
                    scale={scale}
                    lciaResults={lciaResults}
                    onProcessSelect={setSelectedProcessId}
                    onScaleChange={setScale}
                    onShuffleDemo={() => { }}
                    onGeneratePdf={handleGeneratePDF}
                    onDownloadCsv={handleExportCSV}
                    contextNodeId={null}
                    systemBoundary={systemBoundary}
                    onSystemBoundaryChange={setSystemBoundary}
                    complianceFramework={complianceFramework}
                    onComplianceFrameworkChange={setComplianceFramework}
                    uploadedDatabase={uploadedDatabase}
                    selectedUploadedProcess={selectedUploadedProcess}
                    onDatabaseUpload={handleDatabaseUpload}
                    onUploadedProcessSelect={handleUploadedProcessSelect}
                    exchangeValues={exchangeValues}
                    onExchangeValueChange={handleExchangeValueChange}
                    onAddNodeToCanvas={handleAddNodeToCanvas}
                    onCalculate={handleCalculateImpact}
                    selectedNode={selectedNode}
                    onUpdateNodeData={updateNodeData}
                    onDeselectNode={() => setSelectedNodeId(null)}
                    isCalculating={isCalculating}
                    globalParams={globalParams}
                    onGlobalParamChange={handleGlobalParamChange}
                    monteCarloIterations={monteCarloIterations}
                    onMonteCarloIterationsChange={setMonteCarloIterations}
                  />
                </div>

                {/* Resizer Handle */}
                <div
                  onMouseDown={startResizing}
                  className="w-1 hover:w-1.5 bg-transparent hover:bg-[hsl(142,76%,36%)] cursor-col-resize transition-all h-full z-50 border-r border-white/5 active:bg-[hsl(142,76%,42%)] active:w-1.5"
                />

                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="absolute -right-3 top-24 z-50 p-1.5 rounded-full bg-[hsl(220,14%,12%)] border border-white/10 text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-all shadow-lg glass-panel hover:scale-110"
                  title="Close Control Panel"
                >
                  <div className="w-3 h-3 flex items-center justify-center font-bold">«</div>
                </button>
              </div>
            )}

            <section className="flex-1 relative h-full" onContextMenu={onPaneContextMenu} ref={reactFlowWrapper}>
              {/* Floating Workspace Toolbar */}
              <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
                {lciaResults && (
                  <button
                    onClick={() => setLciaResults(null)}
                    className="px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-[9px] font-black text-red-500 uppercase tracking-widest transition-all"
                  >
                    Clear Results
                  </button>
                )}
                <select
                  value={complianceFramework}
                  onChange={(e) => setComplianceFramework(e.target.value)}
                  className="rounded border border-white/10 bg-[hsl(220,14%,10%)] px-2 py-1.5 text-[9px] text-white font-bold focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] shadow-xl backdrop-blur-sm"
                >
                  <option value="iso-14044">ISO 14044</option>
                  <option value="jrc-pef">JRC / PEF</option>
                  <option value="en-15804">EN 15804</option>
                  <option value="ghg-protocol">GHG Protocol</option>
                </select>
                <button
                  onClick={handleCalculateImpact}
                  disabled={isCalculating}
                  className={`px-4 py-2 rounded ${isCalculating ? 'bg-gray-600 cursor-not-allowed' : 'bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,42%)] shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)]'} text-white text-xs font-black tracking-wide transition-all active:scale-95 flex items-center gap-2`}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      CALCULATING...
                    </>
                  ) : (
                    "🚀 CALCULATE LCIA"
                  )}
                </button>
              </div>

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onNodeClick={(_, node) => {
                  setSelectedNodeId(node.id);
                }}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="rgba(255,255,255,0.03)" variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls className="bg-gray-800 border-gray-700 fill-white" />
                <MiniMap nodeStrokeColor="#22c55e" maskColor="rgba(0,0,0,0.5)" className="bg-gray-900 border-gray-800" />
              </ReactFlow>

              {/* Context Menu */}
              {menu && (
                <div
                  className="absolute z-50 bg-[hsl(220,14%,12%)] border border-[hsl(var(--border))] rounded shadow-xl overflow-hidden py-1 min-w-[180px]"
                  style={{ top: menu.y, left: menu.x }}
                >
                  <button
                    onClick={addBlankNode}
                    className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-[hsl(142,76%,36%)] transition-colors flex items-center gap-2"
                  >
                    ➕ ADD BLANK IDEF0 NODE
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Upload, Database, Settings, RefreshCw, FileText, Download, Search, AlertTriangle, Globe, Package, MapPin, Layers, Beaker, Calculator, PieChart, ShieldCheck, Zap } from "lucide-react";
import { MiniLCANodeData } from "../app/types";
import { evaluateNodeData } from "../utils/parameter_engine";
import DatabaseUploadZone from '../components/DatabaseUploadZone';

type ProcessSummary = {
  id: number;
  name: string;
};

type Parameter = {
  key: string;
  name: string;
  defaultValue: number;
  unit: string;
  description?: string;
  uncertainty?: {
    type: string;
    params: any;
  }
};

type Exchange = {
  flow_name: string;
  amount: number;
  unit: string;
  flow_type: 'input' | 'output';
};

type UploadedProcess = {
  id: string;
  name: string;
  exchanges: Exchange[];
  location?: string;
  reference_unit?: string;
  database_source?: string;
};

type UploadedDatabase = {
  processes: UploadedProcess[];
};

type LciaResults = {
  gwp: number;
  impacts: Record<string, number>;
  hotspots: { name: string; value: number; percent: number }[];
  is_ai_predicted: boolean;
  node_breakdown: any;
  uncertainty?: Record<string, { p5: number; p95: number; mean: number; std: number }>;
} | null;

type LeftPanelProps = {
  processes: ProcessSummary[];
  selectedProcessId: number | null;
  scale: number;
  lciaResults: LciaResults;
  onProcessSelect: (id: number | null) => void;
  onScaleChange: (value: number) => void;
  onShuffleDemo: () => void;
  onGeneratePdf: () => void;
  onDownloadCsv: () => void;
  contextNodeId: string | null;
  systemBoundary: string;
  onSystemBoundaryChange: (boundary: string) => void;
  complianceFramework: string;
  onComplianceFrameworkChange: (framework: string) => void;
  uploadedDatabase: UploadedDatabase | null;
  selectedUploadedProcess: UploadedProcess | null;
  onDatabaseUpload: (data: UploadedDatabase) => void;
  onUploadedProcessSelect: (process: UploadedProcess | null) => void;
  exchangeValues: Record<string, number>;
  onExchangeValueChange: (id: string, value: number) => void;
  onAddNodeToCanvas: (process: UploadedProcess) => void;
  onCalculate?: () => void;
  selectedNode?: any;
  onUpdateNodeData?: (id: string, data: any) => void;
  onDeselectNode?: () => void;
  isCalculating?: boolean;
  globalParams: Record<string, number>;
  onGlobalParamChange: (key: string, value: number) => void;
  monteCarloIterations?: number;
  onMonteCarloIterationsChange?: (value: number) => void;
};

export function LeftPanel({
  processes,
  selectedProcessId,
  scale,
  lciaResults,
  onProcessSelect,
  onScaleChange,
  onShuffleDemo,
  onGeneratePdf,
  onDownloadCsv,
  contextNodeId,
  systemBoundary,
  onSystemBoundaryChange,
  complianceFramework,
  onComplianceFrameworkChange,
  uploadedDatabase,
  selectedUploadedProcess,
  onDatabaseUpload,
  onUploadedProcessSelect,
  exchangeValues,
  onExchangeValueChange,
  onAddNodeToCanvas,
  onCalculate,
  selectedNode,
  onUpdateNodeData,
  onDeselectNode,
  isCalculating,
  globalParams,
  onGlobalParamChange,
  monteCarloIterations = 1,
  onMonteCarloIterationsChange
}: LeftPanelProps) {
  const [activeNodeTab, setActiveNodeTab] = useState<'scope' | 'technosphere' | 'elementary' | 'variables' | 'allocation' | 'quality'>('scope');
  const [search, setSearch] = useState("");
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UploadedProcess[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [activeSearchIdx, setActiveSearchIdx] = useState<number | null>(null);


  const nodeData: MiniLCANodeData = useMemo(() => {
    if (!selectedNode) return {
      processName: "",
      description: "",
      scope: { functionalUnit: "", location: "" },
      technosphere: [],
      elementary: [],
      variables: {},
      allocation: { method: 'physical', factors: {} },
      uncertainty: {}
    };
    const data = selectedNode.data;
    const baseData = data.technosphere ? data : {
      processName: data.processName || data.label || "New Process",
      description: data.description || "",
      scope: {
        functionalUnit: data.unit || "1 unit",
        location: typeof data.location === 'string' ? data.location : (data.location?.value || "GLO")
      },
      technosphere: (data.exchanges || [])
        .filter((ex: any) => ['input', 'output', 'mechanism', 'control'].includes(ex.flow_type))
        .map((ex: any, i: number) => ({
          id: `tech-${i}`,
          flow_name: ex.flow_name,
          flowType: ex.flow_type,
          dataset_uuid: ex.dataset_uuid || "",
          formula: ex.amount?.toString() || "0",
          evaluatedAmount: ex.amount || 0,
          unit: ex.unit || "kg"
        })),
      elementary: (data.exchanges || [])
        .filter((ex: any) => ['emission', 'extraction'].includes(ex.flow_type))
        .map((ex: any, i: number) => ({
          id: `elem-${i}`,
          flow_name: ex.flow_name,
          flowType: ex.flow_type,
          dataset_uuid: ex.dataset_uuid || "",
          formula: ex.amount?.toString() || "0",
          evaluatedAmount: ex.amount || 0,
          unit: ex.unit || "kg"
        })),
      variables: data.parameters || {},
      allocation: { method: 'physical', factors: {} },
      uncertainty: {}
    };
    return evaluateNodeData(baseData, globalParams);
  }, [selectedNode, globalParams]);
  useEffect(() => {
    // Determine the process ID to fetch parameters for
    const procId = selectedNode?.data?.proc_id || selectedProcessId;

    if (procId) {
      fetch(`http://localhost:8000/api/parameters/definitions?processId=${procId}`)
        .then((res) => res.json())
        .then((data) => {
          setParameters(data);
          // Only set defaults if the node doesn't already have these parameters
          const existingParams = selectedNode?.data?.parameters || {};
          const newValues: Record<string, number> = { ...existingParams };

          data.forEach((p: Parameter) => {
            if (newValues[p.key] === undefined) {
              newValues[p.key] = p.defaultValue;
            }
          });
          setParamValues(newValues);

          // Sync back to node if it's a node selection
          if (selectedNode && Object.keys(existingParams).length === 0) {
            onUpdateNodeData?.(selectedNode.id, { parameters: newValues });
          }
        })
        .catch(err => console.error("Param fetch failed", err));
    }
  }, [selectedProcessId, selectedNode?.id]);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        fetch(`http://localhost:8000/api/search-processes?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data);
            setIsSearching(true); // Keep results visible
            setIsSearching(false);
          })
          .catch(err => {
            console.error("Search failed", err);
            setIsSearching(false);
          });
      } else {
        if (activeSearchIdx === null) { // Only clear if not in deep search mode to keep global results
          setSearchResults([]);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeSearchIdx]);

  // Click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setActiveSearchIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="w-full h-full flex flex-col bg-[hsl(220,14%,8%)] border-r border-white/5 overflow-hidden font-mono">
      {/* Header */}
      <header className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[hsl(142,76%,36%)] rounded flex items-center justify-center font-black text-white text-xs">A</div>
          <h1 className="text-sm font-bold tracking-tight text-[hsl(var(--foreground))]">AUTOLCA <span className="text-[hsl(142,76%,36%)]">PRO</span></h1>
        </div>
        {selectedNode && (
          <div className="bg-[hsl(142,76%,36%)] px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter">
            Editing Mode
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-white custom-scrollbar-zone">
        {/* Global Parameters Section */}
        {!selectedNode && (
          <div className="space-y-3 p-3 rounded-lg bg-[hsl(220,14%,8%)] border border-[hsl(142,76%,36%,0.2)] shadow-xl animate-in slide-in-from-top-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(142,76%,36%)] flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Global Scoping Parameters
            </label>
            <div className="space-y-3 mt-2">
              {Object.entries(globalParams).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-gray-400 font-mono">{key}</span>
                    <span className="text-[hsl(142,76%,36%)] font-mono">{val.toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => onGlobalParamChange(key, parseFloat(e.target.value) || 0)}
                    className="w-full h-8 bg-[hsl(220,14%,12%)] border border-white/5 rounded px-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedNode ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Tab Navigation */}
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 overflow-x-auto no-scrollbar backdrop-blur-sm sticky top-0 z-30">
              {[
                { id: 'scope', icon: Globe, label: 'Scope' },
                { id: 'technosphere', icon: Package, label: 'Economy' },
                { id: 'elementary', icon: Beaker, label: 'Biosphere' },
                { id: 'variables', icon: Calculator, label: 'Math' },
                { id: 'allocation', icon: PieChart, label: 'Allocation' },
                { id: 'quality', icon: ShieldCheck, label: 'Quality' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveNodeTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${activeNodeTab === tab.id ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[450px] flex flex-col gap-4">
              {activeNodeTab === 'scope' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500">Process Name</label>
                    <input
                      value={nodeData.processName}
                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { processName: e.target.value })}
                      className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500">Description</label>
                    <textarea
                      value={nodeData.description}
                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { description: e.target.value })}
                      className="w-full h-24 bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-400 font-bold resize-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
                      placeholder="Enter detailed process metadata..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500">Functional Unit</label>
                      <input
                        value={nodeData.scope.functionalUnit}
                        onChange={(e) => onUpdateNodeData?.(selectedNode.id, { scope: { ...nodeData.scope, functionalUnit: e.target.value } })}
                        className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500">Geography</label>
                      <input
                        value={nodeData.scope.location}
                        onChange={(e) => onUpdateNodeData?.(selectedNode.id, { scope: { ...nodeData.scope, location: e.target.value } })}
                        className="w-full bg-[hsl(220,14%,8%)] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white font-mono focus:ring-1 focus:ring-[hsl(142,76%,36%)] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(activeNodeTab === 'technosphere' || activeNodeTab === 'elementary') && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">
                      {activeNodeTab === 'technosphere' ? 'Technosphere flows (economy)' : 'Elementary flows (biosphere)'}
                    </h4>
                    <button
                      onClick={() => {
                        const isTechnosphere = activeNodeTab === 'technosphere';
                        const newItem: any = {
                          id: Math.random().toString(36).substring(2, 11),
                          flow_name: "New Flow",
                          flowType: isTechnosphere ? 'input' : 'emission',
                          dataset_uuid: "",
                          formula: "0",
                          evaluatedAmount: 0,
                          unit: "kg"
                        };

                        if (isTechnosphere) {
                          const list = [...(nodeData.technosphere || [])];
                          list.push(newItem);
                          onUpdateNodeData?.(selectedNode.id, { technosphere: list });
                        } else {
                          const list = [...(nodeData.elementary || [])];
                          list.push(newItem);
                          onUpdateNodeData?.(selectedNode.id, { elementary: list });
                        }
                      }}
                      className="px-2 py-1 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded shadow-lg shadow-[hsl(142,76%,36%,0.2)] hover:scale-105 transition-transform"
                    >
                      + ADD FLOW
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(activeNodeTab === 'technosphere' ? nodeData.technosphere : nodeData.elementary).map((flow, idx) => (
                      <div key={flow.id} className="p-3 bg-[hsl(220,14%,12%)] border border-white/10 rounded-lg space-y-3 relative group/flow hover:border-[hsl(142,76%,36%,0.4)] transition-all">
                        <div className="flex items-center gap-2">
                          <select
                            value={flow.flowType}
                            onChange={(e) => {
                              const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
                              list[idx].flowType = e.target.value as any;
                              onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
                            }}
                            className="bg-[hsl(220,14%,8%)] border border-white/5 rounded px-1.5 py-1 text-[9px] font-bold text-gray-400 capitalize focus:text-white"
                          >
                            {activeNodeTab === 'technosphere' ? (
                              <>
                                <option value="input">Input</option>
                                <option value="output">Output</option>
                                <option value="mechanism">Mechanism</option>
                                <option value="control">Control</option>
                              </>
                            ) : (
                              <>
                                <option value="emission">Emission</option>
                                <option value="extraction">Extraction</option>
                              </>
                            )}
                          </select>
                          <div className="flex-1 relative">
                            <input
                              value={flow.flow_name}
                              onFocus={() => setActiveSearchIdx(idx)}
                              onChange={(e) => {
                                const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
                                list[idx].flow_name = e.target.value;
                                onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
                                setSearchQuery(e.target.value);
                                setShowResults(true);
                              }}
                              className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-[10px] text-white font-bold focus:border-[hsl(142,76%,36%)] outline-none"
                              placeholder="Search dataset..."
                            />
                            {showResults && activeSearchIdx === idx && (
                              <div className="absolute z-[110] w-full mt-1 bg-[hsl(220,14%,15%)] border border-white/10 rounded shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-1">
                                {searchResults.map((proc) => (
                                  <div
                                    key={proc.id}
                                    onClick={() => {
                                      const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
                                      list[idx] = {
                                        ...list[idx],
                                        flow_name: proc.name,
                                        unit: proc.reference_unit || list[idx].unit,
                                        dataset_uuid: proc.id
                                      };
                                      onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
                                      setActiveSearchIdx(null);
                                      setShowResults(false);
                                    }}
                                    className="p-2 hover:bg-[hsl(142,76%,36%,0.2)] border-b border-white/5 cursor-pointer flex flex-col gap-0.5"
                                  >
                                    <span className="text-[10px] font-bold text-white truncate">{proc.name}</span>
                                    <span className="text-[8px] text-gray-500 uppercase">{proc.location} • {proc.reference_unit}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
                              list.splice(idx, 1);
                              onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
                            }}
                            className="opacity-0 group-hover/flow:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1"
                          >
                            < Zap className="w-3 h-3 rotate-45" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[7px] text-gray-500 font-black uppercase">Formula (MathJS)</span>
                            <input
                              value={flow.formula}
                              onChange={(e) => {
                                const list = activeNodeTab === 'technosphere' ? [...nodeData.technosphere] : [...nodeData.elementary];
                                list[idx].formula = e.target.value;
                                onUpdateNodeData?.(selectedNode.id, { [activeNodeTab]: list });
                              }}
                              className="w-full h-8 bg-black/40 border border-white/5 rounded px-2 text-[10px] font-mono text-[hsl(142,76%,36%)] focus:border-[hsl(142,76%,36%)] outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[7px] text-gray-500 font-black uppercase">Result</span>
                            <div className="w-full h-8 flex items-center px-2 bg-black/20 border border-white/5 rounded text-[10px] font-mono text-gray-300">
                              {flow.evaluatedAmount.toFixed(4)} <span className="ml-auto text-[8px] text-gray-600 font-bold">{flow.unit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNodeTab === 'variables' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">Math Engine Variables</h4>
                    <button
                      onClick={() => {
                        const newVars = { ...nodeData.variables, [`v${Object.keys(nodeData.variables).length + 1}`]: 0 };
                        onUpdateNodeData?.(selectedNode.id, { variables: newVars });
                      }}
                      className="px-2 py-1 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded shadow-lg shadow-[hsl(142,76%,36%,0.2)] hover:scale-105 transition-transform"
                    >
                      + ADD VARIABLE
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(nodeData.variables).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 p-2 bg-[hsl(220,14%,12%)] border border-white/5 rounded-lg group/var hover:border-[hsl(142,76%,36%,0.4)] transition-all">
                        <input
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                            if (newKey === key) return;
                            const newVars = { ...nodeData.variables };
                            delete newVars[key];
                            newVars[newKey] = val;
                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
                          }}
                          className="w-24 bg-transparent border-r border-white/10 px-2 py-1 text-[10px] text-[hsl(142,76%,36%)] font-mono font-bold outline-none"
                        />
                        <input
                          type="number"
                          step="any"
                          value={val}
                          onChange={(e) => {
                            const newVars = { ...nodeData.variables, [key]: parseFloat(e.target.value) || 0 };
                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
                          }}
                          className="flex-1 bg-transparent px-2 py-1 text-[10px] text-white font-mono text-right outline-none"
                        />
                        <button
                          onClick={() => {
                            const newVars = { ...nodeData.variables };
                            delete newVars[key];
                            onUpdateNodeData?.(selectedNode.id, { variables: newVars });
                          }}
                          className="opacity-0 group-hover/var:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1"
                        >
                          <Zap className="w-3 h-3 rotate-45" />
                        </button>
                      </div>
                    ))}
                    {Object.keys(nodeData.variables).length === 0 && (
                      <div className="p-8 text-center border border-dashed border-white/5 rounded-lg">
                        <Calculator className="w-8 h-8 text-gray-700 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
                          No local constants defined.<br />Global parameters are still available.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeNodeTab === 'allocation' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                      <PieChart className="w-3.5 h-3.5" />
                      Allocation Strategy
                    </label>
                    <select
                      value={nodeData.allocation.method}
                      onChange={(e) => onUpdateNodeData?.(selectedNode.id, { allocation: { ...nodeData.allocation, method: e.target.value } })}
                      className="w-full bg-[hsl(220,14%,8%)] border border-white/20 rounded px-3 py-2 text-xs text-white font-black"
                    >
                      <option value="physical">Physical Attribution (Mass/Energy/Volume)</option>
                      <option value="economic">Economic Allocation (Market Value)</option>
                      <option value="none">No Allocation (System Expansion)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.2)] rounded-lg space-y-3">
                    <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
                      If this sub-system produces multiple co-products, define the allocation factor for the main reference flow.
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-white flex-1">{nodeData.processName}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={100} className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-[hsl(142,76%,36%)] text-right" />
                        <span className="text-[10px] font-bold text-gray-600">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeNodeTab === 'quality' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Data Quality Indicators (DQRs)
                    </label>

                    {[
                      { label: 'Reliability', color: 'bg-green-500' },
                      { label: 'Completeness', color: 'bg-blue-500' },
                      { label: 'Temporal Cor.', color: 'bg-yellow-500' },
                      { label: 'Geographic Cor.', color: 'bg-red-500' },
                      { label: 'Technological Cor.', color: 'bg-purple-500' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-white">Score: 1.0</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className={`flex-1 h-3 rounded-sm ${n === 1 ? item.color : 'bg-white/5 opacity-50'} border border-black/20`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-white/5" />

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500">Uncertainty Distribution</label>
                    <select className="w-full bg-[hsl(220,14%,8%)] border border-white/20 rounded px-3 py-2 text-xs text-white font-bold">
                      <option>None (Deterministic)</option>
                      <option>Normal (Gaussian)</option>
                      <option>Lognormal (Standard LCA)</option>
                      <option>Pedigree-based (DQR Calculated)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              <button
                onClick={() => onDeselectNode?.()}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border border-white/10 rounded-md transition-all"
              >
                Close Editor
              </button>
              <button
                onClick={() => {
                  onUpdateNodeData?.(selectedNode.id, nodeData); // Force final sync
                  onDeselectNode?.();
                }}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-[hsl(142,76%,36%)] text-white rounded-md shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all"
              >
                Save & Update
              </button>
            </div>
          </div>
        ) : (
          /* Global Database View (Original UI) */
          <>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] flex items-center">
                <Database className="w-3 h-3 mr-2" />
                LCA Database Integration
              </label>
              <DatabaseUploadZone onUploadSuccess={onDatabaseUpload} />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] flex items-center">
                <RefreshCw className="w-3 h-3 mr-2" />
                Active Process Control
              </label>

              <div className="relative" ref={searchRef}>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-[hsl(142,76%,36%)] transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={uploadedDatabase ? "Search database processes..." : "Upload a database first..."}
                    disabled={!uploadedDatabase}
                    className="w-full h-10 pl-9 pr-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)] placeholder:text-gray-600 font-bold transition-all disabled:opacity-50"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 border-2 border-[hsl(142,76%,36%)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Combobox Dropdown */}
                {showResults && (searchQuery.length >= 2 || (uploadedDatabase && searchResults.length > 0)) && (
                  <div className="absolute z-[100] w-full mt-1 bg-[hsl(220,14%,12%)] border border-white/10 rounded-md shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchResults.length > 0 ? (
                      searchResults.map((proc) => {
                        const hasNoImpact = true; // Placeholder for logic
                        return (
                          <div
                            key={proc.id}
                            onClick={() => {
                              onUploadedProcessSelect(proc);
                              setSearchQuery(proc.name);
                              setShowResults(false);
                            }}
                            className="p-3 hover:bg-[hsl(142,76%,36%,0.15)] border-b border-white/5 cursor-pointer group transition-colors flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-white group-hover:text-[hsl(142,76%,36%)] transition-colors truncate">{proc.name}</span>
                              {hasNoImpact && (
                                <div className="group/warn relative">
                                  <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded shadow-2xl text-[8px] text-gray-300 font-bold invisible group-hover/warn:visible opacity-0 group-hover/warn:opacity-100 transition-all z-[101]">
                                    Warning: This process may require mapping to standard impact methods (e.g., TRACI/ReCiPe).
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
                                <Globe className="w-2.5 h-2.5" />
                                <span>{proc.location || 'GLO'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-black">
                                <Package className="w-2.5 h-2.5" />
                                <span>{proc.reference_unit || '1 unit'}</span>
                              </div>
                              <div className="ml-auto px-1.5 py-0.5 rounded-full bg-[hsl(142,76%,36%,0.1)] border border-[hsl(142,76%,36%,0.2)] text-[7px] font-black text-[hsl(142,76%,36%)] uppercase tracking-tighter">
                                User Upload
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-6 text-center space-y-4">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">No local results found for "{searchQuery}"</p>
                        <button className="w-full py-2 bg-[hsl(142,76%,36%)] text-white text-[9px] font-black uppercase rounded hover:bg-[hsl(142,76%,46%)] transition-colors">
                          Connect USLCI / Ecoinvent ➔
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {selectedUploadedProcess && (
              <div className="p-3 rounded-lg bg-[hsl(220,14%,13%)] border border-[hsl(var(--border))] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-tighter">Exchange Variables</label>
                  {selectedUploadedProcess.exchanges.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate flex-1" title={ex.flow_name}>
                        {ex.flow_name}
                      </span>
                      <div className="flex items-center gap-1 w-24">
                        <input
                          type="number"
                          step="any"
                          value={exchangeValues[`exchange_${idx}`] ?? ex.amount}
                          onChange={(e) => onExchangeValueChange(`exchange_${idx}`, Number(e.target.value))}
                          className="w-full bg-[hsl(220,14%,8%)] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-[10px] font-mono text-[hsl(142,76%,36%)] text-right focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
                        />
                        <span className="text-[8px] text-[hsl(var(--muted-foreground))] font-bold w-6 text-left">{ex.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onAddNodeToCanvas(selectedUploadedProcess)}
                  className="w-full bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,46%)] text-white font-bold py-2 rounded text-xs transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse flex items-center justify-center gap-2"
                >
                  ➕ ADD PROCESS TO CANVAS
                </button>
              </div>
            )}
          </>
        )}

        <hr className="border-[hsl(var(--border))]" />

        {/* System Boundary */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Methodology</label>
          <select
            value={systemBoundary}
            onChange={(e) => onSystemBoundaryChange(e.target.value)}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all font-bold"
          >
            <option value="cradle-to-cradle">Cradle-to-Cradle (C2C)</option>
            <option value="cradle-to-gate">Cradle-to-Gate</option>
            <option value="cradle-to-grave">Cradle-to-Grave</option>
            <option value="gate-to-gate">Gate-to-Gate</option>
            <option value="gate-to-cradle">Gate-to-Cradle</option>
          </select>

          <div className="text-[10px] text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(220,14%,8%)] border border-white/5 rounded leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 italic font-medium">
            {systemBoundary === 'cradle-to-cradle' && "Cradle-to-Cradle (C2C): A circular, restorative model where end-of-life products are recycled, upcycled, or biodegraded into new raw materials, eliminating waste and enabling continuous technical or biological cycles."}
            {systemBoundary === 'cradle-to-gate' && "Cradle-to-Gate: Evaluates a partial product life cycle from resource extraction (\"cradle\") to the factory gate (\"gate\") before it reaches the consumer. Commonly used for B2B footprinting."}
            {systemBoundary === 'cradle-to-grave' && "Cradle-to-Grave: The standard linear life cycle model, tracing a product from raw material extraction (\"cradle\") through production, transport, usage, and final waste disposal (\"grave\")."}
            {systemBoundary === 'gate-to-gate' && "Gate-to-Gate: A partial LCA, typically mapping a single value-added process within a manufacturing chain."}
            {systemBoundary === 'gate-to-cradle' && "Gate-to-Cradle: Focuses on the recycling, refurbishment, or regeneration phase of a product, from the end-of-life waste stage (\"gate\") back into a new production cycle (\"cradle\")."}
          </div>
        </div>

        <hr className="border-[hsl(var(--border))]" />

        {/* Reporting Compliance */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Reporting Compliance</label>
          <select
            value={complianceFramework}
            onChange={(e) => onComplianceFrameworkChange(e.target.value)}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)] transition-all font-bold"
          >
            <option value="iso-14044">ISO 14040 / 14044</option>
            <option value="jrc-pef">JRC / PEF (EF 3.1)</option>
            <option value="en-15804">EN 15804+A2</option>
            <option value="ghg-protocol">GHG Protocol</option>
          </select>
        </div>

        {/* Global Uncertainty Analysis */}
        <div className="space-y-3 p-3 rounded-lg bg-[hsl(142,76%,36%,0.05)] border border-[hsl(142,76%,36%,0.1)]">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(142,76%,36%)] flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            Uncertainty Mode
          </label>

          <div className="flex bg-[hsl(220,14%,8%)] rounded p-1">
            <button
              onClick={() => onMonteCarloIterationsChange?.(1)}
              className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${monteCarloIterations <= 1 ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.2)]' : 'text-gray-500 hover:text-white'}`}
            >
              Deterministic
            </button>
            <button
              onClick={() => onMonteCarloIterationsChange?.(1000)}
              className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${monteCarloIterations > 1 ? 'bg-[hsl(142,76%,36%)] text-white shadow-lg shadow-[hsl(142,76%,36%,0.2)]' : 'text-gray-500 hover:text-white'}`}
            >
              Stochastic
            </button>
          </div>

          {monteCarloIterations > 1 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-gray-400">Monte Carlo Iterations</span>
                <span className="text-[hsl(142,76%,36%)] font-mono">{monteCarloIterations}</span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={monteCarloIterations}
                onChange={(e) => onMonteCarloIterationsChange?.(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[hsl(142,76%,36%)]"
              />
              <p className="text-[8px] text-gray-600 font-bold uppercase leading-tight">
                Vectorized simulation calculates {monteCarloIterations} supply chain variations in parallel.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] flex-shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onGeneratePdf}
            disabled={isCalculating}
            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(var(--foreground))]'} text-[9px] font-bold transition-colors`}
          >
            <FileText className="w-3 h-3" />
            PDF
          </button>
          <button
            onClick={onDownloadCsv}
            disabled={isCalculating}
            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(var(--foreground))]'} text-[9px] font-bold transition-colors`}
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={onShuffleDemo}
            disabled={isCalculating}
            className={`flex items-center justify-center gap-1 p-2 rounded ${isCalculating ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] text-[hsl(142,76%,36%)]'} text-[9px] font-bold transition-colors`}
          >
            ⚡ BENCH
          </button>
        </div>
      </div>

      {/* Result Dashboard */}
      {lciaResults && (
        <footer className="p-4 bg-[hsl(220,14%,8%)] border-t border-[hsl(var(--border))] space-y-4 max-h-[400px] overflow-y-auto">
          {/* AI Warning */}
          {lciaResults.is_ai_predicted && (
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-start gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-yellow-500 uppercase leading-tight">
                Notice: Some missing Characterization Factors were predicted using AI (KNNImputer).
              </p>
            </div>
          )}

          {/* Hotspot Card */}
          {lciaResults.hotspots.length > 0 && (
            <div className="p-4 bg-red-600/10 border-2 border-red-600/30 rounded-lg space-y-2 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.1)]">
              <div className="flex items-center gap-2 text-[11px] font-black text-red-500 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" />
                Supply Chain Hotspot
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-black text-white truncate max-w-[140px] italic">🔴 {lciaResults.hotspots[0].name}</span>
                <span className="text-lg font-black text-red-500">{lciaResults.hotspots[0].percent.toFixed(1)}%</span>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">
                This process accounts for the majority of Carbon Impact (GWP) in the current supply chain.
              </p>
            </div>
          )}

          {/* GWP Total */}
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Total GWP</span>
              <div className="text-right">
                <div className="text-xl font-black text-[hsl(142,76%,36%)] leading-none">
                  {lciaResults.gwp.toFixed(2)} <span className="text-[10px]">kg CO₂ eq</span>
                </div>
                {lciaResults.uncertainty?.gwp_climate_change && (
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
                    95% CI: {lciaResults.uncertainty.gwp_climate_change.p5.toFixed(1)} — {lciaResults.uncertainty.gwp_climate_change.p95.toFixed(1)}
                    <span className="ml-1 text-[hsl(142,76%,36%)]">({(lciaResults as any).iterations} runs)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full bg-[hsl(220,14%,15%)] h-1 rounded-full overflow-hidden">
              <div className="bg-[hsl(142,76%,36%)] h-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* JRC Categories Table */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">JRC EF 3.1 Impact Table</label>
            <div className="space-y-1">
              {Object.entries(lciaResults.impacts).map(([key, val]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const unit_map: Record<string, string> = {
                  'gwp_climate_change': 'kg CO2 eq',
                  'odp_ozone_depletion': 'kg CFC11 eq',
                  'ap_acidification': 'mol H+ eq',
                  'ep_freshwater': 'kg P eq',
                  'ep_marine': 'kg N eq',
                  'ep_terrestrial': 'mol N eq',
                  'pocp_photochemical_ozone': 'kg NMVOC eq',
                  'pm_particulate_matter': 'disease inc.',
                  'ir_ionising_radiation': 'kBq U235 eq',
                  'ht_c_human_toxicity_cancer': 'CTUh',
                  'ht_nc_human_toxicity_non_cancer': 'CTUh',
                  'et_fw_ecotoxicity_freshwater': 'CTUe',
                  'lu_land_use': 'Pt',
                  'wsf_water_scarcity': 'm3 world eq',
                  'ru_mm_resource_use_min_met': 'kg Sb eq',
                  'ru_f_resource_use_fossils': 'MJ'
                };
                return (
                  <div key={key} className="flex justify-between items-center text-[9px] p-1 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <span className="text-gray-400 font-bold max-w-[140px] truncate">{label}</span>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-white font-mono">{val.toExponential(2)}</span>
                        <span className="text-gray-600 text-[7px]">{unit_map[key] || ''}</span>
                      </div>
                      {lciaResults.uncertainty?.[key] && (
                        <div className="text-[7px] text-gray-500 font-bold">
                          [{lciaResults.uncertainty[key].p5.toExponential(1)} .. {lciaResults.uncertainty[key].p95.toExponential(1)}]
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </footer>
      )}
    </aside>
  );
}

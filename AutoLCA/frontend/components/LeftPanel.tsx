import { useState, useCallback, useMemo, useEffect } from "react";
import { Upload, Database, Settings } from "lucide-react";
import DatabaseUploadZone from '../components/DatabaseUploadZone';

type ProcessSummary = {
  id: number;
  name: string;
};

type Parameter = {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
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
  description?: string;
  exchanges: Exchange[];
};

type UploadedDatabase = {
  processes: UploadedProcess[];
};

type Hotspot = { name: string; value: number; percent: number };

type LciaResults =
  | {
    gwp: number;
    hotspots: Hotspot[];
  }
  | null;

type LeftPanelProps = {
  processes: ProcessSummary[];
  selectedProcessId: number | null;
  scale: number;
  lciaResults: LciaResults;
  onProcessSelect: (id: number | null) => void;
  onScaleChange: (value: number) => void;
  onShuffleDemo: () => void;
  contextNodeId: string | null;
  systemBoundary: string;
  onSystemBoundaryChange: (boundary: string) => void;
  onExchangeValuesChange?: (values: Record<string, number>) => void;
  onCalculateImpact?: () => void;
  onNodeDataChange?: (nodeId: string, data: any) => void;
  comparativeData?: any[];
  onAnalyze3D?: (file: File, material: string, machine: string, region: string) => void;
  isAnalyzing3D?: boolean;
  isInvalid?: boolean;
};

export function LeftPanel({
  processes,
  selectedProcessId,
  scale,
  lciaResults,
  onProcessSelect,
  onScaleChange,
  onShuffleDemo,
  contextNodeId,
  systemBoundary,
  onSystemBoundaryChange,
  onExchangeValuesChange,
  onCalculateImpact,
  onNodeDataChange,
  comparativeData = [],
  onAnalyze3D,
  isAnalyzing3D = false,
  isInvalid = false
}: LeftPanelProps) {
  const [viewMode, setViewMode] = useState<'canvas' | '3dprint'>('canvas');
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [material, setMaterial] = useState('PLA');
  const [machine, setMachine] = useState('FDM_desktop');
  const [region, setRegion] = useState('Global_Avg');
  const [infillPercent, setInfillPercent] = useState(20);
  const [supportEnabled, setSupportEnabled] = useState(true);

  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, number>>({});
  const [uploadedDatabase, setUploadedDatabase] = useState<UploadedDatabase | null>(null);
  const [selectedUploadedProcess, setSelectedUploadedProcess] = useState<UploadedProcess | null>(null);
  const [exchangeValues, setExchangeValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedProcessId) {
      fetch(`/api/process/${selectedProcessId}/parameters`)
        .then((res) => res.json())
        .then((data) => {
          setParameters(data);
          const defaults: Record<string, number> = {};
          data.forEach((p: Parameter) => {
            defaults[p.id] = p.default;
          });
          setParamValues(defaults);
        });
    }
  }, [selectedProcessId]);

  const handleSearch = useCallback(() => {
    // Placeholder: could filter processes by name with backend search
  }, []);

  const handleDatabaseUpload = useCallback((data: UploadedDatabase) => {
    setUploadedDatabase(data);
    setSelectedUploadedProcess(null);
    setExchangeValues({});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/upload-database", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Database uploaded and switched successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedProcessName = useMemo(() => {
    return processes.find((p) => p.id === selectedProcessId)?.name ?? "None selected";
  }, [processes, selectedProcessId]);

  return (
    <aside className="w-[340px] shrink-0 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(220,18%,8%)]">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Triya.io</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          AI Life Cycle Assessment - Super Calculator
        </p>

        <div className="flex mt-4 bg-[hsl(220,14%,12%)] rounded-lg p-1 border border-white/5">
          <button 
            type="button"
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${viewMode === 'canvas' ? 'bg-[hsl(142,76%,36%)] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setViewMode('canvas')}
          >
            Canvas Builder
          </button>
          <button 
            type="button"
            className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${viewMode === '3dprint' ? 'bg-[hsl(142,76%,36%)] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setViewMode('3dprint')}
          >
            3D Print Analyzer
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {viewMode === 'canvas' ? (
          <>
            {/* Objective 1: Upload Database Zone */}
            <DatabaseUploadZone onUploadSuccess={handleDatabaseUpload} />

        {/* System Boundary Logic */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            System Boundary
          </label>
          <select
            value={systemBoundary}
            onChange={(e) => onSystemBoundaryChange(e.target.value)}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
          >
            <option value="gate">Cradle-to-Gate</option>
            <option value="grave">Cradle-to-Grave</option>
            <option value="cradle">Cradle-to-Cradle (Circular)</option>
          </select>
        </div>

        {/* Process selection bound to database */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Active Process
          </label>
          {uploadedDatabase ? (
            <select
              value={selectedUploadedProcess?.id ?? ""}
              onChange={(e) => {
                const processId = e.target.value;
                const process = uploadedDatabase.processes.find(p => p.id === processId);
                setSelectedUploadedProcess(process || null);
                if (process) {
                  // Initialize exchange values with defaults
                  const defaults: Record<string, number> = {};
                  process.exchanges.forEach((exchange) => {
                    defaults[exchange.flow_name] = exchange.amount;
                  });
                  setExchangeValues(defaults);
                  onExchangeValuesChange?.(defaults);
                } else {
                  setExchangeValues({});
                }
              }}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
            >
              <option value="">Select a process…</option>
              {uploadedDatabase.processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
              Upload a database to view processes
            </div>
          )}
        </div>

        {/* Dynamic Exchange Parameters */}
        {selectedUploadedProcess && (
          <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Parameters
            </label>
            
            {/* Scale Parameter */}
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
                Functional Unit Scale
              </label>
              <input
                type="range"
                min={0.1}
                max={10.0}
                step={0.1}
                value={scale}
                onChange={(e) => onScaleChange(Number(e.target.value))}
                className="w-full accent-[hsl(142,76%,36%)]"
              />
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>0.1</span>
                <span>{scale.toFixed(1)}</span>
                <span>10.0</span>
              </div>
            </div>

            {/* Exchange Parameters */}
            {selectedUploadedProcess.exchanges.length > 0 && (
              <>
                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
                  Exchange Amounts
                </label>
                {selectedUploadedProcess.exchanges.map((exchange, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
                      {exchange.flow_name} ({exchange.flow_type}) - {exchange.unit}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={exchange.amount * 3} // Allow up to 3x the default
                      step={0.01}
                      value={exchangeValues[exchange.flow_name] ?? exchange.amount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExchangeValues(prev => {
                          const updated = { ...prev, [exchange.flow_name]: val };
                          onExchangeValuesChange?.(updated);
                          return updated;
                        });
                      }}
                      className="w-full accent-[hsl(142,76%,36%)]"
                    />
                    <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                      <span>0</span>
                      <span>{(exchangeValues[exchange.flow_name] ?? exchange.amount).toFixed(2)}</span>
                      <span>{(exchange.amount * 3).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Shuffle Example */}


        {/* Shuffle Example */}
        <button
          type="button"
          onClick={onShuffleDemo}
          className="w-full rounded-md border-2 border-dashed border-[hsl(142,76%,36%)] bg-[hsl(220,14%,12%)] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(220,14%,16%)] transition-colors"
        >
          Generate Heuristic Baseline
        </button>

        {/* Export actions */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={onCalculateImpact}
            disabled={isInvalid}
            className={`w-full rounded-md border border-transparent px-3 py-3 text-sm font-bold text-white shadow transition-all ${isInvalid ? 'bg-gray-700 cursor-not-allowed opacity-50 font-black' : 'bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,46%)]'}`}
          >
            {isInvalid ? "PROHIBITED: MASS BALANCE VIOLATION" : "Execute LCIA Computation"}
          </button>
        </div>

        {/* LCIA results dashboard */}

        {/* LCIA results placeholder */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
            LCIA Results
          </h3>
          {lciaResults ? (
            <div className="space-y-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Process: <span className="font-medium text-[hsl(var(--foreground))]">{selectedProcessName}</span>
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Total impact (GWP-like):{" "}
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {lciaResults.gwp.toFixed(3)}
                </span>
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                  Top hotspots (&gt; 80% cumulative):
                </p>
                {lciaResults.hotspots
                  .reduce<{ items: Hotspot[]; cum: number }>((acc, h) => {
                    if (acc.cum >= 80) return acc;
                    const nextCum = acc.cum + h.percent;
                    acc.items.push(h);
                    acc.cum = nextCum;
                    return acc;
                  }, { items: [], cum: 0 }).items
                  .map((h) => (
                    <p
                      key={h.name}
                      className="text-xs text-[hsl(var(--muted-foreground))] flex justify-between"
                    >
                      <span>{h.name}</span>
                      <span>{h.percent.toFixed(1)}%</span>
                    </p>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {isInvalid ? "Computation locked. Resolve mass balance errors in Expert Mode." : "Select a process or generate Heuristic Baseline to see impacts."}
            </p>
          )}

          {/* SaaS: Comparative Scenario Benchmarking */}
          {comparativeData.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(142,76%,36%)]">
                Scenario Benchmarking
              </h4>
              <div className="space-y-3">
                {comparativeData.map((s: any, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400">
                      <span>{s.name}</span>
                      <span>{s.gwp.toFixed(2)} CO2eq</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[hsl(142,76%,36%)] transition-all duration-1000"
                        style={{ width: `${Math.min(100, (s.gwp / Math.max(...comparativeData.map((d: any) => d.gwp))) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contextual parameters for right-clicked node (per-use-case customization) */}
        {contextNodeId && (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] p-4">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
              Node Parameters
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
              Adjust parameters for the selected use-case node:{" "}
              <span className="font-mono text-[hsl(var(--foreground))]">{contextNodeId}</span>
            </p>
            {/* Demo controls; can be wired to backend later */}
            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
              Scenario intensity
            </label>
            <input
              type="range"
              min={0}
              max={200}
              defaultValue={100}
              className="w-full accent-[hsl(142,76%,36%)] mb-2"
              onChange={(e) => onNodeDataChange?.(contextNodeId, { intensity: Number(e.target.value) })}
            />
            <label className="block text-xs text-[hsl(var(--foreground))] mb-1">
              Variant label
            </label>
            <input
              type="text"
              placeholder="e.g. Recycled content high"
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,14%)] px-2 py-1 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(142,76%,36%)]"
              onChange={(e) => onNodeDataChange?.(contextNodeId, { variant: e.target.value })}
            />
          </div>
        )}
        </>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Upload .STL File
              </label>
              <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-6 bg-[hsl(220,14%,10%)] text-center hover:bg-[hsl(220,14%,14%)] transition-colors relative">
                <input 
                  type="file" 
                  accept=".stl" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setStlFile(file);
                  }}
                />
                <Upload className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
                {stlFile ? (
                  <p className="text-sm font-bold text-[hsl(142,76%,60%)]">{stlFile.name}</p>
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Drag & drop or click to upload
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Material
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
              >
                <option value="PLA">PLA (Polylactic Acid)</option>
                <option value="ABS">ABS Plastic</option>
                <option value="PETG">PETG</option>
                <option value="Nylon">Nylon PA12</option>
                <option value="TPU">TPU Flex</option>
                <option value="Ti6Al4V">Titanium Alloy (Ti6Al4V)</option>
                <option value="SS316L">Stainless Steel 316L</option>
                <option value="AlSi10Mg">Aluminum Alloy (AlSi10Mg)</option>
                <option value="Inconel625">Inconel 625</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Machine / Process
              </label>
              <select
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
              >
                <option value="FDM_desktop">FDM Desktop</option>
                <option value="FDM_industrial">FDM Industrial</option>
                <option value="SLA">SLA Resin</option>
                <option value="SLS">SLS Powder Bed</option>
                <option value="DMLS">DMLS Metal</option>
                <option value="EBM">EBM Metal</option>
                <option value="Binder_Jetting">Binder Jetting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Region / Energy Grid
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(220,14%,12%)] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)]"
              >
                <option value="India">India (0.82 kg CO₂/kWh)</option>
                <option value="China">China (0.68)</option>
                <option value="US_East">US East (0.45)</option>
                <option value="US_West">US West (0.28)</option>
                <option value="EU_Average">EU Average (0.30)</option>
                <option value="EU_Nordic">EU Nordic (0.05)</option>
                <option value="Australia">Australia (0.73)</option>
                <option value="Global_Avg">Global Average (0.49)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Infill Percentage: {infillPercent}%
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={infillPercent}
                onChange={(e) => setInfillPercent(Number(e.target.value))}
                className="w-full accent-[hsl(142,76%,36%)]"
              />
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>5%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Support Structures
              </label>
              <button
                type="button"
                onClick={() => setSupportEnabled(!supportEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${supportEnabled ? 'bg-[hsl(142,76%,36%)]' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${supportEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <button
              type="button"
              disabled={!stlFile || isAnalyzing3D}
              onClick={() => stlFile && onAnalyze3D?.(stlFile, material, machine, region)}
              className="w-full rounded-md border border-transparent bg-[hsl(142,76%,36%)] px-3 py-3 text-sm font-bold text-white shadow hover:bg-[hsl(142,76%,46%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing3D ? "Analyzing..." : "Generate 3D Print LCA"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

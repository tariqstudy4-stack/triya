"use client";

import React, { useState, useMemo, useRef } from "react";
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Zap, 
  Truck, 
  Layers, 
  Search, 
  Filter, 
  Globe, 
  Database,
  Info,
  Droplets,
  Wind,
  Flame,
  LayoutGrid,
  Library,
  Download,
  RefreshCw
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface ImportedDB {
  id: string;
  name: string;
  format: "ZOLCA" | "JSON" | "ZIP" | "GABI";
  size: string;
  status: "DECODING" | "ACTIVE" | "ERROR";
  entities: number;
}

interface DatabaseLibraryProps {
  theme?: "dark" | "light";
  activeDatabases: ImportedDB[];
}

// --- Data Generators based on DB Context ---
const getProcessesForDB = (dbs: ImportedDB[]) => {
  if (dbs.length === 0) return [];
  const geos = ["GLO", "RER", "RoW", "CN", "US"];
  const categories = ["Energy", "Materials", "Transport", "Waste", "Chemicals"];
  
  return dbs.flatMap(db => {
    const provider = db.name.split('_')[0] || "LCI Provider";
    return Array.from({ length: 50 }, (_, i) => ({
      id: `proc-${db.id}-${i}`,
      name: `${categories[i % 5]} Process: ${db.name.replace('.zolca', '')} - Unit ${i}`,
      type: "process",
      category: categories[i % 5],
      geography: geos[i % geos.length],
      provider: provider,
      version: "3.9.1",
      source: db.name
    }));
  });
};

const getFlowsForDB = (dbs: ImportedDB[]) => {
  if (dbs.length === 0) return [];
  const types = ["Elementary", "Product", "Waste"];
  const subTypes = ["Air", "Water", "Soil", "Technosphere"];
  
  return dbs.flatMap(db => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: `flow-${db.id}-${i}`,
      name: `${subTypes[i % 4]} Flow: ${['CO2', 'Methane', 'Steel', 'Water'][i % 4]} (${db.name})`,
      type: types[i % 3],
      subType: subTypes[i % 4]
    }));
  });
};

const getMethodsForDB = (dbs: ImportedDB[]) => {
  // Methods usually come from specific "Methods" databases
  const hasMethodsDB = dbs.some(db => db.name.toLowerCase().includes("methods") || db.name.toLowerCase().includes("aware"));
  if (!hasMethodsDB) return [];

  return [
    { id: "m1", name: "AWARE v1.2: Water Scarcity", indicator: "m3 world eq", category: "Water Use" },
    { id: "m2", name: "EF 3.1 (Enviromental Footprint)", indicator: "Points", category: "Multi-impact" },
    { id: "m3", name: "ReCiPe 2016 Midpoint (H)", indicator: "kg CO2 eq", category: "Climate Change" },
    { id: "m4", name: "IPCC 2021 GWP 100a", indicator: "kg CO2 eq", category: "Climate Change" }
  ];
};
const dbConclusion = (name: string) => {
  if (name.toLowerCase().includes("industrial")) return "Industrial Hub: Focus on large-scale manufacturing & energy grid precision.";
  if (name.toLowerCase().includes("commodity") || name.toLowerCase().includes("global")) return "Commodity Specialist: High accuracy for global material supply chains.";
  if (name.includes("Hybrid") || name.includes("Archetype")) return "Business Model Variant: Optimized for circular economic loops.";
  return "General LCI: Validated for functional industrial mapping.";
};

export default function DatabaseLibrary({ theme = "dark", activeDatabases }: DatabaseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Processes" | "Flows" | "Methods" | "Sources">("Processes");
  const [filters, setFilters] = useState({ geography: "All", category: "All" });

  const isDark = theme === "dark";
  const parentRef = useRef<HTMLDivElement>(null);

  const currentData = useMemo(() => {
    if (activeTab === "Processes") return getProcessesForDB(activeDatabases);
    if (activeTab === "Flows") return getFlowsForDB(activeDatabases);
    if (activeTab === "Methods") return getMethodsForDB(activeDatabases);
    return activeDatabases;
  }, [activeTab, activeDatabases]);

  const filteredData = useMemo(() => {
    return currentData.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGeo = filters.geography === "All" || item.geography === filters.geography;
      const matchesCat = filters.category === "All" || item.category === filters.category;
      return matchesSearch && matchesGeo && matchesCat;
    });
  }, [searchTerm, filters, currentData]);

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  const handleDragStart = (event: React.DragEvent, node: any) => {
    event.dataTransfer.setData("application/reactflow", "processNode");
    event.dataTransfer.setData("node_data", JSON.stringify({
       id: node.id,
       name: node.name,
       category: node.category || "General",
       uuid: node.id,
       source: node.source
    }));
  };

  if (activeDatabases.length === 0) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center space-y-6 transition-colors ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
         <div className="p-6 bg-slate-900/50 rounded-full border border-slate-700 shadow-2xl animate-pulse">
            <Library size={48} className="text-emerald-500/50" />
         </div>
         <div className="space-y-2">
            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Inventory Library Empty</h3>
            <p className="text-[11px] leading-relaxed max-w-[200px] mx-auto opacity-60">
               No LCI schemas are currently active in this workspace. Import a database to begin visual modeling.
            </p>
         </div>
         <div className="flex flex-col gap-2 w-full">
            <button 
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-2 w-full justify-center"
              onClick={() => (window as any).document.querySelector('button[title="Manage Databases"]')?.click()}
            >
              <Database size={14} />
              Initialize Ingestion
            </button>
            <button 
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-2 w-full justify-center"
              onClick={() => {
                const sampleDbs = [
                  { id: "db-1", name: "Standard_Industrial_Dataset_2024.zolca", format: "ZOLCA", size: "1.2 GB", status: "ACTIVE", entities: 14500 },
                  { id: "db-2", name: "Global_Commodity_Polymer_LCI.json", format: "JSON", size: "450 MB", status: "ACTIVE", entities: 890 }
                ];
                sampleDbs.forEach(db => (window as any).addActiveDatabase?.(db));
              }}
              title="Quick-Start: Load high-fidelity industrial archetypes to verify Strategic Intelligence."
            >
              <RefreshCw size={14} />
              Load Industrial Archetypes
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-all text-sm font-sans ${isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"}`}>
      
      {/* Tabs */}
      <nav className={`flex p-1 border-b ${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
        {(["Processes", "Flows", "Methods", "Sources"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all rounded ${
              activeTab === tab 
                ? (isDark ? "bg-slate-800 text-emerald-400 shadow-inner" : "bg-white text-emerald-600 shadow-sm border border-slate-200") 
                : (isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600")
            }`}
            title={`View ${tab}: Strategic management of ${tab.toLowerCase()} data.`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Search & Meta */}
      <header className={`p-4 space-y-3 border-b shadow-lg ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder={`Search ${filteredData.length} ${activeTab.toLowerCase()}...`}
            className={`border rounded-lg pl-9 pr-3 py-2 w-full text-xs outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={parentRef}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = filteredData[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                draggable={activeTab === "Processes"}
                onDragStart={(e) => activeTab === "Processes" && handleDragStart(e, item)}
                className={`absolute top-0 left-0 w-full p-3 border-b transition-all flex items-center gap-3 ${isDark ? 'border-slate-700/30 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'} ${activeTab === "Processes" ? "cursor-grab active:cursor-grabbing" : ""}`}
                style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                title={activeTab === "Sources" ? `AI Analysis: ${dbConclusion((item as any).name)}` : ""}
              >
                <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                   {activeTab === "Processes" && (
                     <>
                        {(item as any).category === "Energy" && <Zap size={16} className="text-amber-500" />}
                        {(item as any).category === "Materials" && <Layers size={16} className="text-blue-500" />}
                        {(item as any).category === "Transport" && <Truck size={16} className="text-slate-400" />}
                        {!["Energy", "Materials", "Transport"].includes((item as any).category) && <Box size={16} className="text-emerald-500" />}
                     </>
                   )}
                   {activeTab === "Flows" && (
                     <>
                        {(item as any).subType === "Air" && <Wind size={16} className="text-blue-400" />}
                        {(item as any).subType === "Water" && <Droplets size={16} className="text-cyan-500" />}
                        {(item as any).subType === "Soil" && <Flame size={16} className="text-orange-500" />}
                        {(item as any).subType === "Technosphere" && <Box size={16} className="text-slate-500" />}
                     </>
                   )}
                   {activeTab === "Methods" && <Filter size={16} className="text-emerald-500" />}
                   {activeTab === "Sources" && <Database size={16} className="text-emerald-400 animate-pulse" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{(item as any).name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activeTab === "Processes" && (
                      <>
                        <span className="text-[9px] font-black px-1 rounded border border-slate-700 bg-slate-900 text-slate-500 uppercase">{(item as any).geography}</span>
                        <span className="text-[9px] text-slate-500 font-medium truncate">{(item as any).provider} v3.9</span>
                      </>
                    )}
                    {activeTab === "Flows" && <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{(item as any).type} Flow</span>}
                    {activeTab === "Methods" && <span className="text-[9px] text-slate-500 font-bold uppercase">{(item as any).indicator}</span>}
                    {activeTab === "Sources" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black px-1 py-0.5 bg-slate-900 rounded text-slate-500 border border-slate-700 uppercase">{(item as any).format}</span>
                        <span className="text-[9px] text-emerald-500/80 font-mono italic truncate">{dbConclusion((item as any).name)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {activeTab === "Processes" && (
                  <div title="View detailed LCI metadata for this functional process.">
                    <Info size={12} className="text-slate-600 cursor-help" />
                  </div>
                )}
                {activeTab === "Sources" && (
                  <div title="Export database inventory to local XLS.">
                    <Download size={12} className="text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className={`p-3 border-t flex justify-between items-center ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
           <Database size={10} />
           {activeDatabases.length} DB Loaded
         </span>
         <span className="text-[9px] font-bold text-emerald-500 uppercase">{filteredData.length} Entities</span>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
      `}</style>
    </div>
  );
}

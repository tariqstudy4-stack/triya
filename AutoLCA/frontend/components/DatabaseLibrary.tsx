"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Folder, ChevronRight, ChevronDown, Box, Zap, Truck, Layers, Search, Filter, Globe, Database, Info, Droplets, Wind, Flame, LayoutGrid, Library, Download, RefreshCw 
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLCAStore } from "../lib/lcaStore";

interface DatabaseLibraryProps {
  theme?: "dark" | "light";
  activeDatabases?: any[];
  onOpenManager?: () => void;
}

export default function DatabaseLibrary({ theme = "dark", onOpenManager, activeDatabases: propActiveDatabases }: DatabaseLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Processes" | "Flows" | "Methods" | "Sources">("Processes");
  const [backendData, setBackendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"LIVE" | "OFFLINE">("OFFLINE");

  const isDark = theme === "dark";
  const parentRef = useRef<HTMLDivElement>(null);
  const dbUpdateTrigger = useLCAStore((s) => s.dbUpdateTrigger);
  const triggerDbRefresh = useLCAStore((s) => s.triggerDbRefresh);
  const activeDatabases = useLCAStore((s) => s.activeDatabases);
  // Use prop if provided, otherwise fallback to store
  const effectiveDatabases = propActiveDatabases ?? activeDatabases;
  const setActiveDatabases = useLCAStore((s) => s.setActiveDatabases);

  // Connectivity & Metadata Initialization
  useEffect(() => {
    const initLibrary = async () => {
      try {
        const res = await fetch("/api/databases");
        if (res.ok) {
           const dbs = await res.json();
           setActiveDatabases(dbs);
           setBackendStatus("LIVE");
        }
      } catch (e) {
        setBackendStatus("OFFLINE");
      }
    };
    initLibrary();
  }, [dbUpdateTrigger, setActiveDatabases]);

  // Search Logic
  useEffect(() => {
    const fetchEntities = async () => {
      // Allow searching even if global health check is pending
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search-processes?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
           const data = await res.json();
           setBackendData(data);
           if (backendStatus === "OFFLINE") setBackendStatus("LIVE");
        }
      } catch (e) { 
        setBackendData([]);
      }
      setIsLoading(false);
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchEntities();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dbUpdateTrigger, backendStatus]);

  const groupedData = useMemo(() => {
     const groups: Record<string, any[]> = {};
     backendData.forEach(item => {
        const dbName = item.provider || "Industrial LCI";
        if (!groups[dbName]) groups[dbName] = [];
        groups[dbName].push(item);
     });
     return groups;
  }, [backendData]);

  const flatList = useMemo(() => {
    const list: any[] = [];
    Object.entries(groupedData).forEach(([group, items]) => {
      // Always show headers for clarity, even if only one database exists
      list.push({ isHeader: true, name: group });
      list.push(...items);
    });
    return list;
  }, [groupedData]);

  const rowVirtualizer = useVirtualizer({
    count: flatList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => flatList[index]?.isHeader ? 30 : 60,
    overscan: 10,
  });

  const handleDragStart = async (event: React.DragEvent, node: any) => {
    if (node.isHeader) {
      event.preventDefault();
      return;
    }

    // Signal Drag Start
    event.dataTransfer.setData("application/reactflow", "process");
    
    try {
      // Fetch full structured data including technosphere flows
      const res = await fetch(`/api/processes/${node.id}/full`);
      if (res.ok) {
        const fullData = await res.json();
        // Pack entire TriyaNodeData payload
        event.dataTransfer.setData("node_data", JSON.stringify({
           ...fullData,
           id: node.id // Carry the ID for reference
        }));
      } else {
        // Fallback
        event.dataTransfer.setData("node_data", JSON.stringify({
           label: node.name,
           category: node.category || "General",
           location: node.location || "GLO",
           source: node.provider,
           inputs: [],
           outputs: [{ id: "out-1", name: node.name, amount: 1.0, unit: "kg" }],
           elementary_flows: []
        }));
      }
    } catch (e) {
      console.error("Deep drag failed", e);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-all text-sm font-sans ${isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"}`}>
      <nav className={`flex p-1 border-b ${isDark ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
        {["Processes", "Flows", "Methods", "Sources"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all rounded ${activeTab === tab ? (isDark ? "bg-slate-800 text-emerald-400" : "bg-white text-emerald-600 shadow-sm") : "text-slate-500"}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <header className={`p-4 border-b ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
           <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Library size={12} className="text-emerald-500" />
              LCI Repository
           </h2>
           <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${
              backendStatus === "LIVE" 
              ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
              : (isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700')
           }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${backendStatus === "LIVE" ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {backendStatus}
           </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${backendData.length} library entities...`}
            className={`border rounded-lg pl-9 pr-3 py-2 w-full text-xs outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={parentRef}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = flatList[virtualRow.index];
            if (item.isHeader) {
              return (
                <div 
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full px-4 py-2 bg-slate-900/50 border-b border-slate-700 text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500"
                  style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                >
                  <Database size={8} className="inline mr-2" />
                  {item.name}
                </div>
              );
            }

            return (
              <div
                key={virtualRow.key}
                draggable={activeTab === "Processes"}
                onDragStart={(e) => handleDragStart(e, item)}
                className={`absolute top-0 left-0 w-full p-3 border-b flex items-center gap-3 ${isDark ? 'border-slate-700/30 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'} cursor-grab group transition-colors`}
                style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                   {item.category === "Energy" ? <Zap size={16} className="text-amber-500" /> : <Box size={16} className="text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold truncate text-white group-hover:text-emerald-400 transition-colors">{item.name}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${i < (5 - (item.dqi || 3)) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black px-1 rounded border border-slate-700 bg-slate-900 text-slate-500 uppercase flex items-center gap-1">
                      <Globe size={8} />
                      {item.location}
                    </span>
                    <span className="text-[9px] text-slate-600 font-medium truncate italic">{item.provider || "Industrial LCI"}</span>
                    <span className="text-[8px] font-bold text-slate-500 ml-auto">{item.version || "1.0.0"} | {item.data_year || 2023}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="p-3 border-t bg-slate-900/50 flex flex-col gap-2 border-slate-700">
         <div className="flex justify-between items-center">
            <button 
              onClick={onOpenManager}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-500 transition-all border border-emerald-500/20"
            >
               <Database size={12} />
               Manage Databases
            </button>
            <span className="text-[9px] font-bold text-emerald-500 uppercase">{backendData.length} Entities</span>
         </div>
         
         <button 
           disabled={isSyncing}
           onClick={async () => {
             setIsSyncing(true);
             try {
               const res = await fetch("/api/databases/ingest");
               if (res.ok) {
                  triggerDbRefresh();
                  const dbRes = await fetch("/api/databases");
                  if (dbRes.ok) setActiveDatabases(await dbRes.json());
                  setSyncSuccess(true);
                  setTimeout(() => setSyncSuccess(false), 3000);
               }
             } catch (e) {
               console.error("Sync failed", e);
             }
             setIsSyncing(false);
           }}
           className={`w-full py-2 border rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${
             syncSuccess 
             ? "bg-emerald-500 text-white border-emerald-400" 
             : "bg-emerald-600/10 hover:bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
           }`}
         >
            <RefreshCw size={10} className={`${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isSyncing ? "Scanning industrial databases..." : syncSuccess ? "Inventory Synchronized" : "Scan Industrial Inventory"}
         </button>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

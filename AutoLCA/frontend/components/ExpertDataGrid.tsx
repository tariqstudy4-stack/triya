"use client";

import React, { useState, useRef, useMemo } from "react";
import { Terminal, Database } from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLcaStore } from "@/lib/store";

type ExpertDataGridProps = {
  isExpertMode: boolean;
  selectedNode: any;
  onUpdate: (nodeId: string, data: any) => void;
  isInvalid?: boolean;
};

const UNITS = ["kg", "ton", "unit", "MJ", "kWh", "hr", "m3", "tkm"];

export function ExpertDataGrid({ isExpertMode, selectedNode, onUpdate }: ExpertDataGridProps) {
  const [activeTab, setActiveTab] = useState<"lci" | "mfa" | "metadata">("lci");
  const [dbSearchQuery, setDbSearchQuery] = useState("");
  const [dbResults, setDbResults] = useState<any[]>([]);

  const { updateNodeData } = useLcaStore();
  const nodeData = selectedNode?.data || {};
  const lci = nodeData.lci_parameters || {};
  const mfa = nodeData.mfa_parameters || {};
  const meta = nodeData.metadata || {};

  const handleDbSearch = async () => {
    if (!dbSearchQuery) return;
    try {
        const res = await fetch(`/api/search-db?query=${dbSearchQuery}`);
        if (res.ok) {
            const result = await res.json();
            setDbResults(result.exchanges || []);
        }
    } catch(e) { console.error(e) }
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: dbResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 10,
  });

  const massBalanceSum = useMemo(() => {
    if (!nodeData.exchanges) return 0;
    return nodeData.exchanges
      .filter((e: any) => e.flow_type === 'output')
      .reduce((acc: number, e: any) => acc + (e.transfer_rate ?? 1.0), 0);
  }, [nodeData.exchanges]);

  if (!isExpertMode) return null;

  return (
    <div className="fixed bottom-0 left-0 w-[calc(100%-400px)] h-[350px] bg-[hsl(220,14%,8%)] border-t border-white/10 z-30 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 font-mono">
      {/* Header Tabs with ISO Lexicon */}
      <div className="flex bg-[#1e1e1e] border-b border-white/5">
        <div className="px-4 py-2 border-r border-white/5 flex items-center gap-2 bg-[#2d2d2d] text-gray-300 text-xs text-[10px]">
          <Terminal className="w-3 h-3 text-[hsl(142,76%,60%)]" /> ISO Expert Terminal
        </div>
        <button onClick={() => setActiveTab("lci")} className={`px-4 py-2 border-r border-white/5 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === "lci" ? "text-blue-400 bg-white/5" : "text-gray-500 hover:bg-white/5"}`}>
          Technosphere Inventory Resource
        </button>
        <button onClick={() => setActiveTab("mfa")} className={`px-4 py-2 border-r border-white/5 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === "mfa" ? "text-yellow-400 bg-white/5" : "text-gray-500 hover:bg-white/5"}`}>
          Configure Mass Transfer Coefficients
        </button>
        <button onClick={() => setActiveTab("metadata")} className={`px-4 py-2 border-r border-white/5 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === "metadata" ? "text-red-400 bg-white/5" : "text-gray-500 hover:bg-white/5"}`}>
          DQI Pedigree Uncertainty Matrix
        </button>
        
        {activeTab === "mfa" && massBalanceSum > 1.0001 && (
           <div className="flex items-center px-4 py-2 bg-red-900/40 text-red-400 text-[10px] font-bold animate-pulse">
             ⚠️ MASS BALANCE VIOLATION: Σ TRANSFER ({massBalanceSum.toFixed(3)}) &gt; 1.0
           </div>
        )}

        <div className="ml-auto px-4 py-2 text-[10px] text-gray-600 flex items-center uppercase font-bold tracking-tighter">
            {selectedNode ? `Editing Element: ${selectedNode.id}` : "Awaiting System Selection"}
        </div>
      </div>

      {/* Content Space */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e] text-xs">
         {!selectedNode && (
            <div className="w-full h-full flex items-center justify-center text-gray-600 italic">Select an ISO process element on the canvas to configure Technosphere/Ecosphere parameters...</div>
         )}
         
         {/* Technosphere Search */}
         {selectedNode && activeTab === "lci" && (
            <div className="p-4 flex flex-col h-full gap-4">
              <div className="flex gap-2 w-full">
                <input 
                  type="text" 
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  placeholder="Seach Technosphere Inventory (e.g. Steel, PVC, Electricity)..."
                  className="flex-1 bg-[#252526] border border-[#3c3c3c] text-[#d4d4d4] px-3 py-1 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button onClick={handleDbSearch} className="bg-[#0e639c] text-white px-4 py-1 hover:bg-[#1177bb] transition-colors flex items-center gap-2"><Database className="w-3 h-3" /> Fetch LCI</button>
              </div>
              <div ref={parentRef} className="flex-1 border border-[#3c3c3c] rounded-sm overflow-auto bg-[#252526] h-full relative">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-[#333333] text-[#cccccc] sticky top-0 z-10">
                       <tr>
                          <th className="p-2 border-b border-r border-[#3c3c3c]">Technosphere Process</th>
                          <th className="p-2 border-b border-r border-[#3c3c3c]">LCI Context</th>
                          <th className="p-2 border-b border-r border-[#3c3c3c]">Reference Mass</th>
                          <th className="p-2 border-b border-[#3c3c3c]">Flow Direction</th>
                       </tr>
                    </thead>
                    <tbody className="text-[#d4d4d4]">
                       {dbResults.length > 0 ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const ex = dbResults[virtualRow.index];
                          return (
                          <tr key={virtualRow.index} className="hover:bg-[#2a2d2e] cursor-pointer absolute top-0 left-0 w-full flex" style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}>
                             <td className="p-2 border-b border-r border-[#3c3c3c] flex-1 truncate">
                               <div className="text-white font-bold">{ex.process_name}</div>
                               <div className="text-[10px] text-gray-500 truncate">{ex.flow_id}</div>
                             </td>
                             <td className="p-2 border-b border-r border-[#3c3c3c] w-32 flex items-center gap-1">
                               <span className="bg-blue-600/20 text-blue-400 px-1 py-0.5 rounded-[2px] text-[9px] font-bold border border-blue-500/20">[{ex.geography}]</span>
                               <span className="bg-purple-600/20 text-purple-400 px-1 py-0.5 rounded-[2px] text-[9px] font-bold border border-purple-500/20">[{ex.system_model?.replace('Allocation ', '')}]</span>
                             </td>
                             <td className="p-2 border-b border-r border-[#3c3c3c] w-24 text-[#b5cea8] font-bold flex items-center">{ex.amount}</td>
                             <td className="p-2 border-b border-[#3c3c3c] w-16 text-[#ce9178] flex items-center uppercase">{ex.type}</td>
                          </tr>
                       )}) : (
                          <tr><td colSpan={4} className="p-4 text-center text-gray-600">No LCI data retrieved. Execute computation against the technosphere index.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </div>
         )}

         {/* MFA / Mass Transfer */}
         {selectedNode && activeTab === "mfa" && (
            <div className="p-4 space-y-4">
               <h4 className="text-[#569cd6] font-bold uppercase tracking-widest text-[10px]"># Mass Balance Distribution & Economic Allocation Settings</h4>
               <div className="overflow-x-auto border border-[#3c3c3c]">
                 <table className="w-full text-left">
                   <thead className="bg-[#333333] text-[#cccccc]">
                     <tr>
                       <th className="p-2 text-[10px]">Technosphere / Ecosphere Flow</th>
                       <th className="p-2 text-[10px]">Classification</th>
                       <th className="p-2 text-[10px]">Deterministic Inventory</th>
                       <th className="p-2 text-[10px]">Standard Unit</th>
                       <th className="p-2 text-[10px]">Mass Transfer Rate (Σ≤1.0)</th>
                     </tr>
                   </thead>
                   <tbody>
                     {(nodeData.exchanges || []).map((ex: any, idx: number) => {
                        return (
                       <tr key={idx} className="border-b border-[#3c3c3c]">
                         <td className="p-2 text-white">{ex.flow_name}</td>
                         <td className={`p-2 uppercase font-bold text-[9px] ${ex.flow_type === 'input' ? 'text-blue-400' : 'text-orange-400'}`}>
                           {ex.flow_type === 'input' ? 'Technosphere Input' : 'Ecosphere Elementary Flow'}
                         </td>
                         <td className="p-2">
                            <input 
                              type="number" 
                              step="0.0001" 
                              value={ex.amount} 
                              onChange={(e) => {
                                const newEx = [...nodeData.exchanges];
                                newEx[idx] = { ...ex, amount: parseFloat(e.target.value) || 0 };
                                updateNodeData(selectedNode.id, { exchanges: newEx });
                              }}
                              className="w-full bg-[#252526] border border-[#3c3c3c] px-2 py-0.5 outline-none focus:border-blue-500" 
                            />
                         </td>
                         <td className="p-2">
                            <select 
                              value={ex.unit} 
                              onChange={(e) => {
                                const newEx = [...nodeData.exchanges];
                                newEx[idx] = { ...ex, unit: e.target.value };
                                updateNodeData(selectedNode.id, { exchanges: newEx });
                              }}
                              className="bg-[#252526] border border-[#3c3c3c] px-1 py-0.5 outline-none"
                            >
                              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                         </td>
                         <td className="p-2">
                            {ex.flow_type === 'output' ? (
                               <input 
                                 type="number" 
                                 step="0.01" 
                                 max="1" 
                                 value={ex.transfer_rate ?? 1.0} 
                                 onChange={(e) => {
                                   const newEx = [...nodeData.exchanges];
                                   newEx[idx] = { ...ex, transfer_rate: parseFloat(e.target.value) || 0 };
                                   updateNodeData(selectedNode.id, { exchanges: newEx });
                                 }}
                                 className={`w-full bg-[#252526] border px-2 py-0.5 outline-none focus:border-blue-500 ${massBalanceSum > 1.0001 ? 'border-red-500 bg-red-900/20' : 'border-[#3c3c3c]'}`} 
                               />
                            ) : <span className="text-gray-600">-</span>}
                         </td>
                       </tr>
                     )})}
                   </tbody>
                 </table>
               </div>
               
               <div className="bg-[#2d2d2d] p-3 border-l-4 border-yellow-500 font-mono mt-4 flex justify-between items-center">
                  <div>
                    <span className="text-[#c586c0]">Economic Allocation Method</span>: <span className="text-[#ce9178]">"{lci.allocation_method || "Physical"}"</span>
                  </div>
                  <div className="text-[10px] text-gray-500 italic">
                    Calculations follow ISO 14044 hierarchical mass conservation principles.
                  </div>
               </div>
            </div>
         )}

         {/* Pedigree / Metadata */}
         {selectedNode && activeTab === "metadata" && (
            <div className="p-4 grid grid-cols-2 gap-8 text-[#d4d4d4]">
               <div>
                  <h4 className="text-[#569cd6] font-bold mb-4 uppercase tracking-tighter text-[10px]"># DQI Pedigree Uncertainty Matrix (ISO 14040)</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center"><span className="text-gray-400">Reliability</span> <input type="number" min="1" max="5" defaultValue={meta.pedigree_matrix?.reliability || 1} className="w-20 bg-[#252526] border border-[#3c3c3c] px-2" /></div>
                     <div className="flex justify-between items-center"><span className="text-gray-400">Completeness</span> <input type="number" min="1" max="5" defaultValue={meta.pedigree_matrix?.completeness || 1} className="w-20 bg-[#252526] border border-[#3c3c3c] px-2" /></div>
                     <div className="flex justify-between items-center"><span className="text-gray-400">Temporal Correlation</span> <input type="number" min="1" max="5" defaultValue={meta.pedigree_matrix?.temporal_correlation || 1} className="w-20 bg-[#252526] border border-[#3c3c3c] px-2" /></div>
                     <div className="flex justify-between items-center"><span className="text-gray-400">Geographic Correlation</span> <input type="number" min="1" max="5" defaultValue={meta.pedigree_matrix?.geographical_correlation || 1} className="w-20 bg-[#252526] border border-[#3c3c3c] px-2" /></div>
                  </div>
               </div>
               <div>
                  <h4 className="text-[#569cd6] font-bold mb-4 uppercase tracking-tighter text-[10px]"># Execute Stochastic Uncertainty Analysis Settings</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400">Distribution Profile</span> 
                        <select className="bg-[#252526] border border-[#3c3c3c] px-2 w-32" defaultValue={meta.uncertainty_distribution || "Lognormal"}>
                           <option>Lognormal</option><option>Normal</option><option>Triangular</option>
                        </select>
                     </div>
                     <div className="flex justify-between items-center"><span className="text-gray-400">Regional Boundary</span> <input type="text" defaultValue={meta.geography || "GLO"} className="w-32 bg-[#252526] border border-[#3c3c3c] px-2 text-[#ce9178]" /></div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

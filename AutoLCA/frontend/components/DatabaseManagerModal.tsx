"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Upload, Database, CheckCircle2, AlertCircle, FileJson, 
  Trash2, ExternalLink, RefreshCw, BarChart3, Info, Lock
} from "lucide-react";
import { useLCAStore } from "../lib/lcaStore";

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
  activeDatabases?: any[];
  onImported?: (db: any) => void;
  onRemove?: (id: any) => void;
}

export default function DatabaseManagerModal({ 
  isOpen, 
  onClose, 
  theme = "dark", 
  activeDatabases: propDatabases,
  onImported,
  onRemove
}: DatabaseManagerModalProps) {
  const isDark = theme === "dark";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const triggerDbRefresh = useLCAStore((s) => s.triggerDbRefresh);
  const internalActiveDatabases = useLCAStore((s) => s.activeDatabases);
  const effectiveDatabases = propDatabases ?? internalActiveDatabases;
  const setActiveDatabases = useLCAStore((s) => s.setActiveDatabases);

  // Fetch all databases from persisted SQLite on open
  useEffect(() => {
    if (isOpen) {
      fetchDatabases();
    }
  }, [isOpen]);

  const fetchDatabases = async () => {
    try {
      const res = await fetch("/api/databases");
      if (res.ok) {
        const data = await res.json();
        setActiveDatabases(data);
      }
    } catch (e) {
      console.error("Failed to fetch databases", e);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-database", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully ingested ${data.entities_count} entities from ${file.name}` 
        });
        triggerDbRefresh();
        fetchDatabases();
      } else {
        const err = await res.json();
        setUploadStatus({ type: 'error', message: err.detail || "Upload failed" });
      }
    } catch (e) {
      setUploadStatus({ type: 'error', message: "Connection to LCI Engine failed." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDatabase = async (id: string) => {
    if (!confirm("Are you sure you want to remove this library from your industrial inventory? This action is irreversible.")) return;

    try {
      const res = await fetch(`/api/databases/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerDbRefresh();
        fetchDatabases();
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleSyncDatabase = async (id: string) => {
    try {
      const res = await fetch(`/api/databases/${id}/sync`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUploadStatus({ type: 'success', message: `Sync complete: Refreshed ${data.entities} entities.` });
        triggerDbRefresh();
        fetchDatabases();
      }
    } catch (e) {
      console.error("Sync failed", e);
      setUploadStatus({ type: 'error', message: "Database re-sync failed." });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
        
        {/* Header */}
        <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">
                 <Database size={24} className="text-white" />
              </div>
              <div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Industrial LCI Ingestion</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inventory Management & Federated Data Architecture</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
              <X size={24} />
           </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <div className="grid grid-cols-1 gap-8">
              
              {/* Upload Section */}
              <section className="relative p-10 border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-800/20 text-center group hover:border-emerald-500/50 transition-all">
                 <input 
                   type="file" 
                   className="absolute inset-0 opacity-0 cursor-pointer" 
                   onChange={handleFileUpload}
                   disabled={isUploading}
                 />
                 <div className="flex flex-col items-center gap-4">
                    <div className={`p-5 rounded-3xl bg-slate-900 border border-slate-700 transition-all ${isUploading ? 'animate-pulse scale-110 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'group-hover:scale-110 group-hover:border-emerald-500'}`}>
                       {isUploading ? <RefreshCw size={40} className="text-emerald-500 animate-spin" /> : <Upload size={40} className="text-emerald-500" />}
                    </div>
                    <div>
                       <h3 className="text-lg font-black uppercase tracking-widest text-white">Ingest New Database</h3>
                       <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Supports OpenLCA .zolca, .json-ld, and Standard Industrial .CSV</p>
                    </div>
                 </div>
              </section>

              {/* Status Alert */}
              {uploadStatus && (
                 <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-2 ${uploadStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {uploadStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{uploadStatus.message}</span>
                 </div>
              )}

              {/* Database List */}
              <section className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">Active Industrial Libraries ({effectiveDatabases.length})</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {effectiveDatabases.map((db: any) => (
                       <div key={db.id} className="p-6 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 flex items-center justify-between group hover:border-emerald-500/30 transition-all hover:bg-slate-800/60 shadow-xl">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700">
                                <FileJson size={20} className="text-blue-400" />
                             </div>
                             <div>
                                <h5 className="text-[11px] font-black uppercase text-white truncate max-w-[150px]">{db.name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[8px] font-black uppercase text-slate-500 px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">{db.format}</span>
                                   <span className="text-[8px] font-black uppercase text-emerald-500/60">{db.entities} ENTITIES</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-1">
                             <button 
                               onClick={() => handleSyncDatabase(db.id)}
                               title="Re-sync formulas & parameters"
                               className="p-3 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                             >
                                <RefreshCw size={16} />
                             </button>
                             <button 
                               onClick={() => handleDeleteDatabase(db.id)}
                               title="Remove database"
                               className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </div>
                    ))}
                    {effectiveDatabases.length === 0 && (
                       <div className="col-span-full py-10 text-center border border-slate-800 rounded-[2rem] border-dashed">
                          <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">No external databases ingested yet.</p>
                       </div>
                    )}
                 </div>
              </section>

           </div>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
           <div className="flex items-center gap-2 text-slate-500">
              <Info size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Federated Persistence: SQLite 3.0</span>
           </div>
           <button onClick={onClose} className="px-10 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl">Close Console</button>
        </footer>

      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

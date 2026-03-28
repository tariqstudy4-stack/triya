"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Database, 
  X, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileJson,
  Archive,
  Layers
} from "lucide-react";

type DBFormat = "ZOLCA" | "JSON" | "ZIP" | "GABI";

interface ImportedDB {
  id: string;
  name: string;
  format: DBFormat;
  size: string;
  status: "DECODING" | "ACTIVE" | "ERROR";
  entities: number;
}

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (db: ImportedDB) => void;
  activeDatabases: ImportedDB[];
  onRemove: (id: string) => void;
  theme: "dark" | "light";
}

export default function DatabaseManagerModal({ 
  isOpen, 
  onClose, 
  activeDatabases, 
  onRemove, 
  onImported,
  theme 
}: DatabaseManagerModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isDark = theme === "dark";

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulation of decoding/indexing large LCI databases
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        
        const format: DBFormat = file.name.endsWith(".zolca") ? "ZOLCA" : file.name.endsWith(".json") ? "JSON" : "ZIP";
        
        onImported({
          id: `db-${Date.now()}`,
          name: file.name,
          format,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          status: "ACTIVE",
          entities: format === "ZOLCA" ? 14200 : 580
        });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border transition-colors duration-500 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        
        {/* Header */}
        <header className={`p-6 border-b flex justify-between items-center ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Database className="text-emerald-500" size={24} />
             </div>
             <div>
               <h3 className={`text-lg font-black tracking-tight uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>LCI Database Manager</h3>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Import & Synchronize LCA Inventories</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/20 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
        </header>

        <div className="p-8 space-y-8">
          
          {/* Active Databases Section */}
          <div className="space-y-4">
             <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Project Databases</h4>
             <div className="space-y-2">
                {activeDatabases.length === 0 ? (
                  <div className={`p-10 rounded-xl border-2 border-dashed flex flex-col items-center justify-center space-y-3 opacity-50 ${isDark ? 'border-slate-800 bg-slate-800/20' : 'border-slate-200 bg-slate-50'}`}>
                     <Layers size={32} className="text-slate-500" />
                     <p className="text-xs font-medium text-slate-500">No external databases currently assigned to this project.</p>
                  </div>
                ) : (
                  activeDatabases.map(db => (
                    <div key={db.id} className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${isDark ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50'}`}>
                       <div className="flex items-center gap-4">
                          {db.format === "JSON" ? <FileJson className="text-blue-500" size={20} /> : <Archive className="text-amber-500" size={20} />}
                          <div>
                             <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{db.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">{db.format}</span>
                                <span className="text-[10px] text-slate-500">• {db.size}</span>
                                <span className="text-[10px] text-slate-500">• {db.entities.toLocaleString()} entities</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="text-emerald-500" size={16} />
                          <button 
                            onClick={() => onRemove(db.id)}
                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Import Dropzone */}
          <div className="space-y-4">
             <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Import New Schema (.zolca, .json)</h4>
             <div 
               onClick={() => !isUploading && fileInputRef.current?.click()}
               className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${isUploading ? 'border-blue-500 bg-blue-500/5' : (isDark ? 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-slate-200 hover:border-blue-500/30 hover:bg-blue-50/50')}`}
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".zolca,.json,.zip"
                  onChange={handleFileDrop}
                />
                
                {isUploading ? (
                  <div className="w-full max-w-xs space-y-4 flex flex-col items-center">
                     <RefreshCw className="text-blue-500 animate-spin" size={32} />
                     <div className="w-full space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                           <span>Decoding Schema</span>
                           <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                     </div>
                     <p className="text-[10px] text-slate-500 text-center italic">Extracting nodes, elementary flows, and characterization factors...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="text-slate-500 mb-3" size={32} />
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Drag and Drop Database Source</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Supports OpenLCA .zolca & ISO/TS 14048 JSON</p>
                  </>
                )}
             </div>
          </div>

        </div>

        <footer className={`p-6 border-t flex items-center gap-3 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
           <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <AlertCircle size={14} />
              <span>Imported data is stored in the local project instance</span>
           </div>
           <button 
             onClick={onClose}
             className="ml-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
           >
             Finish Sync
           </button>
        </footer>

      </div>
    </div>
  );
}

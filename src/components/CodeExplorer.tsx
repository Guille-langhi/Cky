import React, { useState } from "react";
import { PygameFile, Language } from "../types";
import { pygameCodebase } from "../data/pygameCodebase";
import { 
  FileCode, 
  Folder, 
  Terminal, 
  Download, 
  Play, 
  Copy, 
  Check, 
  Laptop, 
  FileText, 
  Info,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface CodeExplorerProps {
  language: Language;
}

export default function CodeExplorer({ language }: CodeExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<PygameFile>(pygameCodebase[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate downloadable Python file
  const handleDownloadFile = (file: PygameFile) => {
    const element = document.createElement("a");
    const fileBlob = new Blob([file.content], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quick download of the whole zip-like bundle instruction
  const handleDownloadAll = () => {
    // Generate a shell script or simple bundle downloader instructions
    const instructions = `# CKY Pygame Setup & Runner script
# Copy-paste this script or download the individual files to execute

# 1. Install Pygame:
pip install pygame

# 2. Run CKY:
python main.py
`;
    const element = document.createElement("a");
    const fileBlob = new Blob([instructions], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = "README_setup.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[580px] w-full">
      
      {/* File Explorer sidebar */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/80">
            <Folder className="w-5 h-5 text-yellow-500" />
            <h3 className="text-sm font-bold font-display text-white tracking-wider">
              {language === "es" ? "ESTRUCTURA DE ARCHIVOS" : "FILE STRUCTURE"}
            </h3>
          </div>

          <p className="text-[10px] text-slate-400 font-mono mb-4 leading-relaxed">
            {language === "es" 
              ? "Explora el código fuente estructurado en Python y Pygame según 'La Biblia del Proyecto'. Puedes usar este código directamente en tu PC."
              : "Explore the structured Python & Pygame source code directly based on 'The Project Bible'. You can use this code directly on your PC."
            }
          </p>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">
              CKY /
            </div>
            {pygameCodebase.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left font-mono text-xs transition-all ${
                    isSelected
                      ? "bg-yellow-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 ${isSelected ? "text-slate-950" : "text-yellow-500/80"}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isSelected ? "text-slate-950" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Installer / Runner Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-[9px] text-slate-400 space-y-1.5 leading-relaxed">
            <div className="font-bold text-slate-300 flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-yellow-500" />
              <span>{language === "es" ? "REQUISITOS DE PC" : "PC REQUIREMENTS"}</span>
            </div>
            <p>• Python 3.11</p>
            <p>• Pygame 2.5 (pip install pygame)</p>
            <p>• {language === "es" ? "Compatible con Windows 8.1 / 10 / 11" : "Windows 8.1 / 10 / 11 Compatible"}</p>
          </div>

          <button
            onClick={handleDownloadAll}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{language === "es" ? "DESCARGAR README SETUP" : "DOWNLOAD SETUP README"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor and file details */}
      <div className="flex-1 flex flex-col bg-slate-950">
        
        {/* Code Header Info Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-green-400" />
            <div>
              <span className="text-slate-400 text-xs">{selectedFile.path}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{selectedFile.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleCopy}
              className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-yellow-500" />}
              <span>{copied ? (language === "es" ? "Copiado!" : "Copied!") : (language === "es" ? "Copiar" : "Copy")}</span>
            </button>
            <button
              onClick={() => handleDownloadFile(selectedFile)}
              className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4 text-yellow-500" />
              <span>{language === "es" ? "Descargar" : "Download"}</span>
            </button>
          </div>
        </div>

        {/* Syntax-highlighted code viewport */}
        <div className="flex-1 p-4 overflow-auto bg-black/60 font-mono text-[11px] leading-relaxed text-green-400 select-all relative group max-h-[460px]">
          <div className="absolute top-2 right-2 text-[8px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded uppercase pointer-events-none select-none">
            PYTHON
          </div>
          <pre className="whitespace-pre">{selectedFile.content}</pre>
        </div>

        {/* Quick implementation instructions footer */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-start gap-2.5 text-[10px] font-mono text-slate-400">
          <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p>
            {language === "es"
              ? "Este código es parte de la arquitectura del juego detallada en la Sección 9. Configura un loop nativo de Pygame con soporte de máquina de estados."
              : "This code implements the game architecture detailed in Section 9. It sets up a native Pygame loop supporting a state machine."
            }
          </p>
        </div>

      </div>

    </div>
  );
}

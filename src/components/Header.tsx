import React from "react";
import { Sparkles, Terminal, Volume2, VolumeX, Globe, Gamepad2, Save, Smartphone } from "lucide-react";
import { Language } from "../types";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSilent: boolean;
  onToggleSound: () => void;
  onOpenSaveLoadModal?: (mode: "save" | "load") => void;
  onOpenGraphicsSettings?: () => void;
  onOpenAndroidModal?: () => void;
  onOpenAudioModal?: () => void;
}

export default function Header({
  language,
  onLanguageChange,
  isSilent,
  onToggleSound,
  onOpenSaveLoadModal,
  onOpenGraphicsSettings,
  onOpenAndroidModal,
  onOpenAudioModal,
}: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 text-slate-950">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display tracking-wider text-yellow-500 flex items-center gap-1.5">
            CKY <span className="text-emerald-400 text-xs font-mono px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 rounded-full font-bold">ANDROID</span>
          </h1>
          <p className="text-[10px] text-emerald-400/90 font-medium font-mono uppercase tracking-widest flex items-center gap-1">
            <span>●</span> {language === "es" ? "Juego Exclusivo para Android" : "Android Exclusive Game"}
          </p>
        </div>
      </div>

      {/* Center: Android Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-inner">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
          {language === "es" ? "ANDROID • 10PRINT_ STUDIOS" : "ANDROID • 10PRINT_ STUDIOS"}
        </span>
      </div>

      {/* Control Actions (Save/Load, Sound & Language toggles) */}
      <div className="flex items-center gap-2">
        
        {/* Graphics Engine Settings Button */}
        {onOpenGraphicsSettings && (
          <button
            onClick={onOpenGraphicsSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
            title={language === "es" ? "Configurar Motor Gráfico HD" : "HD Graphics Engine Settings"}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">{language === "es" ? "MOTOR HD" : "HD ENGINE"}</span>
          </button>
        )}

        {/* Android Edition & Install Button */}
        {onOpenAndroidModal && (
          <button
            onClick={onOpenAndroidModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
            title={language === "es" ? "Descargar APK Nativo de Android" : "Download Native Android APK"}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{language === "es" ? "APK ANDROID" : "ANDROID APK"}</span>
          </button>
        )}

        {/* Save / Load System Button */}
        {onOpenSaveLoadModal && (
          <button
            onClick={() => onOpenSaveLoadModal("save")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-yellow-400 hover:text-yellow-300 rounded-lg border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all shadow-sm active:scale-95"
            title={language === "es" ? "Guardar o Cargar Partida" : "Save or Load Game"}
          >
            <Save className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">{language === "es" ? "GUARDAR" : "SAVE"}</span>
          </button>
        )}

        {/* Silent Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-colors ${
            isSilent
              ? "text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400"
              : "text-yellow-500 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10"
          }`}
          title={isSilent ? (language === "es" ? "Activar sonido" : "Enable sound") : (language === "es" ? "Silenciar mundo" : "Mute world")}
        >
          {isSilent ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Audio Controls Modal Trigger */}
        {onOpenAudioModal && (
          <button
            onClick={onOpenAudioModal}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
            title={language === "es" ? "Ajustes de Sonido y BGM" : "Sound & BGM Settings"}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={() => onLanguageChange(language === "es" ? "en" : "es")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-lg border border-slate-800 bg-slate-900 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-yellow-500" />
          <span>{language === "es" ? "ES" : "EN"}</span>
        </button>

      </div>
    </header>
  );
}


import React, { useState } from "react";
import { Volume2, VolumeX, Music, Bell, X } from "lucide-react";
import { soundEngine } from "../lib/soundEngine";
import { Language } from "../types";

interface AudioControlsModalProps {
  language: Language;
  onClose: () => void;
}

export default function AudioControlsModal({ language, onClose }: AudioControlsModalProps) {
  const isEs = language === "es";
  const [bgmVol, setBgmVol] = useState<number>(() => soundEngine.getBgmVolume());
  const [sfxVol, setSfxVol] = useState<number>(() => soundEngine.getSfxVolume());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isAudioMuted());

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setBgmVol(v);
    soundEngine.setBgmVolume(v);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setSfxVol(v);
    soundEngine.setSfxVolume(v);
    soundEngine.playTone(440, "sine", 0.08);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
    if (!next) {
      soundEngine.playTone(520, "sine", 0.1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm">
              {isEs ? "Ajustes de Sonido y Música" : "Audio & Music Settings"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Mute Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold">
            {isEs ? "Silenciar Todo (Mute)" : "Mute All"}
          </span>
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all ${
              isMuted
                ? "bg-red-500/20 border border-red-500 text-red-400"
                : "bg-emerald-500/20 border border-emerald-500 text-emerald-300"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? (isEs ? "Silenciado" : "Muted") : (isEs ? "Activo" : "Active")}
          </button>
        </div>

        {/* BGM Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <Music className="w-3.5 h-3.5 text-pink-400" />
              {isEs ? "Música de Fondo (BGM)" : "Background Music (BGM)"}
            </span>
            <span className="text-slate-400 font-mono">{Math.round(bgmVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVol}
            onChange={handleBgmChange}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* SFX Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <Bell className="w-3.5 h-3.5 text-yellow-400" />
              {isEs ? "Efectos de Sonido (SFX)" : "Sound Effects (SFX)"}
            </span>
            <span className="text-slate-400 font-mono">{Math.round(sfxVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVol}
            onChange={handleSfxChange}
            className="w-full accent-yellow-500 cursor-pointer"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 mt-2"
        >
          {isEs ? "Listo" : "Done"}
        </button>
      </div>
    </div>
  );
}

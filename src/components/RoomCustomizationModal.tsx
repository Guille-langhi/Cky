import React, { useState } from "react";
import { X, Sparkles, Palette, Home, Check } from "lucide-react";
import { Language } from "../types";
import { soundEngine } from "../lib/soundEngine";

interface RoomCustomizationModalProps {
  language: Language;
  onClose: () => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

export default function RoomCustomizationModal({
  language,
  onClose,
  onShowNotification
}: RoomCustomizationModalProps) {
  const [poster, setPoster] = useState<string>(() => localStorage.getItem("cky_decor_poster") || "rock");
  const [bedspread, setBedspread] = useState<string>(() => localStorage.getItem("cky_decor_bedspread") || "purple");
  const [lights, setLights] = useState<string>(() => localStorage.getItem("cky_decor_lights") || "warm");

  const handleSaveDecor = (type: "poster" | "bedspread" | "lights", value: string) => {
    soundEngine.playSfx("purchase");
    if (type === "poster") {
      setPoster(value);
      localStorage.setItem("cky_decor_poster", value);
    } else if (type === "bedspread") {
      setBedspread(value);
      localStorage.setItem("cky_decor_bedspread", value);
    } else if (type === "lights") {
      setLights(value);
      localStorage.setItem("cky_decor_lights", value);
    }

    if (onShowNotification) {
      onShowNotification({
        icon: "🎨",
        titleEs: "¡Habitación Personalizada!",
        titleEn: "Room Customized!",
        subEs: "Tus elecciones de diseño fueron guardadas con éxito.",
        subEn: "Your design choices were saved successfully.",
        color: "purple"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/40 text-2xl">
              🎨
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-300">
                {language === "es" ? "Decoración de la Habitación" : "Bedroom Customization"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Personaliza el rincón privado de CKY" : "Customize CKY's private bedroom"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-80 pr-1">
          {/* 1. Póster de la Pared */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🖼️</span> {language === "es" ? "Póster en la Pared:" : "Wall Poster:"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "rock", labelEs: "Rock Nacional", labelEn: "Rock Band", icon: "🎸" },
                { id: "anime", labelEs: "Anime Retro 90s", labelEn: "Retro Anime", icon: "⭐" },
                { id: "cosmic", labelEs: "Orbe Cósmico", labelEn: "Cosmic Orb", icon: "🌌" },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSaveDecor("poster", item.id)}
                  className={`p-2 rounded-xl border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                    poster === item.id
                      ? "bg-indigo-950 border-indigo-500 text-indigo-300 font-bold shadow"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/40"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px]">{language === "es" ? item.labelEs : item.labelEn}</span>
                  {poster === item.id && <Check className="w-3 h-3 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cubrecama */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🛏️</span> {language === "es" ? "Cubrecama de la Cama:" : "Bedspread Style:"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "purple", labelEs: "Púrpura Místico", labelEn: "Mystic Purple", color: "bg-purple-900" },
                { id: "sky", labelEs: "Celeste Suave", labelEn: "Soft Sky Blue", color: "bg-sky-900" },
                { id: "rose", labelEs: "Rosa Seda", labelEn: "Silk Pink", color: "bg-rose-900" },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSaveDecor("bedspread", item.id)}
                  className={`p-2 rounded-xl border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                    bedspread === item.id
                      ? "bg-indigo-950 border-indigo-500 text-indigo-300 font-bold shadow"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/40"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full ${item.color} border border-slate-700 shadow-inner`} />
                  <span className="text-[10px]">{language === "es" ? item.labelEs : item.labelEn}</span>
                  {bedspread === item.id && <Check className="w-3 h-3 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Luces Guirnalda */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>💡</span> {language === "es" ? "Guirnalda de Luces:" : "Fairy String Lights:"}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "off", labelEs: "Apagada", labelEn: "Off", icon: "⚪" },
                { id: "warm", labelEs: "Luz Cálida", labelEn: "Warm Yellow", icon: "🟡" },
                { id: "neon", labelEs: "Neón RGB", labelEn: "Neon RGB", icon: "🟣" },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSaveDecor("lights", item.id)}
                  className={`p-2 rounded-xl border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                    lights === item.id
                      ? "bg-indigo-950 border-indigo-500 text-indigo-300 font-bold shadow"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/40"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px]">{language === "es" ? item.labelEs : item.labelEn}</span>
                  {lights === item.id && <Check className="w-3 h-3 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow cursor-pointer"
        >
          {language === "es" ? "Guardar Decoración" : "Save Decoration"}
        </button>
      </div>
    </div>
  );
}

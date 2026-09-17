import React, { useState } from "react";
import { Language } from "../types";
import { Shield, Sparkles, MapPin, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Swords, Flame, Skull } from "lucide-react";

interface Day8ObjectivesTrackerProps {
  language: Language;
  plazaDefended: boolean;
  hospitalDefended: boolean;
  terminalDefended: boolean;
  mallDefended: boolean;
  currentMap: string;
  onTravelTo: (mapId: "plaza_principal" | "hospital_municipal" | "bus_terminal" | "shopping_mall" | "street") => void;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
}

export default function Day8ObjectivesTracker({
  language,
  plazaDefended,
  hospitalDefended,
  terminalDefended,
  mallDefended,
  currentMap,
  onTravelTo,
  playSound,
}: Day8ObjectivesTrackerProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const isEs = language === "es";

  const completedCount = [plazaDefended, hospitalDefended, terminalDefended, mallDefended].filter(Boolean).length;
  const allDefended = completedCount === 4;

  const objectives = [
    {
      id: "plaza",
      mapId: "plaza_principal" as const,
      nameEs: "Plaza Principal",
      nameEn: "Main Plaza",
      enemyEs: "Coloso de las Sombras",
      enemyEn: "Shadow Colossus",
      icon: "⛲",
      defended: plazaDefended,
      descEs: "Un coloso astral ha corrompido la fuente y los senderos del parque.",
      descEn: "An astral colossus corrupted the fountain and park pathways."
    },
    {
      id: "hospital",
      mapId: "hospital_municipal" as const,
      nameEs: "Hospital Municipal",
      nameEn: "Municipal Hospital",
      enemyEs: "Espectro de la Peste",
      enemyEn: "Plague Specter",
      icon: "🏥",
      defended: hospitalDefended,
      descEs: "Un espectro tóxico está drenando las salas médicas y las camas de guardia.",
      descEn: "A toxic specter is draining the emergency rooms and hospital beds."
    },
    {
      id: "terminal",
      mapId: "bus_terminal" as const,
      nameEs: "Terminal de Ómnibus",
      nameEn: "Bus Terminal",
      enemyEs: "Leviatán del Asfalto",
      enemyEn: "Asphalt Leviathan",
      icon: "🚌",
      defended: terminalDefended,
      descEs: "Una bestia de alquitrán espectral bloquea la salida de colectivos y andenes.",
      descEn: "A beast of spectral tar blocks the departure gates and buses."
    },
    {
      id: "mall",
      mapId: "shopping_mall" as const,
      nameEs: "Centro Comercial",
      nameEn: "Shopping Mall",
      enemyEs: "Gárgola de Cristal",
      enemyEn: "Crystal Gargoyle",
      icon: "🛍️",
      defended: mallDefended,
      descEs: "Una gárgola sombría hace trizas las vidrieras y la fuente del shopping.",
      descEn: "A shadow gargoyle shatters shopfronts and the mall fountain."
    }
  ];

  return (
    <aside
      aria-label={isEs ? "Rastreador de Objetivos Día 8" : "Day 8 Objectives Tracker"}
      className="fixed top-20 right-4 z-40 max-w-sm w-full bg-slate-950/92 backdrop-blur-md border border-purple-500/50 rounded-2xl shadow-2xl text-slate-100 overflow-hidden animate-fade-in"
    >
      {/* Tracker Header */}
      <header className="p-3 bg-gradient-to-r from-purple-950/90 via-slate-900/90 to-red-950/80 border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-950/80 border border-red-500/60 rounded-lg text-red-400 animate-pulse">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black font-mono tracking-wider text-yellow-400 uppercase flex items-center gap-1.5">
              {isEs ? "DÍA 8: ATAQUE FINAL" : "DAY 8: FINAL ASSAULT"}
            </h3>
            <p className="text-[10px] font-mono text-purple-200">
              {isEs ? "Rastreador Táctico de Asedio" : "Tactical Siege Tracker"} • {completedCount}/4
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playSound?.(600, "sine", 0.1);
            setIsCollapsed(!isCollapsed);
          }}
          className="p-1 hover:bg-slate-800 text-slate-300 rounded-lg transition"
          title={isCollapsed ? (isEs ? "Expandir" : "Expand") : (isEs ? "Minimizar" : "Minimize")}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-800">
        <div
          className={`h-full transition-all duration-500 ${
            allDefended ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-red-500"
          }`}
          style={{ width: `${(completedCount / 4) * 100}%` }}
        />
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-2.5 max-h-[70vh] overflow-y-auto font-mono text-xs">
          {!allDefended ? (
            <p className="text-[11px] text-slate-300 leading-snug">
              {isEs
                ? "Elegí libremente el orden de defensa. Viajá a cada foco y destruí a los espíritus de la Vecina:"
                : "Freely choose your defense order. Travel to each zone and destroy the Neighbor's spirits:"}
            </p>
          ) : (
            <div className="p-2.5 bg-red-950/80 border border-red-500/80 rounded-xl space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{isEs ? "¡TODOS LOS FOCOS ASEGURADOS!" : "ALL ZONES SECURED!"}</span>
              </div>
              <p className="text-[11px] text-red-200">
                {isEs
                  ? "W sugiere confrontar a la Vecina en la puerta de su casa para terminar con esto."
                  : "W suggests confronting the Neighbor at her door to end this once and for all."}
              </p>
              <button
                onClick={() => {
                  playSound?.(750, "sine", 0.2);
                  onTravelTo("street");
                }}
                className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-red-950 cursor-pointer"
              >
                <Skull className="w-3.5 h-3.5" />
                {isEs ? "IR A LA PUERTA DE LA VECINA" : "GO TO NEIGHBOR'S DOOR"}
              </button>
            </div>
          )}

          {/* Objectives List */}
          <div className="space-y-1.5">
            {objectives.map((obj) => {
              const isHere = currentMap === obj.mapId;
              return (
                <div
                  key={obj.id}
                  className={`p-2 rounded-xl border transition-all ${
                    obj.defended
                      ? "bg-slate-900/50 border-emerald-500/40 text-slate-400"
                      : "bg-slate-900/90 border-slate-700 hover:border-purple-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{obj.icon}</span>
                      <div className="truncate">
                        <span
                          className={`font-bold block truncate ${
                            obj.defended ? "line-through text-emerald-400" : "text-slate-100"
                          }`}
                        >
                          {isEs ? obj.nameEs : obj.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          {isEs ? obj.enemyEs : obj.enemyEn}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {obj.defended ? (
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isEs ? "LIBERADA" : "SECURED"}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            playSound?.(680, "sine", 0.2);
                            onTravelTo(obj.mapId);
                          }}
                          className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                            isHere
                              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black animate-bounce"
                              : "bg-purple-600 hover:bg-purple-500 text-white"
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          {isHere
                            ? (isEs ? "¡AQUÍ!" : "HERE!")
                            : (isEs ? "DEFENDER" : "DEFEND")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>{isEs ? "Compañeros: CKY, W y Ángela" : "Party: CKY, W & Angela"}</span>
            <span className="text-yellow-400 font-bold">
              {allDefended ? (isEs ? "¡Victoria cercana!" : "Victory near!") : (isEs ? "En combate" : "In battle")}
            </span>
          </footer>
        </div>
      )}
    </aside>
  );
}

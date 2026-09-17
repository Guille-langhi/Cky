import React, { useState, useEffect } from "react";
import { 
  SaveSlotData, 
  SAVE_SLOTS, 
  getAllSaveSlots, 
  saveToSlot, 
  loadFromSlot, 
  deleteSaveSlot 
} from "../lib/saveSystem";
import { Language, GameState, OutfitType, CharacterStats, InventoryItem, PhoneChat, PhonePhoto, DiaryEntry, Companion, Position } from "../types";
import { Save, Download, Trash2, Clock, MapPin, User, Check, AlertTriangle, ShieldCheck, X } from "lucide-react";

interface SaveLoadModalProps {
  language: Language;
  mode: "save" | "load";
  onClose: () => void;
  onLoadGame: (saveData: SaveSlotData) => void;
  // Current game state to save when user clicks save
  getCurrentSavePayload: () => Omit<SaveSlotData, "id" | "slotName" | "timestamp" | "dateString" | "playtimeString" | "mapNameEs" | "mapNameEn">;
  isSilent?: boolean;
}

export default function SaveLoadModal({
  language,
  mode: initialMode,
  onClose,
  onLoadGame,
  getCurrentSavePayload,
  isSilent = false,
}: SaveLoadModalProps) {
  const [activeTab, setActiveTab] = useState<"save" | "load">(initialMode);
  const [slotsData, setSlotsData] = useState<Record<string, SaveSlotData | null>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmOverwriteId, setConfirmOverwriteId] = useState<string | null>(null);

  const reloadSlots = () => {
    setSlotsData(getAllSaveSlots());
  };

  useEffect(() => {
    reloadSlots();
  }, []);

  const playSoundEffect = (freq: number, type: OscillatorType = "sine") => {
    if (isSilent) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveToSlot = (slotId: string) => {
    const payload = getCurrentSavePayload();
    const success = saveToSlot(slotId, payload);
    if (success) {
      playSoundEffect(700, "sine");
      const slotDef = SAVE_SLOTS.find(s => s.id === slotId);
      const slotName = slotDef ? (language === "es" ? slotDef.nameEs : slotDef.nameEn) : slotId;
      showToast(
        language === "es"
          ? `¡Partida guardada con éxito en ${slotName}!`
          : `Game saved successfully in ${slotName}!`
      );
      reloadSlots();
      setConfirmOverwriteId(null);
    } else {
      playSoundEffect(200, "sawtooth");
      showToast(
        language === "es" ? "Error al guardar la partida" : "Error saving game"
      );
    }
  };

  const handleLoadSlot = (slotData: SaveSlotData) => {
    playSoundEffect(880, "sine");
    showToast(
      language === "es"
        ? `Cargando partida: ${slotData.slotName}...`
        : `Loading game: ${slotData.slotName}...`
    );
    setTimeout(() => {
      onLoadGame(slotData);
      onClose();
    }, 400);
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSaveSlot(slotId);
    playSoundEffect(300, "sawtooth");
    showToast(
      language === "es" ? "Ranura de guardado eliminada" : "Save slot deleted"
    );
    setConfirmDeleteId(null);
    reloadSlots();
  };

  const getOutfitLabel = (outfit: OutfitType) => {
    switch (outfit) {
      case "uniform": return language === "es" ? "Uniforme Escolar" : "School Uniform";
      case "pajamas": return language === "es" ? "Pijama" : "Pajamas";
      case "casual": return language === "es" ? "Ropa Casual" : "Casual Clothes";
      case "towel": return language === "es" ? "En Toalla" : "In Towel";
      case "naked": return language === "es" ? "Sin Ropa" : "Unclothed";
      default: return outfit;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-yellow-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500 rounded-2xl text-slate-950 shadow-lg">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display uppercase tracking-wider text-yellow-400">
                {language === "es" ? "Sistema de Guardado" : "Save System"}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {language === "es" ? "Gestiona tus ranuras de partida guardada" : "Manage your game save slots"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: GUARDAR / CARGAR */}
        <div className="flex items-center gap-2 mb-4 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab("save");
              playSoundEffect(450, "sine");
            }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "save"
                ? "bg-yellow-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {language === "es" ? "GUARDAR PARTIDA" : "SAVE GAME"}
          </button>
          
          <button
            onClick={() => {
              setActiveTab("load");
              playSoundEffect(450, "sine");
            }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "load"
                ? "bg-yellow-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {language === "es" ? "CARGAR PARTIDA" : "LOAD GAME"}
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-3 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Save Slots List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {SAVE_SLOTS.map((slot) => {
            const slotData = slotsData[slot.id];
            const isOccupied = !!slotData;
            const isAutosave = slot.isAutosave;

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  isOccupied
                    ? "bg-slate-900/90 border-slate-700 hover:border-yellow-500/50 shadow-lg"
                    : "bg-slate-950 border-slate-800/80 border-dashed hover:border-slate-700"
                }`}
              >
                {/* Slot Title & Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isAutosave
                        ? "bg-sky-950 border-sky-500/50 text-sky-400"
                        : "bg-slate-800 border-slate-700 text-yellow-400"
                    }`}>
                      {language === "es" ? slot.nameEs : slot.nameEn}
                    </span>

                    {isAutosave && (
                      <span className="text-[10px] font-mono text-sky-400/80 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {language === "es" ? "Automático" : "Automatic"}
                      </span>
                    )}
                  </div>

                  {isOccupied && slotData && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {slotData.dateString}
                    </span>
                  )}
                </div>

                {/* Slot Payload Content if occupied */}
                {isOccupied && slotData ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      
                      {/* Map Location */}
                      <div className="flex items-center gap-1.5 text-slate-200 col-span-2 sm:col-span-1">
                        <MapPin className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        <span className="truncate">
                          {language === "es" ? slotData.mapNameEs : slotData.mapNameEn}
                        </span>
                      </div>

                      {/* In-game Clock */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{slotData.playtimeString}</span>
                      </div>

                      {/* Level & Outfit */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Niv. {slotData.playerLevel} ({getOutfitLabel(slotData.currentOutfit)})</span>
                      </div>

                    </div>

                    {/* Stats mini bar */}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 px-1 pt-1">
                      <span>🍗 Hambre: {slotData.stats.hambre}%</span>
                      <span>💧 Sed: {slotData.stats.sed}%</span>
                      <span>✨ Higiene: {slotData.stats.higiene}%</span>
                      <span>🎒 Items: {slotData.inventory.length}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                      
                      {/* Load Button */}
                      <button
                        onClick={() => handleLoadSlot(slotData)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-mono text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {language === "es" ? "Cargar" : "Load"}
                      </button>

                      {/* Save/Overwrite Button (if not autosave in save mode) */}
                      {activeTab === "save" && !isAutosave && (
                        confirmOverwriteId === slot.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-amber-400 font-bold mr-1">
                              {language === "es" ? "¿Sobrescribir?" : "Overwrite?"}
                            </span>
                            <button
                              onClick={() => handleSaveToSlot(slot.id)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold rounded-lg transition"
                            >
                              {language === "es" ? "Sí" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmOverwriteId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white font-mono text-xs rounded-lg"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmOverwriteId(slot.id)}
                            className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-xl font-mono text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {language === "es" ? "Sobrescribir" : "Overwrite"}
                          </button>
                        )
                      )}

                      {/* Delete Slot Button */}
                      {!isAutosave && (
                        confirmDeleteId === slot.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-red-400 font-bold mr-1">
                              {language === "es" ? "¿Borrar?" : "Delete?"}
                            </span>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-lg transition"
                            >
                              {language === "es" ? "Sí" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white font-mono text-xs rounded-lg"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(slot.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                            title={language === "es" ? "Eliminar guardado" : "Delete save"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}

                    </div>
                  </div>
                ) : (
                  /* Empty Slot State */
                  <div className="flex items-center justify-between py-2 px-1">
                    <span className="text-xs font-mono text-slate-500 italic">
                      {language === "es" ? "Ranura Vacía - Sin datos" : "Empty Slot - No data"}
                    </span>

                    {activeTab === "save" && !isAutosave && (
                      <button
                        onClick={() => handleSaveToSlot(slot.id)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-mono text-xs font-bold rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {language === "es" ? "Guardar aquí" : "Save here"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer Info */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center font-mono text-[10px] text-slate-500 flex items-center justify-between">
          <span>{language === "es" ? "Almacenamiento Local (LocalStorage) Activo" : "LocalStorage Active"}</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white underline font-mono text-[11px]"
          >
            {language === "es" ? "Volver al Juego" : "Back to Game"}
          </button>
        </div>

      </div>
    </div>
  );
}

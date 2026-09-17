import React, { useState, useEffect } from "react";
import { 
  InventoryItem, 
  DiaryEntry, 
  Language, 
  CharacterStats, 
  Companion 
} from "../types";
import { 
  Briefcase, 
  BookOpen, 
  Map, 
  Settings, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  BookMarked,
  Activity,
  Users,
  Zap,
  Heart,
  Droplets,
  Utensils,
  Feather,
  Edit2,
  Check,
  Smartphone,
  Trophy,
  Shield,
  Award,
  Gem
} from "lucide-react";
import { ACHIEVEMENTS_LIST, getUnlockedAchievementIds } from "../data/achievements";
import { ACCESSORIES_DATABASE } from "../data/accessories";
import { AccessoryItem } from "../types";

interface JournalAndInventoryProps {
  language: Language;
  inventory: InventoryItem[];
  diaryEntries: DiaryEntry[];
  currentMapId: string;
  isSilent: boolean;
  onToggleSound: () => void;
  customKeys: { up: string; down: string; left: string; right: string };
  onUpdateKeys: (keys: { up: string; down: string; left: string; right: string }) => void;
  onResetGame: () => void;
  stats: CharacterStats;
  onUseItem?: (itemId: string) => void;
  twinName: string;
  onSetTwinName: (name: string) => void;
  pauName: string;
  onSetPauName: (name: string) => void;
  companions: Companion[];
  hasBackpack?: boolean;
  currentOutfit?: string;
  hasGroomed?: boolean;
  onToggleBackpack?: () => void;
  onOpenPhone?: () => void;
  onOpenSaveLoadModal?: (mode: "save" | "load") => void;
  onOpenDevModal?: () => void;
  currentDay?: number;
}

export default function JournalAndInventory({
  language,
  inventory,
  diaryEntries,
  currentMapId,
  isSilent,
  onToggleSound,
  customKeys,
  onUpdateKeys,
  onResetGame,
  stats,
  onUseItem,
  twinName,
  onSetTwinName,
  pauName,
  onSetPauName,
  companions,
  hasBackpack = false,
  currentOutfit = "pajamas",
  hasGroomed = false,
  onToggleBackpack,
  onOpenPhone,
  onOpenSaveLoadModal,
  onOpenDevModal,
  currentDay = 1
}: JournalAndInventoryProps) {
  const [selectedDiaryDay, setSelectedDiaryDay] = useState<number>(currentDay || 1);

  useEffect(() => {
    if (currentDay) {
      setSelectedDiaryDay(currentDay);
    }
  }, [currentDay]);

  const [activeSubTab, setActiveSubTab] = useState<
    "stats" | "inventory" | "companions" | "powers" | "diary" | "map" | "achievements" | "settings"
  >(currentMapId === "map" ? "map" : currentMapId === "diary" ? "diary" : "stats");

  const [achFilter, setAchFilter] = useState<"all" | "story" | "combat" | "secrets" | "lifestyle">("all");

  React.useEffect(() => {
    if (currentMapId === "map") {
      setActiveSubTab("map");
    } else if (currentMapId === "diary") {
      setActiveSubTab("diary");
    }
  }, [currentMapId]);

  const [invCategory, setInvCategory] = useState<"backpack" | "pockets" | "accessories">("backpack");
  
  // Equipped RPG Accessories State (Persistent in localStorage)
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cky_equipped_accessories");
      return saved ? JSON.parse(saved) : ["perfume_frances", "colgante_astral"];
    } catch {
      return ["perfume_frances", "colgante_astral"];
    }
  });

  const handleToggleEquip = (accId: string) => {
    setEquippedAccessories(prev => {
      let next: string[];
      if (prev.includes(accId)) {
        next = prev.filter(id => id !== accId);
      } else {
        if (prev.length >= 3) {
          next = [...prev.slice(1), accId];
        } else {
          next = [...prev, accId];
        }
      }
      try {
        localStorage.setItem("cky_equipped_accessories", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save equipped accessories", e);
      }
      return next;
    });
  };

  // Compute Active Accessory Stat Bonuses
  const activeBonuses = React.useMemo(() => {
    let atk = 0;
    let def = 0;
    let spd = 0;
    let eva = 0;
    let crit = 0;
    let mana = 0;

    equippedAccessories.forEach(accId => {
      const found = ACCESSORIES_DATABASE.find(a => a.id === accId);
      if (found?.statBonus) {
        if (found.statBonus.damageBoost) atk += found.statBonus.damageBoost;
        if (found.statBonus.speed) spd += found.statBonus.speed;
        if (found.statBonus.evasion) eva += found.statBonus.evasion;
        if (found.statBonus.critRate) crit += found.statBonus.critRate;
        if (found.statBonus.manaBoost) mana += found.statBonus.manaBoost;
        if (found.statBonus.healBoost) def += Math.floor(found.statBonus.healBoost / 2);
      }
    });

    return { atk, def, spd, eva, crit, mana };
  }, [equippedAccessories]);
  const [editingTwin, setEditingTwin] = useState<boolean>(false);
  const [editingPau, setEditingPau] = useState<boolean>(false);
  const [tempTwinName, setTempTwinName] = useState<string>(twinName || "Kael");
  const [tempPauName, setTempPauName] = useState<string>(pauName || "Pau");

  // Key configurations rebind local state
  const [upKey, setUpKey] = useState<string>(customKeys.up);
  const [downKey, setDownKey] = useState<string>(customKeys.down);
  const [leftKey, setLeftKey] = useState<string>(customKeys.left);
  const [rightKey, setRightKey] = useState<string>(customKeys.right);

  const handleApplyKeys = () => {
    onUpdateKeys({
      up: upKey,
      down: downKey,
      left: leftKey,
      right: rightKey,
    });
  };

  const handleSaveTwinName = () => {
    if (tempTwinName.trim()) {
      onSetTwinName(tempTwinName.trim());
      setEditingTwin(false);
    }
  };

  const handleSavePauName = () => {
    if (tempPauName.trim()) {
      onSetPauName(tempPauName.trim());
      setEditingPau(false);
    }
  };

  const backpackItems = inventory.filter((i) => i.category === "backpack" || !i.category);
  const pocketItems = inventory.filter((i) => i.category === "pockets");

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full">
      
      {/* Menu Title Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30">
            <Briefcase className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold font-display text-yellow-400 uppercase tracking-widest">
            {language === "es" ? "MENÚ PRINCIPAL DE CKY" : "CKY MAIN MENU"}
          </h2>
        </div>

        {/* Quick Backpack Equipment Action */}
        {onToggleBackpack && (
          <button
            onClick={onToggleBackpack}
            className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
              hasBackpack
                ? "bg-green-500/20 border-green-500/40 text-green-300 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300"
                : "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-300"
            }`}
            title={hasBackpack ? "Click para dejar la mochila" : "Click para equipar la mochila"}
          >
            <span>🎒</span>
            <span>
              {hasBackpack
                ? (language === "es" ? "Mochila: LLEVANDO" : "Backpack: EQUIPPED")
                : (language === "es" ? "Mochila: GUARDADA" : "Backpack: STORED")
              }
            </span>
          </button>
        )}
      </div>

      {/* Sub tabs navigation */}
      <div className="flex bg-slate-950/80 p-2 border-b border-slate-800 overflow-x-auto gap-1 scrollbar-thin">
        
        {/* Stats button */}
        <button
          onClick={() => setActiveSubTab("stats")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "stats"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{language === "es" ? "ESTADÍSTICAS" : "STATS"}</span>
        </button>

        {/* Inventory button */}
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "inventory"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{language === "es" ? "INVENTARIO" : "INVENTORY"}</span>
        </button>

        {/* Companions button */}
        <button
          onClick={() => setActiveSubTab("companions")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "companions"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === "es" ? "COMPAÑEROS" : "PARTY"}</span>
        </button>

        {/* Powers & XP button */}
        <button
          onClick={() => setActiveSubTab("powers")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "powers"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{language === "es" ? "PODERES" : "POWERS"}</span>
        </button>

        {/* Diary button */}
        <button
          onClick={() => setActiveSubTab("diary")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "diary"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === "es" ? "DIARIO" : "DIARY"}</span>
        </button>

        {/* Map button */}
        <button
          onClick={() => setActiveSubTab("map")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "map"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>{language === "es" ? "MAPA" : "MAP"}</span>
        </button>

        {/* Achievements button */}
        <button
          onClick={() => setActiveSubTab("achievements")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "achievements"
              ? "bg-slate-800 text-amber-400 border border-amber-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === "es" ? "LOGROS" : "TROPHIES"}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === "settings"
              ? "bg-slate-800 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{language === "es" ? "OPCIONES" : "SETTINGS"}</span>
        </button>

      </div>

      {/* Main Content Viewport */}
      <div className="p-4 bg-slate-900 min-h-[260px]">

        {/* 1. STATS VIEW */}
        {activeSubTab === "stats" && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-yellow-400" />
                <span>{language === "es" ? "Estadísticas Vitales de CKY" : "CKY Vital Statistics"}</span>
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Nivel {stats.level} ({stats.xp}/{stats.maxXp} XP)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Hambre (Hunger) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5" />
                    {language === "es" ? "Hambre" : "Hunger"}
                  </span>
                  <span className="text-amber-300 font-bold">{Math.round(stats.hambre)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, stats.hambre))}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
                  {language === "es" 
                    ? "Se consume a lo largo del día. Rellénalo con alimentos encontrables." 
                    : "Depletes during the day. Replenish with found food items."}
                </p>
              </div>

              {/* Sed (Thirst) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-sky-400 font-bold flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    {language === "es" ? "Sed" : "Thirst"}
                  </span>
                  <span className="text-sky-300 font-bold">{Math.round(stats.sed)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, stats.sed))}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
                  {language === "es" 
                    ? "Mantén a CKY hidratada con botellas de agua y bebidas." 
                    : "Keep CKY hydrated with water bottles and drinks."}
                </p>
              </div>

              {/* Perfume (Spiritual Mana) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-purple-400 font-bold flex items-center gap-1">
                    <Feather className="w-3.5 h-3.5" />
                    {language === "es" ? "Perfume (Maná Espiritual)" : "Perfume (Spiritual Mana)"}
                  </span>
                  <span className="text-purple-300 font-bold">{Math.round(stats.perfume)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, stats.perfume))}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
                  {language === "es" 
                    ? "Energía mística requerida para sostener y lanzar ataques de Espíritus." 
                    : "Mystic energy needed to sustain and launch Spirit attacks."}
                </p>
              </div>

              {/* Amor (Twin Bond) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {language === "es" ? "Amor (Vínculo Gemelar)" : "Love (Twin Bond)"}
                  </span>
                  <span className="text-rose-300 font-bold">{Math.round(stats.amor)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-pink-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, stats.amor))}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
                  {language === "es" 
                    ? "Aumenta interactuando con tu Gemelo. Potencia el daño de batalla conjunto." 
                    : "Increases by interacting with your Twin. Boosts joint battle power."}
                </p>
              </div>

              {/* Higiene (Hygiene) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {language === "es" ? "Higiene Personal" : "Personal Hygiene"}
                  </span>
                  <span className="text-emerald-300 font-bold">{Math.round(stats.higiene ?? 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, stats.higiene ?? 100))}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
                  {language === "es" 
                    ? "Se consume con la rutina diaria. Rellénala aseándote en el baño o lavándote las manos." 
                    : "Depletes during daily routine. Replenish by washing up in the bathroom or sink."}
                </p>
              </div>

              {/* Energía del Celular (Phone Battery) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-lime-400 font-bold flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    {language === "es" ? "Energía del Celular" : "Phone Battery"}
                  </span>
                  <span className="text-lime-300 font-bold">{Math.round(stats.bateriaCelular ?? 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-lime-600 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, stats.bateriaCelular ?? 100))}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
                  {language === "es" 
                    ? "Se gasta con el uso del teléfono y se recarga en la mesa de luz o cargadores." 
                    : "Drains with phone usage and recharges on the bedside table or chargers."}
                </p>
              </div>

              {/* Billetera y Recursos Económicos */}
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span>💵</span>
                    {language === "es" ? "Billetera de CKY" : "CKY's Wallet"}
                  </span>
                  <span className="text-amber-300 font-bold text-sm">${(stats.money ?? 0).toLocaleString()} ARS</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">
                  {language === "es"
                    ? "Dinero obtenido en misiones, la plantita de mamá ($500) y el tesoro de las Ruinas ($50.000). Se usa en el Shopping Mall y locales."
                    : "Cash earned from quests, mom's plant ($500) and the Ruins treasure ($50,000). Spend it at the Mall & shops."}
                </p>
              </div>

              {/* Estado de Buffs Activos */}
              <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400 font-bold flex items-center gap-1">
                    <span>✨</span>
                    {language === "es" ? "Efectos & Buffs Activos" : "Active Effects & Buffs"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {stats.speedBuff ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span>👟</span> {language === "es" ? "Velocidad Pro (+Running)" : "Pro Speed (+Running)"}
                    </span>
                  ) : null}
                  {stats.perfumeBuff ? (
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span>🌸</span> {language === "es" ? "Aura Francesa (Nuit Éthérée)" : "French Aura (Nuit Éthérée)"}
                    </span>
                  ) : null}
                  {!stats.speedBuff && !stats.perfumeBuff && (
                    <span className="text-[10px] text-slate-500 italic">
                      {language === "es" ? "Sin buffs activos actualmente." : "No active buffs right now."}
                    </span>
                  )}
                </div>
              </div>

              {/* Atributos RPG de Combate y Bonificadores de Accesorios */}
              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40 col-span-1 sm:col-span-2 shadow-lg">
                <div className="flex items-center justify-between text-xs mb-2 pb-1.5 border-b border-cyan-500/20">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>{language === "es" ? "Atributos de Combate RPG" : "RPG Combat Attributes"}</span>
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">
                    {language === "es" ? "Calculado con Nivel + Accesorios" : "Level + Accessories Scaled"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <p className="text-[9px] text-slate-400 uppercase">Ataque (ATK)</p>
                    <p className="text-sm font-black text-amber-300">
                      {25 + (stats.level || 1) * 4 + activeBonuses.atk}
                      {activeBonuses.atk > 0 && <span className="text-[10px] text-emerald-400"> (+{activeBonuses.atk})</span>}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <p className="text-[9px] text-slate-400 uppercase">Defensa (DEF)</p>
                    <p className="text-sm font-black text-cyan-300">
                      {15 + (stats.level || 1) * 3 + activeBonuses.def}
                      {activeBonuses.def > 0 && <span className="text-[10px] text-emerald-400"> (+{activeBonuses.def})</span>}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <p className="text-[9px] text-slate-400 uppercase">Velocidad (SPD)</p>
                    <p className="text-sm font-black text-lime-300">
                      {12 + activeBonuses.spd}
                      {activeBonuses.spd > 0 && <span className="text-[10px] text-emerald-400"> (+{activeBonuses.spd})</span>}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <p className="text-[9px] text-slate-400 uppercase">Evasión (EVA)</p>
                    <p className="text-sm font-black text-purple-300">
                      {8 + activeBonuses.eva}%
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                    <p className="text-[9px] text-slate-400 uppercase">Crítico (CRIT)</p>
                    <p className="text-sm font-black text-rose-300">
                      {10 + activeBonuses.crit}%
                    </p>
                  </div>
                </div>

                {/* Ranuras de Accesorios Equipados */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Gem className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-[10px] text-slate-300 font-bold uppercase">
                      {language === "es" ? "Ranuras de Accesorios:" : "Accessory Slots:"}
                    </span>
                    <div className="flex gap-1.5">
                      {ACCESSORIES_DATABASE.map(acc => {
                        const isEquipped = equippedAccessories.includes(acc.id);
                        if (!isEquipped) return null;
                        return (
                          <span 
                            key={acc.id}
                            className="text-[10px] bg-purple-950/80 text-purple-200 border border-purple-500/50 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"
                            title={acc.nameEs}
                          >
                            <span>{acc.icon}</span>
                            <span className="hidden sm:inline">{acc.nameEs.split(" ")[0]}</span>
                          </span>
                        );
                      })}
                      {equippedAccessories.length === 0 && (
                        <span className="text-[10px] text-slate-500 italic">
                          {language === "es" ? "Ningún accesorio equipado" : "No accessories equipped"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubTab("inventory");
                      setInvCategory("accessories");
                    }}
                    className="text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>💍</span>
                    <span>{language === "es" ? "Cambiar Accesorios" : "Manage Accessories"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. INVENTORIES VIEW (Mochila vs Bolsillos) */}
        {activeSubTab === "inventory" && (
          <div className="space-y-3 font-mono">
            
            {/* Wallet Banner */}
            <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">💵</span>
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                    {language === "es" ? "Saldo Disponible en Billetera" : "Available Wallet Balance"}
                  </span>
                  <p className="text-xs font-bold text-white">
                    ${(stats.money ?? 0).toLocaleString()} <span className="text-[10px] text-amber-400">ARS</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                {language === "es" ? "Compras: Shopping Mall / Panchería" : "Shops: Shopping Mall / Hot Dogs"}
              </span>
            </div>

            {/* Category selection bar & Backpack Status */}
            <div className="flex flex-col sm:flex-row gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex gap-2 flex-1">
                <button
                  onClick={() => setInvCategory("backpack")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    invCategory === "backpack"
                      ? "bg-yellow-500 text-slate-950 shadow-md"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>🎒</span>
                  <span>{language === "es" ? "Mochila (Misiones)" : "Backpack (Missions)"}</span>
                  <span className="text-[10px] opacity-75">({backpackItems.length})</span>
                </button>

                <button
                  onClick={() => setInvCategory("pockets")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    invCategory === "pockets"
                      ? "bg-yellow-500 text-slate-950 shadow-md"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>👖</span>
                  <span>{language === "es" ? "Bolsillos" : "Pockets"}</span>
                  <span className="text-[10px] opacity-75">({pocketItems.length})</span>
                </button>

                <button
                  onClick={() => setInvCategory("accessories")}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    invCategory === "accessories"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md font-extrabold"
                      : "bg-slate-950 text-purple-400 hover:text-white border border-purple-900/50"
                  }`}
                >
                  <span>💍</span>
                  <span>{language === "es" ? "Accesorios" : "Accessories"}</span>
                  <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.2 rounded font-mono">
                    {equippedAccessories.length}/3
                  </span>
                </button>
              </div>

              {onToggleBackpack && (
                <button
                  onClick={onToggleBackpack}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                    hasBackpack
                      ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                      : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  <span>{hasBackpack ? "🏠" : "🎒"}</span>
                  <span>
                    {hasBackpack
                      ? (language === "es" ? "Dejar Mochila" : "Leave Backpack")
                      : (language === "es" ? "Tomar Mochila" : "Take Backpack")
                    }
                  </span>
                </button>
              )}
            </div>

            {/* Accessories View (RPG Equipment Slots) */}
            {invCategory === "accessories" ? (
              <div className="space-y-3">
                <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-pink-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {language === "es" ? "Armario & Reliquias de Combate" : "Wardrobe & Combat Relics"}
                      </h4>
                      <p className="text-[10px] text-purple-300">
                        {language === "es" 
                          ? "Equipa hasta 3 accesorios para potenciar a CKY y su grupo en batallas." 
                          : "Equip up to 3 accessories to boost CKY and her party in battle."}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-purple-900/80 text-purple-200 border border-purple-400/40">
                    {equippedAccessories.length} / 3 {language === "es" ? "ACTIVAS" : "ACTIVE"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACCESSORIES_DATABASE.map((acc) => {
                    const isEquipped = equippedAccessories.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isEquipped
                            ? "bg-slate-950 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                                {acc.icon}
                              </span>
                              <div>
                                <h5 className="font-bold text-xs text-white">
                                  {language === "es" ? acc.nameEs : acc.nameEn}
                                </h5>
                                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                                  {language === "es" ? acc.bonusEs : acc.bonusEn}
                                </span>
                              </div>
                            </div>
                            {isEquipped && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                                {language === "es" ? "EQUIPADO" : "EQUIPPED"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                            {language === "es" ? acc.descEs : acc.descEn}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-mono">
                            {acc.statBonus.damageBoost ? `+${acc.statBonus.damageBoost}% ATK ` : ""}
                            {acc.statBonus.speed ? `+${acc.statBonus.speed} SPD ` : ""}
                            {acc.statBonus.evasion ? `+${acc.statBonus.evasion}% EVA ` : ""}
                            {acc.statBonus.critRate ? `+${acc.statBonus.critRate}% CRIT ` : ""}
                            {acc.statBonus.healBoost ? `+${acc.statBonus.healBoost}% HEAL ` : ""}
                          </span>
                          <button
                            onClick={() => handleToggleEquip(acc.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                              isEquipped
                                ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                                : "bg-purple-600 hover:bg-purple-500 text-white shadow-md"
                            }`}
                          >
                            {isEquipped
                              ? (language === "es" ? "Desequipar" : "Unequip")
                              : (language === "es" ? "Equipar Ranura" : "Equip Slot")
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : invCategory === "backpack" && !hasBackpack ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-950 border border-dashed border-amber-500/30 rounded-2xl text-center">
                <div className="p-3 bg-amber-500/10 rounded-2xl mb-3 text-2xl text-amber-400">
                  🎒
                </div>
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                  {language === "es" ? "Mochila no equipada" : "Backpack Not Equipped"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                  {language === "es"
                    ? "No estás llevando la mochila encima. Solo puedes llevar cuadernos, agua y objetos de misión cuando la tomes."
                    : "You are not carrying your backpack right now. You can only carry notebooks, water, and mission supplies when equipped."}
                </p>
                {onToggleBackpack && (
                  <button
                    onClick={onToggleBackpack}
                    className="mt-4 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold font-mono rounded-xl shadow transition-all flex items-center gap-2"
                  >
                    <span>🎒</span>
                    <span>{language === "es" ? "Tomar la Mochila Ahora" : "Take Backpack Now"}</span>
                  </button>
                )}
              </div>
            ) : (
              /* Items Grid when equipped or when checking Pockets */
              ((invCategory === "backpack" ? backpackItems : pocketItems).length > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(invCategory === "backpack" ? backpackItems : pocketItems).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all relative"
                    >
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xl text-yellow-400">
                        {item.icon}
                      </div>
                      <div className="flex-1 pr-2">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {language === "es" ? item.nameEs : item.nameEn}
                          {item.isKey && (
                            <span className="text-[8px] uppercase font-bold bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/20">
                              {language === "es" ? "Clave" : "Key"}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {language === "es" ? item.descEs : item.descEn}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          {item.id === "phone" && onOpenPhone && (
                            <button
                              onClick={onOpenPhone}
                              className="py-1 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded text-[10px] font-bold transition-all flex items-center gap-1"
                            >
                              <span>📱</span>
                              <span>{language === "es" ? "Abrir Celular" : "Open Phone"}</span>
                            </button>
                          )}

                          {item.effect && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                              {item.effect.type === "hambre" && `🍗 +${item.effect.amount}% Hambre`}
                              {item.effect.type === "sed" && `💧 +${item.effect.amount}% Sed`}
                              {item.effect.type === "perfume" && `🌸 +${item.effect.amount}% Perfume`}
                              {item.effect.type === "amor" && `❤️ +${item.effect.amount}% Amor`}
                              {item.effect.type === "higiene" && `🧼 +${item.effect.amount}% Higiene`}
                              {item.effect.type === "speed_buff" && `👟 +Velocidad`}
                              {item.effect.type === "outfit" && `👗 Equipar`}
                              {item.effect.type === "water_bottle" && `🧴 Recargar / Beber`}
                              {item.effect.type === "money" && `💵 +$${item.effect.amount}`}
                            </span>
                          )}

                          {item.usable && onUseItem && (
                            <button
                              onClick={() => onUseItem(item.id)}
                              className="py-1 px-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded text-[10px] font-bold transition-all flex items-center gap-1"
                            >
                              <span>⚡</span>
                              <span>
                                {item.effect?.type === "outfit"
                                  ? (language === "es" ? "Ponerse" : "Equip")
                                  : (language === "es" ? "Usar / Consumir" : "Use / Consume")}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 font-mono text-xs">
                  <Briefcase className="w-8 h-8 mb-2 opacity-25" />
                  <span>
                    {language === "es"
                      ? invCategory === "backpack"
                        ? "Tu mochila está vacía por el momento"
                        : "Tus bolsillos están vacíos"
                      : invCategory === "backpack"
                        ? "Your backpack is currently empty"
                        : "Your pockets are empty"}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        {/* 3. COMPANIONS VIEW (Divided into 3 Categories) */}
        {activeSubTab === "companions" && (
          <div className="space-y-4 font-mono text-xs">
            
            {/* Category 1: Gemelo (Twin Hybrid) */}
            <div className="p-3.5 bg-slate-950 border border-purple-500/40 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/20 border-b border-l border-purple-500/30 text-[9px] font-bold text-purple-300 uppercase rounded-bl-xl">
                1. Gemelo Híbrido
              </div>

              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-2xl p-2 bg-purple-950 border border-purple-500/30 rounded-xl">♊</span>
                <div>
                  <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">
                    {language === "es" ? "Espíritu + Humano (Misma Alma)" : "Spirit + Human (Same Soul)"}
                  </span>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{twinName || "Gemelo Cónyuge"}</span>
                    <button
                      onClick={() => {
                        setTempTwinName(twinName || "Kael");
                        setEditingTwin(!editingTwin);
                      }}
                      className="text-slate-400 hover:text-yellow-400 text-[10px] flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      title="Cambiar nombre"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>{language === "es" ? "Renombrar" : "Rename"}</span>
                    </button>
                  </h4>
                </div>
              </div>

              {editingTwin && (
                <div className="mt-2 mb-3 p-2 bg-slate-900 rounded-lg border border-yellow-500/40 flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTwinName}
                    onChange={(e) => setTempTwinName(e.target.value)}
                    placeholder={language === "es" ? "Nombre de tu Gemelo..." : "Your Twin's name..."}
                    className="bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    onClick={handleSaveTwinName}
                    className="py-1 px-3 bg-yellow-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{language === "es" ? "Guardar" : "Save"}</span>
                  </button>
                </div>
              )}

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-[10px] text-purple-200 leading-relaxed">
                  {language === "es" 
                    ? "✨ Al ser gemelos, sus estadísticas y daño bajan y suben en simultáneo como si fueran una sola persona. El vínculo de Amor potencia las batallas." 
                    : "✨ As twins, your stats and damage rise and fall simultaneously as one person. The Love bond boosts battle power."}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Vínculo de Amor: <strong className="text-rose-400">{Math.round(stats.amor)}%</strong></span>
                  <span>Nivel de Combate: <strong className="text-yellow-400">{stats.level}</strong></span>
                </div>
              </div>
            </div>

            {/* Category 2: Espíritus (Compañeros Místicos de Batalla) */}
            <div className="p-3.5 bg-slate-950 border border-sky-500/30 rounded-2xl relative">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>2. Espíritus Compañeros</span>
                </h4>
                <span className="text-[9px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Consumen Perfume (Maná)
                </span>
              </div>

              <p className="text-[10px] text-slate-400 mb-2.5 leading-relaxed">
                {language === "es"
                  ? "Espíritus aliados que luchan contra los espíritus oscuros del Limbo. Se alimentan de la energía espiritual de CKY."
                  : "Allied spirits fighting dark limbo entities. They feed on CKY's spiritual perfume energy."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-slate-950 border border-slate-800 rounded-lg">🕊️</span>
                  <div>
                    <h5 className="font-bold text-white text-xs">HERMES</h5>
                    <p className="text-[9px] text-sky-300 font-semibold">Guardián del Limbo</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {language === "es" ? "Abre portales y revela objetos ocultos." : "Opens portals and reveals hidden objects."}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 border border-purple-500/30 rounded-xl flex items-center gap-2.5 relative overflow-hidden">
                  <span className="text-2xl p-1.5 bg-purple-950/60 border border-purple-500/40 rounded-lg">🧖‍♂️</span>
                  <div>
                    <h5 className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                      <span>W (Espíritu Cambiaformas)</span>
                      <span className="text-[8px] bg-purple-900 text-purple-200 px-1 py-0.2 rounded border border-purple-700">Protector</span>
                    </h5>
                    <p className="text-[9px] text-purple-300 font-semibold">Espíritu Guardián Ancestral</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                      {language === "es" 
                        ? "Creado para proteger a la heredera. Es serio, un poco ingenuo y cambia de forma (¡como toalla!). Blanco de los chistes de Ángela." 
                        : "Created to protect the heir. Serious, slightly naive, shapeshifts (like into a towel!). Target of Angela's jokes."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category 3: Humanos (Amigos y Enemigos) */}
            <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Humanos de la Trama</span>
              </h4>

              <div className="space-y-2">
                {/* Amigos Sub-header & List */}
                <div className="p-2.5 bg-slate-900 rounded-xl border border-emerald-500/20">
                  <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5">
                    <span>💚</span>
                    <span>{language === "es" ? "Amigos & Familia" : "Friends & Family"}</span>
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">👩</span>
                    <div>
                      <h5 className="font-bold text-white text-xs">
                        {language === "es" ? "Mamá" : "Mom"}
                      </h5>
                      <p className="text-[9px] text-slate-400">
                        {language === "es" ? "Madre cariñosa. Debe ser protegida del mundo oculto." : "Loving mother. Must be kept safe from the hidden world."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enemigos Sub-header & List */}
                <div className="p-2.5 bg-slate-900 rounded-xl border border-red-500/30">
                  <span className="text-[9px] font-bold uppercase text-red-400 tracking-wider flex items-center gap-1 mb-1.5">
                    <span>🔴</span>
                    <span>{language === "es" ? "Enemigos & Rivales" : "Enemies & Rivals"}</span>
                  </span>
                  <div className="flex items-center gap-2.5 justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">👩‍🎤</span>
                      <div>
                        <h5 className="font-bold text-white text-xs flex items-center gap-2">
                          <span>{pauName || "Pau"}</span>
                          <button
                            onClick={() => {
                              setTempPauName(pauName || "Pau");
                              setEditingPau(!editingPau);
                            }}
                            className="text-slate-400 hover:text-yellow-400 text-[10px] flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                            title="Cambiar nombre de Pau"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>{language === "es" ? "Renombrar" : "Rename"}</span>
                          </button>
                        </h5>
                        <p className="text-[9px] text-slate-400">
                          {language === "es" ? "Rival escolar que sospecha de tu doble vida espiritual." : "School rival suspicious of your double spiritual life."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {editingPau && (
                    <div className="mt-2 p-2 bg-slate-950 rounded-lg border border-red-500/40 flex items-center gap-2">
                      <input
                        type="text"
                        value={tempPauName}
                        onChange={(e) => setTempPauName(e.target.value)}
                        placeholder={language === "es" ? "Nombre de tu rival..." : "Your rival's name..."}
                        className="bg-slate-900 border border-slate-800 text-white rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleSavePauName}
                        className="py-1 px-3 bg-red-500 text-white font-bold rounded text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>{language === "es" ? "Guardar" : "Save"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* La Vecina: Antagonista Principal */}
                <div className="p-3 bg-slate-900/90 rounded-xl border-2 border-red-600/50 relative overflow-hidden shadow-lg shadow-red-950/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold uppercase text-red-400 bg-red-950/70 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>☠️</span>
                      <span>{language === "es" ? "Villana Principal / Mente Maestra" : "Main Villain / Mastermind"}</span>
                    </span>
                    <span className="text-[9px] text-red-300 font-mono">Peligro: SSS</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-1 bg-red-950/40 border border-red-500/30 rounded-lg">🦹‍♀️</span>
                    <div className="flex-1">
                      <h5 className="font-bold text-red-200 text-xs flex items-center gap-1.5">
                        <span>{language === "es" ? "La Vecina de al Lado" : "The Neighbor Next Door"}</span>
                        <span className="text-[8px] bg-purple-950 text-purple-300 px-1 rounded border border-purple-800">Oculta</span>
                      </h5>
                      <p className="text-[9px] text-slate-300 mt-1 leading-relaxed">
                        {language === "es"
                          ? "Finge ser una vecina cordial y común, pero en secreto es la causante de las anomalías del Limbo, la tragedia de Ángela y las sombras que acechan."
                          : "Feigns being a kind, regular neighbor, but secretly causes the Limbo anomalies, Angela's tragedy, and lurking shadows."}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] text-red-300">
                        <span className="bg-slate-950/60 p-1 rounded border border-red-900/40">🌑 Manipulación de Sombras</span>
                        <span className="bg-slate-950/60 p-1 rounded border border-red-900/40">👁️ Hipnosis de Comunidad</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 4. POWERS & XP VIEW */}
        {activeSubTab === "powers" && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>{language === "es" ? "Nivel de Poder de CKY" : "CKY Power Level"}</span>
                </span>
                <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Nivel {stats.level}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-1">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (stats.xp / stats.maxXp) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>{stats.xp} XP</span>
                <span>{stats.maxXp} XP {language === "es" ? "siguiente nivel" : "next level"}</span>
              </div>
            </div>

            {/* List of unlockable skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                {language === "es" ? "Habilidades Espirituales" : "Spiritual Abilities"}
              </h4>

              {/* Ability 1 */}
              <div className="p-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-lg">👁️</span>
                  <div>
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{language === "es" ? "Ver lo Invisible" : "See the Unseen"}</span>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase">
                        {language === "es" ? "Desbloqueado" : "Unlocked"}
                      </span>
                    </h5>
                    <p className="text-[9px] text-slate-400">
                      {language === "es" 
                        ? "Permite ver espíritus a través de la pantalla de tu celular." 
                        : "Allows seeing spirits through your cellphone screen."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ability 2 */}
              <div className={`p-2.5 bg-slate-950 border rounded-xl flex items-center justify-between ${
                stats.level >= 2 ? "border-purple-500/30" : "border-slate-800 opacity-60"
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-lg">⚡</span>
                  <div>
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{language === "es" ? "Ráfaga Espiritual" : "Spiritual Burst"}</span>
                      {stats.level >= 2 ? (
                        <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold uppercase">
                          {language === "es" ? "Desbloqueado" : "Unlocked"}
                        </span>
                      ) : (
                        <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-bold uppercase">
                          {language === "es" ? "Req. Nivel 2" : "Req. Level 2"}
                        </span>
                      )}
                    </h5>
                    <p className="text-[9px] text-slate-400">
                      {language === "es" 
                        ? "Ataque concentrado que consume 20% de Perfume." 
                        : "Focused attack consuming 20% Perfume."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ability 3 */}
              <div className={`p-2.5 bg-slate-950 border rounded-xl flex items-center justify-between ${
                stats.level >= 3 ? "border-rose-500/30" : "border-slate-800 opacity-60"
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-lg">💖</span>
                  <div>
                    <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{language === "es" ? "Vínculo Gemelar Supremo" : "Supreme Twin Bond"}</span>
                      {stats.level >= 3 ? (
                        <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold uppercase">
                          {language === "es" ? "Desbloqueado" : "Unlocked"}
                        </span>
                      ) : (
                        <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-bold uppercase">
                          {language === "es" ? "Req. Nivel 3" : "Req. Level 3"}
                        </span>
                      )}
                    </h5>
                    <p className="text-[9px] text-slate-400">
                      {language === "es" 
                        ? "Combina fuerzas con tu Gemelo para causar daño masivo en batallas." 
                        : "Combines forces with your Twin to inflict massive damage."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 5. DIARY VIEW (Diario de Misiones + Reflexiones) */}
        {activeSubTab === "diary" && (() => {
          const activeDay = selectedDiaryDay;
          const hasBooks = inventory.some(i => i.id === "backpack_notebook");
          const hasSandwich = inventory.some(i => i.id === "sandwich_salame_queso" || i.id === "salame_sandwich" || i.id === "sandwich_salame");
          const hasAngelaFriend = diaryEntries.some(e => e.id === "chapter_02_angela_friend" && e.unlocked);

          const tasksDay1 = [
            {
              id: "uniform",
              titleEs: "Ponerse el uniforme de la escuela",
              titleEn: "Put on school uniform",
              descEs: "Cámbiate de ropa en el ropero de tu habitación. Ponte la remera verde y jean azul.",
              descEn: "Change clothes in your room closet. Put on green shirt and blue jeans.",
              xp: 5,
              time: 5,
              icon: "👕",
              completed: currentOutfit === "uniform",
            },
            {
              id: "bathroom",
              titleEs: "Asearse en el baño",
              titleEn: "Wash up in the bathroom",
              descEs: "Ve al baño de la casa y lávate la cara en el lavatorio o date una ducha.",
              descEn: "Go to the bathroom and wash your face in the sink or take a shower.",
              xp: 10,
              time: 10,
              icon: "🧼",
              completed: !!hasGroomed,
            },
            {
              id: "backpack",
              titleEs: "Recoger la mochila",
              titleEn: "Pick up backpack",
              descEs: "Busca tu mochila en el Mueble 1 de tu habitación.",
              descEn: "Find your backpack in Furniture 1 of your room.",
              xp: 5,
              time: 5,
              icon: "🎒",
              completed: !!hasBackpack,
            },
            {
              id: "water_bottle",
              titleEs: "Recoger botella de agua",
              titleEn: "Pick up water bottle",
              descEs: "Abre la heladera de la cocina para tomar tu botella de agua favorita de CKY.",
              descEn: "Open the kitchen fridge to retrieve CKY's favorite water bottle.",
              xp: 5,
              time: 2,
              icon: "🧴",
              completed: inventory.some(i => i.id === "water_bottle_full" || i.id === "water_bottle_empty"),
            },
            {
              id: "books",
              titleEs: "Recoger los libros de la escuela",
              titleEn: "Pick up school books",
              descEs: "Toma tus libros y cuadernos de estudio (requiere tener la mochila primero).",
              descEn: "Take your books and study notebooks (requires having the backpack first).",
              xp: 5,
              time: 5,
              icon: "📚",
              completed: hasBooks,
            },
          ];

          const tasksDay2 = [
            {
              id: "uniform",
              titleEs: "Ponerse el uniforme de la escuela",
              titleEn: "Put on school uniform",
              descEs: "Ponte el uniforme en el ropero para disimular tus planes ante tu mamá.",
              descEn: "Put on your school uniform to disguise your plans from Mom.",
              xp: 5,
              time: 5,
              icon: "👕",
              completed: currentOutfit === "uniform",
            },
            {
              id: "bathroom",
              titleEs: "Asearse en el baño",
              titleEn: "Wash up in the bathroom",
              descEs: "Ve al baño y lávate la cara en el lavatorio o date una ducha.",
              descEn: "Wash your face in the sink or take a shower.",
              xp: 10,
              time: 10,
              icon: "🧼",
              completed: !!hasGroomed,
            },
            {
              id: "backpack",
              titleEs: "Recoger la mochila",
              titleEn: "Pick up backpack",
              descEs: "Recoge tu mochila del Mueble 1 de tu habitación.",
              descEn: "Pick up your backpack from Furniture 1.",
              xp: 5,
              time: 5,
              icon: "🎒",
              completed: !!hasBackpack,
            },
            {
              id: "water_bottle",
              titleEs: "Recoger botella de agua",
              titleEn: "Pick up water bottle",
              descEs: "Abre la heladera de la cocina para tomar tu botella de agua favorita.",
              descEn: "Open the kitchen fridge to retrieve CKY's favorite water bottle.",
              xp: 5,
              time: 2,
              icon: "🧴",
              completed: inventory.some(i => i.id === "water_bottle_full" || i.id === "water_bottle_empty"),
            },
            {
              id: "books",
              titleEs: "Recoger los libros de la escuela",
              titleEn: "Pick up school books",
              descEs: "Toma tus libros del Mueble 2 para simular que vas a estudiar.",
              descEn: "Take study books from Furniture 2 to pretend you're going to school.",
              xp: 5,
              time: 5,
              icon: "📚",
              completed: hasBooks,
            },
            {
              id: "sandwich",
              titleEs: "Sándwich de salame y queso",
              titleEn: "Salami & cheese sandwich",
              descEs: "Toma el sándwich de salame y queso de la heladera de la cocina para el espíritu de Ángela.",
              descEn: "Get a salami & cheese sandwich from the kitchen fridge for Angela's spirit.",
              xp: 15,
              time: 5,
              icon: "🥪",
              completed: hasSandwich || hasAngelaFriend,
            },
            {
              id: "bus_line4",
              titleEs: "Tomar colectivo Línea 4",
              titleEn: "Take Line 4 Bus",
              descEs: "Sal a la calle y sube al colectivo verde de la Línea 4 en dirección al Cementerio Municipal.",
              descEn: "Go to the street and board the Line 4 green bus to the Municipal Cemetery.",
              xp: 20,
              time: 15,
              icon: "🚌",
              completed: currentMapId === "cemetery" || hasAngelaFriend,
            },
            {
              id: "angela_tomb",
              titleEs: "Encontrar la tumba rosa de Ángela",
              titleEn: "Find Angela's pink grave",
              descEs: "Llega al cementerio, busca la tumba rosa de Ángela y entrégale el sándwich.",
              descEn: "Arrive at the cemetery, locate Angela's pink grave, and give her the sandwich.",
              xp: 50,
              time: 20,
              icon: "🪦",
              completed: hasAngelaFriend,
            },
            {
              id: "battle_shadow",
              titleEs: "Derrotar a la Sombra del Limbo",
              titleEn: "Defeat the Limbo Shadow",
              descEs: "Lucha junto a Ángela contra la sombra invocada por la vecina y purifica el cementerio.",
              descEn: "Fight alongside Angela against the shadow summoned by the neighbor and purify the cemetery.",
              xp: 60,
              time: 15,
              icon: "⚡",
              completed: diaryEntries.some(e => e.id === "chapter_02_shadow_battle" && e.unlocked),
            },
            {
              id: "day2_shower_mystery",
              titleEs: "Ducha divertida y misterio de la toalla",
              titleEn: "Fun shower & towel mystery",
              descEs: "Regresa a casa a ducharte con los chistes de Ángela, descubre que falta la toalla y encuéntrala en la silla de tu habitación.",
              descEn: "Return home to shower with Angela's jokes, find the missing towel on your bedroom chair.",
              xp: 40,
              time: 15,
              icon: "🚿",
              completed: diaryEntries.some(e => e.id === "chapter_02_shower_mystery" && e.unlocked),
            },
            {
              id: "day2_sleep_bed",
              titleEs: "Acostarse a dormir para el viernes",
              titleEn: "Go to bed to sleep for Friday",
              descEs: "Métete en la cama de tu habitación para descansar tras un largo día y prepararte para el viernes.",
              descEn: "Get into bed to rest after a long day and get ready for Friday.",
              xp: 30,
              time: 10,
              icon: "🛏️",
              completed: currentDay >= 3,
            },
          ];

          const tasksDay3 = [
            {
              id: "day3_wake_uniform",
              titleEs: "Viernes y tu cuerpo lo sabe (Uniforme & Aseo)",
              titleEn: "Friday and your body knows it (Uniform & Grooming)",
              descEs: "Vístete con el uniforme escolar y aséate en el baño con los ánimos matutinos de Ángela.",
              descEn: "Dress in your school uniform and groom in the bathroom with Angela's morning cheers.",
              xp: 20,
              time: 10,
              icon: "👕",
              completed: (currentOutfit === "uniform" || currentDay > 3) && hasGroomed,
            },
            {
              id: "day3_find_supplies",
              titleEs: "El misterio de los útiles desaparecidos",
              titleEn: "Mystery of the missing school supplies",
              descEs: "Tus útiles desaparecieron de la mesa. Búscalos en la habitación de mamá siguiendo el rastro espectral.",
              descEn: "Your supplies vanished from the table. Look for them in mom's room following spectral traces.",
              xp: 35,
              time: 10,
              icon: "📚",
              completed: diaryEntries.some(e => e.id === "chapter_03_morning_disappearances" && e.unlocked),
            },
            {
              id: "day3_bus_school",
              titleEs: "Tomar el colectivo y enfrentar la mirada de la Vecina",
              titleEn: "Take the bus & face the Neighbor's look",
              descEs: "Sal a la parada, elude las indirectas de la vecina y toma el colectivo hacia la Escuela N° 87.",
              descEn: "Go to the bus stop, dodge the neighbor's hints and take the bus to School No. 87.",
              xp: 40,
              time: 15,
              icon: "🚌",
              completed: diaryEntries.some(e => e.id === "chapter_03_school_shadow" && e.unlocked) || currentDay > 3,
            },
            {
              id: "day3_battle_school_storage",
              titleEs: "Batalla: Sombra Hurtadora en el depósito escolar",
              titleEn: "Battle: Thief Shadow in school storage",
              descEs: "Derrota a la sombra del Limbo en el depósito escolar y recupera los recuerdos robados.",
              descEn: "Defeat the Limbo shadow in the school storage and recover stolen memories.",
              xp: 70,
              time: 20,
              icon: "⚔️",
              completed: diaryEntries.some(e => e.id === "chapter_03_school_shadow" && e.unlocked),
            },
            {
              id: "day3_battle_rift_guardian",
              titleEs: "Batalla: Guardián de la Grieta de la Vecina",
              titleEn: "Battle: Neighbor's Rift Guardian",
              descEs: "Rastrea la emanación morada cerca de la casa de la vecina y destruye al Devorador de Recuerdos.",
              descEn: "Track the purple surge near the neighbor's house and destroy the Memory Devourer.",
              xp: 100,
              time: 25,
              icon: "⚡",
              completed: diaryEntries.some(e => e.id === "chapter_03_rift_guardian" && e.unlocked),
            },
            {
              id: "day3_shower_spirit_w",
              titleEs: "La ducha nocturna y la revelación de W",
              titleEn: "Night shower and the revelation of W",
              descEs: "Asegúrate con Ángela de que la toalla esté en el toallero, báñate, regresa desnuda a la pieza y descubre la verdadera identidad de W.",
              descEn: "Make sure with Angela the towel is on the rack, shower, return naked to your bedroom, and reveal W's true identity.",
              xp: 80,
              time: 20,
              icon: "🧖‍♂️",
              completed: diaryEntries.some(e => e.id === "chapter_03_towel_spirit_w" && e.unlocked),
            },
            {
              id: "day3_dinner_and_treasure",
              titleEs: "Cena nocturna y el Secreto del Tesoro de W",
              titleEn: "Late dinner & W's Secret Treasure",
              descEs: "Cena en la cocina, habla con Ángela sobre renovar tu ropa vieja y descubre con W el tesoro oculto para el sábado.",
              descEn: "Eat dinner in the kitchen, discuss replacing old clothes with Angela, and learn from W about the ancient treasure for Saturday.",
              xp: 90,
              time: 25,
              icon: "💎",
              completed: diaryEntries.some(e => e.id === "chapter_03_treasure_plan" && e.unlocked),
            },
          ];

          const tasksDay4: {
            id: string;
            titleEs: string;
            titleEn: string;
            descEs: string;
            descEn: string;
            xp: number;
            time: number;
            icon: string;
            completed: boolean;
          }[] = [
            {
              id: "day4_plan_ancient_ruins",
              titleEs: "Despertar temprano y partir hacia las Ruinas Ancestrales",
              titleEn: "Wake up early & head to Ancient Ruins",
              descEs: "Despiértate a las 06:00 AM, repasa con W y Ángela las coordenadas del tesoro oculto en el Valle de las Ruinas.",
              descEn: "Wake up at 06:00 AM, review with W and Angela the coordinates of the hidden treasure in the Valley of Ruins.",
              xp: 40,
              time: 10,
              icon: "🌅",
              completed: diaryEntries.some(e => e.id === "chapter_04_ancient_ruins_treasure" && e.unlocked) || currentDay > 4,
            },
            {
              id: "day4_battle_guardian",
              titleEs: "Batalla: Golem Guardián del Tesoro Ancestral",
              titleEn: "Battle: Ancient Treasure Guardian Golem",
              descEs: "Derrota al colosal Golem de Piedra en las Ruinas que sella el tesoro usando las técnicas combinadas de Ángela y W.",
              descEn: "Defeat the colossal Stone Golem in the Ruins sealing the treasure using Angela & W combo techniques.",
              xp: 120,
              time: 25,
              icon: "⚔️",
              completed: diaryEntries.some(e => e.id === "chapter_04_ancient_ruins_treasure" && e.unlocked),
            },
            {
              id: "day4_shovel_unearth_treasure",
              titleEs: "Metamorfosis de W (Pala) y Desenterrar el Tesoro",
              titleEn: "W's Shovel Metamorphosis & Dig Treasure",
              descEs: "Usa la forma de pala dorada de W para cavar la X y desenterrar el cofre repleto de monedas y joyas (+$50.000).",
              descEn: "Use W's golden shovel form to dig the X and unearth the treasure chest full of coins and gems (+$50,000).",
              xp: 100,
              time: 15,
              icon: "⛏️",
              completed: diaryEntries.some(e => e.id === "chapter_04_w_shovel_and_treasure" && e.unlocked),
            },
            {
              id: "day4_shower_w_guard_duty",
              titleEs: "Ducha relajante en casa y orden de guardia a W",
              titleEn: "Relaxing shower at home & W guard order",
              descEs: "Regresen a casa llenos de tierra, ordena a W montar guardia estricta afuera y date una ducha reconfortante.",
              descEn: "Return home dirty with mud, order W to stay outside on guard duty, and take a refreshing shower.",
              xp: 80,
              time: 20,
              icon: "🚿",
              completed: diaryEntries.some(e => e.id === "chapter_04_shower_and_w_rule" && e.unlocked),
            },
            {
              id: "day4_shopping_mall_trip",
              titleEs: "Tarde de compras en el Centro Comercial",
              titleEn: "Afternoon shopping spree at City Mall",
              descEs: "Visita el Centro Comercial con Ángela y W, compra ropa de moda y disfruta de la merienda de celebración.",
              descEn: "Visit the Shopping Mall with Angela and W, buy stylish clothes, and enjoy celebratory food.",
              xp: 90,
              time: 30,
              icon: "🛍️",
              completed: diaryEntries.some(e => e.id === "chapter_04_shopping_and_lingerie" && e.unlocked),
            },
            {
              id: "day4_sexy_lingerie_purchase",
              titleEs: "Tienda de Lencería: Conjunto de Encaje Sexy",
              titleEn: "Lingerie Boutique: Sexy Lace Set",
              descEs: "Sigue los consejos de Ángela en la boutique de lencería, compra el conjunto sexy de encaje rojo y agrégalo a tu ropero.",
              descEn: "Follow Angela's tips in the lingerie boutique, buy the sexy red lace lingerie set, and add it to your wardrobe.",
              xp: 120,
              time: 20,
              icon: "👙",
              completed: diaryEntries.some(e => e.id === "chapter_04_shopping_and_lingerie" && e.unlocked),
            },
          ];

          const tasksDay5 = [
            {
              id: "day5_deep_cleaning",
              titleEs: "Limpieza Profunda con W (Transformaciones)",
              titleEn: "Deep Cleaning with W (Transformations)",
              descEs: "Ayuda a Mamá limpiando la casa y combate las plagas con W transformado en plumero, escoba y aspiradora.",
              descEn: "Help Mom clean the house and battle pests with W transformed into duster, broom, and vacuum.",
              xp: 150,
              time: 45,
              icon: "🧹",
              completed: diaryEntries.some(e => e.id === "chapter_05_deep_cleaning_mission" && e.unlocked),
            },
            {
              id: "day5_airport_race",
              titleEs: "Carrera al Aeropuerto contra la Vecina",
              titleEn: "Airport Race against the Neighbor",
              descEs: "Vístete con ropa deportiva y compite contra la vecina trotando hasta el aeropuerto por el pancho y la coca.",
              descEn: "Wear sport outfit and race the neighbor jogging to the airport for hot dog and soda.",
              xp: 100,
              time: 30,
              icon: "🏃‍♀️",
              completed: diaryEntries.some(e => e.id === "chapter_05_airport_race_neighbor" && e.unlocked),
            },
            {
              id: "day5_sexy_photos",
              titleEs: "Ducha Refrescante y Sesión Cómica de Fotos Sexys",
              titleEn: "Refreshing Shower & Comic Sexy Photoshoot",
              descEs: "Báñate tras la carrera, pruébate la lencería roja sexy de encaje con las ocurrencias de Ángela y la vergüenza cósmica de W.",
              descEn: "Take a shower after the run, try the sexy red lace lingerie with Angela's banter and W's cosmic embarrassment.",
              xp: 120,
              time: 25,
              icon: "📸",
              completed: diaryEntries.some(e => e.id === "chapter_05_sweat_shower_and_lingerie_photos" && e.unlocked),
            },
          ];

          const tasksDay6 = [
            {
              id: "day6_dark_form_battle",
              titleEs: "Batalla: Forma Oscura & Alma Gemela Revelada",
              titleEn: "Battle: Dark Form & Soulmate Revealed",
              descEs: "Derrota a la sombra encapuchada en la habitación. Alanis interviene y revela a tu Alma Gemela híbrida.",
              descEn: "Defeat the hooded shadow in the bedroom. Alanis intervenes and reveals your hybrid Soulmate.",
              xp: 150,
              time: 20,
              icon: "⚔️",
              completed: diaryEntries.some(e => e.id === "chapter_06_soulmate_revelation_hybrid" && e.unlocked),
            },
            {
              id: "day6_monday_prep",
              titleEs: "Rutina del Lunes: Uniforme, Mochila y Sándwich",
              titleEn: "Monday Routine: Uniform, Backpack & Sandwich",
              descEs: "Prepárate para la escuela con las bromas de Ángela, guarda la mochila, libros y el sándwich de salame.",
              descEn: "Get ready for school with Angela's jokes, pack your backpack, books, and salami sandwich.",
              xp: 50,
              time: 15,
              icon: "🎒",
              completed: diaryEntries.some(e => e.id === "chapter_06_monday_school_routine" && e.unlocked),
            },
            {
              id: "day6_bus_and_school_possession",
              titleEs: "Viaje Hostil y Posesión Masiva en la Escuela",
              titleEn: "Hostile Bus Ride & Mass School Possession",
              descEs: "Sube al colectivo donde todos actúan agresivos y descubre que la escuela entera está bajo influencia oscura.",
              descEn: "Board the bus where everyone acts hostile and discover the school is under dark influence.",
              xp: 80,
              time: 20,
              icon: "🚌",
              completed: diaryEntries.some(e => e.id === "chapter_06_possessed_bus_and_school" && e.unlocked),
            },
            {
              id: "day6_bathroom_cabal",
              titleEs: "Cónclave en el Baño de Chicas: La Posesión de la Escuela",
              titleEn: "Girls' Bathroom Council: School Possession Revealed",
              descEs: "Reúnete con tu grupo en el baño de chicas para descubrir que la escuela está parasitada y Mateo en peligro en el patio.",
              descEn: "Meet with your party in the girls' bathroom to discover the school is parasitized and Mateo is in danger in the courtyard.",
              xp: 90,
              time: 15,
              icon: "🧼",
              completed: diaryEntries.some(e => e.id === "chapter_06_girls_bathroom_cabal" && e.unlocked),
            },
            {
              id: "day6_soccer_boss_battle",
              titleEs: "Duelo en el Patio: Derrotar y Purificar a Mateo",
              titleEn: "Courtyard Duel: Defeat & Purify Mateo",
              descEs: "Enfrenta al espíritu de combate de la vecina que posee a Mateo en la cancha de fútbol y libéralo para siempre.",
              descEn: "Confront the neighbor's combat spirit possessing Mateo on the soccer pitch and free him forever.",
              xp: 200,
              time: 25,
              icon: "⚽",
              completed: diaryEntries.some(e => e.id === "chapter_06_possessed_soccer_battle_victory" && e.unlocked),
            },
            {
              id: "day6_soulmate_encounter_and_grimoire",
              titleEs: "Visita al Alma Gemela: Beso y Grimorio de Sombras",
              titleEn: "Soulmate Visit: Kiss & Grimoire of Shadows",
              descEs: "Cumple la exigencia de Alanis en la casa de tu gemelo, descubre la foto con la Vecina y obtén el Grimorio.",
              descEn: "Fulfill Alanis's demand at your soulmate's house, discover the photo with the Neighbor, and receive the Grimoire.",
              xp: 200,
              time: 30,
              icon: "📖",
              completed: diaryEntries.some(e => e.id === "chapter_06_soulmate_kiss_and_grimoire" && e.unlocked),
            },
            {
              id: "day6_confession_w_grimoire_sleep",
              titleEs: "Confesión en Casa, Grimorio a W y Noche",
              titleEn: "Confession at Home, Grimoire to W & Night",
              descEs: "Regresa a tu habitación, desahógate sobre la frialdad y la foto sospechosa, entrega el libro a W y a dormir.",
              descEn: "Return to your room, vent about the coldness and suspicious photo, hand the book to W, and sleep.",
              xp: 150,
              time: 20,
              icon: "🌙",
              completed: diaryEntries.some(e => e.id === "chapter_06_confession_photo_and_night" && e.unlocked),
            },
          ];

          const tasksDay7 = [
            {
              id: "day7_grimoire_strategy",
              titleEs: "W Descifra el Grimorio: Estrategia de los Poseídos",
              titleEn: "W Decodes Grimoire: Possessed Strategy",
              descEs: "Escucha la explicación de W al despertar: luchar del más débil al más fuerte según la jerarquía de las sombras.",
              descEn: "Listen to W's explanation upon waking: fight from weakest to strongest according to shadow hierarchy.",
              xp: 50,
              time: 10,
              icon: "📖",
              completed: diaryEntries.some(e => e.id === "chapter_07_wake_and_grimoire_strategy" && e.unlocked),
            },
            {
              id: "day7_tuesday_prep",
              titleEs: "Preparación del Martes: Uniforme, Mochila y Libros",
              titleEn: "Tuesday Preparation: Uniform, Backpack & Books",
              descEs: "Vístete con el uniforme escolar, aséate, recoge la mochila, libros, agua y sándwich de salame, y viaja a la escuela.",
              descEn: "Wear school uniform, groom yourself, grab backpack, books, water, and salami sandwich, then head to school.",
              xp: 50,
              time: 15,
              icon: "🎒",
              completed: diaryEntries.some(e => e.id === "chapter_07_tuesday_morning_prep" && e.unlocked),
            },
            {
              id: "day7_director_expulsion",
              titleEs: "Injusticia Escolar: Expulsión por Orden de la Vecina",
              titleEn: "School Injustice: Expulsion by the Neighbor's Order",
              descEs: "Preséntate en la Dirección Escolar. El Director manipulado te notifica tu expulsión inmediata e injusta.",
              descEn: "Report to the Principal's Office. The manipulated Principal notifies your immediate and unjust expulsion.",
              xp: 80,
              time: 15,
              icon: "🚫",
              completed: diaryEntries.some(e => e.id === "chapter_07_director_unjust_expulsion" && e.unlocked),
            },
            {
              id: "day7_basement_discovery_labyrinth",
              titleEs: "Laberinto del Sótano: Válvulas, Llaves y Sombras",
              titleEn: "Basement Labyrinth: Valves, Keys & Shadows",
              descEs: "Baja por la puerta secreta del pasillo, desactiva la válvula de vapor, encuentra la llave y vence a los guardianes.",
              descEn: "Head through the hallway secret door, turn off steam valve, find maintenance key, and defeat shadow sentries.",
              xp: 150,
              time: 30,
              icon: "💨",
              completed: diaryEntries.some(e => e.id === "chapter_07_basement_discovery_and_labyrinth" && e.unlocked),
            },
            {
              id: "day7_laboratory_boss_liberation",
              titleEs: "Batalla en el Laboratorio: Liberación del Profesor y Compañera",
              titleEn: "Laboratory Boss Battle: Rescue Professor & Classmate",
              descEs: "Entra al Aula Laboratorio Subterránea, destruye al Espíritu Alquimista Oscuro y rescata al Profesor y a tu amiga.",
              descEn: "Enter Underground Chemistry Lab, destroy Dark Alchemist Spirit, and rescue the Professor and your friend.",
              xp: 300,
              time: 35,
              icon: "🧪",
              completed: diaryEntries.some(e => e.id === "chapter_07_laboratory_boss_and_liberation" && e.unlocked),
            },
            {
              id: "day7_alanis_red_lingerie_mandate",
              titleEs: "Exigencia de Alanis: Lencería Roja y Misión Íntima",
              titleEn: "Alanis's Mandate: Red Lingerie & Intimate Mission",
              descEs: "Regresa a casa, discute con Alanis y reúnete con Ángela y W. Dúchate y guarda la lencería en la mochila.",
              descEn: "Return home, argue with Alanis and meet Angela & W. Shower and pack the red lingerie into your backpack.",
              xp: 100,
              time: 20,
              icon: "👙",
              completed: diaryEntries.some(e => e.id === "chapter_07_alanis_red_lingerie_mandate" && e.unlocked),
            },
            {
              id: "day7_soulmate_awkward_kiss_critique",
              titleEs: "Visita al Gemelo: El Beso Torpe y la Crítica Desubicada",
              titleEn: "Visit Soulmate: The Awkward Kiss & Unfiltered Critique",
              descEs: "Ve a la casa de tu gemelo, bésalo para calibrar las auras y soporta su crítica antes de pedir explicaciones.",
              descEn: "Go to your soulmate's house, kiss him to calibrate auras, and endure his critique before asking questions.",
              xp: 100,
              time: 15,
              icon: "💋",
              completed: diaryEntries.some(e => e.id === "chapter_07_soulmate_awkward_kiss_critique" && e.unlocked),
            },
            {
              id: "day7_red_lingerie_runway_intel",
              titleEs: "Pasarela en Lencería Roja y Revelación del Gran Ataque",
              titleEn: "Red Lingerie Runway & The Grand Attack Revealed",
              descEs: "Cámbiate al conjunto de lencería roja en su baño, desfila en la sala y averigua el plan de ataque de la Vecina.",
              descEn: "Change into red lingerie in his bathroom, strut in the living room, and uncover the Neighbor's attack plan.",
              xp: 200,
              time: 20,
              icon: "✨",
              completed: diaryEntries.some(e => e.id === "chapter_07_red_lingerie_runway_intel" && e.unlocked),
            },
            {
              id: "day7_night_preparations_and_sleep",
              titleEs: "Consejo Nocturno, Risas con Ángela y Descanso en Piyama",
              titleEn: "Night Council, Angela's Jests & Silk Pajamas Rest",
              descEs: "Vuelve a casa, cuéntale a W y Ángela lo sucedido, ponte el piyama de seda y descansa para la gran batalla.",
              descEn: "Return home, brief W and Angela, put on silk pajamas, and rest up for tomorrow's great battle.",
              xp: 250,
              time: 30,
              icon: "🛏️",
              completed: diaryEntries.some(e => e.id === "chapter_07_night_preparations_and_sleep" && e.unlocked),
            },
          ];

          const tasksDay8 = [
            {
              id: "day8_war_council",
              titleEs: "Consejo de Guerra Matutino con W y Ángela",
              titleEn: "Morning War Council with W and Angela",
              descEs: "Despierta a las 07:00 AM, ponte ropa casual cómoda y prepárate para defender la ciudad ante el ataque coordinado.",
              descEn: "Wake up at 07:00 AM, dress in casual clothes, and prep to defend the city against the coordinated assault.",
              xp: 100,
              time: 10,
              icon: "🛡️",
              completed: diaryEntries.some(e => e.id === "chapter_08_morning_briefing" && e.unlocked),
            },
            {
              id: "day8_defend_city",
              titleEs: "Defensa de los 4 Puntos Neurálgicos de la Ciudad",
              titleEn: "Defense of the 4 City Strategic Points",
              descEs: "Derrota a los 4 jefes sombríos en la Plaza, el Hospital, la Terminal de Ómnibus y el Shopping Mall.",
              descEn: "Defeat all 4 shadow bosses at the Plaza, Hospital, Bus Terminal, and Shopping Mall.",
              xp: 400,
              time: 60,
              icon: "⚔️",
              completed: diaryEntries.some(e => e.id === "chapter_08_quad_battle_complete" && e.unlocked),
            },
            {
              id: "day8_final_climax",
              titleEs: "Confrontación en la Puerta de la Vecina y Supernova",
              titleEn: "Confrontation at Neighbor's Door & Cosmic Supernova",
              descEs: "Enfréntate a la traición del gemelo, honra el sacrificio de W y Ángela y desata tu poder cósmico definitivo.",
              descEn: "Face the soulmate's betrayal, honor W and Angela's sacrifice, and unleash your ultimate cosmic supernova.",
              xp: 500,
              time: 30,
              icon: "⚡",
              completed: diaryEntries.some(e => e.id === "chapter_08_supernova_climax" && e.unlocked),
            },
            {
              id: "day8_renounce_destiny",
              titleEs: "Renuncia ante Alanis y Vuelta a la Normalidad",
              titleEn: "Renounce Lineage to Alanis & Return to Normal Life",
              descEs: "Rechaza el destino impuesto por los dioses en tu habitación y elige ser una chica normal de secundaria.",
              descEn: "Reject the god-imposed destiny in your room and choose to be an ordinary high school girl.",
              xp: 600,
              time: 20,
              icon: "🕊️",
              completed: diaryEntries.some(e => e.id === "chapter_08_normal_girl_closure" && e.unlocked),
            },
          ];

          const currentTasks = activeDay === 8 ? tasksDay8 : activeDay === 7 ? tasksDay7 : activeDay === 6 ? tasksDay6 : activeDay === 5 ? tasksDay5 : activeDay === 4 ? tasksDay4 : activeDay === 3 ? tasksDay3 : activeDay === 2 ? tasksDay2 : tasksDay1;
          const completedCount = currentTasks.filter(t => t.completed).length;
          const totalTasks = currentTasks.length;
          const progressPercent = Math.round((completedCount / totalTasks) * 100);

          return (
            <div className="space-y-4 font-mono text-xs">
              {/* Day Selector Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(1)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 1
                      ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>☀️</span>
                  <span>{language === "es" ? "Día 1" : "Day 1"}</span>
                  {currentDay === 1 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 1 ? "bg-black/30 text-black" : "bg-yellow-500/20 text-yellow-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(2)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 2
                      ? "bg-pink-500 text-black shadow-md shadow-pink-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🌙</span>
                  <span>{language === "es" ? "Día 2" : "Day 2"}</span>
                  {currentDay === 2 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 2 ? "bg-black/30 text-black" : "bg-pink-500/20 text-pink-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(3)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 3
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🔮</span>
                  <span>{language === "es" ? "Día 3" : "Day 3"}</span>
                  {currentDay === 3 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 3 ? "bg-white/30 text-white" : "bg-purple-500/20 text-purple-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(4)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 4
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>💎</span>
                  <span>{language === "es" ? "Día 4" : "Day 4"}</span>
                  {currentDay === 4 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 4 ? "bg-white/30 text-white" : "bg-rose-500/20 text-rose-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(5)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 5
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🧹</span>
                  <span>{language === "es" ? "Día 5" : "Day 5"}</span>
                  {currentDay === 5 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 5 ? "bg-white/30 text-white" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(6)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 6
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>⚡</span>
                  <span>{language === "es" ? "Día 6" : "Day 6"}</span>
                  {currentDay === 6 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 6 ? "bg-white/30 text-white" : "bg-indigo-500/20 text-indigo-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(7)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 7
                      ? "bg-red-600 text-white shadow-md shadow-red-500/40"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🧪</span>
                  <span>{language === "es" ? "Día 7" : "Day 7"}</span>
                  {currentDay === 7 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 7 ? "bg-white/30 text-white" : "bg-red-500/20 text-red-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDiaryDay(8)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDay === 8
                      ? "bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-md shadow-purple-500/40"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>⚔️</span>
                  <span>{language === "es" ? "Día 8: Clímax" : "Day 8: Climax"}</span>
                  {currentDay === 8 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeDay === 8 ? "bg-white/30 text-white" : "bg-purple-500/20 text-purple-300"}`}>
                      {language === "es" ? "Actual" : "Current"}
                    </span>
                  )}
                </button>
              </div>

              {/* Post-Game Notice Banner */}
              <div className="p-3 bg-gradient-to-r from-purple-950/70 via-slate-900 to-pink-950/70 border border-purple-500/40 rounded-2xl flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl p-1.5 bg-purple-900/60 border border-purple-400/40 rounded-xl">🔥</span>
                  <div>
                    <h5 className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <span>{language === "es" ? "¡Modo Libre & Misiones Locas Desbloqueables!" : "Free Roam & Crazy Missions Unlockable!"}</span>
                      <span className="text-[8px] bg-pink-500/30 text-pink-200 border border-pink-500/40 px-1.5 py-0.2 rounded uppercase font-extrabold">Post-Game</span>
                    </h5>
                    <p className="text-[10px] text-slate-300 font-sans">
                      {language === "es"
                        ? "Al terminar el juego normal (Día 8), desbloquearás el Modo Libre con 15+ misiones cómicas y picantes (Sex shop con Ángela, Pijama party en lencería, gym con W y más)."
                        : "Upon finishing the main game (Day 8), you will unlock Free Roam Mode with 15+ crazy & spicy missions (Adult store with Angela, Lingerie sleepover, gym with W, etc)."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Journal Header */}
              <div className={`p-3.5 bg-slate-950 border-2 rounded-2xl relative shadow-lg ${
                activeDay === 8
                  ? "border-purple-500/50"
                  : activeDay === 7
                  ? "border-red-500/50"
                  : activeDay === 6
                  ? "border-indigo-500/50"
                  : activeDay === 5
                  ? "border-emerald-500/50"
                  : activeDay === 4
                  ? "border-rose-500/50"
                  : activeDay === 3
                  ? "border-purple-500/50"
                  : activeDay === 2
                  ? "border-pink-500/50"
                  : "border-yellow-500/50"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      {activeDay === 8 ? "⚔️" : activeDay === 7 ? "🧪" : activeDay === 6 ? "⚡" : activeDay === 5 ? "🧹" : activeDay === 4 ? "💎" : activeDay === 3 ? "🔮" : activeDay === 2 ? "👻" : "📓"}
                    </span>
                    <div>
                      <h3 className={`font-bold text-sm uppercase tracking-wide ${
                        activeDay === 8
                          ? "text-purple-400"
                          : activeDay === 7
                          ? "text-red-400"
                          : activeDay === 6
                          ? "text-indigo-400"
                          : activeDay === 5
                          ? "text-emerald-400"
                          : activeDay === 4
                          ? "text-rose-400"
                          : activeDay === 3
                          ? "text-purple-400"
                          : activeDay === 2
                          ? "text-pink-400"
                          : "text-yellow-400"
                      }`}>
                        {language === "es" ? `Diario de Misiones — Día ${activeDay}` : `Mission Journal — Day ${activeDay}`}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {activeDay === 8
                          ? (language === "es" ? "Ataque final coordinado, defensa de 4 locaciones, traición, supernova cósmica y elección libre" : "Final assault, 4 spots defense, betrayal, cosmic supernova, and free choice")
                          : activeDay === 7
                          ? (language === "es" ? "Estrategia del Grimorio, expulsión escolar injusta, laberinto del sótano y rescate en el laboratorio" : "Grimoire strategy, unjust expulsion, basement labyrinth, and chemistry lab rescue")
                          : activeDay === 6
                          ? (language === "es" ? "Posesión escolar de la vecina, cónclave en el baño, 3 investigaciones y batalla de fútbol" : "Neighbor's school possession, girls' bathroom council, 3 investigations, and soccer boss battle")
                          : activeDay === 5
                          ? (language === "es" ? "Limpieza profunda con W, carrera al aeropuerto y fotos sexys de lencería" : "Deep cleaning with W, airport race, and sexy lingerie photoshoot")
                          : activeDay === 4
                          ? (language === "es" ? "Búsqueda del tesoro ancestral, baño y compras en el shopping" : "Ancient treasure quest, shower, and mall shopping spree")
                          : activeDay === 3
                          ? (language === "es" ? "Viernes de escuela, misterio de la toalla y secretos del Limbo" : "Friday at school, towel mystery, and Limbo secrets")
                          : activeDay === 2
                          ? (language === "es" ? "Misión especial: Ayudar al espíritu de Ángela" : "Secret mission: Help Angela's spirit")
                          : (language === "es" ? "Preparación para el primer día de escuela" : "Preparation for the first day of school")}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    activeDay === 8
                      ? "text-purple-300 bg-purple-500/20 border-purple-500/40"
                      : activeDay === 7
                      ? "text-red-300 bg-red-500/20 border-red-500/40"
                      : activeDay === 6
                      ? "text-indigo-300 bg-indigo-500/20 border-indigo-500/40"
                      : activeDay === 5
                      ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/40"
                      : activeDay === 4
                      ? "text-rose-300 bg-rose-500/20 border-rose-500/40"
                      : activeDay === 3
                      ? "text-purple-300 bg-purple-500/20 border-purple-500/40"
                      : activeDay === 2
                      ? "text-pink-300 bg-pink-500/20 border-pink-500/40"
                      : "text-yellow-300 bg-yellow-500/20 border-yellow-500/40"
                  }`}>
                    {completedCount} / {totalTasks} {language === "es" ? "Listas" : "Done"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <span>📌</span>
                  <span>{language === "es" ? `Tareas del Día ${activeDay}` : `Day ${activeDay} Tasks`}</span>
                </h4>

                {currentTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      task.completed
                        ? "bg-emerald-950/30 border-emerald-500/40"
                        : "bg-slate-950/80 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                        {task.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className={`font-bold text-xs ${task.completed ? "text-emerald-300 line-through decoration-emerald-500/60" : "text-white"}`}>
                            {language === "es" ? task.titleEs : task.titleEn}
                          </h5>
                          <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-500/30 font-bold">
                            +{task.xp} XP
                          </span>
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-bold">
                            +{task.time} min
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {language === "es" ? task.descEs : task.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {task.completed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-[10px] rounded-full">
                          ✓ {language === "es" ? "COMPLETADO" : "DONE"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded-full">
                          ⏳ {language === "es" ? "PENDIENTE" : "PENDING"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Story Reflections Sub-Section */}
              <div className="pt-2 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
                  <span>{language === "es" ? "Reflexiones e Historias Desbloqueadas" : "Unlocked Reflections & Story"}</span>
                </h4>

                {diaryEntries.some(e => e.unlocked) ? (
                  diaryEntries
                    .filter(e => e.unlocked)
                    .map((entry) => (
                      <div 
                        key={entry.id} 
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold font-mono text-yellow-500 flex items-center gap-1 pl-1.5">
                            <BookMarked className="w-3.5 h-3.5 text-yellow-500" />
                            {language === "es" ? entry.titleEs : entry.titleEn}
                          </h4>
                          <span className="text-[9px] font-mono text-slate-500">{entry.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-mono pl-1.5 leading-relaxed whitespace-pre-line">
                          {language === "es" ? entry.textEs : entry.textEn}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-500 font-mono text-xs bg-slate-950/60 rounded-xl border border-slate-900">
                    <BookOpen className="w-6 h-6 mb-1 opacity-25" />
                    <span>
                      {language === "es" ? "No hay reflexiones adicionales en el diario" : "No additional reflections yet"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 6. MAP VIEW */}
        {activeSubTab === "map" && (() => {
          const houseRooms = [
            { id: "bedroom", icon: "🛏️", nameEs: "Habitación de CKY", nameEn: "CKY's Bedroom", descEs: "Tu cuarto con cama, ropero y escritorio.", descEn: "Your room with bed, wardrobe, and desk." },
            { id: "moms_room", icon: "🪴", nameEs: "Habitación de Mamá", nameEn: "Mom's Bedroom", descEs: "Cuarto de tu madre con su espejo y plantas.", descEn: "Your mom's bedroom with mirror and plants." },
            { id: "hallway", icon: "🚪", nameEs: "Pasillo Central", nameEn: "Central Hallway", descEs: "Pasillo que conecta los dormitorios y la cocina.", descEn: "Hallway connecting bedrooms and kitchen." },
            { id: "sisters_room", icon: "🧸", nameEs: "Hab. de la Hermana", nameEn: "Sister's Room", descEs: "Habitación con escritorio y peluches.", descEn: "Sister's room with desk and plushies." },
            { id: "empty_room", icon: "🛋️", nameEs: "Sala de Estar", nameEn: "Living Room", descEs: "Sala principal con chimenea y sillón.", descEn: "Main living room with fireplace and armchair." },
            { id: "bathroom", icon: "🧼", nameEs: "Baño Principal", nameEn: "Bathroom", descEs: "Baño con lavatorio, ducha e inodoro.", descEn: "Bathroom with sink, shower, and toilet." },
            { id: "house", icon: "🍳", nameEs: "Cocina y Comedor", nameEn: "Kitchen & Dining", descEs: "Cocina amplia con heladera, mesa y TV.", descEn: "Kitchen with fridge, dining table, and TV." },
          ];

          const cityZones = [
            { id: "street", icon: "🏙️", nameEs: "Calle de la Ciudad", nameEn: "City Street", descEs: "Frente a la casa, parada de colectivos.", descEn: "Front street, bus stop." },
            { id: "cemetery", icon: "🪦", nameEs: "Cementerio Municipal", nameEn: "Municipal Cemetery", descEs: "Cementerio de la ciudad donde descansa la tumba rosa de Ángela.", descEn: "City cemetery where Angela's pink grave rests." },
            { id: "limbo", icon: "🔮", nameEs: "Limbo de Sombras", nameEn: "Shadow Limbo", descEs: "Plano espiritual místico.", descEn: "Mystic spiritual plane." },
          ];

          const isCurrentRoom = (roomId: string) => {
            if (currentMapId === roomId) return true;
            if (currentMapId === "living_room" && roomId === "empty_room") return true;
            if (currentMapId === "kitchen" && roomId === "house") return true;
            return false;
          };

          return (
            <div className="space-y-4 font-mono text-xs">
              {/* Title Header */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗺️</span>
                  <div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                      {language === "es" ? "Plano Interactivo de la Casa de CKY" : "Interactive House Blueprint"}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {language === "es" ? "Explora las habitaciones y zonas descubiertas de la ciudad" : "Explore rooms and discovered city zones"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2.5 py-1 rounded-lg">
                  📍 {language === "es" ? "Ubicación Actual" : "Current Location"}
                </span>
              </div>

              {/* House Blueprint Grid */}
              <div className="p-3.5 bg-slate-950/90 border-2 border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>🏠</span>
                  <span>{language === "es" ? "Habitaciones de la Casa" : "House Rooms"}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {houseRooms.map((room) => {
                    const active = isCurrentRoom(room.id);
                    return (
                      <div
                        key={room.id}
                        className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                          active
                            ? "bg-gradient-to-br from-pink-950/80 to-purple-950/80 border-pink-500 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/50"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {active && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-pink-500 text-white font-bold text-[8px] rounded-full uppercase shadow animate-pulse">
                            📍 {language === "es" ? "AQUÍ" : "HERE"}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{room.icon}</span>
                            <h5 className={`font-bold text-xs ${active ? "text-pink-300" : "text-white"}`}>
                              {language === "es" ? room.nameEs : room.nameEn}
                            </h5>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-tight">
                            {language === "es" ? room.descEs : room.descEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* External / Discovered City Map */}
              <div className="p-3.5 bg-slate-950/90 border-2 border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>🏙️</span>
                  <span>{language === "es" ? "Zonas Exteriores de la Ciudad" : "Exterior City Zones"}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cityZones.map((zone) => {
                    const active = isCurrentRoom(zone.id);
                    return (
                      <div
                        key={zone.id}
                        className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                          active
                            ? "bg-gradient-to-br from-yellow-950/80 to-amber-950/80 border-yellow-500 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-500/50"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {active && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-yellow-500 text-slate-950 font-bold text-[8px] rounded-full uppercase shadow animate-pulse">
                            📍 {language === "es" ? "AQUÍ" : "HERE"}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{zone.icon}</span>
                            <h5 className={`font-bold text-xs ${active ? "text-yellow-300" : "text-white"}`}>
                              {language === "es" ? zone.nameEs : zone.nameEn}
                            </h5>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-tight">
                            {language === "es" ? zone.descEs : zone.descEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 8. ACHIEVEMENTS VIEW */}
        {activeSubTab === "achievements" && (() => {
          const unlockedIds = getUnlockedAchievementIds();
          const filteredAchievements = ACHIEVEMENTS_LIST.filter((a) => {
            if (achFilter === "all") return true;
            return a.category === achFilter;
          });
          const unlockedCount = ACHIEVEMENTS_LIST.filter((a) => unlockedIds.has(a.id)).length;
          const totalCount = ACHIEVEMENTS_LIST.length;
          const progressPercent = Math.round((unlockedCount / totalCount) * 100);

          return (
            <div className="space-y-4 font-mono text-xs text-slate-300">
              {/* Summary Trophy Header */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
                    <Trophy className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{language === "es" ? "Sala de Trofeos & Hazañas" : "Trophy Room & Feats"}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {language === "es"
                        ? "Desbloquea medallas épicas viviendo cada aventura y secreto del juego."
                        : "Unlock epic medals by exploring every adventure and secret."}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto text-center sm:text-right min-w-[140px] space-y-1">
                  <div className="flex justify-between sm:justify-end gap-2 text-[10px] font-bold">
                    <span className="text-slate-400">{unlockedCount} / {totalCount} {language === "es" ? "Logros" : "Achievements"}</span>
                    <span className="text-amber-400 font-black">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: "all", labelEs: "Todos", labelEn: "All", icon: "⭐" },
                  { id: "story", labelEs: "Historia", labelEn: "Story", icon: "📖" },
                  { id: "combat", labelEs: "Combate", labelEn: "Combat", icon: "⚔️" },
                  { id: "secrets", labelEs: "Secretos", labelEn: "Secrets", icon: "🗝️" },
                  { id: "lifestyle", labelEs: "Vida & Minijuegos", labelEn: "Lifestyle", icon: "🥪" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAchFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      achFilter === f.id
                        ? "bg-amber-950/80 border-amber-400 text-amber-300 shadow"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{language === "es" ? f.labelEs : f.labelEn}</span>
                  </button>
                ))}
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredAchievements.map((ach) => {
                  const isUnlocked = unlockedIds.has(ach.id);
                  const rarityBorder =
                    ach.rarity === "legendary"
                      ? "border-amber-400/80 bg-gradient-to-r from-amber-950/40 to-slate-950"
                      : ach.rarity === "epic"
                      ? "border-purple-500/60 bg-gradient-to-r from-purple-950/40 to-slate-950"
                      : ach.rarity === "rare"
                      ? "border-blue-500/50 bg-gradient-to-r from-blue-950/40 to-slate-950"
                      : "border-slate-800 bg-slate-950";

                  return (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                        isUnlocked
                          ? `${rarityBorder} shadow-sm`
                          : "border-slate-800/60 bg-slate-950/50 opacity-60"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border flex-shrink-0 ${
                          isUnlocked
                            ? "bg-slate-900 border-amber-400/40 shadow-inner"
                            : "bg-slate-900/80 border-slate-800 grayscale"
                        }`}
                      >
                        {isUnlocked ? ach.icon : "🔒"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-100 truncate">
                            {language === "es" ? ach.titleEs : ach.titleEn}
                          </h4>
                          <span
                            className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${
                              ach.rarity === "legendary"
                                ? "bg-amber-950 text-amber-300 border-amber-500/50"
                                : ach.rarity === "epic"
                                ? "bg-purple-950 text-purple-300 border-purple-500/50"
                                : ach.rarity === "rare"
                                ? "bg-blue-950 text-blue-300 border-blue-500/50"
                                : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}
                          >
                            {ach.rarity}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-snug font-sans line-clamp-2">
                          {language === "es" ? ach.descEs : ach.descEn}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[9px]">
                          <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                            +{ach.xpReward} XP
                          </span>
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              isUnlocked ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            {isUnlocked ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>{language === "es" ? "Conseguido" : "Unlocked"}</span>
                              </>
                            ) : (
                              <span>{language === "es" ? "Bloqueado" : "Locked"}</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 7. SETTINGS VIEW */}
        {activeSubTab === "settings" && (
          <div className="space-y-4 font-mono text-xs text-slate-300">
            
            {/* Save & Load Game Card */}
            {onOpenSaveLoadModal && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-yellow-400 text-sm flex items-center gap-2">
                    <span>💾</span>
                    <span>{language === "es" ? "Guardar o Cargar Partida" : "Save or Load Game"}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {language === "es" 
                      ? "Accede a las ranuras de guardado manual o autoguardado para gestionar tu partida."
                      : "Access manual or autosave slots to manage your game progress."}
                  </p>
                </div>
                <button
                  onClick={() => onOpenSaveLoadModal("save")}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl shadow transition active:scale-95 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>💾</span>
                  <span>{language === "es" ? "ABRIR SLOTS" : "OPEN SLOTS"}</span>
                </button>
              </div>
            )}

            {/* Development Day Select Card */}
            {onOpenDevModal && (
              <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                    <span>💻</span>
                    <span>{language === "es" ? "Modo Desarrollo (Selección de Día)" : "Dev Mode (Day Selector)"}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {language === "es" 
                      ? "Cambia directamente al día deseado para probar eventos o hacer ajustes."
                      : "Jump directly to any day to test events or make adjustments."}
                  </p>
                </div>
                <button
                  onClick={onOpenDevModal}
                  className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 font-bold rounded-xl shadow transition active:scale-95 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>{language === "es" ? "CAMBIAR DÍA" : "SELECT DAY"}</span>
                </button>
              </div>
            )}

            {/* Quick config options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-800">
              
              {/* Volume Silent toggler */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{language === "es" ? "Mundo Silencioso" : "Silent World"}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {language === "es" ? "Configuración de audio de fondo." : "Background audio setting."}
                  </p>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`p-2 rounded-lg border ${
                    isSilent
                      ? "text-slate-500 border-slate-800 hover:border-slate-700"
                      : "text-yellow-500 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10"
                  }`}
                >
                  {isSilent ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Dangerous Area Reset */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{language === "es" ? "Reiniciar Juego" : "Reset Progress"}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {language === "es" ? "Borrar progreso del capítulo 1." : "Reset back to chapter start."}
                  </p>
                </div>
                <button
                  onClick={onResetGame}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-xs font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>{language === "es" ? "Re-iniciar" : "Reset"}</span>
                </button>
              </div>

            </div>

            {/* Custom Keyboard Controls Configurator */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <h4 className="font-bold text-white text-xs mb-2.5 flex items-center gap-1">
                <Settings className="w-4 h-4 text-yellow-500" />
                <span>{language === "es" ? "Reconfigurar Controles de Teclado" : "Rebind Keyboard Controls"}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">{language === "es" ? "Arriba" : "Up"}</span>
                  <input
                    type="text"
                    value={upKey}
                    onChange={(e) => setUpKey(e.target.value.substring(0, 1))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-center font-bold font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">{language === "es" ? "Abajo" : "Down"}</span>
                  <input
                    type="text"
                    value={downKey}
                    onChange={(e) => setDownKey(e.target.value.substring(0, 1))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-center font-bold font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">{language === "es" ? "Izquierda" : "Left"}</span>
                  <input
                    type="text"
                    value={leftKey}
                    onChange={(e) => setLeftKey(e.target.value.substring(0, 1))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-center font-bold font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">{language === "es" ? "Derecha" : "Right"}</span>
                  <input
                    type="text"
                    value={rightKey}
                    onChange={(e) => setRightKey(e.target.value.substring(0, 1))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-center font-bold font-mono focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyKeys}
                className="mt-3.5 w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs py-2 rounded-lg transition-colors"
              >
                {language === "es" ? "APLICAR ASIGNACIÓN DE TECLAS" : "APPLY KEY REMAP"}
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

import React, { useState } from "react";
import { X, ClipboardList, CheckCircle, Clock, Award, Sparkles } from "lucide-react";
import { Language, InventoryItem } from "../types";
import { soundEngine } from "../lib/soundEngine";
import { unlockAchievement } from "../data/achievements";

interface TownNoticeBoardModalProps {
  language: Language;
  onClose: () => void;
  onAddXP: (amount: number) => void;
  onAddMoney: (amount: number) => void;
  inventory: InventoryItem[];
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

interface TownQuest {
  id: string;
  titleEs: string;
  titleEn: string;
  authorEs: string;
  authorEn: string;
  descEs: string;
  descEn: string;
  rewardMoney: number;
  rewardXP: number;
  icon: string;
}

const QUESTS: TownQuest[] = [
  {
    id: "quest_lost_notes",
    titleEs: "Apuntes Perdidos de Geografía",
    titleEn: "Lost Geography Study Notes",
    authorEs: "Profesor Montenegro",
    authorEn: "Professor Montenegro",
    descEs: "Olvidé mis hojas de mapas en el patio de la escuela. Si una alumna aplicada me las trae, habrá recompensa.",
    descEn: "I forgot my map notes in the school courtyard. If a diligent student brings them to me, there will be a reward.",
    rewardMoney: 300,
    rewardXP: 40,
    icon: "📜"
  },
  {
    id: "quest_don_pepe_mustard",
    titleEs: "Salsa Secreta para los Panchos",
    titleEn: "Secret Sauce for the Hot Dogs",
    authorEs: "Don Pepe",
    authorEn: "Don Pepe",
    descEs: "Se me acabó la mostaza especial de la colonia para los panchos. Necesito una mano con el pedido de provisiones.",
    descEn: "Ran out of special mustard for the hot dogs. Need a hand with the provisions order.",
    rewardMoney: 500,
    rewardXP: 50,
    icon: "🌭"
  },
  {
    id: "quest_fountain_wishes",
    titleEs: "Limpieza de la Fuente de los Deseos",
    titleEn: "Wishing Fountain Restoration",
    authorEs: "Comité de la Plaza",
    authorEn: "Town Square Committee",
    descEs: "La fuente central de la plaza necesita que tiren una moneda con buenos deseos para purificar las aguas del pueblo.",
    descEn: "The town square fountain needs a wish coin tossed to purify the municipal waters.",
    rewardMoney: 400,
    rewardXP: 45,
    icon: "⛲"
  },
  {
    id: "quest_10print_retro_tester",
    titleEs: "Betatester Oficial de 10Print_ Studios",
    titleEn: "10Print_ Studios Official Playtester",
    authorEs: "10Print_ Studios (Desarrolladores)",
    authorEn: "10Print_ Studios (Game Devs)",
    descEs: "¡El estudio creador 10Print_ busca betatesters en el pueblo para certificar el rendimiento retro y reportar bromas cósmicas! Recibí la bendición y recompensa oficial.",
    descEn: "Indie studio 10Print_ seeks brave town playtesters to certify retro performance and report cosmic banter! Receive official developer blessings and bounty.",
    rewardMoney: 600,
    rewardXP: 60,
    icon: "👾"
  }
];

export default function TownNoticeBoardModal({
  language,
  onClose,
  onAddXP,
  onAddMoney,
  onShowNotification
}: TownNoticeBoardModalProps) {
  const [completedQuests, setCompletedQuests] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("cky_completed_board_quests");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleCompleteQuest = (quest: TownQuest) => {
    if (completedQuests.includes(quest.id)) return;

    const next = [...completedQuests, quest.id];
    setCompletedQuests(next);
    try {
      localStorage.setItem("cky_completed_board_quests", JSON.stringify(next));
    } catch {}

    soundEngine.playSfx("fanfare");
    onAddMoney(quest.rewardMoney);
    onAddXP(quest.rewardXP);

    if (quest.id === "quest_10print_retro_tester") {
      unlockAchievement("ach_10print_fan", onShowNotification, onAddXP);
    }

    if (onShowNotification) {
      onShowNotification({
        icon: quest.icon,
        titleEs: `¡Misión Cumplida: ${quest.titleEs}!`,
        titleEn: `Quest Completed: ${quest.titleEn}!`,
        subEs: `Recibiste +$${quest.rewardMoney} y +${quest.rewardXP} XP por ayudar al pueblo.`,
        subEn: `Earned +$${quest.rewardMoney} and +${quest.rewardXP} XP for helping out.`,
        color: "emerald"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40 text-2xl">
              📋
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-300">
                {language === "es" ? "Tablón de Recados Vecinales" : "Town Notice Board"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Plaza Principal • Misiones Secundarias" : "Town Square • Side Quests"}
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

        <p className="text-xs text-slate-300">
          {language === "es"
            ? "Ayuda a los vecinos y profesores del pueblo en sus tareas cotidianas para ganar dinero y experiencia extra:"
            : "Help neighbors and teachers with daily tasks to earn extra money and experience:"}
        </p>

        {/* Quests List */}
        <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
          {QUESTS.map((quest) => {
            const isDone = completedQuests.includes(quest.id);
            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDone
                    ? "bg-slate-950/50 border-emerald-500/40 opacity-80"
                    : "bg-slate-950/80 border-slate-800 hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{quest.icon}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200">
                          {language === "es" ? quest.titleEs : quest.titleEn}
                        </h4>
                        {isDone && (
                          <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold border border-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> {language === "es" ? "Completada" : "Completed"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-400/90 font-bold">
                        {language === "es" ? `Solicitado por: ${quest.authorEs}` : `Posted by: ${quest.authorEn}`}
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {language === "es" ? quest.descEs : quest.descEn}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400 font-bold">+${quest.rewardMoney}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-amber-400 font-bold">+{quest.rewardXP} XP</span>
                  </div>

                  {!isDone ? (
                    <button
                      onClick={() => handleCompleteQuest(quest)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow"
                    >
                      <Sparkles className="w-3 h-3" />
                      {language === "es" ? "Cumplir Recado" : "Complete Favor"}
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {language === "es" ? "✓ Recompensa cobrada" : "✓ Reward collected"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase transition-colors cursor-pointer"
        >
          {language === "es" ? "Cerrar Tablón" : "Close Board"}
        </button>
      </div>
    </div>
  );
}

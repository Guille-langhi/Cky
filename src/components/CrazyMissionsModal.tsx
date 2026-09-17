// src/components/CrazyMissionsModal.tsx
import React, { useState } from "react";
import { Sparkles, Flame, BookOpen, CheckCircle2, ChevronRight, X, Play, Trophy, DollarSign, Award, Star } from "lucide-react";
import { Language } from "../types";
import { CRAZY_MISSIONS, CrazyMission } from "../data/crazyMissions";
import { unlockAchievement } from "../data/achievements";
import { soundEngine } from "../lib/soundEngine";

interface CrazyMissionsModalProps {
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
  addXP: (amount: number) => void;
  onAddMoney?: (amount: number) => void;
  onTriggerDialogue: (speaker: string, textEs: string, textEn: string, onDone?: () => void) => void;
}

export default function CrazyMissionsModal({
  language,
  onClose,
  onShowNotification,
  addXP,
  onAddMoney,
  onTriggerDialogue,
}: CrazyMissionsModalProps) {
  const isEs = language === "es";
  const [selectedCharacter, setSelectedCharacter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeMission, setActiveMission] = useState<CrazyMission | null>(null);

  // Read completed missions from localStorage
  const getCompletedMissionIds = (): Set<string> => {
    try {
      const saved = localStorage.getItem("cky_completed_crazy_missions");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  };

  const [completedIds, setCompletedIds] = useState<Set<string>>(getCompletedMissionIds);

  const characters = [
    { id: "all", nameEs: "Todos", nameEn: "All", icon: "✨" },
    { id: "angela", nameEs: "Ángela", nameEn: "Angela", icon: "👻" },
    { id: "w", nameEs: "W (Guardián)", nameEn: "W (Guardian)", icon: "🛡️" },
    { id: "mama", nameEs: "Mamá", nameEn: "Mom", icon: "👩" },
    { id: "vecina", nameEs: "Vecina", nameEn: "Neighbor", icon: "🦹‍♀️" },
    { id: "alanis", nameEs: "Alanis", nameEn: "Alanis", icon: "🕊️" },
    { id: "grupo", nameEs: "Grupo & Picantes", nameEn: "Squad & Spicy", icon: "🔥" },
  ];

  const filteredMissions = CRAZY_MISSIONS.filter((m) => {
    if (selectedCharacter !== "all" && m.character !== selectedCharacter) return false;
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    return true;
  });

  const handlePlayMission = (mission: CrazyMission) => {
    soundEngine.unlockAudio();
    soundEngine.playSfx("select");
    
    // Trigger multi-step dialogue preview
    let stepIndex = 0;
    const playDialogueStep = () => {
      if (stepIndex < mission.dialoguePreview.length) {
        const step = mission.dialoguePreview[stepIndex];
        stepIndex++;
        onTriggerDialogue(
          `${step.speaker} ${step.avatar}`,
          step.textEs,
          step.textEn,
          playDialogueStep
        );
      } else {
        // Mission finished!
        const nextCompleted = new Set(completedIds);
        nextCompleted.add(mission.id);
        setCompletedIds(nextCompleted);
        localStorage.setItem("cky_completed_crazy_missions", JSON.stringify(Array.from(nextCompleted)));

        addXP(mission.rewardXP);
        if (onAddMoney && mission.rewardMoney > 0) {
          onAddMoney(mission.rewardMoney);
        }

        soundEngine.playSfx("levelUp");

        if (mission.achievementId) {
          unlockAchievement(mission.achievementId, onShowNotification, addXP);
        }

        if (onShowNotification) {
          onShowNotification({
            icon: mission.icon,
            titleEs: `¡MISIÓN CÓMICA COMPLETADA!`,
            titleEn: `CRAZY MISSION COMPLETED!`,
            subEs: `${mission.titleEs} (+${mission.rewardXP} XP, +$${mission.rewardMoney})`,
            subEn: `${mission.titleEn} (+${mission.rewardXP} XP, +$${mission.rewardMoney})`,
            color: "amber"
          });
        }
      }
    };

    onClose();
    playDialogueStep();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-mono select-none animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-purple-500/60 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950 border-b border-purple-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-900/60 border border-purple-400/50 rounded-2xl text-2xl shadow-lg shadow-purple-950">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 tracking-wider">
                  {isEs ? "CRÓNICAS DEL MODO LIBRE: MISIONES LOCAS & PICANTES" : "FREE ROAM CHRONICLES: CRAZY & SPICY MISSIONS"}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold uppercase">
                  {isEs ? "Post-Game" : "Epilogue"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                {isEs
                  ? "¡Desbloqueado tras terminar el Capítulo 1! Historias, paseos al sex shop, pijamadas y locuras sin filtro de cada personaje."
                  : "Unlocked after completing Chapter 1! Stories, adult boutique trips, wild sleepovers, and unfiltered antics for each character."}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSfx("cancel");
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {characters.map((char) => {
            const isSelected = selectedCharacter === char.id;
            return (
              <button
                key={char.id}
                onClick={() => {
                  soundEngine.playSfx("select");
                  setSelectedCharacter(char.id);
                  setActiveMission(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-md shadow-purple-900/50"
                    : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{char.icon}</span>
                <span>{isEs ? char.nameEs : char.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area: Grid / Details */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMissions.map((mission) => {
            const isCompleted = completedIds.has(mission.id);
            const isSelected = activeMission?.id === mission.id;

            return (
              <div
                key={mission.id}
                onClick={() => {
                  soundEngine.playSfx("select");
                  setActiveMission(mission);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                  isSelected
                    ? "bg-purple-950/50 border-purple-400 shadow-lg shadow-purple-950/50"
                    : isCompleted
                    ? "bg-slate-950/60 border-emerald-500/30 hover:border-emerald-400/50"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Status Watermark */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isEs ? "Vivido" : "Completed"}</span>
                  </div>
                )}

                <div>
                  {/* Category Badge & Character */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl p-1 bg-slate-900 border border-slate-800 rounded-lg">
                      {mission.icon}
                    </span>
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        mission.category === "picante"
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                          : mission.category === "sobrenatural"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        {isEs ? mission.badgeEs : mission.badgeEn}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {isEs ? mission.characterNameEs : mission.characterNameEn}
                      </p>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {isEs ? mission.titleEs : mission.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-sans mt-1 leading-relaxed line-clamp-2">
                    {isEs ? mission.summaryEs : mission.summaryEn}
                  </p>
                </div>

                {/* Footer Rewards & Action */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3" /> +{mission.rewardXP} XP
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" /> +${mission.rewardMoney}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayMission(mission);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-[11px] font-bold shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isCompleted ? (isEs ? "Revivir" : "Replay") : (isEs ? "Jugar" : "Play")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Mission Details Drawer */}
        {activeMission && (
          <div className="p-4 bg-slate-950 border-t border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-3xl p-2 bg-slate-900 border border-purple-500/40 rounded-xl">
                {activeMission.icon}
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-300">
                  {isEs ? activeMission.titleEs : activeMission.titleEn}
                </h4>
                <p className="text-[11px] text-slate-300 font-sans max-w-xl">
                  {isEs ? activeMission.summaryEs : activeMission.summaryEn}
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePlayMission(activeMission)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Flame className="w-4 h-4 fill-current text-slate-950 animate-bounce" />
              <span>{isEs ? "¡Vivir esta Aventura Ahora!" : "Live this Adventure Now!"}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

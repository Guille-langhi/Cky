import React, { useState, useEffect } from "react";
import { Language, SoulmateInfo } from "../types";
import { Swords, Shield, Sparkles, Zap, Heart, Flame, Skull } from "lucide-react";
import { androidBridge } from "../lib/androidMobileBridge";
import { soundEngine } from "../lib/soundEngine";

interface Day6DarkFormBattleModalProps {
  language: Language;
  onVictory: () => void;
  playSound: (freq: number, type?: OscillatorType, duration?: number) => void;
  soulmateInfo?: SoulmateInfo | null;
}

export default function Day6DarkFormBattleModal({
  language,
  onVictory,
  playSound,
  soulmateInfo
}: Day6DarkFormBattleModalProps) {
  const [darkFormHp, setDarkFormHp] = useState<number>(120);
  const [delayedDarkFormHp, setDelayedDarkFormHp] = useState<number>(120);
  const maxHp = 120;
  const [turn, setTurn] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string>(
    language === "es"
      ? "¡Una extraña silueta encapuchada del Limbo bloquea la habitación! CKY, Ángela y W se preparan para el combate."
      : "A strange hooded silhouette from Limbo blocks the room! CKY, Angela, and W prepare for battle."
  );
  const [animatingAttack, setAnimatingAttack] = useState<string | null>(null);
  const [isDefeated, setIsDefeated] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<"red" | "gold" | "white" | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Battle BGM Management
  useEffect(() => {
    soundEngine.unlockAudio();
    const prevTrack = soundEngine.getCurrentTrack();
    soundEngine.playBgm("battle");
    return () => {
      if (prevTrack) soundEngine.playBgm(prevTrack);
      else soundEngine.stopBgm();
    };
  }, []);

  // Lagging HP drain
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedDarkFormHp(darkFormHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [darkFormHp]);

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 450);
  };

  const handleAction = (actionType: "cky_burst" | "angela_echo" | "w_aegis") => {
    if (animatingAttack || isDefeated) return;

    if (actionType === "cky_burst") {
      setAnimatingAttack("cky");
      playSound(520, "sawtooth", 0.35);
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      triggerShake();
      setTimeout(() => setScreenFlash(null), 300);

      const dmg = 55;
      const nextHp = Math.max(0, darkFormHp - dmg);
      setDarkFormHp(nextHp);
      setBattleLog(
        language === "es"
          ? `⚡ ¡CKY canaliza una poderosa Ráfaga Astral infligiendo ${dmg} de daño!`
          : `⚡ CKY channels a powerful Astral Burst dealing ${dmg} damage!`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerDefeat();
        } else {
          setTurn((t) => t + 1);
        }
      }, 700);
    } else if (actionType === "angela_echo") {
      setAnimatingAttack("angela");
      playSound(780, "sine", 0.4);
      androidBridge.hapticImpact();
      setScreenFlash("red");
      triggerShake();
      setTimeout(() => setScreenFlash(null), 300);

      const dmg = 45;
      const nextHp = Math.max(0, darkFormHp - dmg);
      setDarkFormHp(nextHp);
      setBattleLog(
        language === "es"
          ? `🌸 ¡Ángela desata su Eco Espiritual rosa infligiendo ${dmg} de daño y aturdiendo a la sombra!`
          : `🌸 Angela unleashes her pink Spirit Echo dealing ${dmg} damage and staggering the shadow!`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerDefeat();
        } else {
          setTurn((t) => t + 1);
        }
      }, 700);
    } else if (actionType === "w_aegis") {
      setAnimatingAttack("w");
      playSound(880, "triangle", 0.45);
      androidBridge.hapticAction();
      setScreenFlash("white");
      triggerShake();
      setTimeout(() => setScreenFlash(null), 300);

      const dmg = 35;
      const nextHp = Math.max(0, darkFormHp - dmg);
      setDarkFormHp(nextHp);
      setBattleLog(
        language === "es"
          ? `🛡️ ¡W proyecta su Chispa Sagrada y Barrera Arcana infligiendo ${dmg} de daño cósmico!`
          : `🛡️ W projects his Sacred Spark & Arcane Barrier dealing ${dmg} cosmic damage!`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerDefeat();
        } else {
          setTurn((t) => t + 1);
        }
      }, 700);
    }
  };

  const triggerDefeat = () => {
    setIsDefeated(true);
    androidBridge.hapticLevelUp();
    setScreenFlash("white");
    setTimeout(() => setScreenFlash(null), 600);
    playSound(960, "sine", 0.6);
    setBattleLog(
      language === "es"
        ? "✨ ¡La Forma Oscura cae arrodillada! CKY y Ángela cargan su ataque final cuando un resplandor dorado ilumina el cielo..."
        : "✨ The Dark Form collapses! CKY and Angela charge their finishing strike as a divine golden glow lights up..."
    );
    setTimeout(() => {
      onVictory();
    }, 1200);
  };

  const hpPercent = Math.max(0, Math.min(100, (darkFormHp / maxHp) * 100));
  const delayedHpPercent = Math.max(0, Math.min(100, (delayedDarkFormHp / maxHp) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Hit Flash Overlay */}
      {screenFlash && (
        <div
          className={`absolute inset-0 pointer-events-none z-50 transition-opacity duration-150 ${
            screenFlash === "red"
              ? "bg-red-600/35"
              : screenFlash === "gold"
              ? "bg-amber-400/35"
              : "bg-white/50"
          }`}
        />
      )}

      <div className={`w-full max-w-2xl bg-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-white font-mono transition-transform ${screenShake ? "animate-shake" : ""}`}>
        {/* Background radial glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-950 border border-indigo-500/40 rounded-xl text-lg">⚔️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-indigo-300 uppercase tracking-wider">
                {language === "es" ? "Batalla: Forma Oscura del Limbo" : "Battle: Dark Form of Limbo"}
              </h2>
              <span className="text-[10px] text-indigo-400/80">
                {language === "es" ? "Amanecer del Lunes • Habitación de CKY" : "Monday Dawn • CKY's Bedroom"}
              </span>
            </div>
          </div>
          <div className="px-3 py-1 bg-indigo-950/80 border border-indigo-500/40 rounded-full text-xs font-bold text-indigo-300">
            {language === "es" ? `Turno ${turn}` : `Turn ${turn}`}
          </div>
        </div>

        {/* Enemy Status Bar with Trailing Damage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌑</span>
              <span className="font-bold text-sm text-purple-200">
                {language === "es" ? "Forma Oscura Encapuchada" : "Hooded Dark Form"}
              </span>
            </div>
            <span className="text-xs text-purple-400 font-bold">
              {darkFormHp} / {maxHp} HP
            </span>
          </div>

          {/* HP Bar with Trailing Effect */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-purple-500/30 relative">
            <div
              className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
              style={{ width: `${delayedHpPercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-rose-500 transition-all duration-300 ease-out relative z-10"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Combat Scene Animation */}
        <div className="h-44 bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl border border-slate-800/80 p-4 relative flex items-center justify-between px-8 overflow-hidden">
          {/* CKY & Allies Party */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="flex items-center gap-2">
              {/* Angela mini orb */}
              <div className="w-6 h-6 rounded-full bg-pink-400/80 animate-pulse border border-pink-200 flex items-center justify-center text-[10px]">
                🌸
              </div>
              {/* CKY Avatar */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-400 p-0.5 shadow-lg ${
                  animatingAttack === "cky" ? "scale-125 translate-x-4 transition-transform duration-300" : ""
                }`}
              >
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-2xl">
                  👱‍♀️
                </div>
              </div>
              {/* W mini orb */}
              <div className="w-6 h-6 rounded-full bg-yellow-400/80 animate-pulse border border-yellow-200 flex items-center justify-center text-[10px]">
                ✨
              </div>
            </div>
            <span className="text-[11px] font-bold text-yellow-300">CKY, Ángela & W</span>
          </div>

          {/* Attack particle effect in center */}
          {animatingAttack && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-bounce">
              {animatingAttack === "cky" && <span className="text-4xl text-yellow-300 drop-shadow-md">⚡⚡⚡</span>}
              {animatingAttack === "angela" && <span className="text-4xl text-pink-400 drop-shadow-md">🌸✨🌸</span>}
              {animatingAttack === "w" && <span className="text-4xl text-yellow-400 drop-shadow-md">🛡️✨💫</span>}
            </div>
          )}

          {/* Hooded Dark Form Silhouette */}
          <div
            className={`flex flex-col items-center gap-1 z-10 ${
              animatingAttack ? "animate-pulse" : ""
            } ${isDefeated ? "opacity-60 scale-90 transition-all duration-700" : ""}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-purple-500/60 flex items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-900/30 animate-ping" />
              <span className="text-3xl relative z-10">👤</span>
            </div>
            <span className="text-[11px] font-bold text-purple-300">
              {isDefeated ? (language === "es" ? "¡Derrotado!" : "Defeated!") : (language === "es" ? "Sombra Encapuchada" : "Hooded Shadow")}
            </span>
          </div>
        </div>

        {/* Battle Log */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed min-h-[50px] flex items-center">
          {battleLog}
        </div>

        {/* Tactical Action Buttons */}
        {!isDefeated ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleAction("cky_burst")}
              disabled={!!animatingAttack}
              className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs"
            >
              <Zap className="w-4 h-4" />
              <span>{language === "es" ? "Ráfaga Astral (CKY)" : "Astral Burst (CKY)"}</span>
            </button>

            <button
              onClick={() => handleAction("angela_echo")}
              disabled={!!animatingAttack}
              className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === "es" ? "Eco Espiritual (Ángela)" : "Spirit Echo (Angela)"}</span>
            </button>

            <button
              onClick={() => handleAction("w_aegis")}
              disabled={!!animatingAttack}
              className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs"
            >
              <Shield className="w-4 h-4" />
              <span>{language === "es" ? "Égida Sagrado (W)" : "Sacred Aegis (W)"}</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-full text-xs font-bold animate-pulse">
              ✨ {language === "es" ? "¡Intervención Celestial de Alanis en curso...!" : "Celestial Intervention by Alanis in progress..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

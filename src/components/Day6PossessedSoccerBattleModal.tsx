import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Shield, Heart, Activity, Droplet, Package } from "lucide-react";
import { Language, SoulmateInfo } from "../types";
import FloatingDamageText, { FloatingNumber } from "./FloatingDamageText";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

interface Day6PossessedSoccerBattleModalProps {
  language: Language;
  soulmateInfo: SoulmateInfo | null;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onVictory: () => void;
}

export default function Day6PossessedSoccerBattleModal({
  language,
  soulmateInfo,
  playSound,
  onVictory
}: Day6PossessedSoccerBattleModalProps) {
  const maxBossHp = 320;
  const [bossHp, setBossHp] = useState<number>(320);
  const [delayedBossHp, setDelayedBossHp] = useState<number>(320);
  const [partyHp, setPartyHp] = useState<number>(100);
  const [delayedPartyHp, setDelayedPartyHp] = useState<number>(100);
  const [turn, setTurn] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string>(
    language === "es"
      ? "⚽ ¡Mateo está poseído por el Espíritu de la Discordia de la Vecina! Sus ojos arden en llamas púrpuras y su pelota emite fuego sombrío."
      : "⚽ Mateo is possessed by the Neighbor's Discord Spirit! His eyes glow purple and his soccer ball emits shadow flame."
  );
  const [animatingAttack, setAnimatingAttack] = useState<string | null>(null);
  const [isDefeated, setIsDefeated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"skills" | "backpack">("skills");
  const [sandwichCount, setSandwichCount] = useState<number>(2);
  const [waterBottleCount, setWaterBottleCount] = useState<number>(1);
  const [perfumeCount, setPerfumeCount] = useState<number>(1);
  const [attackBuffActive, setAttackBuffActive] = useState<boolean>(false);
  const [bossBlinded, setBossBlinded] = useState<boolean>(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<"red" | "gold" | "white" | null>(null);

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
      setDelayedBossHp(bossHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [bossHp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedPartyHp(partyHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [partyHp]);

  const soulmateName = soulmateInfo?.name || "Kael";

  const showFloating = (text: string, type: "damage" | "heal" | "critical" | "buff") => {
    const id = Date.now() + Math.random();
    setFloatingNumbers([{ id, text, type }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 900);
  };

  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 450);
  };

  const executeEnemyTurn = (currentBossHp: number) => {
    if (currentBossHp <= 0) return;

    setTimeout(() => {
      if (bossBlinded) {
        soundEngine.playSfx("portal");
        setBossBlinded(false);
        showFloating(language === "es" ? "¡FALLÓ!" : "MISSED!", "buff");
        setBattleLog(
          language === "es"
            ? "🌸 ¡El espíritu en Mateo está mareado por el perfume francés y erra el disparo por completo!"
            : "🌸 The spirit in Mateo is dazed by French perfume and completely misses the shot!"
        );
        setTurn((t) => t + 1);
        return;
      }

      const enemyAttacks = [
        {
          nameEs: "⚽ Tiro del Limbo Sombreado",
          nameEn: "⚽ Shadow Limbo Shot",
          dmg: 18,
          msgEs: "¡Mateo patea un bombazo sombrío que impacta al grupo con fuego oscuro!",
          msgEn: "Mateo shoots a shadowy blast impacting the party with dark flame!"
        },
        {
          nameEs: "🦹‍♀️ Risa Macabra de la Vecina",
          nameEn: "🦹‍♀️ Neighbor's Macabre Laughter",
          dmg: 14,
          msgEs: "¡La voz de la Vecina resuena desde el cuerpo de Mateo desorientando a CKY!",
          msgEn: "The Neighbor's voice echoes from Mateo disorienting CKY!"
        },
        {
          nameEs: "⚡ Furia Poseída",
          nameEn: "⚡ Possessed Fury",
          dmg: 22,
          msgEs: "¡El espíritu de la Vecina intensifica su posesión y lanza una onda de choque!",
          msgEn: "The Neighbor's spirit intensifies possession and blasts a shockwave!"
        }
      ];

      const atk = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
      soundEngine.playSfx("hit");
      androidBridge.hapticImpact();
      setScreenFlash("red");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();

      setPartyHp((prev) => Math.max(15, prev - atk.dmg));
      showFloating(`-${atk.dmg} HP`, "damage");
      setBattleLog(
        language === "es"
          ? `${atk.nameEs}: ${atk.msgEs} (-${atk.dmg} HP al equipo)`
          : `${atk.nameEn}: ${atk.msgEn} (-${atk.dmg} HP to party)`
      );
      setTurn((t) => t + 1);
    }, 1000);
  };

  const handleAction = (
    action: "cky_blast" | "angela_slap" | "w_shield" | "soulmate_resonance" | "sandwich" | "water" | "perfume"
  ) => {
    if (isDefeated || animatingAttack) return;

    setAnimatingAttack(action);

    if (action === "cky_blast") {
      soundEngine.playSfx("critical");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();
      const baseDmg = 65;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} HP`, "critical");
      setBattleLog(
        language === "es"
          ? `⚡ ¡CKY dispara una Ráfaga Astral Directa hacia la pelota de fútbol sombría! (-${dmg} HP)`
          : `⚡ CKY fires a Direct Astral Blast at the shadowy soccer ball! (-${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 700);
    } else if (action === "angela_slap") {
      soundEngine.playSfx("hit");
      androidBridge.hapticImpact();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      const baseDmg = 55;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} HP`, "damage");
      setBattleLog(
        language === "es"
          ? `🌸 ¡Ángela se materializa con una Bofetada Fantasmal y se burla del peinado del espíritu! (-${dmg} HP)`
          : `🌸 Angela manifests with a Phantom Slap and mocks the spirit's hairstyle! (-${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 700);
    } else if (action === "w_shield") {
      soundEngine.playSfx("heal");
      androidBridge.hapticAction();
      setScreenFlash("white");
      setTimeout(() => setScreenFlash(null), 300);
      const dmg = 45;
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      setPartyHp((prev) => Math.min(100, prev + 25));
      showFloating(`+25 HP`, "heal");
      setBattleLog(
        language === "es"
          ? `🛡️ ¡W levanta la Égida Sagrada de la Heredera, reflejando el fuego oscuro y curando al grupo! (+25 HP, -${dmg} HP)`
          : `🛡️ W raises the Lady Heir's Sacred Aegis, reflecting dark flame and healing party! (+25 HP, -${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 700);
    } else if (action === "soulmate_resonance") {
      soundEngine.playSfx("critical");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();
      const baseDmg = 95;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} CRÍTICO!`, "critical");
      setBattleLog(
        language === "es"
          ? `💫 ¡${soulmateName} desata su Resonancia Híbrida desgarrando los tentáculos del Limbo que apresan a Mateo! (-${dmg} HP CRÍTICO)`
          : `💫 ${soulmateName} unleashes Hybrid Resonance tearing the Limbo tentacles binding Mateo! (-${dmg} HP CRITICAL)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 700);
    } else if (action === "sandwich") {
      if (sandwichCount <= 0) {
        setAnimatingAttack(null);
        return;
      }
      soundEngine.playSfx("heal");
      androidBridge.hapticItemPickup();
      setSandwichCount((c) => c - 1);
      setPartyHp((prev) => Math.min(100, prev + 60));
      showFloating(`+60 HP`, "heal");
      setBattleLog(
        language === "es"
          ? "🥪 ¡CKY comparte un delicioso Sándwich de Salame y Queso con el equipo! ¡Salud y energía recuperadas (+60 HP)!"
          : "🥪 CKY shares a delicious Salami & Cheese Sandwich with the team! Recovered +60 HP!"
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(bossHp);
      }, 700);
    } else if (action === "water") {
      if (waterBottleCount <= 0) {
        setAnimatingAttack(null);
        return;
      }
      soundEngine.playSfx("heal");
      androidBridge.hapticItemPickup();
      setWaterBottleCount((c) => c - 1);
      setPartyHp((prev) => Math.min(100, prev + 40));
      setAttackBuffActive(true);
      showFloating(`+40 HP & BUFF`, "buff");
      setBattleLog(
        language === "es"
          ? "🧴 ¡CKY bebe agua fresca de su botella favorita! Se rehidrata (+40 HP) y concentra su poder astral (+35% daño próximo ataque)."
          : "🧴 CKY drinks cold water from her favorite bottle! Rehydrates (+40 HP) and focuses astral energy (+35% next attack damage)."
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(bossHp);
      }, 700);
    } else if (action === "perfume") {
      if (perfumeCount <= 0) {
        setAnimatingAttack(null);
        return;
      }
      soundEngine.playSfx("fanfare");
      androidBridge.hapticItemPickup();
      setPerfumeCount((c) => c - 1);
      setBossBlinded(true);
      showFloating(`¡CEGUERA!`, "buff");
      setBattleLog(
        language === "es"
          ? "💐 ¡CKY rocía el perfume francés 'Nuit Éthérée'! El aroma embriagador ciega y desorienta al espíritu de Mateo (0 daño próximo turno)."
          : "💐 CKY sprays French perfume 'Nuit Éthérée'! The aroma blinds and disorients Mateo's spirit (0 damage next enemy turn)."
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(bossHp);
      }, 700);
    }
  };

  const triggerVictory = () => {
    setIsDefeated(true);
    soundEngine.playSfx("fanfare");
    androidBridge.hapticLevelUp();
    setScreenFlash("white");
    setTimeout(() => setScreenFlash(null), 600);
    setBattleLog(
      language === "es"
        ? "✨ ¡¡EL ESPÍRITU OSCURO DE LA VECINA EMITE UN ALARIDO, EXPLOTA EN LLAMAS PURAS Y SE DESVANECE PARA SIEMPRE!! Mateo cae arrodillado libre de posesión..."
        : "✨ THE NEIGHBOR'S DARK SPIRIT SHRIEKS, EXPLODES IN PURE FLAME AND DISSIPATES FOREVER!! Mateo falls to his knees free from possession..."
    );
    setTimeout(() => {
      onVictory();
    }, 1800);
  };

  const bossHpPercent = Math.max(0, Math.min(100, (bossHp / maxBossHp) * 100));
  const delayedBossHpPercent = Math.max(0, Math.min(100, (delayedBossHp / maxBossHp) * 100));
  const delayedPartyHpPercent = Math.max(0, Math.min(100, delayedPartyHp));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Screen Hit Flash Overlay */}
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

      <div
        className={`w-full max-w-2xl bg-slate-950 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 text-white font-mono transition-transform duration-100 ${
          isScreenShaking ? "translate-x-1 -translate-y-1 scale-[1.01]" : ""
        }`}
      >
        <FloatingDamageText numbers={floatingNumbers} />

        {/* Background ambient glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-rose-950 border border-rose-500/50 rounded-2xl text-xl animate-pulse">
              ⚽
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-display text-rose-300 uppercase tracking-wider">
                {language === "es"
                  ? "Batalla: Mateo Poseído (Espíritu de la Vecina)"
                  : "Battle: Possessed Mateo (Neighbor's Spirit)"}
              </h2>
              <span className="text-[10px] text-rose-400/80">
                {language === "es"
                  ? "Patio del Colegio • Cancha de Fútbol"
                  : "School Courtyard • Soccer Pitch"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-950/80 border border-rose-500/40 rounded-full text-xs font-bold text-rose-300">
              {language === "es" ? `Turno ${turn}` : `Turn ${turn}`}
            </span>
          </div>
        </div>

        {/* Boss Status Bar with Trailing Damage */}
        <div className="bg-slate-900/90 border border-rose-950 rounded-2xl p-3.5 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦹‍♂️</span>
              <div>
                <span className="font-bold text-xs sm:text-sm text-rose-200">
                  {language === "es"
                    ? "Mateo Poseído • Parásito del Limbo"
                    : "Possessed Mateo • Limbo Parasite"}
                </span>
                <span className="block text-[9px] text-purple-400">
                  {language === "es"
                    ? "Controlado por la Vecina"
                    : "Controlled by the Neighbor"}
                </span>
              </div>
            </div>
            <span className="text-xs text-rose-400 font-bold">
              {bossHp} / {maxBossHp} HP
            </span>
          </div>
          {/* Boss HP Bar with Trailing Effect */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-rose-500/40 relative">
            <div
              className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
              style={{ width: `${delayedBossHpPercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 transition-all duration-300 ease-out relative z-10"
              style={{ width: `${bossHpPercent}%` }}
            />
          </div>
        </div>

        {/* Combat Scene Animation Canvas */}
        <div className="h-44 bg-gradient-to-b from-slate-950 via-emerald-950/30 to-slate-900 rounded-2xl border border-emerald-900/40 p-4 relative flex items-center justify-between px-6 sm:px-10 overflow-hidden">
          {/* Soccer pitch lines overlay */}
          <div className="absolute inset-0 border-t border-b border-emerald-500/10 pointer-events-none" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/10 pointer-events-none" />

          {/* CKY & Allies Party */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="flex items-center gap-1.5">
              {/* Angela mini orb */}
              <div className="w-6 h-6 rounded-full bg-pink-400/90 animate-pulse border border-pink-200 flex items-center justify-center text-[10px] shadow-lg">
                🌸
              </div>
              {/* Soulmate mini avatar */}
              <div className="w-7 h-7 rounded-xl bg-purple-500/80 border border-purple-300 flex items-center justify-center text-xs shadow-lg animate-bounce">
                {soulmateInfo?.avatar || "🧑‍🦱"}
              </div>
              {/* CKY Avatar */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 p-0.5 shadow-xl ${
                  animatingAttack ? "scale-125 translate-x-3 transition-transform duration-300" : ""
                }`}
              >
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-2xl">
                  👱‍♀️
                </div>
              </div>
              {/* W mini orb */}
              <div className="w-6 h-6 rounded-full bg-yellow-400/90 animate-pulse border border-yellow-200 flex items-center justify-center text-[10px] shadow-lg">
                ✨
              </div>
            </div>
            <span className="text-[10px] font-bold text-yellow-300">
              CKY, {soulmateName}, Ángela & W
            </span>
          </div>

          {/* Attack particle effect in center */}
          {animatingAttack && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-bounce">
              {animatingAttack === "cky_blast" && (
                <span className="text-4xl text-yellow-300 drop-shadow-md">⚡⚡⚡</span>
              )}
              {animatingAttack === "angela_slap" && (
                <span className="text-4xl text-pink-400 drop-shadow-md">🌸💥🌸</span>
              )}
              {animatingAttack === "w_shield" && (
                <span className="text-4xl text-yellow-400 drop-shadow-md">🛡️✨💫</span>
              )}
              {animatingAttack === "soulmate_resonance" && (
                <span className="text-4xl text-purple-300 drop-shadow-md">💫🔮✨</span>
              )}
              {animatingAttack === "sandwich" && (
                <span className="text-4xl text-emerald-400 drop-shadow-md">🥪💖✨</span>
              )}
            </div>
          )}

          {/* Possessed Mateo Sprite */}
          <div
            className={`flex flex-col items-center gap-1 z-10 ${
              animatingAttack ? "animate-pulse" : ""
            } ${isDefeated ? "opacity-50 scale-75 transition-all duration-700" : ""}`}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-900/40 animate-ping" />
                <span className="text-3xl relative z-10">⚽🧑</span>
              </div>
              {/* Shadow aura */}
              <div className="absolute -inset-2 rounded-2xl bg-purple-600/30 blur-sm pointer-events-none animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-rose-300">
              {isDefeated
                ? language === "es"
                  ? "¡Espíritu Destruido!"
                  : "Spirit Purified!"
                : language === "es"
                ? "Mateo Poseído"
                : "Possessed Mateo"}
            </span>
          </div>
        </div>

        {/* Party HP Bar with Trailing Damage */}
        <div className="flex items-center justify-between bg-slate-900/80 rounded-xl px-4 py-2 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span className="font-bold">{language === "es" ? "Salud del Grupo:" : "Party Health:"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 sm:w-44 h-2 bg-slate-950 rounded-full overflow-hidden border border-emerald-500/40 relative">
              <div
                className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                style={{ width: `${delayedPartyHpPercent}%` }}
              />
              <div
                className="h-full bg-emerald-400 transition-all duration-200 relative z-10"
                style={{ width: `${partyHp}%` }}
              />
            </div>
            <span className="font-mono text-emerald-400 font-bold">{partyHp}%</span>
          </div>
        </div>

        {/* Battle Log */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed min-h-[48px] flex items-center">
          {battleLog}
        </div>

        {/* Tactical Action Buttons with Tabs */}
        {!isDefeated ? (
          <div className="space-y-2">
            {/* Tab Selector */}
            <div className="flex gap-2 border-b border-rose-950 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("skills")}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  activeTab === "skills"
                    ? "bg-rose-950 text-rose-200 border border-rose-500 shadow-md"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                {language === "es" ? "Ataques del Equipo" : "Party Attacks"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("backpack")}
                className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  activeTab === "backpack"
                    ? "bg-emerald-950 text-emerald-200 border border-emerald-500 shadow-md"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                {language === "es" ? "Mochila / Ítems" : "Backpack / Items"}
                {(sandwichCount > 0 || waterBottleCount > 0 || perfumeCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {activeTab === "skills" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleAction("cky_blast")}
                  disabled={!!animatingAttack}
                  className="p-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-[11px] min-h-[44px]"
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{language === "es" ? "Ráfaga Astral" : "Astral Blast"}</span>
                </button>

                <button
                  onClick={() => handleAction("angela_slap")}
                  disabled={!!animatingAttack}
                  className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-[11px] min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{language === "es" ? "Bofetada Ángela" : "Angela Slap"}</span>
                </button>

                <button
                  onClick={() => handleAction("w_shield")}
                  disabled={!!animatingAttack}
                  className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-[11px] min-h-[44px]"
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{language === "es" ? "Égida de W" : "W Aegis"}</span>
                </button>

                <button
                  onClick={() => handleAction("soulmate_resonance")}
                  disabled={!!animatingAttack}
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-[11px] min-h-[44px]"
                >
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{language === "es" ? `Resonancia (${soulmateName})` : `Resonance`}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleAction("sandwich")}
                  disabled={!!animatingAttack || sandwichCount <= 0}
                  className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs min-h-[44px]"
                >
                  <span>🥪</span>
                  <span>{language === "es" ? `Sándwich de Salame (+60 HP) [${sandwichCount}]` : `Salami Sandwich (+60 HP) [${sandwichCount}]`}</span>
                </button>

                <button
                  onClick={() => handleAction("water")}
                  disabled={!!animatingAttack || waterBottleCount <= 0}
                  className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs min-h-[44px]"
                >
                  <Droplet className="w-3.5 h-3.5 shrink-0 text-cyan-200" />
                  <span>{language === "es" ? `Botella de Agua (+Buff) [${waterBottleCount}]` : `Water Bottle (+Buff) [${waterBottleCount}]`}</span>
                </button>

                <button
                  onClick={() => handleAction("perfume")}
                  disabled={!!animatingAttack || perfumeCount <= 0}
                  className="p-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-fuchsia-200" />
                  <span>{language === "es" ? `Perfume Francés (Ceguera) [${perfumeCount}]` : `French Perfume (Blind) [${perfumeCount}]`}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold animate-pulse">
              ✨ {language === "es" ? "¡El espíritu de la vecina ha sido destruido! Mateo vuelve a la normalidad..." : "The neighbor's spirit is destroyed! Mateo returns to normal..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

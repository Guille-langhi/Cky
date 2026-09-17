import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Shield, Heart, Activity, Flame, Droplet, Package } from "lucide-react";
import { Language, SoulmateInfo } from "../types";
import FloatingDamageText, { FloatingNumber } from "./FloatingDamageText";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

interface Day7LabBossBattleModalProps {
  language: Language;
  soulmateInfo: SoulmateInfo | null;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onVictory: () => void;
}

export default function Day7LabBossBattleModal({
  language,
  soulmateInfo,
  playSound,
  onVictory
}: Day7LabBossBattleModalProps) {
  const maxBossHp = 420;
  const [bossHp, setBossHp] = useState<number>(420);
  const [delayedBossHp, setDelayedBossHp] = useState<number>(420);
  const [partyHp, setPartyHp] = useState<number>(100);
  const [delayedPartyHp, setDelayedPartyHp] = useState<number>(100);
  const [turn, setTurn] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string>(
    language === "es"
      ? "🧪 ¡El Espíritu Alquimista Oscuro de la Vecina flota sobre el círculo alquímico! El Profesor Montenegro y Abril están atrapados en cadenas espectrales obligados a sintetizar venenos del Limbo."
      : "🧪 The Dark Alchemist Spirit floats over the alchemical circle! Professor Montenegro and Abril are trapped in spectral chains, forced to brew Limbo poisons."
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
      const enemyAttacks = [
        {
          nameEs: "🧪 Frasco de Ácido Sombrío",
          nameEn: "🧪 Shadow Acid Flask",
          dmg: 18,
          msgEs: "¡El alquimista arroja un matraz de ácido ectoplásmico que corroe el aire!",
          msgEn: "The alchemist throws an ectoplasmic acid flask that corrodes the air!"
        },
        {
          nameEs: "💨 Vaho Alquímico de Sumisión",
          nameEn: "💨 Submission Alchemy Mist",
          dmg: 15,
          msgEs: "¡Vapores púrpuras emanan del círculo obligando al grupo a inhalar veneno!",
          msgEn: "Purple fumes billow from the circle forcing the team to inhale poison!"
        },
        {
          nameEs: "🦹‍♀️ Mandato Maldito de la Vecina",
          nameEn: "🦹‍♀️ Neighbor's Cursed Command",
          dmg: 24,
          msgEs: "¡La voz de la Vecina retumba en el laboratorio, duplicando la densidad del círculo alquímico!",
          msgEn: "The Neighbor's voice booms across the lab, doubling the alchemical circle's power!"
        }
      ];

      if (bossBlinded) {
        soundEngine.playSfx("portal");
        setBossBlinded(false);
        showFloating(language === "es" ? "¡FALLÓ!" : "MISSED!", "buff");
        setBattleLog(
          language === "es"
            ? "🌸 ¡El Alquimista Oscuro está cegado por el perfume francés y derrama sus pócimas sin dañar al equipo!"
            : "🌸 The Dark Alchemist is blinded by the French perfume and spills potions harmlessly!"
        );
        setTurn((t) => t + 1);
        return;
      }

      const atk = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
      soundEngine.playSfx("hit");
      androidBridge.hapticImpact();
      setScreenFlash("red");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();

      setPartyHp((prev) => Math.max(12, prev - atk.dmg));
      showFloating(`-${atk.dmg} HP`, "damage");
      setBattleLog(
        language === "es"
          ? `${atk.nameEs}: ${atk.msgEs} (-${atk.dmg} HP al equipo)`
          : `${atk.nameEn}: ${atk.msgEn} (-${atk.dmg} HP to party)`
      );
      setTurn((t) => t + 1);
    }, 1100);
  };

  const handleAction = (
    action: "cky_shockwave" | "angela_snark" | "w_purification" | "soulmate_combo" | "sandwich" | "water" | "perfume"
  ) => {
    if (isDefeated || animatingAttack) return;

    setAnimatingAttack(action);

    if (action === "cky_shockwave") {
      soundEngine.playSfx("critical");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();
      const baseDmg = 85;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} HP`, "critical");
      setBattleLog(
        language === "es"
          ? `⚡ ¡CKY desata una Onda de Choque Astral Fulminante que rompe las probetas oscuras! (-${dmg} HP)`
          : `⚡ CKY unleashes a Fulminant Astral Shockwave shattering dark beakers! (-${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 750);
    } else if (action === "angela_snark") {
      soundEngine.playSfx("hit");
      androidBridge.hapticImpact();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      const baseDmg = 80;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} HP`, "damage");
      setBattleLog(
        language === "es"
          ? `👻 ¡Ángela se materializa y desbarata el matraz: '¡Tu química es más trucha que la de la vecina!'! (-${dmg} HP)`
          : `👻 Angela materializes and disrupts the flask: 'Your chemistry is faker than the neighbor!'! (-${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 750);
    } else if (action === "w_purification") {
      soundEngine.playSfx("heal");
      androidBridge.hapticAction();
      setScreenFlash("white");
      setTimeout(() => setScreenFlash(null), 300);
      setPartyHp((prev) => Math.min(100, prev + 35));
      showFloating(`+35 HP`, "heal");
      const dmg = 60;
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      setBattleLog(
        language === "es"
          ? `🛡️ ¡W irradia su Luz Purificadora Ancestral, disipando los gases tóxicos y debilitando las cadenas del Profesor! (+35 HP, -${dmg} HP al jefe)`
          : `🛡️ W radiates Ancient Purifying Light, clearing toxic fumes and weakening chains on the Professor! (+35 HP, -${dmg} HP to boss)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 750);
    } else if (action === "soulmate_combo") {
      soundEngine.playSfx("critical");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();
      const baseDmg = 115;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} CRÍTICO!`, "critical");
      setBattleLog(
        language === "es"
          ? `💖 ¡${soulmateName} sincroniza su parte humana y astral con CKY en una Doble Llama Resonante que destruye el núcleo alquímico! (-${dmg} HP CRÍTICO)`
          : `💖 ${soulmateName} synchronizes human & astral power with CKY in a Dual Resonant Flare obliterating the alchemical core! (-${dmg} CRIT HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) {
          triggerVictory();
        } else {
          executeEnemyTurn(nextHp);
        }
      }, 750);
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
          ? "🥪 ¡El equipo recupera fuerzas con el sándwich de salame y queso! (+60 HP al equipo)"
          : "🥪 The team regains stamina with the salami & cheese sandwich! (+60 HP to party)"
      );
      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(bossHp);
      }, 750);
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
          ? "🧴 ¡CKY toma un buen trago de agua fría! (+40 HP y +35% de daño en el próximo ataque)."
          : "🧴 CKY drinks cold water! (+40 HP and +35% damage on next attack)."
      );
      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(bossHp);
      }, 750);
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
          ? "💐 ¡CKY esparce el perfume de lujo! El Alquimista Oscuro se aturde y cegará su próximo ataque."
          : "💐 CKY sprays luxury perfume! The Dark Alchemist is blinded for the next turn."
      );
      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(bossHp);
      }, 750);
    }
  };

  const triggerVictory = () => {
    setIsDefeated(true);
    soundEngine.playSfx("fanfare");
    androidBridge.hapticLevelUp();
    setScreenFlash("white");
    setTimeout(() => setScreenFlash(null), 500);
    setBattleLog(
      language === "es"
        ? "🎉 ¡VICTORIA TOTAL! ¡El Espíritu Alquimista Oscuro ha sido destruido! El círculo se desintegra y el Profesor Montenegro y Abril caen al suelo libres y a salvo."
        : "🎉 TOTAL VICTORY! The Dark Alchemist Spirit has been destroyed! The circle shatters and Professor Montenegro and Abril are free and safe."
    );
    setTimeout(() => {
      onVictory();
    }, 1800);
  };

  const bossHpPercent = Math.max(0, Math.min(100, (bossHp / maxBossHp) * 100));
  const delayedBossHpPercent = Math.max(0, Math.min(100, (delayedBossHp / maxBossHp) * 100));
  const delayedPartyHpPercent = Math.max(0, Math.min(100, delayedPartyHp));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in font-mono">
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
        className={`bg-slate-900 border-2 border-red-600 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden relative shadow-red-950/50 transition-transform duration-100 ${
          isScreenShaking ? "translate-x-1 -translate-y-1 scale-[1.01]" : ""
        }`}
      >
        <FloatingDamageText numbers={floatingNumbers} />
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-red-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-red-950 border border-red-500/50 rounded-xl animate-bounce">
              🧪🧙‍♂️
            </span>
            <div>
              <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                <span>{language === "es" ? "JEFE DE MAZMORRA: AULA LABORATORIO" : "DUNGEON BOSS: CHEMISTRY LAB"}</span>
                <span className="text-[8px] bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.5 rounded">
                  {language === "es" ? "Día 7 Clímax" : "Day 7 Climax"}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Rescata al Profesor Montenegro y a Abril de la posesión" : "Rescue Professor Montenegro and Abril from possession"}
              </p>
            </div>
          </div>
          <span className="text-xs bg-red-950 text-red-300 font-bold px-2.5 py-1 rounded-full border border-red-700">
            {language === "es" ? `Turno ${turn}` : `Turn ${turn}`}
          </span>
        </div>

        {/* Combat Area */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          
          {/* Captives HUD */}
          <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">⛓️👨‍🏫👩‍🎓</span>
              <span>
                {language === "es"
                  ? "Rehenes: Profesor de Química & Abril (Atrapados en círculo alquímico)"
                  : "Captives: Chemistry Professor & Abril (Trapped in alchemical circle)"}
              </span>
            </div>
            <span className="text-[10px] text-yellow-400 font-bold">
              {isDefeated ? (language === "es" ? "¡LIBERADOS!" : "FREED!") : (language === "es" ? "EN PELIGRO" : "IN DANGER")}
            </span>
          </div>

          {/* Boss HUD */}
          <div className="p-3 bg-slate-950 border-2 border-red-600/50 rounded-2xl flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-pulse">🧪🧙‍♂️</span>
                <div>
                  <h4 className="font-bold text-xs text-red-200 flex items-center gap-1.5">
                    <span>{language === "es" ? "Espíritu Alquimista Oscuro" : "Dark Alchemist Spirit"}</span>
                    <span className="text-[8px] bg-purple-950 text-purple-300 border border-purple-700 px-1.5 py-0.5 rounded">
                      {language === "es" ? "Lugarteniente de la Vecina" : "Neighbor's Lieutenant"}
                    </span>
                  </h4>
                  <p className="text-[9px] text-red-400 font-semibold">
                    {language === "es" ? "Poder: Alquimia Prohibida del Limbo • Debilidad: Resonancia Gemela" : "Power: Forbidden Limbo Alchemy • Weakness: Twin Resonance"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400 font-mono">
                {bossHp} / {maxBossHp} HP
              </span>
            </div>

            {/* Boss Health Bar with Trailing Damage */}
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                style={{ width: `${delayedBossHpPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-red-600 to-rose-500 transition-all duration-200 rounded-full relative z-10"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>
          </div>

          {/* Party HUD */}
          <div className="p-3 bg-slate-950 border border-sky-500/40 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <span className="text-xl p-1 bg-yellow-950/80 border border-yellow-500/50 rounded-full">👧</span>
                  <span className="text-xl p-1 bg-sky-950/80 border border-sky-500/50 rounded-full">👻</span>
                  <span className="text-xl p-1 bg-purple-950/80 border border-purple-500/50 rounded-full">🧖‍♂️</span>
                  <span className="text-xl p-1 bg-pink-950/80 border border-pink-500/50 rounded-full">💖</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-sky-200">
                    CKY, Ángela, W & {soulmateName}
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    {language === "es" ? "Escuadrón de Justicia Escolar" : "School Justice Squad"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" />
                <span>{partyHp} / 100 HP</span>
              </div>
            </div>

            {/* Party Health Bar with Trailing Damage */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                style={{ width: `${delayedPartyHpPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 transition-all duration-200 rounded-full relative z-10"
                style={{ width: `${partyHp}%` }}
              />
            </div>
          </div>

          {/* Battle Log Box */}
          <div className="p-3 bg-black/85 border border-slate-800 rounded-xl min-h-[56px] flex items-center">
            <p className="text-xs text-slate-200 leading-relaxed animate-fade-in">
              {battleLog}
            </p>
          </div>

          {/* Tactical Action Buttons with Tabs */}
          {!isDefeated ? (
            <div className="space-y-2">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("skills")}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    activeTab === "skills"
                      ? "bg-red-950 text-red-200 border border-red-500 shadow-md"
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
                    onClick={() => handleAction("cky_shockwave")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Onda CKY" : "CKY Wave"}</span>
                  </button>

                  <button
                    onClick={() => handleAction("angela_snark")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Sarcasmo" : "Snark"}</span>
                  </button>

                  <button
                    onClick={() => handleAction("w_purification")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Luz de W" : "W's Light"}</span>
                  </button>

                  <button
                    onClick={() => handleAction("soulmate_combo")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Flame className="w-4 h-4 shrink-0 text-yellow-300" />
                    <span>{language === "es" ? "Llama Resonante" : "Resonant Flare"}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAction("sandwich")}
                    disabled={isDefeated || animatingAttack !== null || sandwichCount <= 0}
                    className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs min-h-[44px]"
                  >
                    <span>🥪</span>
                    <span>{language === "es" ? `Sándwich (+60 HP) [${sandwichCount}]` : `Sandwich (+60 HP) [${sandwichCount}]`}</span>
                  </button>

                  <button
                    onClick={() => handleAction("water")}
                    disabled={isDefeated || animatingAttack !== null || waterBottleCount <= 0}
                    className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs min-h-[44px]"
                  >
                    <Droplet className="w-3.5 h-3.5 shrink-0 text-cyan-200" />
                    <span>{language === "es" ? `Agua (+Buff) [${waterBottleCount}]` : `Water (+Buff) [${waterBottleCount}]`}</span>
                  </button>

                  <button
                    onClick={() => handleAction("perfume")}
                    disabled={isDefeated || animatingAttack !== null || perfumeCount <= 0}
                    className="p-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-fuchsia-200" />
                    <span>{language === "es" ? `Perfume (Ceguera) [${perfumeCount}]` : `Perfume (Blind) [${perfumeCount}]`}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold animate-pulse">
                ✨ {language === "es" ? "¡El laboratorio fue purificado y los rehenes están a salvo!" : "The lab has been purified and hostages are safe!"}
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

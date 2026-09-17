import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Shield, Heart, Activity, Droplet, Package } from "lucide-react";
import { Language, SoulmateInfo } from "../types";
import FloatingDamageText, { FloatingNumber } from "./FloatingDamageText";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

interface Day7BasementMinionBattleModalProps {
  language: Language;
  soulmateInfo: SoulmateInfo | null;
  minionType: "steam_specter" | "discord_shadow";
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onVictory: () => void;
}

export default function Day7BasementMinionBattleModal({
  language,
  soulmateInfo,
  minionType,
  playSound,
  onVictory
}: Day7BasementMinionBattleModalProps) {
  const isSteam = minionType === "steam_specter";
  const enemyName = isSteam
    ? (language === "es" ? "Espectro Guardián de las Calderas" : "Boiler Guardian Specter")
    : (language === "es" ? "Sombra de Discordia Escolar" : "School Discord Shadow");
  const enemySprite = isSteam ? "💨👻" : "👤🔥";
  const enemyMaxHp = isSteam ? 220 : 260;

  const [enemyHp, setEnemyHp] = useState<number>(enemyMaxHp);
  const [delayedEnemyHp, setDelayedEnemyHp] = useState<number>(enemyMaxHp);
  const [partyHp, setPartyHp] = useState<number>(100);
  const [delayedPartyHp, setDelayedPartyHp] = useState<number>(100);
  const [turn, setTurn] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string>(
    isSteam
      ? (language === "es"
          ? "💨 ¡El Espectro de las Calderas bloquea el paso con ráfagas de vapor oscuro! W recuerda: '¡Es débil al viento purificador y a la luz de los espíritus!'"
          : "💨 The Boiler Specter blocks the corridor with dark steam! W recalls: 'It is weak against purifying wind and spirit light!'")
      : (language === "es"
          ? "👤 ¡Una Sombra de Discordia surge de las tuberías protegiendo el Generador del Limbo! W advierte: '¡Ataca con resonancia de amor y chispa astral!'"
          : "👤 A Discord Shadow surges from the pipes guarding the Limbo Generator! W warns: 'Strike with love resonance and astral spark!'")
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
      setDelayedEnemyHp(enemyHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [enemyHp]);

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

  const executeEnemyTurn = (currentEnemyHp: number) => {
    if (currentEnemyHp <= 0) return;

    setTimeout(() => {
      if (bossBlinded) {
        soundEngine.playSfx("portal");
        setBossBlinded(false);
        showFloating(language === "es" ? "¡FALLÓ!" : "MISSED!", "buff");
        setBattleLog(
          language === "es"
            ? `🌸 ¡El ${enemyName} está aturdido por el perfume francés y falla su ataque!`
            : `🌸 The ${enemyName} is stunned by the French perfume and misses its attack!`
        );
        setTurn((t) => t + 1);
        return;
      }

      const enemyAttacks = isSteam
        ? [
            {
              nameEs: "💨 Chorro de Vapor Hirviente",
              nameEn: "💨 Scalding Steam Blast",
              dmg: 14,
              msgEs: "¡El espectro arroja vapor del Limbo que quema y ciega momentáneamente!",
              msgEn: "The specter blasts Limbo steam that burns and blinds!"
            },
            {
              nameEs: "🦹‍♀️ Susurro de la Vecina",
              nameEn: "🦹‍♀️ Neighbor's Whisper",
              dmg: 12,
              msgEs: "¡Un eco sombrío de la Vecina intenta debilitar la moral del grupo!",
              msgEn: "A shadowy echo of the Neighbor tries to weaken party morale!"
            }
          ]
        : [
            {
              nameEs: "🔥 Látigo de Ectoplasma",
              nameEn: "🔥 Ectoplasm Whip",
              dmg: 16,
              msgEs: "¡La sombra azota con cables de energía oscura provenientes del generador!",
              msgEn: "The shadow lashes with dark energy conduits from the generator!"
            },
            {
              nameEs: "🌑 Vórtice de Angustia",
              nameEn: "🌑 Vortex of Anguish",
              dmg: 18,
              msgEs: "¡La sombra expande una onda de rencor escolar!",
              msgEn: "The shadow expands a wave of school grudge!"
            }
          ];

      const atk = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
      soundEngine.playSfx("hit");
      androidBridge.hapticImpact();
      setScreenFlash("red");
      setTimeout(() => setScreenFlash(null), 300);
      triggerScreenShake();

      setPartyHp((prev) => Math.max(10, prev - atk.dmg));
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
      const baseDmg = isSteam ? 65 : 70;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextHp);
      showFloating(`-${dmg} HP`, "critical");
      setBattleLog(
        language === "es"
          ? `⚡ ¡CKY dispara una Ráfaga Astral Directa con precisión implacable! (-${dmg} HP)`
          : `⚡ CKY fires a Direct Astral Blast with pinpoint precision! (-${dmg} HP)`
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
      const baseDmg = isSteam ? 75 : 60; // Extra effective on steam
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextHp);
      showFloating(`-${dmg} HP`, "damage");
      setBattleLog(
        language === "es"
          ? `👻 ¡Ángela se abalanza con un Golpe Astral Sarcástico: '¡Volvé a la cañería, mamarracho!'! ¡Debilidad del Grimorio aprovechada! (-${dmg} HP)`
          : `👻 Angela charges with a Sarcastic Astral Slap: 'Back to the pipes, trash!'! Grimoire weakness exploited! (-${dmg} HP)`
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
      setPartyHp((prev) => Math.min(100, prev + 25));
      showFloating(`+25 HP`, "heal");
      const dmg = 45;
      const nextHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextHp);
      setBattleLog(
        language === "es"
          ? `🛡️ ¡W despliega su Vórtice Celestial y disipa la oscuridad! (+25 HP al equipo, -${dmg} HP al enemigo)`
          : `🛡️ W deploys his Celestial Vortex and dispels the darkness! (+25 HP to party, -${dmg} HP to enemy)`
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
      const baseDmg = isSteam ? 80 : 95; // Extra effective on discord shadow
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextHp);
      showFloating(`-${dmg} CRÍTICO!`, "critical");
      setBattleLog(
        language === "es"
          ? `💖 ¡${soulmateName} canaliza su mitad humana y espiritual, liberando un Impacto de Resonancia Cósmica fulminante! (-${dmg} HP)`
          : `💖 ${soulmateName} channels hybrid cosmic energy, releasing a devastating Resonance Impact! (-${dmg} HP)`
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
          ? "🥪 ¡El equipo comparte un bocado del sándwich de salame y queso! ¡Se restauran +60 HP!"
          : "🥪 The party shares a bite of the salami & cheese sandwich! Restores +60 HP!"
      );
      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(enemyHp);
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
          ? "🧴 ¡CKY toma un trago de agua bien fresca! (+40 HP y +35% de ataque próximo)."
          : "🧴 CKY drinks cold water! (+40 HP and +35% next attack damage)."
      );
      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(enemyHp);
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
          ? `💐 ¡CKY esparce el perfume francés! El ${enemyName} queda desorientado (0 daño próximo turno).`
          : `💐 CKY sprays the perfume! The ${enemyName} is blinded (0 damage next turn).`
      );
      setTimeout(() => {
        setAnimatingAttack(null);
        executeEnemyTurn(enemyHp);
      }, 700);
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
        ? `✨ ¡VICTORIA! ¡El ${enemyName} ha sido pulverizado y disipado por la luz del equipo!`
        : `✨ VICTORY! The ${enemyName} has been pulverized and dispelled by the team's light!`
    );
    setTimeout(() => {
      onVictory();
    }, 1500);
  };

  const enemyHpPercent = Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100));
  const delayedEnemyHpPercent = Math.max(0, Math.min(100, (delayedEnemyHp / enemyMaxHp) * 100));
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
        className={`bg-slate-900 border-2 border-red-500/60 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden relative transition-transform duration-100 ${
          isScreenShaking ? "translate-x-1 -translate-y-1 scale-[1.01]" : ""
        }`}
      >
        <FloatingDamageText numbers={floatingNumbers} />
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-red-950 border border-red-500/50 rounded-xl">
              {enemySprite}
            </span>
            <div>
              <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider">
                {language === "es" ? "COMBATE EN EL SÓTANO • DÍA 7" : "BASEMENT COMBAT • DAY 7"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Aplicando las debilidades del Grimorio de W" : "Applying weaknesses decoded from W's Grimoire"}
              </p>
            </div>
          </div>
          <span className="text-xs bg-slate-800 text-purple-300 font-bold px-2.5 py-1 rounded-full border border-purple-500/30">
            {language === "es" ? `Turno ${turn}` : `Turn ${turn}`}
          </span>
        </div>

        {/* Combat Area */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          
          {/* Enemy HUD */}
          <div className="p-3 bg-slate-950 border border-red-500/40 rounded-2xl flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">{enemySprite}</span>
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>{enemyName}</span>
                    <span className="text-[8px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
                      {language === "es" ? "Esbirro de la Vecina" : "Neighbor Minion"}
                    </span>
                  </h4>
                  <p className="text-[9px] text-red-400 font-semibold">
                    {language === "es" ? "Debilidad: Ataques de Luz y Viento Sagrado" : "Weakness: Light & Sacred Wind"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400">
                {enemyHp} / {enemyMaxHp} HP
              </span>
            </div>

            {/* Health Bar with Trailing Damage */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                style={{ width: `${delayedEnemyHpPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-200 rounded-full relative z-10"
                style={{ width: `${enemyHpPercent}%` }}
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
                    {language === "es" ? "Equipo de Purificación Astral" : "Astral Purifying Party"}
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
          <div className="p-3 bg-black/80 border border-slate-800 rounded-xl min-h-[52px] flex items-center">
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
                    onClick={() => handleAction("cky_blast")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Ráfaga CKY" : "CKY's Blast"}</span>
                  </button>

                  <button
                    onClick={() => handleAction("angela_slap")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Golpe Ángela" : "Angela Slap"}</span>
                  </button>

                  <button
                    onClick={() => handleAction("w_shield")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Escudo W" : "W's Shield"}</span>
                  </button>

                  <button
                    onClick={() => handleAction("soulmate_resonance")}
                    disabled={isDefeated || animatingAttack !== null}
                    className="p-2.5 bg-gradient-to-b from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <Activity className="w-4 h-4 shrink-0" />
                    <span>{language === "es" ? "Resonancia" : "Resonance"}</span>
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
                ✨ {language === "es" ? "¡El enemigo fue derrotado y se disipó en el aire!" : "The enemy was defeated and dispelled into thin air!"}
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

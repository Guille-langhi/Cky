import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Shield, Heart, Activity, Droplet, Package, Eye } from "lucide-react";
import { Language } from "../types";
import FloatingDamageText, { FloatingNumber } from "./FloatingDamageText";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

interface Day2ShadowBattleModalProps {
  language: Language;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onVictory: () => void;
}

export default function Day2ShadowBattleModal({
  language,
  playSound,
  onVictory
}: Day2ShadowBattleModalProps) {
  const enemyName = language === "es" ? "Sombra Rencorosa del Limbo" : "Spiteful Limbo Shadow";
  const enemyMaxHp = 180;

  const [enemyHp, setEnemyHp] = useState<number>(enemyMaxHp);
  const [delayedEnemyHp, setDelayedEnemyHp] = useState<number>(enemyMaxHp);
  const [partyHp, setPartyHp] = useState<number>(100);
  const [delayedPartyHp, setDelayedPartyHp] = useState<number>(100);
  const [turn, setTurn] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string>(
    language === "es"
      ? "👤 ¡Una Sombra Rencorosa invocada por la vecina surge de las criptas del cementerio! Ángela bromea: '¡CKY, mirá ese adefesio! ¡Vamos a darle una paliza con mi distracción picante!'"
      : "👤 A Spiteful Shadow summoned by the neighbor emerges from the cemetery crypts! Angela jokes: 'CKY, look at that freak! Let's beat it with my spicy taunt!'"
  );
  const [animatingAttack, setAnimatingAttack] = useState<string | null>(null);
  const [isDefeated, setIsDefeated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"skills" | "backpack">("skills");
  const [waterBottleCount, setWaterBottleCount] = useState<number>(1);
  const [perfumeCount, setPerfumeCount] = useState<number>(1);
  const [shieldBuffActive, setShieldBuffActive] = useState<boolean>(false);
  const [invisibleSeenActive, setInvisibleSeenActive] = useState<boolean>(false);
  const [bossStunned, setBossStunned] = useState<boolean>(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<"red" | "gold" | "pink" | null>(null);

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

  const showFloating = (text: string, type: "damage" | "heal" | "critical" | "buff") => {
    const id = Date.now() + Math.random();
    setFloatingNumbers((prev) => [...prev, { id, text, type }]);
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
      if (bossStunned) {
        setBossStunned(false);
        setBattleLog(
          language === "es"
            ? "🌀 La Sombra del Limbo sigue aturdida y desorientada, ¡no puede atacar este turno!"
            : "🌀 The Limbo Shadow is still stunned and disoriented, cannot attack this turn!"
        );
        soundEngine.playSfx("dialogue");
        return;
      }

      // Enemy attacks
      const enemyAttacks = [
        {
          nameEs: "Garras del Limbo",
          nameEn: "Limbo Claws",
          dmg: 18,
          logEs: "💀 La Sombra rasguña con sus garras etéreas del inframundo.",
          logEn: "💀 The Shadow slashes with ethereal underworld claws."
        },
        {
          nameEs: "Aliento Sombrío",
          nameEn: "Shadow Breath",
          dmg: 22,
          logEs: "💨 La Sombra exhala una ráfaga de niebla púrpura gélida sobre CKY y Ángela.",
          logEn: "💨 The Shadow exhales a blast of icy purple mist over CKY and Angela."
        },
        {
          nameEs: "Maldición de la Vecina",
          nameEn: "Neighbor's Curse",
          dmg: 25,
          logEs: "👁️ Un eco distorsionado de la risa de la vecina Paula resuena, haciendo temblar el suelo.",
          logEn: "👁️ A distorted echo of Paula the neighbor's laugh echoes, shaking the ground."
        }
      ];

      const attack = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
      let finalDmg = attack.dmg;
      if (shieldBuffActive) {
        finalDmg = Math.floor(finalDmg * 0.5);
        setShieldBuffActive(false);
      }

      setScreenFlash("red");
      setTimeout(() => setScreenFlash(null), 250);
      triggerScreenShake();
      androidBridge.vibrate([40, 60, 40]);
      soundEngine.playSfx("hit");
      showFloating(`-${finalDmg}`, "damage");

      setPartyHp((prev) => Math.max(1, prev - finalDmg));
      setBattleLog(
        language === "es"
          ? `${attack.logEs} Causó ${finalDmg} de daño.`
          : `${attack.logEn} Dealt ${finalDmg} damage.`
      );
    }, 1100);
  };

  // Skill 1: CKY Luz del Linaje
  const handleCkyLightAttack = () => {
    if (animatingAttack || isDefeated) return;
    setAnimatingAttack("cky_light");
    soundEngine.playSfx("attack");
    androidBridge.vibrate(50);

    const baseDmg = invisibleSeenActive ? 60 : 38;
    const isCrit = invisibleSeenActive || Math.random() < 0.25;
    const damage = isCrit ? Math.floor(baseDmg * 1.3) : baseDmg;

    if (invisibleSeenActive) setInvisibleSeenActive(false);

    setScreenFlash("gold");
    setTimeout(() => setScreenFlash(null), 300);

    setTimeout(() => {
      const nextHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextHp);
      showFloating(`-${damage}`, isCrit ? "critical" : "damage");
      if (isCrit) soundEngine.playSfx("critical");

      setBattleLog(
        language === "es"
          ? `✨ CKY canaliza la Luz del Linaje Ancestral. ¡Impacta directo en el núcleo sombrío por ${damage} de daño!`
          : `✨ CKY channels Ancestral Lineage Light. Strikes the shadow core for ${damage} damage!`
      );

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setTurn((prev) => prev + 1);
        executeEnemyTurn(nextHp);
      }
      setAnimatingAttack(null);
    }, 700);
  };

  // Skill 2: CKY Mochilazo Astral
  const handleCkyBackpackSmash = () => {
    if (animatingAttack || isDefeated) return;
    setAnimatingAttack("cky_backpack");
    soundEngine.playSfx("attack");
    androidBridge.vibrate(60);

    setScreenFlash("gold");
    setTimeout(() => setScreenFlash(null), 250);

    setTimeout(() => {
      const damage = 28;
      const nextHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextHp);
      setShieldBuffActive(true);
      showFloating(`-${damage}`, "damage");
      showFloating(language === "es" ? "¡Escudo Activo!" : "Shield Active!", "buff");

      setBattleLog(
        language === "es"
          ? `🎒 ¡CKY revolea la pesada mochila llena de porquerías contra la sombra por ${damage} de daño y levanta una barrera defensiva!`
          : `🎒 CKY swings her heavy backpack full of stuff for ${damage} damage and raises a defensive barrier!`
      );

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setTurn((prev) => prev + 1);
        executeEnemyTurn(nextHp);
      }
      setAnimatingAttack(null);
    }, 700);
  };

  // Skill 3: CKY Ver lo Invisible
  const handleCkySeeInvisible = () => {
    if (animatingAttack || isDefeated) return;
    setAnimatingAttack("cky_see_invisible");
    soundEngine.playSfx("magic");
    androidBridge.vibrate([30, 40, 30]);

    setTimeout(() => {
      setInvisibleSeenActive(true);
      showFloating(language === "es" ? "¡Ojo Astral Activado!" : "Astral Sight Active!", "buff");

      setBattleLog(
        language === "es"
          ? "👁️ CKY usa 'Ver lo Invisible'. Detecta el talón de Aquiles de la sombra. ¡El próximo ataque causará daño crítico masivo!"
          : "👁️ CKY uses 'See Invisible'. Detects the shadow's weak spot. The next attack will deal massive critical damage!"
      );

      setTurn((prev) => prev + 1);
      executeEnemyTurn(enemyHp);
      setAnimatingAttack(null);
    }, 700);
  };

  // Skill 4: Ángela Distracción Picante
  const handleAngelaTaunt = () => {
    if (animatingAttack || isDefeated) return;
    setAnimatingAttack("angela_taunt");
    soundEngine.playSfx("dialogue");
    androidBridge.vibrate([40, 80]);

    setScreenFlash("pink");
    setTimeout(() => setScreenFlash(null), 300);

    setTimeout(() => {
      const damage = 22;
      const nextHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextHp);
      setBossStunned(true);
      showFloating(`-${damage}`, "damage");
      showFloating(language === "es" ? "¡Aturdido!" : "Stunned!", "buff");

      setBattleLog(
        language === "es"
          ? `👻 Ángela le grita a la sombra: '¡Che fantasma desinflado, andá a plancharte las sábanas que das vergüenza ajena!' ¡La sombra se sonroja y queda ATURDIDA (-${damage} HP)!`
          : `👻 Angela yells: 'Hey deflated ghost, go iron your bedsheets, you're embarrassing!' The shadow blushes and is STUNNED (-${damage} HP)!`
      );

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setTurn((prev) => prev + 1);
        executeEnemyTurn(nextHp);
      }
      setAnimatingAttack(null);
    }, 700);
  };

  // Skill 5: Ángela Fogonazo Espectral Rosa
  const handleAngelaBlast = () => {
    if (animatingAttack || isDefeated) return;
    setAnimatingAttack("angela_blast");
    soundEngine.playSfx("magic");
    androidBridge.vibrate(60);

    setScreenFlash("pink");
    setTimeout(() => setScreenFlash(null), 300);

    setTimeout(() => {
      const damage = 46;
      const nextHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextHp);
      showFloating(`-${damage}`, "critical");
      soundEngine.playSfx("critical");

      setBattleLog(
        language === "es"
          ? `🌸 ¡Ángela dispara un proyectil de ectoplasma rosa brillante desde su tumba por ${damage} de daño puro espiritual!`
          : `🌸 Angela fires a bright pink ectoplasm bolt from her tomb for ${damage} pure spiritual damage!`
      );

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setTurn((prev) => prev + 1);
        executeEnemyTurn(nextHp);
      }
      setAnimatingAttack(null);
    }, 700);
  };

  // Item 1: Botella de Agua
  const handleUseWaterBottle = () => {
    if (animatingAttack || isDefeated || waterBottleCount <= 0) return;
    setWaterBottleCount((prev) => prev - 1);
    soundEngine.playSfx("heal");
    androidBridge.vibrate(40);

    const heal = 40;
    setPartyHp((prev) => Math.min(100, prev + heal));
    showFloating(`+${heal} HP`, "heal");

    setBattleLog(
      language === "es"
        ? `🧴 CKY toma un trago largo de su Botella de Agua Favorita. ¡Restaura +${heal} HP a la vitalidad del equipo!`
        : `🧴 CKY takes a sip from her Favorite Water Bottle. Restores +${heal} HP to the team!`
    );

    executeEnemyTurn(enemyHp);
  };

  // Item 2: Perfume Francés
  const handleUsePerfume = () => {
    if (animatingAttack || isDefeated || perfumeCount <= 0) return;
    setPerfumeCount((prev) => prev - 1);
    soundEngine.playSfx("magic");
    androidBridge.vibrate(50);

    setBossStunned(true);
    showFloating(language === "es" ? "¡Aroma Desorientador!" : "Disorienting Scent!", "buff");

    setBattleLog(
      language === "es"
        ? "🌺 CKY rocía el Perfume Francés de mamá en el aire. La sombra se desconcierta por la fragancia y pierde su siguiente turno."
        : "🌺 CKY sprays mom's French Perfume into the air. The shadow is baffled by the fragrance and loses its next turn."
    );

    executeEnemyTurn(enemyHp);
  };

  const handleVictory = () => {
    setIsDefeated(true);
    soundEngine.playSfx("victory");
    androidBridge.vibrate([100, 100, 100, 150]);
    setBattleLog(
      language === "es"
        ? "✨ ¡VICTORIA! La Sombra del Limbo se disolvió en chispas celestiales. El cementerio ha sido purificado de la influencia oscura de la vecina."
        : "✨ VICTORY! The Limbo Shadow dissolved into celestial sparks. The cemetery has been purified from the neighbor's dark influence."
    );
  };

  const enemyHpPct = Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100));
  const delayedEnemyHpPct = Math.max(0, Math.min(100, (delayedEnemyHp / enemyMaxHp) * 100));
  const partyHpPct = Math.max(0, Math.min(100, partyHp));
  const delayedPartyHpPct = Math.max(0, Math.min(100, delayedPartyHp));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 select-none ${
        isScreenShaking ? "animate-shake" : ""
      }`}
    >
      {/* Screen flash layer */}
      {screenFlash && (
        <div
          className={`absolute inset-0 pointer-events-none z-50 transition-opacity duration-200 ${
            screenFlash === "red"
              ? "bg-red-600/30"
              : screenFlash === "pink"
              ? "bg-pink-500/30"
              : "bg-yellow-400/30"
          }`}
        />
      )}

      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-purple-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Floating Numbers Overlay */}
        <FloatingDamageText numbers={floatingNumbers} />

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-pink-950 border-b border-purple-500/30 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪦</span>
            <div>
              <h2 className="text-xs font-bold text-pink-300 font-display uppercase tracking-wider">
                {language === "es" ? "Cementerio Municipal - Batalla Astral" : "Municipal Cemetery - Astral Battle"}
              </h2>
              <span className="text-[10px] text-purple-400 font-mono">
                {language === "es" ? "Día 2 • Purificación de la Sombra" : "Day 2 • Shadow Purification"}
              </span>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-yellow-400 bg-purple-900/40 px-2.5 py-1 rounded-lg border border-purple-500/30">
            {language === "es" ? `Turno ${turn}` : `Turn ${turn}`}
          </div>
        </div>

        {/* Combat Arena Canvas Preview */}
        <div className="relative flex-1 bg-gradient-to-b from-indigo-950/70 via-slate-950 to-purple-950/60 p-4 flex flex-col justify-between min-h-[220px]">
          {/* Enemy HUD */}
          <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-3 shadow-lg max-w-xs self-end w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-200 font-display flex items-center gap-1.5">
                <span className="text-lg">👤🔥</span>
                {enemyName}
              </span>
              <span className="text-[11px] font-mono text-purple-400 font-bold">
                {enemyHp}/{enemyMaxHp}
              </span>
            </div>
            {/* Health Bar with ghost drain */}
            <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-purple-900/50">
              <div
                className="absolute top-0 left-0 h-full bg-red-400/50 transition-all duration-500"
                style={{ width: `${delayedEnemyHpPct}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                style={{ width: `${enemyHpPct}%` }}
              />
            </div>
          </div>

          {/* Center Stage: Sprites */}
          <div className="flex items-center justify-around py-3">
            {/* Player Party: CKY + Angela */}
            <div className="flex items-end gap-3 animate-pulse">
              <div className="text-center">
                <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]">
                  👻
                </div>
                <span className="text-[9px] font-mono font-bold text-pink-300 block">
                  {language === "es" ? "Ángela" : "Angela"}
                </span>
              </div>
              <div className="text-center">
                <div className="text-5xl filter drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]">
                  👧
                </div>
                <span className="text-[9px] font-mono font-bold text-yellow-300 block">
                  CKY
                </span>
              </div>
            </div>

            {/* VS divider */}
            <span className="text-xs font-mono font-black text-purple-400/50 uppercase">
              VS
            </span>

            {/* Boss Sprite */}
            <div className="text-center">
              <div
                className={`text-6xl filter drop-shadow-[0_0_16px_rgba(168,85,247,0.9)] transition-transform duration-200 ${
                  animatingAttack ? "scale-90 opacity-70" : "scale-100"
                }`}
              >
                👤
              </div>
              <span className="text-[9px] font-mono font-bold text-purple-300 block">
                {language === "es" ? "Sombra del Limbo" : "Limbo Shadow"}
              </span>
            </div>
          </div>

          {/* Party HUD */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 shadow-lg max-w-xs self-start w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-300 font-display flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                {language === "es" ? "Equipo CKY & Ángela" : "CKY & Angela Team"}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {partyHp}/100
              </span>
            </div>
            {/* Health Bar */}
            <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-emerald-900/50">
              <div
                className="absolute top-0 left-0 h-full bg-red-400/50 transition-all duration-500"
                style={{ width: `${delayedPartyHpPct}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${partyHpPct}%` }}
              />
            </div>
            {/* Status indicators */}
            <div className="flex gap-1.5 mt-1.5">
              {shieldBuffActive && (
                <span className="text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> {language === "es" ? "Escudo" : "Shield"}
                </span>
              )}
              {invisibleSeenActive && (
                <span className="text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> {language === "es" ? "Ojo Astral" : "Astral Eye"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Narrative Battle Log */}
        <div className="bg-slate-900 border-t border-purple-500/30 px-4 py-2 text-xs font-mono text-slate-300 min-h-[44px] flex items-center">
          <p className="leading-snug">{battleLog}</p>
        </div>

        {/* Action Panel / Victory */}
        <div className="p-3 bg-slate-950 border-t border-purple-500/30">
          {isDefeated ? (
            <div className="space-y-2 text-center py-2 animate-fade-in">
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 font-mono text-xs">
                <p className="font-bold text-sm text-emerald-300 mb-1">
                  🎉 {language === "es" ? "¡PURIFICACIÓN EXITOSA! (+60 XP)" : "PURIFICATION COMPLETE! (+60 XP)"}
                </p>
                <p className="text-[11px] text-emerald-200/90">
                  {language === "es"
                    ? "Ángela sonríe satisfecha y te abraza espiritualmente: '¡Qué gran equipo somos! Ahora vamos a tu casa a que te pegues una buena ducha, que tenés olor a cripta vieja.'"
                    : "Angela smiles warmly and hugs you spiritually: 'What a great team we are! Now let's head home so you can take a shower, you smell like an old crypt.'"}
                </p>
              </div>
              <button
                onClick={onVictory}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
              >
                {language === "es" ? "Regresar a Casa con Ángela ➔" : "Return Home with Angela ➔"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Tab Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "skills"
                      ? "bg-purple-900/70 border border-purple-400 text-purple-200"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  ⚡ {language === "es" ? "Habilidades del Dúo" : "Duo Skills"}
                </button>
                <button
                  onClick={() => setActiveTab("backpack")}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "backpack"
                      ? "bg-purple-900/70 border border-purple-400 text-purple-200"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  🎒 {language === "es" ? "Mochila / Ítems" : "Backpack / Items"}
                </button>
              </div>

              {/* Skills Tab */}
              {activeTab === "skills" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={!!animatingAttack}
                    onClick={handleCkyLightAttack}
                    className="p-2.5 bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/40 rounded-xl text-left font-mono text-xs text-yellow-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-yellow-300">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      {language === "es" ? "Luz del Linaje" : "Lineage Light"}
                    </div>
                    <p className="text-[10px] text-yellow-400/80 mt-0.5">
                      {language === "es" ? "Ataque astral directo (38 DMG)" : "Direct astral strike (38 DMG)"}
                    </p>
                  </button>

                  <button
                    disabled={!!animatingAttack}
                    onClick={handleAngelaBlast}
                    className="p-2.5 bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 rounded-xl text-left font-mono text-xs text-pink-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-pink-300">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      {language === "es" ? "Fogonazo Rosa" : "Pink Blast"}
                    </div>
                    <p className="text-[10px] text-pink-400/80 mt-0.5">
                      {language === "es" ? "Ectoplasma de Ángela (46 DMG)" : "Angela's ectoplasm (46 DMG)"}
                    </p>
                  </button>

                  <button
                    disabled={!!animatingAttack}
                    onClick={handleAngelaTaunt}
                    className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 rounded-xl text-left font-mono text-xs text-rose-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      {language === "es" ? "Distracción Picante" : "Spicy Taunt"}
                    </div>
                    <p className="text-[10px] text-rose-400/80 mt-0.5">
                      {language === "es" ? "Chiste de Ángela que Aturde (22 DMG)" : "Angela's joke stuns (22 DMG)"}
                    </p>
                  </button>

                  <button
                    disabled={!!animatingAttack}
                    onClick={handleCkyBackpackSmash}
                    className="p-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl text-left font-mono text-xs text-cyan-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      {language === "es" ? "Mochilazo Defensivo" : "Backpack Smash"}
                    </div>
                    <p className="text-[10px] text-cyan-400/80 mt-0.5">
                      {language === "es" ? "Golpe y Escudo Protector (28 DMG)" : "Hit + Protective Shield (28 DMG)"}
                    </p>
                  </button>

                  <button
                    disabled={!!animatingAttack}
                    onClick={handleCkySeeInvisible}
                    className="col-span-2 p-2 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 rounded-xl text-left font-mono text-xs text-indigo-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="font-bold text-indigo-300">
                          {language === "es" ? "Ver lo Invisible (Poder Ancestral)" : "See the Invisible (Ancestral Power)"}
                        </p>
                        <p className="text-[10px] text-indigo-400/80">
                          {language === "es" ? "Revela debilidad oculta para daño crítico masivo en el siguiente turno" : "Reveals hidden core for massive crit next turn"}
                        </p>
                      </div>
                    </div>
                    <span className="text-indigo-400 font-bold">➔</span>
                  </button>
                </div>
              )}

              {/* Backpack Tab */}
              {activeTab === "backpack" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={waterBottleCount <= 0 || !!animatingAttack}
                    onClick={handleUseWaterBottle}
                    className="p-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl text-left font-mono text-xs text-cyan-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-bold text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                        {language === "es" ? "Botella de Agua" : "Water Bottle"}
                      </span>
                      <span className="text-[10px] bg-cyan-900/60 px-1.5 py-0.5 rounded">
                        x{waterBottleCount}
                      </span>
                    </div>
                    <p className="text-[10px] text-cyan-400/80 mt-0.5">
                      {language === "es" ? "Restaura +40 HP de Vitalidad" : "Restores +40 HP Vitality"}
                    </p>
                  </button>

                  <button
                    disabled={perfumeCount <= 0 || !!animatingAttack}
                    onClick={handleUsePerfume}
                    className="p-2.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 rounded-xl text-left font-mono text-xs text-purple-200 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        {language === "es" ? "Perfume de Mamá" : "Mom's Perfume"}
                      </span>
                      <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded">
                        x{perfumeCount}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-400/80 mt-0.5">
                      {language === "es" ? "Aturde a la sombra 1 turno" : "Stuns shadow for 1 turn"}
                    </p>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

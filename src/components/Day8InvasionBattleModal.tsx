import React, { useState, useEffect } from "react";
import { Zap, Sparkles, Shield, Heart, Droplet, Package, CheckCircle2 } from "lucide-react";
import { Language } from "../types";
import FloatingDamageText, { FloatingNumber } from "./FloatingDamageText";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

export type Day8Location = "plaza" | "hospital" | "terminal" | "mall";

interface Day8InvasionBattleModalProps {
  language: Language;
  location: Day8Location;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
  onVictory: () => void;
}

export default function Day8InvasionBattleModal({
  language,
  location,
  playSound,
  onVictory,
}: Day8InvasionBattleModalProps) {
  const isEs = language === "es";

  const locationData = {
    plaza: {
      nameEs: "Plaza Principal",
      nameEn: "Main Plaza",
      bossNameEs: "Coloso Sombrío del Parque",
      bossNameEn: "Shadow Park Colossus",
      bossSprite: "👹",
      maxHp: 360,
      introEs: "¡Un gigantesco Coloso de sombras y raíces oscuras ha profanado la fuente de la Plaza Principal, arrojando agua corrupta del Limbo!",
      introEn: "A giant Colossus of shadows and dark roots has profaned the Main Plaza fountain, spewing corrupt Limbo water!",
      attacks: [
        { nameEs: "🌳 Latigazo de Raíces Negras", nameEn: "🌳 Black Roots Whip", dmg: 16, msgEs: "¡El coloso azota el suelo levantando raíces espinosas!", msgEn: "The colossus whips the ground with thorny roots!" },
        { nameEs: "⛲ Chorro de Agua Maldita", nameEn: "⛲ Cursed Water Blast", dmg: 20, msgEs: "¡Una ráfaga de agua fangosa del Limbo impacta al equipo!", msgEn: "A blast of muddy Limbo water strikes the party!" },
        { nameEs: "🪨 Banco de Plaza Proyectil", nameEn: "🪨 Flying Park Bench", dmg: 24, msgEs: "¡El monstruo arranca un banco de hierro y lo arroja con furia!", msgEn: "The monster tears out an iron bench and hurls it!" }
      ]
    },
    hospital: {
      nameEs: "Hospital Municipal",
      nameEn: "Municipal Hospital",
      bossNameEs: "Espectro de la Peste del Limbo",
      bossNameEn: "Limbo Plague Specter",
      bossSprite: "☣️",
      maxHp: 380,
      introEs: "¡El Espectro de la Peste flota en la sala de guardia del Hospital, liberando miasmas sombríos que paralizan a médicos y pacientes!",
      introEn: "The Plague Specter floats in the Hospital emergency room, releasing shadow miasma paralyzing doctors and patients!",
      attacks: [
        { nameEs: "💉 Agujas Ectoplásmicas", nameEn: "💉 Ectoplasmic Needles", dmg: 18, msgEs: "¡Una lluvia de agujas astrales envenenadas roza al grupo!", msgEn: "A rain of poisoned astral needles grazes the party!" },
        { nameEs: "🌫️ Vaho Miasmático Hospitalario", nameEn: "🌫️ Hospital Miasma Fog", dmg: 22, msgEs: "¡Gases púrpuras asfixian la sala de guardia!", msgEn: "Purple fumes choke the emergency ward!" },
        { nameEs: "💀 Pulso de Somatización Oscura", nameEn: "💀 Dark Somatization Pulse", dmg: 25, msgEs: "¡Una onda de dolor astral reverbera en el pecho de CKY!", msgEn: "An astral pain shockwave reverberates in CKY's chest!" }
      ]
    },
    terminal: {
      nameEs: "Terminal de Ómnibus",
      nameEn: "Bus Terminal",
      bossNameEs: "Leviatán del Asfalto",
      bossNameEn: "Asphalt Leviathan",
      bossSprite: "🚎",
      maxHp: 400,
      introEs: "¡El Leviatán del Asfalto emerge del pavimento de los andenes, aplastando los carteles de viaje e impidiendo el paso de los colectivos!",
      introEn: "The Asphalt Leviathan bursts from platform pavement, crushing route signs and trapping all buses!",
      attacks: [
        { nameEs: "🛞 Cornada de Neumático Espectral", nameEn: "🛞 Spectral Tire Horn Attack", dmg: 20, msgEs: "¡El leviatán embiste con ruedas ardientes de energía sombría!", msgEn: "The leviathan charges with burning dark spectral tires!" },
        { nameEs: "💨 Humo Tóxico de Caño de Escape", nameEn: "💨 Toxic Exhaust Smoke", dmg: 18, msgEs: "¡Una densa nube de hollín del Limbo ciega al equipo!", msgEn: "A thick cloud of Limbo soot blinds the party!" },
        { nameEs: "💥 Aplastamiento de Andén", nameEn: "💥 Platform Slam", dmg: 26, msgEs: "¡El coloso sacude la terminal haciendo vibrar los vidrios!", msgEn: "The colossus slams the platform shaking the windows!" }
      ]
    },
    mall: {
      nameEs: "Centro Comercial",
      nameEn: "Shopping Mall",
      bossNameEs: "Gárgola de Cristal y Pesadillas",
      bossNameEn: "Crystal & Nightmare Gargoyle",
      bossSprite: "🦇",
      maxHp: 390,
      introEs: "¡La Gárgola sombría se posó sobre la gran fuente del shopping, quebrando vitrinas y convirtiendo los escaparates en trampas astrales!",
      introEn: "The shadow Gargoyle perched atop the mall fountain, smashing glass showcases and warping shops into astral traps!",
      attacks: [
        { nameEs: "💎 Lluvia de Astillas de Vidrio", nameEn: "💎 Glass Shards Rain", dmg: 19, msgEs: "¡Esquirlas de cristal encantado cortan el aire a gran velocidad!", msgEn: "Enchanted glass shards slice through the air at high speed!" },
        { nameEs: "👗 Danza de Maniquíes Poseídos", nameEn: "👗 Possessed Mannequins Dance", dmg: 22, msgEs: "¡Maniquíes de la boutique cobran vida atacando en torbellino!", msgEn: "Boutique mannequins come alive attacking in a whirlwind!" },
        { nameEs: "🌀 Chillido Supersónico del Abismo", nameEn: "🌀 Abyss Supersonic Shriek", dmg: 25, msgEs: "¡La gárgola emite un alarido desgarrador que hace temblar las vigas!", msgEn: "The gargoyle emits a screech shaking the mall beams!" }
      ]
    }
  }[location];

  const [bossHp, setBossHp] = useState<number>(locationData.maxHp);
  const [delayedBossHp, setDelayedBossHp] = useState<number>(locationData.maxHp);
  const [partyHp, setPartyHp] = useState<number>(100);
  const [delayedPartyHp, setDelayedPartyHp] = useState<number>(100);
  const [turn, setTurn] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string>(isEs ? locationData.introEs : locationData.introEn);
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

  // Play boss theme and restore on unmount
  useEffect(() => {
    soundEngine.unlockAudio();
    const prev = soundEngine.getCurrentTrack();
    soundEngine.playBgm("boss");
    return () => {
      if (prev) soundEngine.playBgm(prev);
      else soundEngine.stopBgm();
    };
  }, []);

  // Smooth lagging trail effect for HP bars
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

  const showFloating = (text: string, type: "damage" | "heal" | "critical" | "buff") => {
    const id = Date.now() + Math.random();
    setFloatingNumbers([{ id, text, type }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 900);
  };

  const triggerScreenShake = (flashColor?: "red" | "gold" | "white") => {
    setIsScreenShaking(true);
    if (flashColor) {
      setScreenFlash(flashColor);
      setTimeout(() => setScreenFlash(null), 250);
    }
    setTimeout(() => setIsScreenShaking(false), 450);
  };

  const executeEnemyTurn = (currentBossHp: number) => {
    if (currentBossHp <= 0) return;

    setTimeout(() => {
      if (bossBlinded) {
        soundEngine.playSfx("portal");
        setBossBlinded(false);
        showFloating(isEs ? "¡FALLÓ!" : "MISSED!", "buff");
        setBattleLog(
          isEs
            ? "🌸 ¡El jefe está aturdido por el perfume francés de CKY y su ataque falla por completo!"
            : "🌸 The boss is dazed by CKY's French perfume and its attack completely misses!"
        );
        setTurn((t) => t + 1);
        return;
      }

      const atk = locationData.attacks[Math.floor(Math.random() * locationData.attacks.length)];
      soundEngine.playSfx("hit");
      triggerScreenShake("red");
      androidBridge.hapticImpact();

      const nextPartyHp = Math.max(15, partyHp - atk.dmg);
      setPartyHp(nextPartyHp);
      showFloating(`-${atk.dmg} HP`, "damage");

      if (nextPartyHp < 35) {
        androidBridge.hapticHeartbeat();
      }

      setBattleLog(
        isEs
          ? `${atk.nameEs}: ${atk.msgEs} (-${atk.dmg} HP al equipo)`
          : `${atk.nameEn}: ${atk.msgEn} (-${atk.dmg} HP to party)`
      );
      setTurn((t) => t + 1);
    }, 1000);
  };

  const handleAction = (
    action: "cky_shockwave" | "angela_snark" | "w_purification" | "sandwich" | "water" | "perfume"
  ) => {
    if (isDefeated || animatingAttack) return;

    setAnimatingAttack(action);

    if (action === "cky_shockwave") {
      soundEngine.playSfx("critical");
      triggerScreenShake("gold");
      androidBridge.hapticCritical();
      const baseDmg = 95;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} HP`, "critical");
      setBattleLog(
        isEs
          ? `⚡ ¡CKY desata su Onda Astral Fulminante haciendo tambalear al espíritu invasor! (-${dmg} HP)`
          : `⚡ CKY unleashes her Astral Shockwave staggering the invading spirit! (-${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) triggerVictory();
        else executeEnemyTurn(nextHp);
      }, 700);
    } else if (action === "angela_snark") {
      soundEngine.playSfx("hit");
      triggerScreenShake();
      androidBridge.hapticImpact();
      const baseDmg = 85;
      const dmg = attackBuffActive ? Math.round(baseDmg * 1.35) : baseDmg;
      if (attackBuffActive) setAttackBuffActive(false);

      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`-${dmg} HP`, "damage");
      setBattleLog(
        isEs
          ? `👻 ¡Ángela se materializa gritando: '¡Tomátelas bicho feo, devolvé la ciudad!' y le clava sus garras espirituales! (-${dmg} HP)`
          : `👻 Angela materializes shouting: 'Get lost ugly beast, give back our city!' scratching with spectral claws! (-${dmg} HP)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) triggerVictory();
        else executeEnemyTurn(nextHp);
      }, 700);
    } else if (action === "w_purification") {
      soundEngine.playSfx("heal");
      androidBridge.hapticAction();
      setPartyHp((prev) => Math.min(100, prev + 35));
      const dmg = 75;
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);
      showFloating(`+35 HP`, "heal");
      setBattleLog(
        isEs
          ? `🛡️ ¡W proyecta el Halo Celestial Ancestral, purificando la corrupción circundante y curando al grupo! (+35 HP, -${dmg} HP al jefe)`
          : `🛡️ W projects the Ancient Celestial Halo, purifying surrounding corruption and healing the party! (+35 HP, -${dmg} HP to boss)`
      );

      setTimeout(() => {
        setAnimatingAttack(null);
        if (nextHp <= 0) triggerVictory();
        else executeEnemyTurn(nextHp);
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
        isEs
          ? `🥪 ¡CKY saca un delicioso sándwich de salame y queso de la mochila y lo comparte con Ángela y W! (+60 HP al equipo)`
          : `🥪 CKY pulls a delicious salami & cheese sandwich from her backpack sharing with Angela and W! (+60 HP to party)`
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
      androidBridge.hapticAction();
      setWaterBottleCount((c) => c - 1);
      setPartyHp((prev) => Math.min(100, prev + 40));
      setAttackBuffActive(true);
      showFloating(`+40 HP & BUFF`, "buff");
      setBattleLog(
        isEs
          ? `🧴 ¡CKY toma un buen trago de su Botella de Agua Favorita! Se hidrata (+40 HP) y concentra su energía astral (+35% daño próximo turno).`
          : `🧴 CKY drinks from her Favorite Water Bottle! Hydrates (+40 HP) and focuses astral energy (+35% next turn damage).`
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
      androidBridge.hapticAction();
      setPerfumeCount((c) => c - 1);
      setBossBlinded(true);
      showFloating(`¡CEGUERA!`, "buff");
      setBattleLog(
        isEs
          ? `💐 ¡CKY rocía el Perfume Francés 'Nuit Éthérée' sobre el espíritu! Su fragancia exquisita lo aturde y desorienta (0 daño próximo turno).`
          : `💐 CKY sprays French Perfume 'Nuit Éthérée' on the spirit! The exquisite aroma disorients it (0 damage next enemy turn).`
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
    triggerScreenShake("white");
    androidBridge.hapticLevelUp();
    setBattleLog(
      isEs
        ? `🎉 ¡¡VICTORIA!! ¡El ${locationData.bossNameEs} ha sido purificado y destruido! El foco de asedio en ${locationData.nameEs} ha sido completamente liberado.`
        : `🎉 VICTORY!! The ${locationData.bossNameEn} has been purified and destroyed! The siege point at ${locationData.nameEn} has been freed.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-mono select-none">
      {/* Screen Hit / Flash Overlay */}
      {screenFlash === "red" && (
        <div className="fixed inset-0 bg-red-600/30 pointer-events-none z-50 animate-pulse" />
      )}
      {screenFlash === "gold" && (
        <div className="fixed inset-0 bg-amber-400/25 pointer-events-none z-50 animate-pulse" />
      )}
      {screenFlash === "white" && (
        <div className="fixed inset-0 bg-white/40 pointer-events-none z-50 animate-pulse" />
      )}

      <div
        className={`bg-slate-900 border-2 border-red-500/70 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative transition-transform duration-100 ${
          isScreenShaking ? "translate-x-1 -translate-y-1 scale-[1.01]" : ""
        }`}
      >
        <FloatingDamageText numbers={floatingNumbers} />

        {/* Battle Header */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-slate-950 to-purple-950 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{locationData.bossSprite}</span>
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                {isEs ? "BATALLA DE DEFENSA • DÍA 8" : "DEFENSE BATTLE • DAY 8"}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                {isEs ? locationData.bossNameEs : locationData.bossNameEn}
              </h2>
              <span className="text-xs text-amber-300">
                📍 {isEs ? locationData.nameEs : locationData.nameEn}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">{isEs ? "TURNO" : "TURN"} {turn}</span>
            <span className="text-[11px] font-bold text-purple-300">CKY + W + Ángela</span>
          </div>
        </div>

        {/* Arena & HP Bars */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Boss Stage */}
          <div className="p-4 bg-slate-950/80 border border-red-500/30 rounded-2xl flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-glow opacity-20 pointer-events-none" />
            
            <div className="text-6xl sm:text-7xl mb-2 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
              {locationData.bossSprite}
            </div>

            {/* Boss HP with Trailing Health Bar */}
            <div className="w-full max-w-md space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-red-400">{isEs ? locationData.bossNameEs : locationData.bossNameEn}</span>
                <span className="text-slate-300">{bossHp} / {locationData.maxHp} HP</span>
              </div>
              <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-red-900/80 relative">
                {/* Trailing damage bar */}
                <div
                  className="h-full bg-amber-600/70 absolute top-0 left-0 transition-all duration-500 ease-out"
                  style={{ width: `${(delayedBossHp / locationData.maxHp) * 100}%` }}
                />
                {/* Current HP bar */}
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 relative z-10 transition-all duration-200"
                  style={{ width: `${(bossHp / locationData.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Party Status with Trailing Health Bar */}
          <div className="p-3.5 bg-slate-950/70 border border-purple-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="text-2xl" title="CKY">👧</span>
                <span className="text-2xl" title="W">🛡️</span>
                <span className="text-2xl" title="Ángela">👻</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {isEs ? "Equipo: CKY, W y Ángela" : "Party: CKY, W & Angela"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isEs ? "Sándwiches disponibles: " : "Sandwiches left: "}{sandwichCount}
                </span>
              </div>
            </div>

            <div className="w-40 space-y-1 text-right">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">HP</span>
                <span className="text-slate-200">{partyHp} / 100</span>
              </div>
              <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden border border-emerald-950 relative">
                {/* Trailing bar */}
                <div
                  className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                  style={{ width: `${delayedPartyHp}%` }}
                />
                {/* Current bar */}
                <div
                  className={`h-full relative z-10 transition-all duration-200 ${
                    partyHp > 40
                      ? "bg-gradient-to-r from-emerald-600 to-teal-400"
                      : "bg-red-500 animate-pulse"
                  }`}
                  style={{ width: `${partyHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Battle Log Box */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl min-h-[70px] flex items-center text-xs text-slate-300 leading-relaxed shadow-inner">
            <p>{battleLog}</p>
          </div>

          {/* Actions Bar with Tabs */}
          {!isDefeated ? (
            <div className="space-y-2.5">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("skills")}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    activeTab === "skills"
                      ? "bg-purple-900/80 text-purple-200 border border-purple-500 shadow-md"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  {isEs ? "Habilidades del Equipo" : "Party Skills"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("backpack")}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    activeTab === "backpack"
                      ? "bg-emerald-900/80 text-emerald-200 border border-emerald-500 shadow-md"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  {isEs ? "Mochila / Ítems" : "Backpack / Items"}
                  {(sandwichCount > 0 || waterBottleCount > 0 || perfumeCount > 0) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              </div>

              {activeTab === "skills" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleAction("cky_shockwave")}
                    disabled={Boolean(animatingAttack)}
                    className="p-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 text-purple-200 rounded-xl font-bold text-xs flex items-center gap-2.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg min-h-[48px]"
                  >
                    <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="text-left">
                      <span className="block">{isEs ? "Onda Astral (CKY)" : "Astral Shockwave"}</span>
                      <span className="text-[10px] text-purple-400/80 font-normal">
                        {isEs ? "Golpe fulminante (-95 HP)" : "Fulminant strike (-95 HP)"}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAction("angela_snark")}
                    disabled={Boolean(animatingAttack)}
                    className="p-3 bg-pink-950/80 hover:bg-pink-900 border border-pink-500/50 hover:border-pink-400 text-pink-200 rounded-xl font-bold text-xs flex items-center gap-2.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg min-h-[48px]"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                    <div className="text-left">
                      <span className="block">{isEs ? "Garras (Ángela)" : "Claws (Angela)"}</span>
                      <span className="text-[10px] text-pink-400/80 font-normal">
                        {isEs ? "Garras astrales (-85 HP)" : "Astral claws (-85 HP)"}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAction("w_purification")}
                    disabled={Boolean(animatingAttack)}
                    className="p-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-200 rounded-xl font-bold text-xs flex items-center gap-2.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg min-h-[48px]"
                  >
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <span className="block">{isEs ? "Luz Celestial (W)" : "Celestial Light (W)"}</span>
                      <span className="text-[10px] text-amber-400/80 font-normal">
                        {isEs ? "Cura +35 HP y daña" : "Heals +35 HP & deals dmg"}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Sándwich de Salame */}
                  <button
                    onClick={() => handleAction("sandwich")}
                    disabled={Boolean(animatingAttack) || sandwichCount <= 0}
                    className="p-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 rounded-xl font-bold text-xs flex items-center gap-2.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg min-h-[48px]"
                  >
                    <Heart className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-left">
                      <span className="block">{isEs ? "Sándwich de Salame" : "Salami Sandwich"}</span>
                      <span className="text-[10px] text-emerald-400/80 font-normal">
                        {isEs ? `Cura +60 HP (${sandwichCount})` : `Heal +60 HP (${sandwichCount})`}
                      </span>
                    </div>
                  </button>

                  {/* Botella de Agua */}
                  <button
                    onClick={() => handleAction("water")}
                    disabled={Boolean(animatingAttack) || waterBottleCount <= 0}
                    className="p-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 rounded-xl font-bold text-xs flex items-center gap-2.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg min-h-[48px]"
                  >
                    <Droplet className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="text-left">
                      <span className="block">{isEs ? "Botella de Agua" : "Water Bottle"}</span>
                      <span className="text-[10px] text-cyan-400/80 font-normal">
                        {isEs ? `+40 HP & +35% Atq (${waterBottleCount})` : `+40 HP & Buff (${waterBottleCount})`}
                      </span>
                    </div>
                  </button>

                  {/* Perfume Francés */}
                  <button
                    onClick={() => handleAction("perfume")}
                    disabled={Boolean(animatingAttack) || perfumeCount <= 0}
                    className="p-3 bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-500/50 hover:border-fuchsia-400 text-fuchsia-200 rounded-xl font-bold text-xs flex items-center gap-2.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg min-h-[48px]"
                  >
                    <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    <div className="text-left">
                      <span className="block">{isEs ? "Perfume Francés" : "French Perfume"}</span>
                      <span className="text-[10px] text-fuchsia-400/80 font-normal">
                        {isEs ? `Ciega al jefe (${perfumeCount})` : `Blinds boss (${perfumeCount})`}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl flex flex-col items-center gap-3 animate-fade-in text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div>
                <h3 className="text-base font-black text-emerald-300">
                  {isEs ? "¡ZONA ASEGURADA Y PURIFICADA!" : "ZONE SECURED AND PURIFIED!"}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {isEs
                    ? `El espíritu oscuro que atacaba ${locationData.nameEs} ha sido derrotado (+200 XP).`
                    : `The dark spirit attacking ${locationData.nameEn} has been defeated (+200 XP).`}
                </p>
              </div>

              <button
                onClick={onVictory}
                className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {isEs ? "CONTINUAR LA DEFENSA" : "CONTINUE DEFENSE"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

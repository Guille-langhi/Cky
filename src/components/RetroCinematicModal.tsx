import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, X, Volume2, Flame, Award, Zap, Play, Pause, Tv } from "lucide-react";
import { Language, SoulmateInfo } from "../types";
import { soundEngine } from "../lib/soundEngine";
import { androidBridge } from "../lib/androidMobileBridge";

export type CinematicType =
  | "day4_ruins_treasure"
  | "day5_airport_race"
  | "day6_soulmate_kiss"
  | "day8_supernova";

interface RetroCinematicModalProps {
  type: CinematicType;
  language: Language;
  soulmateInfo?: SoulmateInfo | null;
  onClose: () => void;
  onFinish?: () => void;
}

export default function RetroCinematicModal({
  type,
  language,
  soulmateInfo,
  onClose,
  onFinish
}: RetroCinematicModalProps) {
  const isEs = language === "es";
  const soulmateName = soulmateInfo?.name || (isEs ? "Alma Gemela" : "Soulmate");
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [glitchActive, setGlitchActive] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [autoProgress, setAutoProgress] = useState<number>(0);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);

  // Background music and sound effects on mount
  useEffect(() => {
    soundEngine.unlockAudio();
    const prevBgm = soundEngine.getCurrentTrack();

    let cinematicBgm: "mystery" | "street" | "ending" | "climax" = "mystery";
    if (type === "day4_ruins_treasure") {
      soundEngine.playSfx("fanfare");
      cinematicBgm = "mystery";
    } else if (type === "day5_airport_race") {
      soundEngine.playSfx("portal");
      cinematicBgm = "street";
    } else if (type === "day6_soulmate_kiss") {
      soundEngine.playSfx("heal");
      cinematicBgm = "ending";
    } else if (type === "day8_supernova") {
      soundEngine.playSfx("critical");
      cinematicBgm = "climax";
    }

    soundEngine.playBgm(cinematicBgm);

    return () => {
      if (prevBgm) {
        soundEngine.playBgm(prevBgm);
      } else {
        soundEngine.stopBgm();
      }
    };
  }, [type]);

  const triggerSlideFeedback = (nextIdx: number) => {
    soundEngine.playSfx("select");
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 240);

    // Haptic feedback
    if (type === "day8_supernova" && nextIdx === 1) {
      androidBridge.hapticSupernova();
    } else if (type === "day4_ruins_treasure" && nextIdx === 1) {
      androidBridge.hapticItemPickup();
    } else {
      androidBridge.hapticDialogue();
    }
  };

  // Cinematic configurations
  const cinematicData = {
    day4_ruins_treasure: {
      tagEs: "CINEMÁTICA • DÍA 4: EL TESORO ANCESTRAL",
      tagEn: "CINEMATIC • DAY 4: THE ANCIENT TREASURE",
      accentBorder: "border-amber-500/70",
      accentBg: "bg-amber-950/40",
      accentGlow: "shadow-[0_0_50px_rgba(245,158,11,0.25)]",
      slides: [
        {
          titleEs: "EL VALLE DE LAS RUINAS OLVIDADAS",
          titleEn: "VALLEY OF THE FORGOTTEN RUINS",
          subtitleEs: "Monolitos milenarios guardan el secreto de los Señores Antiguos",
          subtitleEn: "Millennial monoliths guard the ancient lords' secret",
          dialogSpeaker: isEs ? "W (Espíritu Guardián)" : "W (Guardian Spirit)",
          dialogEs: "«Aquí yace el relicario sagrado, Señora Heredera. Las raíces centenarias son demasiado duras para vuestras manos... ¡pero no para mí!»",
          dialogEn: "«Here lies the sacred reliquary, Lady Heir. The ancient roots are too hard for your bare hands... but not for me!»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-emerald-950/40 to-slate-900">
              {/* Sunbeam god rays */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(250,204,21,0.25),_transparent_60%)]" />
              {/* Rune Pillars */}
              <div className="absolute left-8 bottom-6 w-12 h-36 bg-slate-800 border-2 border-amber-500/50 rounded-t-lg flex flex-col items-center justify-around py-3">
                <span className="text-amber-400 text-xs animate-pulse">ᚱ</span>
                <span className="text-amber-300 text-xs">ᚨ</span>
                <span className="text-amber-400 text-xs">ᚦ</span>
              </div>
              <div className="absolute right-8 bottom-6 w-12 h-40 bg-slate-800 border-2 border-amber-500/50 rounded-t-lg flex flex-col items-center justify-around py-3">
                <span className="text-amber-300 text-xs">ᛋ</span>
                <span className="text-amber-400 text-xs animate-pulse">ᚹ</span>
                <span className="text-amber-300 text-xs">ᛟ</span>
              </div>
              {/* Characters */}
              <div className="flex items-end gap-6 z-10">
                <div className="flex flex-col items-center">
                  <span className="text-4xl animate-bounce">👧</span>
                  <span className="text-[10px] font-bold text-amber-200 mt-1">CKY</span>
                </div>
                <div className="flex flex-col items-center scale-125 pb-2">
                  <div className="p-3 bg-amber-400/20 border-2 border-amber-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse">
                    <span className="text-4xl">✨🪓</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-yellow-300 mt-1">W (Pala Sagrada)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl animate-pulse">👻</span>
                  <span className="text-[10px] font-bold text-pink-300 mt-1">Ángela</span>
                </div>
              </div>
            </div>
          )
        },
        {
          titleEs: "¡EL COFRE DESENTERRADO! (+$50.000)",
          titleEn: "THE CHEST UNEARTHED! (+$50,000)",
          subtitleEs: "W corta la tierra arcana y el cofre dorado emerge resplandeciente",
          subtitleEn: "W cleaves the arcane earth and the golden chest emerges glowing",
          dialogSpeaker: isEs ? "Ángela (Espíritu)" : "Angela (Spirit)",
          dialogEs: "«¡¡AL FINNN!! ¡Mirá esa pila de billetes y joyas! ¡$50.000 para reventar el shopping comprando lencería sexy, perfume francés y pilchas de gala!»",
          dialogEn: "«FINALLY!! Look at all that cash and jewelry! $50,000 to splurge at the mall on sexy lingerie, French perfume and luxury gala clothes!»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-950/60 via-slate-950 to-slate-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-ping" />
              </div>
              <div className="flex flex-col items-center z-10 space-y-3">
                <div className="relative p-6 bg-slate-900/90 border-2 border-yellow-400 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.5)] flex flex-col items-center">
                  <span className="text-6xl animate-bounce">🪙💎👑</span>
                  <div className="px-4 py-1.5 bg-yellow-500 text-slate-950 font-black text-sm rounded-full tracking-wider mt-2 shadow-lg">
                    +$50.000 ORO ANCESTRAL
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-amber-200">
                  <span className="px-2.5 py-1 bg-black/60 rounded-full border border-amber-500/40">✓ Ropa de Gala</span>
                  <span className="px-2.5 py-1 bg-black/60 rounded-full border border-amber-500/40">✓ Lencería Roja</span>
                  <span className="px-2.5 py-1 bg-black/60 rounded-full border border-amber-500/40">✓ Perfume Nuit</span>
                </div>
              </div>
            </div>
          )
        }
      ]
    },

    day5_airport_race: {
      tagEs: "CINEMÁTICA • DÍA 5: CARRERA AL AEROPUERTO",
      tagEn: "CINEMATIC • DAY 5: AIRPORT RACE",
      accentBorder: "border-sky-500/70",
      accentBg: "bg-sky-950/40",
      accentGlow: "shadow-[0_0_50px_rgba(14,165,233,0.25)]",
      slides: [
        {
          titleEs: "EL DESAFÍO DEL DOMINGO A LA TARDE",
          titleEn: "THE SUNDAY AFTERNOON CHALLENGE",
          subtitleEs: "Trote deportivo por la avenida principal",
          subtitleEn: "Athletic jogging along the main boulevard",
          dialogSpeaker: isEs ? "Paula (La Vecina)" : "Paula (The Neighbor)",
          dialogEs: "«¡Che CKY! ¿Te creés muy rápida con esa ropa deportiva? Quien llegue primero a la terminal del Aeropuerto se gana un pancho completo con papas pay y una coca fría.»",
          dialogEn: "«Hey CKY! Think you're fast in that sportswear? Whoever reaches the Airport terminal first wins a loaded hot dog with potato sticks and an ice-cold Coke.»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-around overflow-hidden bg-gradient-to-r from-orange-950 via-slate-950 to-sky-950">
              {/* Asphalt road line */}
              <div className="absolute bottom-6 left-0 right-0 h-4 bg-slate-800 border-y border-dashed border-yellow-400/80" />
              {/* Jogging CKY */}
              <div className="flex flex-col items-center z-10 animate-bounce">
                <span className="text-5xl">🏃‍♀️💨</span>
                <span className="text-[10px] font-bold text-sky-300 mt-1">CKY (Trotando al 100%)</span>
              </div>
              {/* Magic Cheating Neighbor */}
              <div className="flex flex-col items-center z-10">
                <div className="p-2 bg-purple-950/80 border border-purple-500/50 rounded-2xl animate-pulse">
                  <span className="text-5xl">🦹‍♀️✨</span>
                </div>
                <span className="text-[10px] font-bold text-purple-300 mt-1">Vecina (Teletransporte Oculto)</span>
              </div>
            </div>
          )
        },
        {
          titleEs: "LA TRAMPA EN LA TERMINAL: PANCHO Y COCA",
          titleEn: "THE TERMINAL TRAP: HOT DOG & COKE",
          subtitleEs: "La Vecina llega antes usando sombras y CKY debe pagar la apuesta",
          subtitleEn: "The Neighbor arrives first with shadows and CKY must pay the bet",
          dialogSpeaker: isEs ? "CKY (Empapada en Sudor)" : "CKY (Soaked in Sweat)",
          dialogEs: "«¡¡Hija de p***!! ¡¡Hiciste trampa mágica fija!! Llegué con la lengua en el piso, olor a tigre transpirado y encima tengo que pagarle el pancho a esta bruja...»",
          dialogEn: "«You cheater!! You totally used dark magic!! I arrived breathless, smelling like a sweaty tiger, and on top of that I have to buy this witch a hot dog...»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-950 via-slate-950 to-slate-900">
              <div className="flex items-center gap-8 z-10 p-4 bg-slate-900/80 border-2 border-sky-400 rounded-3xl shadow-xl">
                <div className="text-center">
                  <span className="text-5xl animate-pulse">🌭🥤</span>
                  <p className="text-[10px] font-bold text-amber-300 mt-1">Pancho Don Pepe</p>
                </div>
                <div className="h-16 w-0.5 bg-slate-700" />
                <div className="space-y-1 text-left font-mono">
                  <p className="text-xs text-red-300 font-bold">🦹‍♀️ Paula: «¡Mmmm, qué delicia de pancho!»</p>
                  <p className="text-xs text-sky-300 font-bold">👧 CKY: «Me voy a casa a ducharme YA.»</p>
                  <p className="text-[10px] text-slate-400 italic">Ángela se burla de su olor a tigre en el camino de vuelta.</p>
                </div>
              </div>
            </div>
          )
        }
      ]
    },

    day6_soulmate_kiss: {
      tagEs: "CINEMÁTICA • DÍA 6/7: EL BESO CÓSMICO",
      tagEn: "CINEMATIC • DAY 6/7: THE COSMIC KISS",
      accentBorder: "border-pink-500/70",
      accentBg: "bg-pink-950/40",
      accentGlow: "shadow-[0_0_50px_rgba(236,72,153,0.25)]",
      slides: [
        {
          titleEs: "LA COMUNIÓN FÍSICA Y EL BESO TENSO",
          titleEn: "PHYSICAL COMMUNION & TENSE KISS",
          subtitleEs: "Alanis exige la sintonización de labios para estabilizar las defensas",
          subtitleEn: "Alanis demands lip synchronization to stabilize defenses",
          dialogSpeaker: isEs ? "CKY (Tensa como Estatua)" : "CKY (Stiff as a Statue)",
          dialogEs: "«Bueno... que sea rápido y sin pavadas. Ni se te ocurra hacerte el galán.»",
          dialogEn: "«Fine... make it quick and no foolishness. Don't even think about playing the charmer.»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-pink-950">
              {/* Comic Sparks */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-6xl animate-ping opacity-75">⚡💋✨</span>
              </div>
              <div className="flex items-center gap-6 z-10">
                <div className="flex flex-col items-center">
                  <span className="text-5xl">👧</span>
                  <span className="text-[10px] font-bold text-pink-300 mt-1">CKY (Tiesísima)</span>
                </div>
                <div className="p-3 bg-pink-500/20 border-2 border-pink-400 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.7)] animate-bounce">
                  <span className="text-3xl">💞</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-5xl">🧑‍🦱</span>
                  <span className="text-[10px] font-bold text-purple-300 mt-1">{soulmateName}</span>
                </div>
              </div>
            </div>
          )
        },
        {
          titleEs: "LA CRÍTICA ÁCIDA: «HELADERA DESENCHUFADA»",
          titleEn: "THE SHARP CRITIQUE: «UNPLUGGED FRIDGE»",
          subtitleEs: "El gemelo se limpia la comisura y juzga con frialdad matemática",
          subtitleEn: "The soulmate wipes his lips and judges with mathematical coldness",
          dialogSpeaker: `${soulmateName} (Crítico Arrogante)`,
          dialogEs: isEs
            ? "«La verdad que besás bastante mal, CKY. Besás como una estatua de yeso o una heladera desenchufada... ¿Nunca antes habías besado a nadie?»"
            : "«Honestly you kiss pretty badly, CKY. You kiss like a plaster statue or an unplugged fridge... Have you never kissed anyone before?»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-pink-950/40 to-slate-900">
              <div className="p-5 bg-slate-900/90 border-2 border-pink-500/60 rounded-3xl max-w-md w-full shadow-2xl space-y-3 z-10 text-center">
                <div className="flex justify-center items-center gap-4 text-4xl">
                  <span>🧊</span>
                  <span className="text-pink-400 animate-pulse">💔</span>
                  <span>🔌</span>
                </div>
                <div className="p-2.5 bg-black/60 rounded-xl border border-pink-500/30 font-mono text-xs text-pink-200">
                  {isEs ? "«Diagnóstico: Fría como heladera desenchufada»" : "«Diagnosis: Cold like an unplugged fridge»"}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  {isEs
                    ? "CKY estalla en furia e intenta romperle la mochila en la cabeza antes del chantaje del desfile en lencería roja."
                    : "CKY erupts in fury and tries to smash her backpack on him before the red lingerie runway blackmail."}
                </p>
              </div>
            </div>
          )
        }
      ]
    },

    day8_supernova: {
      tagEs: "CINEMÁTICA • DÍA 8: LA SUPERNOVA CÓSMICA",
      tagEn: "CINEMATIC • DAY 8: COSMIC SUPERNOVA",
      accentBorder: "border-red-500/80",
      accentBg: "bg-red-950/40",
      accentGlow: "shadow-[0_0_60px_rgba(239,68,68,0.4)]",
      slides: [
        {
          titleEs: "LA CAÍDA DE W Y ÁNGELA",
          titleEn: "THE FALL OF W AND ANGELA",
          subtitleEs: "La traición del gemelo consuma la tragedia ante la casa de la Vecina",
          subtitleEn: "The soulmate's betrayal seals the tragedy before the Neighbor's house",
          dialogSpeaker: isEs ? "CKY (Dolor y Quiebre)" : "CKY (Grief & Shattered Soul)",
          dialogEs: "«W... Ángela... ¡¡¡NOOOOO!!! ¡Eran mis dos únicos amigos reales en este mundo!...»",
          dialogEn: "«W... Angela... NOOOOO!!! You were my only two real friends in this world!...»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-red-950 via-slate-950 to-purple-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(239,68,68,0.2),_transparent_70%)]" />
              <div className="flex items-center gap-6 z-10">
                <div className="p-3 bg-yellow-950/60 border border-yellow-500/50 rounded-2xl flex flex-col items-center opacity-60">
                  <span className="text-4xl animate-pulse">✨🛡️💨</span>
                  <span className="text-[9px] text-yellow-300 mt-1">W (Polvo Áureo)</span>
                </div>
                <div className="p-3 bg-red-950/80 border-2 border-red-500 rounded-3xl flex flex-col items-center shadow-2xl">
                  <span className="text-5xl animate-bounce">😭🔥</span>
                  <span className="text-[10px] font-bold text-red-300 mt-1">CKY (Ira Cósmica)</span>
                </div>
                <div className="p-3 bg-purple-950/60 border border-purple-500/50 rounded-2xl flex flex-col items-center opacity-60">
                  <span className="text-4xl animate-pulse">👻💨</span>
                  <span className="text-[9px] text-purple-300 mt-1">Ángela (Disuelta)</span>
                </div>
              </div>
            </div>
          )
        },
        {
          titleEs: "¡¡ESTALLIDO DE SUPERNOVA!!",
          titleEn: "SUPERNOVA ERUPTION!!",
          subtitleEs: "La furia ancestral del linaje se desata como una tormenta dorada pura",
          subtitleEn: "The ancestral lineage wrath erupts like a pure golden tempest",
          dialogSpeaker: isEs ? "CKY (Furia Primordial)" : "CKY (Primordial Fury)",
          dialogEs: "«¡¡¡NO SE LOS VOY A PERDONAR NUNCA EN MI VIDA!!! ¡¡DESAPAREZCAN DE ACÁ!!»",
          dialogEn: "«I WILL NEVER FORGIVE YOU IN MY LIFE!!! DISAPPEAR FROM HERE!!»",
          renderArt: () => (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-amber-500 via-red-600 to-purple-700 animate-pulse">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9),_rgba(239,68,68,0.6)_40%,_transparent_80%)] animate-spin-slow" />
              <div className="flex flex-col items-center z-10 space-y-2">
                <span className="text-7xl animate-bounce">⚡💥🌟</span>
                <div className="px-5 py-1.5 bg-black/80 border-2 border-yellow-300 rounded-full text-yellow-300 font-black text-sm tracking-widest uppercase shadow-2xl">
                  ¡¡SUPERNOVA DESTRUYE AL TRAIDOR!!
                </div>
                <p className="text-[10px] text-white font-mono text-center max-w-sm">
                  {isEs
                    ? "El gemelo se disuelve en cenizas. Paula queda inconsciente contra la pared. La grieta del Limbo se cierra para siempre."
                    : "The soulmate dissolves to ashes. Paula is left unconscious. The Limbo rift seals forever."}
                </p>
              </div>
            </div>
          )
        }
      ]
    }
  };

  const activeCinematic = cinematicData[type];
  const currentSlide = activeCinematic.slides[slideIndex];
  const totalSlides = activeCinematic.slides.length;

  // Auto-play timer loop
  useEffect(() => {
    if (!isAutoPlay) {
      setAutoProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setAutoProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2.5; // ~4 seconds per slide
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoPlay, slideIndex, totalSlides]);

  const handleNext = () => {
    setAutoProgress(0);
    if (slideIndex < totalSlides - 1) {
      const nextIdx = slideIndex + 1;
      triggerSlideFeedback(nextIdx);
      setSlideIndex(nextIdx);
    } else {
      soundEngine.playSfx("fanfare");
      if (onFinish) onFinish();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fade-in font-mono select-none">
      <div
        className={`w-full max-w-2xl bg-slate-900/95 border-2 ${activeCinematic.accentBorder} ${activeCinematic.accentGlow} rounded-3xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300 ${
          glitchActive ? "scale-[0.99] filter contrast-125 brightness-110" : ""
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider truncate max-w-[180px] sm:max-w-none">
              {isEs ? activeCinematic.tagEs : activeCinematic.tagEn}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* CRT Scanline Toggle */}
            <button
              onClick={() => {
                setCrtEnabled((prev) => !prev);
                soundEngine.playSfx("select");
                androidBridge.hapticTap();
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition ${
                crtEnabled
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title="Filtro CRT / Scanlines"
            >
              <Tv className="w-3 h-3" />
              <span>{crtEnabled ? "CRT: ON" : "CRT: OFF"}</span>
            </button>

            {/* Auto Play / Pause Toggle */}
            <button
              onClick={() => {
                setIsAutoPlay((prev) => !prev);
                soundEngine.playSfx("select");
                androidBridge.hapticTap();
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition ${
                isAutoPlay
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title="Reproducción automática"
            >
              {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoPlay ? "AUTO" : "PAUSA"}</span>
            </button>

            <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700">
              {slideIndex + 1}/{totalSlides}
            </span>

            <button
              onClick={() => {
                soundEngine.playSfx("hit");
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Stage Container (Letterbox 16:9 cinematic aspect) with tap-to-advance */}
        <div
          onClick={handleNext}
          className="relative w-full h-56 sm:h-64 border-b border-slate-800/80 bg-black cursor-pointer overflow-hidden group"
        >
          {/* Cinema Letterbox black bars */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-black z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black z-20" />

          {/* CRT Scanline and Vignette Overlays */}
          {crtEnabled && (
            <>
              <div className="absolute inset-0 pointer-events-none z-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.32)_2px,rgba(0,0,0,0.32)_4px)] opacity-75" />
              <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_70px_rgba(0,0,0,0.85)]" />
            </>
          )}

          {/* Tap-to-advance subtle badge */}
          <div className="absolute bottom-3 right-3 z-30 px-2 py-1 bg-black/60 border border-slate-700/60 rounded-md text-[9px] text-slate-400 opacity-70 group-hover:opacity-100 transition flex items-center gap-1 backdrop-blur-sm pointer-events-none">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-spin" />
            <span>{isEs ? "TOCA PARA AVANZAR" : "TAP TO ADVANCE"}</span>
          </div>

          {/* Render Active Art Frame */}
          {currentSlide.renderArt()}
        </div>

        {/* Auto-Play Progress Bar */}
        <div className="w-full h-1 bg-slate-900 border-b border-slate-800 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-100 ease-linear"
            style={{ width: `${autoProgress}%` }}
          />
        </div>

        {/* Narrative & Dialogue Bottom Area */}
        <div className="p-4 sm:p-6 space-y-4 bg-slate-950/80">
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-400 tracking-wide uppercase">
              {isEs ? currentSlide.titleEs : currentSlide.titleEn}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isEs ? currentSlide.subtitleEs : currentSlide.subtitleEn}
            </p>
          </div>

          {/* Dialogue Quote Box */}
          <div className="p-3 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
            <span className="font-bold text-amber-300 font-mono text-xs block mb-1">
              {currentSlide.dialogSpeaker}:
            </span>
            <span>{isEs ? currentSlide.dialogEs : currentSlide.dialogEn}</span>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-2">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {activeCinematic.slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === slideIndex ? "w-6 bg-amber-400" : "w-2 bg-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Action Advance Button */}
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>
                {slideIndex < totalSlides - 1
                  ? isEs
                    ? "CONTINUAR ESCENA"
                    : "NEXT SCENE"
                  : isEs
                  ? "CERRAR Y CONTINUAR"
                  : "CLOSE & CONTINUE"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

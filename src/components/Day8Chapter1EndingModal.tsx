import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, RotateCcw, Award, Heart, CheckCircle2 } from "lucide-react";
import { Language } from "../types";

interface Day8Chapter1EndingModalProps {
  language: Language;
  onOpenJournal: () => void;
  onReturnToTitle: () => void;
  onOpenDevDaySelect: () => void;
  onContinueFreeRoam?: () => void;
  playSound?: (freq: number, type?: OscillatorType, duration?: number) => void;
}

export default function Day8Chapter1EndingModal({
  language,
  onOpenJournal,
  onReturnToTitle,
  onOpenDevDaySelect,
  onContinueFreeRoam,
  playSound,
}: Day8Chapter1EndingModalProps) {
  const isEs = language === "es";
  const [slide, setSlide] = useState<number>(0);

  const slidesEs = [
    {
      title: "EL PRECIO DEL DESTINO",
      icon: "🕊️",
      text: "Así concluye la primera parte de la travesía de CKY. Una historia que comenzó con un simple uniforme escolar, una mochila para llenar de porquerías y un sándwich de salame en la heladera...",
    },
    {
      title: "RECUERDOS QUE NUNCA SE APAGARÁN",
      icon: "👻🛡️",
      text: "El espíritu pícaro y protector de Ángela en el cementerio... y el honor inquebrantable de W, el guardián ancestral que fue toalla, pala, plumero y escudo hasta su último aliento...",
    },
    {
      title: "UNA CHICA NORMAL... ¡Y EL MODO LIBRE DESBLOQUEADO!",
      icon: "👧🔥",
      text: "La grieta del Limbo ha sido sellada. Pero el cosmos tiene sorpresas: ¡Has desbloqueado el Modo Libre! Disfruta de 15+ nuevas misiones cómicas y picantes (la expedición de compras con Ángela al sex shop, pijama party en lencería roja, gimnasio con W, tregua de chismes y mucho más).",
    }
  ];

  const slidesEn = [
    {
      title: "THE PRICE OF DESTINY",
      icon: "🕊️",
      text: "Thus concludes the first chapter of CKY's journey. A story that began with a school uniform, a backpack to fill with trinkets, and a salami sandwich in the fridge...",
    },
    {
      title: "MEMORIES THAT NEVER FADE",
      icon: "👻🛡️",
      text: "Angela's playful and protective spirit in the cemetery... and W's unshakeable honor, the ancient guardian who was towel, shovel, duster, and celestial shield until his last breath...",
    },
    {
      title: "A NORMAL GIRL... & FREE ROAM UNLOCKED!",
      icon: "👧🔥",
      text: "The Limbo rift has been sealed. But the cosmos has surprises: You unlocked Free Roam Mode! Enjoy 15+ new hilarious & spicy missions (Angela's adult shop trip, red lingerie sleepover, gym with W, gossip truce & more).",
    }
  ];

  const slides = isEs ? slidesEs : slidesEn;

  useEffect(() => {
    playSound?.(440, "sine", 0.6);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 animate-fade-in font-mono select-none overflow-y-auto">
      {/* Subtle starfield particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-xl w-full text-center space-y-6 p-6 sm:p-8 bg-slate-900/90 border border-purple-500/40 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        {/* Emblem */}
        <div className="inline-flex items-center justify-center p-3 bg-purple-950/60 border border-purple-500/40 rounded-2xl mb-1 shadow-lg shadow-purple-950">
          <span className="text-4xl animate-pulse">{slides[slide].icon}</span>
        </div>

        {/* Narrative Slide */}
        <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
          <h3 className="text-xs font-black tracking-widest text-amber-400 uppercase">
            {slides[slide].title}
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed max-w-lg mx-auto font-sans">
            {slides[slide].text}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                playSound?.(600, "sine", 0.1);
                setSlide(i);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                slide === i ? "w-8 bg-amber-400" : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* Big Finale Sign */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 tracking-wider">
            {isEs ? "FIN DEL CAPÍTULO 1" : "END OF CHAPTER 1"}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">👾</span>
            <p className="text-xs font-bold text-amber-300 tracking-widest uppercase">
              {isEs ? "Desarrollado y Creado por 10Print_ Studios" : "Developed & Created by 10Print_ Studios"}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {isEs ? "¡Gracias por jugar la versión oficial para Android!" : "Thank you for playing the official Android release!"}
          </p>
        </div>

        {/* Navigation & Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {onContinueFreeRoam && (
            <button
              onClick={() => {
                playSound?.(800, "sine", 0.2);
                onContinueFreeRoam();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-2xl text-xs font-black tracking-wider uppercase border border-emerald-400 shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>{isEs ? "🌟 Exploración Libre (Modo Epílogo)" : "🌟 Free Roam (Epilogue Mode)"}</span>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                playSound?.(650, "sine", 0.15);
                onOpenJournal();
              }}
              className="py-2.5 px-3 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 hover:border-purple-400 text-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEs ? "Diario Íntimo" : "Journal"}</span>
            </button>

            <button
              onClick={() => {
                playSound?.(700, "sine", 0.15);
                onOpenDevDaySelect();
              }}
              className="py-2.5 px-3 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 hover:border-amber-400 text-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isEs ? "Selector Días" : "Day Select"}</span>
            </button>

            <button
              onClick={() => {
                playSound?.(500, "sine", 0.2);
                onReturnToTitle();
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEs ? "Pantalla Título" : "Title Screen"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

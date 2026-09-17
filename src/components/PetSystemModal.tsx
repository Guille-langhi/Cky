import React, { useState, useEffect } from "react";
import { Heart, Utensils, Sparkles, Smile, X, Award, Play } from "lucide-react";
import { soundEngine } from "../lib/soundEngine";

interface PetSystemModalProps {
  language: "es" | "en";
  onClose: () => void;
  onAddXP?: (amount: number) => void;
  playerMoney?: number;
  onDeductMoney?: (amount: number) => boolean;
}

export interface PetData {
  name: string;
  type: "dog" | "cat";
  hunger: number; // 0 - 100
  happiness: number; // 0 - 100
  energy: number; // 0 - 100
  level: number;
  xp: number;
}

export const PetSystemModal: React.FC<PetSystemModalProps> = ({
  language,
  onClose,
  onAddXP,
  playerMoney = 1000,
  onDeductMoney
}) => {
  const [pet, setPet] = useState<PetData>(() => {
    try {
      const saved = localStorage.getItem("cky_pet_data");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: "Firulais",
      type: "dog",
      hunger: 60,
      happiness: 75,
      energy: 80,
      level: 1,
      xp: 20
    };
  });

  const [message, setMessage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem("cky_pet_data", JSON.stringify(pet));
  }, [pet]);

  const triggerAnimation = (msg: string) => {
    setMessage(msg);
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleFeed = () => {
    if (onDeductMoney && !onDeductMoney(50)) {
      triggerAnimation(language === "es" ? "❌ ¡No tienes suficiente dinero ($50) para comprar croquetas!" : "❌ Not enough money ($50) for pet food!");
      return;
    }
    soundEngine.playSfx("purchase");
    if (onAddXP) onAddXP(10);
    setPet(prev => {
      const newHunger = Math.min(100, prev.hunger + 30);
      const newXp = prev.xp + 15;
      const newLevel = newXp >= prev.level * 50 ? prev.level + 1 : prev.level;
      return {
        ...prev,
        hunger: newHunger,
        happiness: Math.min(100, prev.happiness + 10),
        xp: newXp,
        level: newLevel
      };
    });
    triggerAnimation(language === "es" ? `🍖 ¡Alimentaste a ${pet.name}! (+30 Hambre, +10 Cariño, +10 XP)` : `🍖 Fed ${pet.name}! (+30 Hunger, +10 Happiness, +10 XP)`);
  };

  const handlePet = () => {
    soundEngine.playSfx("fanfare");
    if (onAddXP) onAddXP(5);
    setPet(prev => {
      const newHappiness = Math.min(100, prev.happiness + 25);
      const newXp = prev.xp + 10;
      const newLevel = newXp >= prev.level * 50 ? prev.level + 1 : prev.level;
      return {
        ...prev,
        happiness: newHappiness,
        xp: newXp,
        level: newLevel
      };
    });
    triggerAnimation(language === "es" ? `❤️ ¡Acariciaste a ${pet.name}! Ronronea contento (+25 Cariño, +5 XP)` : `❤️ Petted ${pet.name}! (+25 Happiness, +5 XP)`);
  };

  const handlePlayBall = () => {
    if (pet.energy < 20) {
      triggerAnimation(language === "es" ? `😴 ${pet.name} está demasiado cansado para jugar a la pelota.` : `😴 ${pet.name} is too tired to play.`);
      return;
    }
    soundEngine.playSfx("interact");
    if (onAddXP) onAddXP(15);
    setPet(prev => {
      const newHappiness = Math.min(100, prev.happiness + 30);
      const newEnergy = Math.max(0, prev.energy - 25);
      const newHunger = Math.max(0, prev.hunger - 15);
      const newXp = prev.xp + 25;
      const newLevel = newXp >= prev.level * 50 ? prev.level + 1 : prev.level;
      return {
        ...prev,
        happiness: newHappiness,
        energy: newEnergy,
        hunger: newHunger,
        xp: newXp,
        level: newLevel
      };
    });
    triggerAnimation(language === "es" ? `🎾 ¡Jugaron a la pelota en el patio! (+30 Cariño, -25 Energía, +15 XP)` : `🎾 Played fetch in the yard! (+30 Happiness, -25 Energy, +15 XP)`);
  };

  const handleRest = () => {
    soundEngine.playSfx("dialogue");
    setPet(prev => ({
      ...prev,
      energy: 100
    }));
    triggerAnimation(language === "es" ? `💤 ${pet.name} durmió una siesta reconfortante (+100% Energía)` : `💤 ${pet.name} took a nap (+100% Energy)`);
  };

  const handleSwitchType = () => {
    setPet(prev => {
      const nextType = prev.type === "dog" ? "cat" : "dog";
      const nextName = nextType === "dog" ? "Firulais" : "Michi";
      return {
        ...prev,
        type: nextType,
        name: nextName
      };
    });
    soundEngine.playSfx("dialogue");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl font-mono text-slate-100 flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{pet.type === "dog" ? "🐕" : "🐈"}</span>
            <div>
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>{pet.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Nivel {pet.level}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Compañero Animal de CKY" : "CKY's Pet Companion"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchType}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 rounded border border-slate-700 transition"
              title="Cambiar entre perro y gato"
            >
              {pet.type === "dog" ? "Cambiar a Gato 🐈" : "Cambiar a Perro 🐕"}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pet Stage Display */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800">
          <div className="absolute top-3 right-4 flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>XP: {pet.xp}/{pet.level * 50}</span>
          </div>

          {/* Animated Pet Sprite */}
          <div className="relative my-2">
            <div
              className={`text-7xl select-none transition-transform duration-300 ${
                isAnimating ? "scale-125 rotate-6" : "hover:scale-110"
              }`}
            >
              {pet.type === "dog" ? (pet.happiness > 50 ? "🐶" : "🐕") : (pet.happiness > 50 ? "😸" : "🐈")}
            </div>
            {isAnimating && (
              <span className="absolute -top-4 -right-4 text-2xl animate-bounce">
                ✨❤️
              </span>
            )}
          </div>

          <p className="text-xs text-amber-300 font-bold mt-1">
            {pet.happiness > 70 
              ? (language === "es" ? `¡${pet.name} mueve la colita de felicidad!` : `${pet.name} is super happy!`)
              : (language === "es" ? `${pet.name} te mira esperando cariño.` : `${pet.name} is waiting for love.`)}
          </p>

          {/* Message Toast */}
          {message && (
            <div className="mt-3 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs rounded-xl text-center shadow animate-fade-in">
              {message}
            </div>
          )}
        </div>

        {/* Status Bars */}
        <div className="p-4 space-y-3 bg-slate-900/60">
          {/* Hunger */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Utensils className="w-3.5 h-3.5" />
                {language === "es" ? "Hambre / Saciedad" : "Hunger / Fullness"}
              </span>
              <span className="font-bold">{pet.hunger}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                style={{ width: `${pet.hunger}%` }}
              />
            </div>
          </div>

          {/* Happiness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-pink-400">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                {language === "es" ? "Cariño / Felicidad" : "Happiness"}
              </span>
              <span className="font-bold">{pet.happiness}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-300"
                style={{ width: `${pet.happiness}%` }}
              />
            </div>
          </div>

          {/* Energy */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                {language === "es" ? "Energía" : "Energy"}
              </span>
              <span className="font-bold">{pet.energy}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${pet.energy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 grid grid-cols-2 gap-2.5 bg-slate-950 border-t border-slate-800">
          <button
            onClick={handleFeed}
            className="p-3 bg-slate-900 hover:bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-2 hover:border-amber-400 transition active:scale-95 shadow"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>{language === "es" ? "Dar Comida ($50)" : "Feed Food ($50)"}</span>
          </button>

          <button
            onClick={handlePet}
            className="p-3 bg-slate-900 hover:bg-pink-950/60 border border-pink-500/40 rounded-xl text-xs font-bold text-pink-300 flex items-center justify-center gap-2 hover:border-pink-400 transition active:scale-95 shadow"
          >
            <Smile className="w-4 h-4 text-pink-400" />
            <span>{language === "es" ? "Acariciar" : "Pet / Cuddle"}</span>
          </button>

          <button
            onClick={handlePlayBall}
            className="p-3 bg-slate-900 hover:bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 hover:border-emerald-400 transition active:scale-95 shadow"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>{language === "es" ? "Jugar a la Pelota" : "Play Fetch"}</span>
          </button>

          <button
            onClick={handleRest}
            className="p-3 bg-slate-900 hover:bg-sky-950/60 border border-sky-500/40 rounded-xl text-xs font-bold text-sky-300 flex items-center justify-center gap-2 hover:border-sky-400 transition active:scale-95 shadow"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>{language === "es" ? "Siesta / Descanso" : "Rest / Nap"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Trophy, ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Language, InventoryItem } from "../types";
import { soundEngine } from "../lib/soundEngine";

interface ClawMachineMinigameProps {
  language: Language;
  onClose: () => void;
  onAddXP: (amount: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  money: number;
  onDeductMoney: (amount: number) => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

interface PlushPrize {
  id: string;
  nameEs: string;
  nameEn: string;
  icon: string;
  x: number; // 20 to 80 percent
  descEs: string;
  descEn: string;
  rarity: "common" | "rare" | "legendary";
}

const PRIZES: PlushPrize[] = [
  {
    id: "plush_osito_w",
    nameEs: "Peluches Osito W Celestial",
    nameEn: "Celestial Bear W Plush",
    icon: "🧸",
    x: 25,
    descEs: "Un peluche adorable de W con forma de osito y alitas doradas. ¡Para la mesita de luz de CKY!",
    descEn: "An adorable W teddy bear with golden wings. For CKY's nightstand!",
    rarity: "legendary"
  },
  {
    id: "plush_perrito_criollo",
    nameEs: "Peluches Perrito Pulgoso",
    nameEn: "Scruffy Dog Plush",
    icon: "🐶",
    x: 45,
    descEs: "Perrito criollo de peluche suave con orejas caídas. ¡Compañero fiel!",
    descEn: "Soft scruffy stray dog plush with floppy ears. Loyal buddy!",
    rarity: "rare"
  },
  {
    id: "plush_sandwich_gourmet",
    nameEs: "Almohadón Sándwich de Salame",
    nameEn: "Salami Sandwich Plush Pillow",
    icon: "🥪",
    x: 65,
    descEs: "Un sándwich de salame y queso gigante de peluche mullido.",
    descEn: "A giant fluffy plush salami and cheese sandwich pillow.",
    rarity: "common"
  },
  {
    id: "plush_michi_espacial",
    nameEs: "Gatito Espacial Cósmico",
    nameEn: "Cosmic Space Kitty Plush",
    icon: "🐱",
    x: 80,
    descEs: "Gatito negro con ojos brillantes y collar de estrellas del Limbo.",
    descEn: "Black kitty with glowing eyes and Limbo star collar.",
    rarity: "rare"
  }
];

export default function ClawMachineMinigame({
  language,
  onClose,
  onAddXP,
  onAddInventoryItem,
  money,
  onDeductMoney,
  onShowNotification
}: ClawMachineMinigameProps) {
  const [clawX, setClawX] = useState<number>(50); // percentage 15 to 85
  const [clawY, setClawY] = useState<number>(10); // percentage 10 to 75
  const [gameState, setGameState] = useState<"idle" | "moving" | "descending" | "grabbing" | "ascending" | "returning" | "result">("idle");
  const [wonPrize, setWonPrize] = useState<PlushPrize | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  const COST_PER_PLAY = 50;

  const handleStartPlay = () => {
    if (money < COST_PER_PLAY) {
      soundEngine.playSfx("hit");
      if (onShowNotification) {
        onShowNotification({
          icon: "🪙",
          titleEs: "¡Faltan monedas!",
          titleEn: "Not enough coins!",
          subEs: `Cuesta $${COST_PER_PLAY} por ficha de la máquina arcade.`,
          subEn: `Costs $${COST_PER_PLAY} per arcade token.`,
          color: "rose"
        });
      }
      return;
    }

    onDeductMoney(COST_PER_PLAY);
    soundEngine.playSfx("coin");
    setGameState("moving");
    setWonPrize(null);
  };

  const handleDropClaw = () => {
    if (gameState !== "moving") return;
    setGameState("descending");
    soundEngine.playSfx("select");

    // Animate descent
    let curY = 10;
    const dropInterval = setInterval(() => {
      curY += 3;
      setClawY(curY);
      if (curY >= 70) {
        clearInterval(dropInterval);
        setGameState("grabbing");
        soundEngine.playSfx("dialogue");

        // Check if aligned with any prize (within +-8%)
        const matchedPrize = PRIZES.find(p => Math.abs(p.x - clawX) <= 9);

        // Success probability: 80% if aligned
        const grabSuccess = matchedPrize && Math.random() < 0.85;

        setTimeout(() => {
          setGameState("ascending");

          // Animate ascend
          let ascY = 70;
          const ascInterval = setInterval(() => {
            ascY -= 3;
            setClawY(ascY);
            if (ascY <= 10) {
              clearInterval(ascInterval);
              setGameState("returning");

              // Return to drop chute at x: 20
              setTimeout(() => {
                setClawX(20);
                setTimeout(() => {
                  setGameState("result");
                  if (grabSuccess && matchedPrize) {
                    setWonPrize(matchedPrize);
                    soundEngine.playSfx("fanfare");
                    onAddXP(30);

                    const prizeItem: InventoryItem = {
                      id: `${matchedPrize.id}_${Date.now()}`,
                      nameEs: matchedPrize.nameEs,
                      nameEn: matchedPrize.nameEn,
                      descEs: matchedPrize.descEs,
                      descEn: matchedPrize.descEn,
                      icon: matchedPrize.icon,
                      isKey: false,
                      category: "backpack"
                    };
                    onAddInventoryItem(prizeItem);

                    // Also save to room decor toys
                    try {
                      const curToys = JSON.parse(localStorage.getItem("cky_bedroom_toys") || "[]");
                      curToys.push(matchedPrize.id);
                      localStorage.setItem("cky_bedroom_toys", JSON.stringify(curToys));
                    } catch {}

                    if (onShowNotification) {
                      onShowNotification({
                        icon: matchedPrize.icon,
                        titleEs: `¡Atrapaste: ${matchedPrize.nameEs}!`,
                        titleEn: `Caught: ${matchedPrize.nameEn}!`,
                        subEs: "¡El peluche fue guardado en tu mochila para decorar tu habitación!",
                        subEn: "The plush was stored in your backpack to decorate your room!",
                        color: "emerald"
                      });
                    }
                  } else {
                    soundEngine.playSfx("hit");
                  }
                }, 600);
              }, 400);
            }
          }, 30);
        }, 600);
      }
    }, 30);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
        {/* Machine Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/40 text-xl">
              🕹️
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-300">
                {language === "es" ? "Arcade Peluchero 3000" : "Plush Claw Machine 3000"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Centro Comercial • $50 por ficha" : "Shopping Mall • $50 per token"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Glass Showcase */}
        <div className="relative w-full h-64 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between">
          {/* Top Rail */}
          <div className="w-full h-3 bg-slate-800 border-b border-purple-500/30 relative">
            <div
              className="absolute top-0 w-8 h-3 bg-purple-500 rounded-sm transition-all duration-75"
              style={{ left: `${clawX}%`, transform: "translateX(-50%)" }}
            />
          </div>

          {/* Claw Cable & Arm */}
          <div
            className="absolute transition-all duration-75 flex flex-col items-center pointer-events-none"
            style={{
              left: `${clawX}%`,
              top: 0,
              height: `${clawY}%`,
              transform: "translateX(-50%)"
            }}
          >
            <div className="w-1 bg-slate-400 h-full shadow" />
            <div className="text-2xl transform -translate-y-1">
              {gameState === "grabbing" ? "🗜️" : "🏗️"}
            </div>
          </div>

          {/* Prizes Floor */}
          <div className="w-full h-16 bg-slate-900 border-t-2 border-purple-950 flex items-center justify-around px-4 relative">
            {/* Chute */}
            <div className="w-12 h-10 border-2 border-dashed border-purple-400/40 rounded-lg flex items-center justify-center text-[10px] text-purple-300 font-bold bg-purple-950/20">
              VENTA
            </div>

            {/* Plushies on floor */}
            {PRIZES.map((prize) => (
              <div
                key={prize.id}
                className="flex flex-col items-center group cursor-pointer"
                style={{ position: "absolute", left: `${prize.x}%`, transform: "translateX(-50%)" }}
              >
                <div className="text-3xl filter drop-shadow hover:scale-110 transition-transform">
                  {prize.icon}
                </div>
                <span className="text-[8px] text-slate-400 font-bold max-w-[60px] truncate text-center">
                  {prize.nameEs.split(" ")[1] || prize.nameEs}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Controls Panel */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>{language === "es" ? "Tu dinero:" : "Your money:"} <strong className="text-emerald-400">${money}</strong></span>
            <span className="text-purple-400 font-bold">{language === "es" ? "Costo: $50" : "Cost: $50"}</span>
          </div>

          {gameState === "idle" || gameState === "result" ? (
            <div className="space-y-2">
              {gameState === "result" && (
                <div className={`p-2.5 rounded-xl border text-center text-xs font-bold ${wonPrize ? "bg-emerald-950/80 border-emerald-500 text-emerald-300" : "bg-rose-950/80 border-rose-500 text-rose-300"}`}>
                  {wonPrize
                    ? `¡¡FELICITACIONES!! ¡Ganaste: ${wonPrize.nameEs} ${wonPrize.icon}!`
                    : "¡Uyyy se escapó por un pelo! ¡Probá de nuevo!"}
                </div>
              )}
              <button
                onClick={handleStartPlay}
                disabled={money < COST_PER_PLAY}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                {language === "es" ? "Insertar Ficha ($50) y Jugar" : "Insert Token ($50) & Play"}
              </button>
            </div>
          ) : gameState === "moving" ? (
            <div className="space-y-3 animate-fade-in">
              <p className="text-center text-xs text-purple-300 font-bold">
                {language === "es" ? "Usa las flechas para apuntar la garra:" : "Use arrows to align the claw:"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setClawX(prev => Math.max(15, prev - 7));
                    soundEngine.playSfx("dialogue");
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === "es" ? "Izquierda" : "Left"}
                </button>
                <button
                  onClick={() => {
                    setClawX(prev => Math.min(85, prev + 7));
                    soundEngine.playSfx("dialogue");
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {language === "es" ? "Derecha" : "Right"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleDropClaw}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all animate-pulse cursor-pointer"
              >
                {language === "es" ? "¡¡BAJAR GARRA YA!!" : "DROP CLAW NOW!!"}
              </button>
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400 animate-pulse">
              {language === "es" ? "Operando la garra mecánica..." : "Operating mechanical claw..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

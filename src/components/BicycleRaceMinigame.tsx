import React, { useState, useEffect, useRef } from "react";
import { X, Trophy, Bike, Zap, AlertTriangle, Play, RotateCcw } from "lucide-react";
import { Language } from "../types";
import { soundEngine } from "../lib/soundEngine";

interface BicycleRaceMinigameProps {
  language: Language;
  onClose: () => void;
  onAddXP: (amount: number) => void;
  onEarnMoney?: (amount: number) => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

interface Obstacle {
  id: number;
  lane: number; // 0: Left, 1: Center, 2: Right
  y: number; // 0 to 100
  type: "pothole" | "cart" | "bus";
  icon: string;
}

export default function BicycleRaceMinigame({
  language,
  onClose,
  onAddXP,
  onEarnMoney,
  onShowNotification
}: BicycleRaceMinigameProps) {
  const [lane, setLane] = useState<number>(1); // 0, 1, 2
  const [distance, setDistance] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(15);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [scoreTime, setScoreTime] = useState<number>(0);

  const TARGET_DISTANCE = 500; // meters

  // Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory) return;

    const interval = setInterval(() => {
      setScoreTime(prev => prev + 0.1);
      setDistance(prev => {
        const next = prev + speed * 0.15;
        if (next >= TARGET_DISTANCE) {
          setIsVictory(true);
          setIsPlaying(false);
          soundEngine.playSfx("fanfare");
          onAddXP(60);
          if (onEarnMoney) {
            onEarnMoney(250);
          }
          if (onShowNotification) {
            onShowNotification({
              icon: "🚲",
              titleEs: "¡Llegaste a la Meta en Bicicleta!",
              titleEn: "Bicycle Race Finished!",
              subEs: "¡Esquivaste todos los baches de la avenida! (+60 XP, +$250)",
              subEn: "You dodged all the avenue potholes! (+60 XP, +$250)",
              color: "emerald"
            });
          }
          return TARGET_DISTANCE;
        }
        return next;
      });

      // Move obstacles down
      setObstacles(prev => {
        const next = prev
          .map(obs => ({ ...obs, y: obs.y + speed * 0.3 }))
          .filter(obs => obs.y <= 100);

        // Check collision with player (player is at y: 80)
        for (const obs of next) {
          if (obs.lane === lane && obs.y >= 75 && obs.y <= 88) {
            setIsGameOver(true);
            setIsPlaying(false);
            soundEngine.playSfx("hit");
            return next;
          }
        }

        // Spawn new obstacle
        if (Math.random() < 0.18 && next.length < 3) {
          const newLane = Math.floor(Math.random() * 3);
          const types: ("pothole" | "cart" | "bus")[] = ["pothole", "cart", "bus"];
          const selectedType = types[Math.floor(Math.random() * types.length)];
          const icons = { pothole: "🕳️", cart: "🛒", bus: "🚌" };

          next.push({
            id: Date.now() + Math.random(),
            lane: newLane,
            y: 0,
            type: selectedType,
            icon: icons[selectedType]
          });
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isVictory, lane, speed]);

  const handleStart = () => {
    setDistance(0);
    setScoreTime(0);
    setIsGameOver(false);
    setIsVictory(false);
    setObstacles([]);
    setLane(1);
    setIsPlaying(true);
    soundEngine.playSfx("select");
  };

  const handleMoveLeft = () => {
    if (!isPlaying) return;
    setLane(prev => Math.max(0, prev - 1));
    soundEngine.playSfx("dialogue");
  };

  const handleMoveRight = () => {
    if (!isPlaying) return;
    setLane(prev => Math.min(2, prev + 1));
    soundEngine.playSfx("dialogue");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40 text-xl">
              🚲
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-300">
                {language === "es" ? "Carrera en la Avenida" : "Avenue Bike Sprint"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === "es" ? "Esquiva baches y changuitos" : "Dodge potholes & shopping carts"}
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

        {/* HUD Progress */}
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            {language === "es" ? "Meta:" : "Goal:"} <strong className="text-cyan-400">{Math.round(distance)}m / {TARGET_DISTANCE}m</strong>
          </span>
          <span className="text-amber-400 font-bold">
            ⏱️ {scoreTime.toFixed(1)}s
          </span>
        </div>

        {/* Road Track View */}
        <div className="relative w-full h-72 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex shadow-inner">
          {/* 3 Road Lanes */}
          <div className="flex-1 border-r border-dashed border-slate-800 relative flex justify-center">
            <span className="text-[9px] text-slate-700 absolute bottom-1 font-bold">L1</span>
          </div>
          <div className="flex-1 border-r border-dashed border-slate-800 relative flex justify-center">
            <span className="text-[9px] text-slate-700 absolute bottom-1 font-bold">L2</span>
          </div>
          <div className="flex-1 relative flex justify-center">
            <span className="text-[9px] text-slate-700 absolute bottom-1 font-bold">L3</span>
          </div>

          {/* Player CKY on Bicycle */}
          <div
            className="absolute transition-all duration-150 flex flex-col items-center"
            style={{
              left: `${lane * 33.33 + 16.66}%`,
              top: "80%",
              transform: "translate(-50%, -50%)"
            }}
          >
            <div className="text-3xl filter drop-shadow animate-bounce">
              🚲
            </div>
            <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1 rounded font-bold border border-cyan-800">
              CKY
            </span>
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className="absolute text-2xl flex flex-col items-center pointer-events-none"
              style={{
                left: `${obs.lane * 33.33 + 16.66}%`,
                top: `${obs.y}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              <span>{obs.icon}</span>
            </div>
          ))}

          {/* Overlay state */}
          {!isPlaying && !isGameOver && !isVictory && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3">
              <span className="text-4xl">🚲💨</span>
              <p className="text-xs text-slate-200">
                {language === "es"
                  ? "Pedaleá por la avenida esquivando los baches del asfalto hasta la meta de 500m."
                  : "Pedal along the avenue dodging road potholes to reach the 500m finish line."}
              </p>
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Play className="w-4 h-4 fill-white" />
                {language === "es" ? "Iniciar Carrera" : "Start Sprint"}
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3">
              <span className="text-4xl">💥🤕</span>
              <p className="text-sm font-bold text-rose-300">
                {language === "es" ? "¡Te comiste un bache de la avenida!" : "You hit an obstacle on the avenue!"}
              </p>
              <button
                onClick={handleStart}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {language === "es" ? "Reintentar" : "Retry"}
              </button>
            </div>
          )}

          {isVictory && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3">
              <span className="text-4xl">🏆🌟</span>
              <p className="text-sm font-bold text-emerald-300">
                {language === "es" ? "¡¡LLEGASTE A LA META!!" : "YOU REACHED THE FINISH LINE!!"}
              </p>
              <p className="text-xs text-slate-200">
                {language === "es" ? `Tiempo final: ${scoreTime.toFixed(1)} segundos (+60 XP)` : `Final time: ${scoreTime.toFixed(1)}s (+60 XP)`}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                {language === "es" ? "Genial, Continuar" : "Awesome, Continue"}
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleMoveLeft}
            disabled={!isPlaying || lane === 0}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold rounded-xl border border-slate-700 text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
          >
            ◀ {language === "es" ? "Izquierda" : "Left"}
          </button>
          <button
            onClick={handleMoveRight}
            disabled={!isPlaying || lane === 2}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold rounded-xl border border-slate-700 text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
          >
            {language === "es" ? "Derecha" : "Right"} ▶
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { X, Trophy, RotateCcw, Zap } from "lucide-react";
import { Language } from "../types";
import { soundEngine } from "../lib/soundEngine";
import { unlockAchievement } from "../data/achievements";

interface SoccerPenaltyMinigameProps {
  language: Language;
  onClose: () => void;
  onAddXP: (amount: number) => void;
  onShowNotification?: (toast: {
    icon: string;
    titleEs: string;
    titleEn: string;
    subEs?: string;
    subEn?: string;
    color?: "emerald" | "amber" | "sky" | "purple" | "rose";
  }) => void;
}

export default function SoccerPenaltyMinigame({
  language,
  onClose,
  onAddXP,
  onShowNotification,
}: SoccerPenaltyMinigameProps) {
  const isEs = language === "es";

  // Game flow states: 'ready' | 'aiming' | 'power' | 'kicking' | 'shot_result' | 'game_over'
  const [phase, setPhase] = useState<"ready" | "aiming" | "power" | "kicking" | "shot_result" | "game_over">("ready");
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);
  const [goalsScored, setGoalsScored] = useState<number>(0);

  // Aim: -45 to 45 degrees
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [aimDir, setAimDir] = useState<number>(1.8);

  // Power: 0 to 100
  const [power, setPower] = useState<number>(0);
  const [powerDir, setPowerDir] = useState<number>(2.5);

  // Ball & Keeper animation
  const [ballState, setBallState] = useState<{ x: number; y: number; scale: number }>({ x: 200, y: 270, scale: 1 });
  const [keeperX, setKeeperX] = useState<number>(200);
  const [keeperDive, setKeeperDive] = useState<"idle" | "dive_left" | "dive_right" | "catch">("idle");
  const [commentary, setCommentary] = useState<string>(
    isEs ? "¡Alineate en el punto de penal! Presioná FIJAR DIRECCIÓN." : "Line up at penalty spot! Tap LOCK AIM."
  );
  const [lastShotOutcome, setLastShotOutcome] = useState<"goal" | "saved" | "missed" | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sound helper
  const playFx = (type: "kick" | "goal" | "save" | "click" | "win") => {
    try {
      if (type === "kick") soundEngine.playSfx("attack");
      else if (type === "goal") soundEngine.playSfx("level_up");
      else if (type === "save") soundEngine.playSfx("dialogue");
      else if (type === "click") soundEngine.playSfx("menu_nav");
      else if (type === "win") soundEngine.playSfx("purchase");
    } catch {
      // fallback
    }
  };

  // Main oscillation loop
  useEffect(() => {
    let active = true;

    const loop = () => {
      if (!active) return;

      if (phase === "aiming") {
        setAimAngle((prev) => {
          let next = prev + aimDir;
          if (next > 40) {
            next = 40;
            setAimDir(-2);
          } else if (next < -40) {
            next = -40;
            setAimDir(2);
          }
          return next;
        });
      }

      if (phase === "power") {
        setPower((prev) => {
          let next = prev + powerDir;
          if (next > 100) {
            next = 100;
            setPowerDir(-3.5);
          } else if (next < 0) {
            next = 0;
            setPowerDir(3.5);
          }
          return next;
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, aimDir, powerDir]);

  // Handle Shot Trigger
  const handleLockAim = () => {
    playFx("click");
    setPhase("power");
    setPower(15);
    setCommentary(
      isEs
        ? "¡Dirección fijada! Ahora medí la potencia en el botón PATEAR."
        : "Aim locked! Now measure power on SHOOT button."
    );
  };

  const handleShoot = () => {
    playFx("kick");
    setPhase("kicking");

    // Calculate ball target and keeper decision
    // Goal range in canvas: X: 110 to 290, Y: 70 to 140
    const targetX = 200 + aimAngle * 2.8;
    const isTooHigh = power > 92;
    const targetY = isTooHigh ? 35 : 125 - (power / 100) * 55;

    // Keeper dive decision: Mateo anticipates
    const keeperDecision = Math.random();
    let keeperTargetX = 200;
    if (keeperDecision < 0.42) {
      keeperTargetX = 145; // Dive left
      setKeeperDive("dive_left");
    } else if (keeperDecision < 0.84) {
      keeperTargetX = 255; // Dive right
      setKeeperDive("dive_right");
    } else {
      keeperTargetX = 200; // Stay center
      setKeeperDive("catch");
    }

    // Animate ball
    const startTime = performance.now();
    const duration = 650;

    const animateShot = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = Math.sin((progress * Math.PI) / 2);

      const curX = 200 + (targetX - 200) * ease;
      const curY = 270 + (targetY - 270) * ease;
      const curScale = 1 - progress * 0.45;

      setBallState({ x: curX, y: curY, scale: curScale });
      setKeeperX(200 + (keeperTargetX - 200) * ease);

      if (progress < 1) {
        requestAnimationFrame(animateShot);
      } else {
        // Evaluate outcome
        const keeperDist = Math.abs(targetX - keeperTargetX);
        const keeperSaved = !isTooHigh && keeperDist < 36 && targetY >= 65 && targetY <= 150;

        if (isTooHigh) {
          playFx("save");
          setLastShotOutcome("missed");
          setCommentary(
            isEs
              ? "💨 ¡A las nubes! Se fue por encima del travesaño."
              : "💨 Over the crossbar! Kicked too high."
          );
        } else if (targetX < 110 || targetX > 290) {
          playFx("save");
          setLastShotOutcome("missed");
          setCommentary(
            isEs
              ? "❌ ¡Afuera! Pegó contra la red lateral."
              : "❌ Wide! Hit the side netting."
          );
        } else if (keeperSaved) {
          playFx("save");
          setLastShotOutcome("saved");
          setCommentary(
            isEs
              ? "🧤 ¡ATAJÓ MATEO! Mateo: '¡Buena CKY, pero leí tu trayectoria!'"
              : "🧤 SAVED BY MATEO! Mateo: 'Nice shot CKY, but I read your aim!'"
          );
        } else {
          playFx("goal");
          setLastShotOutcome("goal");
          setGoalsScored((prev) => prev + 1);
          setCommentary(
            isEs
              ? "⚽🎉 ¡¡¡GOOOOOOOLAZO DE CKY!!! ¡Al ángulo imposible!"
              : "⚽🎉 GOOOOAL BY CKY!!! Right in the top corner!"
          );
        }

        const nextAttempts = attemptsLeft - 1;
        setAttemptsLeft(nextAttempts);

        setTimeout(() => {
          if (nextAttempts <= 0) {
            setPhase("game_over");
            playFx("win");
            const finalGoals = goalsScored + (!isTooHigh && targetX >= 110 && targetX <= 290 && !keeperSaved ? 1 : 0);
            if (finalGoals >= 3) {
              onAddXP(50);
              unlockAchievement("ach_soccer_hero", onShowNotification, onAddXP);
            } else {
              onAddXP(15);
            }
          } else {
            setPhase("shot_result");
          }
        }, 1200);
      }
    };

    requestAnimationFrame(animateShot);
  };

  const handleNextShot = () => {
    playFx("click");
    setBallState({ x: 200, y: 270, scale: 1 });
    setKeeperX(200);
    setKeeperDive("idle");
    setAimAngle(0);
    setPower(0);
    setLastShotOutcome(null);
    setPhase("aiming");
    setCommentary(
      isEs
        ? `Tiro ${6 - attemptsLeft} de 5: Fijá tu puntería con la flecha.`
        : `Shot ${6 - attemptsLeft} of 5: Lock your aim with the arrow.`
    );
  };

  const handleResetMatch = () => {
    playFx("click");
    setAttemptsLeft(5);
    setGoalsScored(0);
    setBallState({ x: 200, y: 270, scale: 1 });
    setKeeperX(200);
    setKeeperDive("idle");
    setAimAngle(0);
    setPower(0);
    setLastShotOutcome(null);
    setPhase("aiming");
    setCommentary(
      isEs ? "¡Nueva tanda de penales! ¡A patear con todo!" : "New penalty shootout! Give it your all!"
    );
  };

  // Draw turf and goal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grass pitch gradient
    const grassGrad = ctx.createLinearGradient(0, 0, 0, 320);
    grassGrad.addColorStop(0, "#15803d");
    grassGrad.addColorStop(1, "#166534");
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, 400, 320);

    // Goal area chalk lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 50, 240, 120);

    // Goalpost frame (Iron white & crossbar)
    // Goal Dimensions: X: 110 to 290, Y: 70 to 145
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillRect(110, 70, 180, 75); // Net depth

    // Net mesh lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let x = 120; x < 290; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x, 145);
      ctx.stroke();
    }
    for (let y = 80; y < 145; y += 12) {
      ctx.beginPath();
      ctx.moveTo(110, y);
      ctx.lineTo(290, y);
      ctx.stroke();
    }

    // White goalposts
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(110, 145);
    ctx.lineTo(110, 70);
    ctx.lineTo(290, 70);
    ctx.lineTo(290, 145);
    ctx.stroke();

    // Penalty spot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(200, 270, 4, 0, Math.PI * 2);
    ctx.fill();

    // Penalty arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 230, 40, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Draw Goalkeeper Mateo
    ctx.save();
    ctx.translate(keeperX, 130);
    ctx.textAlign = "center";
    ctx.font = "28px sans-serif";

    if (keeperDive === "dive_left") {
      ctx.rotate(-0.35);
      ctx.fillText("🧑‍🧤", -10, 0);
    } else if (keeperDive === "dive_right") {
      ctx.rotate(0.35);
      ctx.fillText("🧤🧑", 10, 0);
    } else if (keeperDive === "catch") {
      ctx.fillText("🙌🧑", 0, -5);
    } else {
      ctx.fillText("🧑‍⚽", 0, 0);
    }
    ctx.restore();

    // Draw Aim Indicator when in aiming phase
    if (phase === "aiming") {
      ctx.save();
      ctx.translate(200, 270);
      ctx.rotate((aimAngle * Math.PI) / 180);

      // Gradient arrow
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -90);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(0, -100);
      ctx.lineTo(-8, -85);
      ctx.lineTo(8, -85);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Draw Ball
    ctx.save();
    ctx.translate(ballState.x, ballState.y);
    ctx.scale(ballState.scale, ballState.scale);
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚽", 0, 0);
    ctx.restore();
  }, [ballState, keeperX, keeperDive, phase, aimAngle]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 font-mono select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <div>
              <h3 className="text-sm font-bold font-display text-emerald-400 uppercase tracking-wide">
                {isEs ? "Duelo de Penales con Mateo" : "Penalty Shootout with Mateo"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isEs ? "Patio de la Escuela CKY" : "CKY School Courtyard"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scoreboard Bar */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              {isEs ? "Goles Anotados" : "Goals Scored"}
            </span>
            <p className="text-lg font-bold text-emerald-400">{goalsScored}</p>
          </div>

          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => {
              const shotIndex = i;
              const hasTaken = 5 - attemptsLeft > shotIndex;
              return (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                    hasTaken
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-slate-900 border-slate-700 text-slate-500"
                  }`}
                >
                  {hasTaken ? "⚽" : i + 1}
                </span>
              );
            })}
          </div>

          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
              {isEs ? "Tiros Restantes" : "Shots Left"}
            </span>
            <p className="text-lg font-bold text-yellow-400">{attemptsLeft}</p>
          </div>
        </div>

        {/* Canvas Stadium Pitch */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-inner flex justify-center bg-slate-950">
          <canvas ref={canvasRef} width={400} height={320} className="w-full max-w-[400px] h-[260px]" />

          {/* Goal / Saved Popup Badge */}
          {lastShotOutcome && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
              <div
                className={`px-5 py-2.5 rounded-2xl border-2 font-black text-sm tracking-wider uppercase shadow-xl ${
                  lastShotOutcome === "goal"
                    ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
                    : lastShotOutcome === "saved"
                    ? "bg-amber-950/90 border-amber-400 text-amber-300"
                    : "bg-rose-950/90 border-rose-400 text-rose-300"
                }`}
              >
                {lastShotOutcome === "goal"
                  ? (isEs ? "⚽ ¡¡GOLAZO!!" : "⚽ GOAL!!")
                  : lastShotOutcome === "saved"
                  ? (isEs ? "🧤 ¡ATAJADA!" : "🧤 SAVED!")
                  : (isEs ? "❌ ¡DESVIADO!" : "❌ MISSED!")}
              </div>
            </div>
          )}
        </div>

        {/* Power Meter when in power phase */}
        {phase === "power" && (
          <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-yellow-500/40 animate-fade-in">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-yellow-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                {isEs ? "Potencia del Tiro" : "Shot Power"}
              </span>
              <span className="text-white">{Math.round(power)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full transition-all duration-75"
                style={{
                  width: `${power}%`,
                  backgroundColor: power > 90 ? "#f43f5e" : power > 60 ? "#eab308" : "#22c55e",
                }}
              />
              {/* Sweet zone marker (60 - 88%) */}
              <div className="absolute top-0 bottom-0 left-[60%] w-[28%] border-x border-dashed border-white/60 bg-white/10" />
            </div>
            <p className="text-[8px] text-slate-400 text-center">
              {isEs ? "Zona ideal: 60% a 88%. Por encima de 90% se va al cielo." : "Sweet spot: 60% to 88%. Above 90% flies over."}
            </p>
          </div>
        )}

        {/* Dynamic Commentary Box */}
        <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-300 leading-snug">{commentary}</p>
        </div>

        {/* Action Controls */}
        <div className="pt-1">
          {phase === "ready" && (
            <button
              onClick={() => {
                playFx("click");
                setPhase("aiming");
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400 active:scale-95 transition cursor-pointer"
            >
              ▶ {isEs ? "COMENZAR TANDA DE PENALES" : "START PENALTY SHOOTOUT"}
            </button>
          )}

          {phase === "aiming" && (
            <button
              onClick={handleLockAim}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-yellow-300 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🎯</span>
              <span>{isEs ? "FIJAR DIRECCIÓN DEL DISPARO" : "LOCK SHOT AIM"}</span>
            </button>
          )}

          {phase === "power" && (
            <button
              onClick={handleShoot}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg border border-rose-400 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
            >
              <span>⚡</span>
              <span>{isEs ? "¡PATEAR AL ARCO AHORA!" : "KICK TOWARDS GOAL NOW!"}</span>
            </button>
          )}

          {phase === "shot_result" && (
            <button
              onClick={handleNextShot}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400 active:scale-95 transition cursor-pointer"
            >
              ➔ {isEs ? "SIGUIENTE PENAL" : "NEXT PENALTY"}
            </button>
          )}

          {phase === "game_over" && (
            <div className="space-y-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 text-center space-y-1">
                <Trophy className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
                <h4 className="text-xs font-black text-amber-300 uppercase">
                  {goalsScored >= 3
                    ? (isEs ? "¡VICTORIA TOTAL EN EL POTRERO! (+50 XP)" : "TOTAL SHOOTOUT VICTORY! (+50 XP)")
                    : (isEs ? "¡BUEN PARTIDO! (+15 XP)" : "GOOD MATCH! (+15 XP)")}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isEs
                    ? `Metiste ${goalsScored} de 5 goles contra Mateo.`
                    : `You scored ${goalsScored} out of 5 goals against Mateo.`}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetMatch}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEs ? "Jugar Revancha" : "Play Rematch"}</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border border-emerald-400 active:scale-95 transition cursor-pointer"
                >
                  {isEs ? "Cerrar" : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

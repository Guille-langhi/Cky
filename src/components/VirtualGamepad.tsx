import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Zap, Smartphone, BookOpen } from "lucide-react";
import { Direction } from "../types";
import { androidBridge } from "../lib/androidMobileBridge";

interface VirtualGamepadProps {
  onMove: (dir: Direction) => void;
  onAction: () => void;
  onCancelOrBackpack: () => void;
  visible: boolean;
  onToggleVisible: () => void;
  isSprinting?: boolean;
  onToggleSprint?: () => void;
  controlMode?: "dpad" | "joystick";
  opacity?: number;
  leftHanded?: boolean;
  onOpenPhone?: () => void;
  onOpenJournal?: () => void;
}

export default function VirtualGamepad({
  onMove,
  onAction,
  onCancelOrBackpack,
  visible,
  onToggleVisible,
  isSprinting: controlledSprinting,
  onToggleSprint: controlledToggleSprint,
  controlMode = "dpad",
  opacity = 85,
  leftHanded = false,
  onOpenPhone,
  onOpenJournal,
}: VirtualGamepadProps) {
  const [localSprinting, setLocalSprinting] = useState<boolean>(false);
  const isSprinting = controlledSprinting !== undefined ? controlledSprinting : localSprinting;
  const toggleSprint = useCallback(() => {
    androidBridge.hapticAction();
    if (controlledToggleSprint) {
      controlledToggleSprint();
    } else {
      setLocalSprinting(prev => !prev);
    }
  }, [controlledToggleSprint]);

  // Movement interval & direction references
  const moveIntervalRef = useRef<number | null>(null);
  const activeDirRef = useRef<Direction | null>(null);

  // D-Pad active direction state for visual highlight
  const [activeDpadDir, setActiveDpadDir] = useState<Direction | null>(null);
  const dpadBaseRef = useRef<HTMLDivElement | null>(null);
  const dpadPointerIdRef = useRef<number | null>(null);

  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickPointerIdRef = useRef<number | null>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingStick, setIsDraggingStick] = useState<boolean>(false);

  const startMoving = useCallback((dir: Direction) => {
    activeDirRef.current = dir;
    androidBridge.hapticTap();
    onMove(dir);
    if (moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
    }
    const moveDelay = isSprinting ? 90 : 165;
    moveIntervalRef.current = window.setInterval(() => {
      if (activeDirRef.current) {
        onMove(activeDirRef.current);
      }
    }, moveDelay);
  }, [isSprinting, onMove]);

  const stopMoving = useCallback(() => {
    activeDirRef.current = null;
    setActiveDpadDir(null);
    if (moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }, []);

  // Update movement interval speed dynamically when sprint mode toggles while moving
  useEffect(() => {
    if (activeDirRef.current && moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
      const moveDelay = isSprinting ? 90 : 165;
      moveIntervalRef.current = window.setInterval(() => {
        if (activeDirRef.current) {
          onMove(activeDirRef.current);
        }
      }, moveDelay);
    }
  }, [isSprinting, onMove]);

  // Unified D-Pad Touch / Pointer Handlers with directional sliding
  const updateDpadDirectionFromCoords = (clientX: number, clientY: number) => {
    if (!dpadBaseRef.current) return;
    const rect = dpadBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Center deadzone
    if (distance < 12) {
      if (activeDirRef.current !== null) {
        stopMoving();
      }
      return;
    }

    let dir: Direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? "right" : "left";
    } else {
      dir = dy > 0 ? "down" : "up";
    }

    if (activeDirRef.current !== dir) {
      setActiveDpadDir(dir);
      startMoving(dir);
    }
  };

  const handleDpadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    dpadPointerIdRef.current = e.pointerId;
    updateDpadDirectionFromCoords(e.clientX, e.clientY);
  };

  const handleDpadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dpadPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateDpadDirectionFromCoords(e.clientX, e.clientY);
  };

  const handleDpadPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    dpadPointerIdRef.current = null;
    stopMoving();
  };

  // Joystick Pointer Handlers
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    joystickPointerIdRef.current = e.pointerId;
    setIsDraggingStick(true);
    handleJoystickPointerMove(e);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    if (!joystickBaseRef.current) return;
    e.preventDefault();
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = rect.width / 2 - 14;

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;
    setStickPos({ x: stickX, y: stickY });

    if (distance > 12) {
      let dir: Direction = "down";
      const deg = (angle * 180) / Math.PI;
      if (deg >= -45 && deg <= 45) {
        dir = "right";
      } else if (deg > 45 && deg <= 135) {
        dir = "down";
      } else if (deg >= -135 && deg < -45) {
        dir = "up";
      } else {
        dir = "left";
      }

      if (activeDirRef.current !== dir) {
        startMoving(dir);
      }
    } else {
      stopMoving();
    }
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    joystickPointerIdRef.current = null;
    setIsDraggingStick(false);
    setStickPos({ x: 0, y: 0 });
    stopMoving();
  };

  // Clean up movement interval on unmount
  useEffect(() => {
    return () => {
      if (moveIntervalRef.current !== null) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, []);

  if (!visible) {
    return (
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          androidBridge.hapticTap();
          onToggleVisible();
        }}
        style={{ touchAction: "none" }}
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 p-2.5 bg-slate-900/90 border border-emerald-500/40 rounded-full text-emerald-400 hover:text-white shadow-xl backdrop-blur-sm active:scale-95 cursor-pointer select-none"
        title="Mostrar Gamepad Virtual para Celular"
        aria-label="Toggle Virtual Gamepad"
      >
        <Eye className="w-4 h-4" />
      </button>
    );
  }

  const opacityStyle = { opacity: Math.max(0.3, Math.min(1, opacity / 100)) };

  return (
    <div
      style={opacityStyle}
      className={`fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] inset-x-0 z-40 pointer-events-none px-[max(0.75rem,env(safe-area-inset-left))] flex items-end justify-between select-none max-w-4xl mx-auto transition-opacity ${
        leftHanded ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Top action controls: Toggle Hide, Turbo Sprint, Phone & Journal Quick Access */}
      <div className={`pointer-events-auto absolute -top-11 flex items-center gap-2 ${leftHanded ? "right-4" : "left-4"}`}>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            androidBridge.hapticTap();
            onToggleVisible();
          }}
          style={{ touchAction: "none" }}
          className="p-2 bg-slate-900/90 border border-slate-700/80 rounded-full text-slate-400 hover:text-white shadow-md backdrop-blur-sm active:scale-95 transition cursor-pointer select-none"
          title="Ocultar Gamepad"
        >
          <EyeOff className="w-3.5 h-3.5 pointer-events-none" />
        </button>

        {/* Turbo Sprint Toggle */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSprint();
          }}
          style={{ touchAction: "none" }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition shadow-lg active:scale-95 cursor-pointer select-none ${
            isSprinting
              ? "bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40 animate-pulse"
              : "bg-slate-900/90 text-slate-300 border-slate-700 hover:text-amber-400"
          }`}
          title="Modo Turbo / Correr"
        >
          <Zap className={`w-3.5 h-3.5 pointer-events-none ${isSprinting ? "fill-current" : ""}`} />
          <span className="pointer-events-none">{isSprinting ? "TURBO ON" : "CORRER"}</span>
        </button>

        {/* Quick Phone HUD Button */}
        {onOpenPhone && (
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              androidBridge.hapticAction();
              onOpenPhone();
            }}
            style={{ touchAction: "none" }}
            className="p-1.5 px-2.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 rounded-full text-cyan-300 shadow-md backdrop-blur-sm active:scale-95 transition flex items-center gap-1 text-[11px] font-mono cursor-pointer select-none"
            title="Abrir Celular"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 pointer-events-none" />
            <span className="hidden xs:inline font-bold pointer-events-none">Móvil</span>
          </button>
        )}

        {/* Quick Journal HUD Button */}
        {onOpenJournal && (
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              androidBridge.hapticAction();
              onOpenJournal();
            }}
            style={{ touchAction: "none" }}
            className="p-1.5 px-2.5 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/50 rounded-full text-purple-300 shadow-md backdrop-blur-sm active:scale-95 transition flex items-center gap-1 text-[11px] font-mono cursor-pointer select-none"
            title="Abrir Diario y Mochila"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400 pointer-events-none" />
            <span className="hidden xs:inline font-bold pointer-events-none">Diario</span>
          </button>
        )}
      </div>

      {/* DIRECTIONAL CONTROLS: D-PAD vs ANALOG JOYSTICK */}
      {controlMode === "joystick" ? (
        /* ANALOG JOYSTICK THUMBSTICK */
        <div
          ref={joystickBaseRef}
          onPointerDown={handleJoystickPointerDown}
          onPointerMove={isDraggingStick ? handleJoystickPointerMove : undefined}
          onPointerUp={handleJoystickPointerUp}
          onPointerCancel={handleJoystickPointerUp}
          onLostPointerCapture={handleJoystickPointerUp}
          className="pointer-events-auto relative w-36 h-36 bg-slate-950/85 border-2 border-slate-700/80 rounded-full p-2 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none ring-2 ring-cyan-500/30 cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
        >
          {/* Concentric Guide Rings */}
          <div className="absolute inset-3 rounded-full border border-slate-800/80 border-dashed pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-slate-700/40 pointer-events-none" />

          {/* Directional ticks */}
          <div className="absolute top-1.5 w-1.5 h-3 bg-cyan-500/50 rounded-full pointer-events-none" />
          <div className="absolute bottom-1.5 w-1.5 h-3 bg-cyan-500/50 rounded-full pointer-events-none" />
          <div className="absolute left-1.5 w-3 h-1.5 bg-cyan-500/50 rounded-full pointer-events-none" />
          <div className="absolute right-1.5 w-3 h-1.5 bg-cyan-500/50 rounded-full pointer-events-none" />

          {/* Floating Knob */}
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center pointer-events-none transition-transform ${
              isDraggingStick ? "scale-95" : "duration-150"
            }`}
            style={{
              transform: `translate3d(${stickPos.x}px, ${stickPos.y}px, 0)`,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-slate-950/30 border border-white/50 shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        /* CLASSIC RETRO D-PAD (Unified touch target with slide transitions) */
        <div
          ref={dpadBaseRef}
          onPointerDown={handleDpadPointerDown}
          onPointerMove={handleDpadPointerMove}
          onPointerUp={handleDpadPointerUp}
          onPointerCancel={handleDpadPointerUp}
          onLostPointerCapture={handleDpadPointerUp}
          style={{ touchAction: "none" }}
          className="pointer-events-auto relative w-36 h-36 bg-slate-950/85 border border-slate-800/90 rounded-full p-2 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none ring-1 ring-emerald-500/20 cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          {/* Center core */}
          <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/40 shadow-inner flex items-center justify-center pointer-events-none">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${activeDpadDir ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-emerald-500/30"}`}></div>
          </div>

          {/* UP Button Visual */}
          <div
            className={`absolute top-1 inset-x-0 mx-auto w-12 h-11 rounded-t-xl border-t border-x border-slate-600 flex items-center justify-center pointer-events-none transition-all ${
              activeDpadDir === "up"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-95 border-emerald-400"
                : "bg-slate-800/95 text-slate-200"
            }`}
          >
            <ChevronUp className="w-6 h-6 pointer-events-none" />
          </div>

          {/* DOWN Button Visual */}
          <div
            className={`absolute bottom-1 inset-x-0 mx-auto w-12 h-11 rounded-b-xl border-b border-x border-slate-600 flex items-center justify-center pointer-events-none transition-all ${
              activeDpadDir === "down"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-95 border-emerald-400"
                : "bg-slate-800/95 text-slate-200"
            }`}
          >
            <ChevronDown className="w-6 h-6 pointer-events-none" />
          </div>

          {/* LEFT Button Visual */}
          <div
            className={`absolute left-1 inset-y-0 my-auto w-11 h-12 rounded-l-xl border-l border-y border-slate-600 flex items-center justify-center pointer-events-none transition-all ${
              activeDpadDir === "left"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-95 border-emerald-400"
                : "bg-slate-800/95 text-slate-200"
            }`}
          >
            <ChevronLeft className="w-6 h-6 pointer-events-none" />
          </div>

          {/* RIGHT Button Visual */}
          <div
            className={`absolute right-1 inset-y-0 my-auto w-11 h-12 rounded-r-xl border-r border-y border-slate-600 flex items-center justify-center pointer-events-none transition-all ${
              activeDpadDir === "right"
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-95 border-emerald-400"
                : "bg-slate-800/95 text-slate-200"
            }`}
          >
            <ChevronRight className="w-6 h-6 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ACTION BUTTONS (A & B) */}
      <div className="pointer-events-auto flex items-center gap-3.5 pb-2 touch-none">
        {/* Button B: Mochila / Cancelar */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            androidBridge.hapticAction();
            onCancelOrBackpack();
          }}
          style={{ touchAction: "none" }}
          className="w-14 h-14 bg-gradient-to-br from-amber-600/95 to-amber-900/95 active:from-amber-500 active:to-amber-800 border-2 border-amber-400/80 rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform text-white font-bold font-mono cursor-pointer select-none"
          aria-label="Button B"
        >
          <span className="text-base leading-none pointer-events-none">B</span>
          <span className="text-[8px] text-amber-200 uppercase tracking-tighter pointer-events-none">Mochila</span>
        </button>

        {/* Button A: Interact / Examine */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            androidBridge.hapticAction();
            onAction();
          }}
          style={{ touchAction: "none" }}
          className="w-16 h-16 bg-gradient-to-br from-emerald-500/95 to-emerald-800/95 active:from-emerald-400 active:to-emerald-700 border-2 border-emerald-300/90 rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform text-white font-extrabold font-mono ring-2 ring-emerald-500/30 cursor-pointer select-none"
          aria-label="Button A"
        >
          <span className="text-lg leading-none pointer-events-none">A</span>
          <span className="text-[9px] text-emerald-100 uppercase tracking-tighter pointer-events-none">Acción</span>
        </button>
      </div>
    </div>
  );
}


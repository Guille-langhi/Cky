import React, { useRef, useState, useEffect } from "react";
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
  const toggleSprint = () => {
    androidBridge.hapticAction();
    if (controlledToggleSprint) {
      controlledToggleSprint();
    } else {
      setLocalSprinting(prev => !prev);
    }
  };

  // D-Pad and Joystick movement interval
  const moveIntervalRef = useRef<number | null>(null);
  const activeDirRef = useRef<Direction | null>(null);

  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingStick, setIsDraggingStick] = useState<boolean>(false);

  const startMoving = (dir: Direction) => {
    activeDirRef.current = dir;
    androidBridge.hapticTap();
    onMove(dir);
    if (moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
    }
    const moveDelay = isSprinting ? 95 : 175;
    moveIntervalRef.current = window.setInterval(() => {
      if (activeDirRef.current) {
        onMove(activeDirRef.current);
      }
    }, moveDelay);
  };

  const stopMoving = () => {
    activeDirRef.current = null;
    if (moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  // Joystick Pointer Handlers
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingStick(true);
    handleJoystickPointerMove(e);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickBaseRef.current) return;
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

    // Determine direction from angle if moved significantly (deadzone 12px)
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
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDraggingStick(false);
    setStickPos({ x: 0, y: 0 });
    stopMoving();
  };

  // Clean up on unmount
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
        onClick={() => {
          androidBridge.hapticTap();
          onToggleVisible();
        }}
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 p-2.5 bg-slate-900/90 border border-emerald-500/40 rounded-full text-emerald-400 hover:text-white shadow-xl backdrop-blur-sm active:scale-95 cursor-pointer"
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
          onClick={() => {
            androidBridge.hapticTap();
            onToggleVisible();
          }}
          className="p-2 bg-slate-900/90 border border-slate-700/80 rounded-full text-slate-400 hover:text-white shadow-md backdrop-blur-sm active:scale-95 transition cursor-pointer"
          title="Ocultar Gamepad"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>

        {/* Turbo Sprint Toggle */}
        <button
          onClick={toggleSprint}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition shadow-lg active:scale-95 cursor-pointer ${
            isSprinting
              ? "bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40 animate-pulse"
              : "bg-slate-900/90 text-slate-300 border-slate-700 hover:text-amber-400"
          }`}
          title="Modo Turbo / Correr"
        >
          <Zap className={`w-3.5 h-3.5 ${isSprinting ? "fill-current" : ""}`} />
          <span>{isSprinting ? "TURBO ON" : "CORRER"}</span>
        </button>

        {/* Quick Phone HUD Button */}
        {onOpenPhone && (
          <button
            onClick={() => {
              androidBridge.hapticAction();
              onOpenPhone();
            }}
            className="p-1.5 px-2.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 rounded-full text-cyan-300 shadow-md backdrop-blur-sm active:scale-95 transition flex items-center gap-1 text-[11px] font-mono cursor-pointer"
            title="Abrir Celular"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline font-bold">Móvil</span>
          </button>
        )}

        {/* Quick Journal HUD Button */}
        {onOpenJournal && (
          <button
            onClick={() => {
              androidBridge.hapticAction();
              onOpenJournal();
            }}
            className="p-1.5 px-2.5 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/50 rounded-full text-purple-300 shadow-md backdrop-blur-sm active:scale-95 transition flex items-center gap-1 text-[11px] font-mono cursor-pointer"
            title="Abrir Diario y Mochila"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xs:inline font-bold">Diario</span>
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
          className="pointer-events-auto relative w-36 h-36 bg-slate-950/85 border-2 border-slate-700/80 rounded-full p-2 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none ring-2 ring-cyan-500/30 cursor-grab active:cursor-grabbing"
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
            className={`w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center transition-transform ${
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
        /* CLASSIC RETRO D-PAD */
        <div className="pointer-events-auto relative w-36 h-36 bg-slate-950/80 border border-slate-800/90 rounded-full p-2 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none ring-1 ring-emerald-500/20">
          {/* Center core */}
          <div className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/40 shadow-inner flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></div>
          </div>

          {/* UP */}
          <button
            onPointerDown={() => startMoving("up")}
            onPointerUp={stopMoving}
            onPointerCancel={stopMoving}
            className="absolute top-1 inset-x-0 mx-auto w-12 h-11 bg-slate-800/95 hover:bg-slate-700/95 active:bg-emerald-600/80 rounded-t-xl border-t border-x border-slate-600 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Move Up"
          >
            <ChevronUp className="w-6 h-6 text-slate-200" />
          </button>

          {/* DOWN */}
          <button
            onPointerDown={() => startMoving("down")}
            onPointerUp={stopMoving}
            onPointerCancel={stopMoving}
            className="absolute bottom-1 inset-x-0 mx-auto w-12 h-11 bg-slate-800/95 hover:bg-slate-700/95 active:bg-emerald-600/80 rounded-b-xl border-b border-x border-slate-600 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Move Down"
          >
            <ChevronDown className="w-6 h-6 text-slate-200" />
          </button>

          {/* LEFT */}
          <button
            onPointerDown={() => startMoving("left")}
            onPointerUp={stopMoving}
            onPointerCancel={stopMoving}
            className="absolute left-1 inset-y-0 my-auto w-11 h-12 bg-slate-800/95 hover:bg-slate-700/95 active:bg-emerald-600/80 rounded-l-xl border-l border-y border-slate-600 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Move Left"
          >
            <ChevronLeft className="w-6 h-6 text-slate-200" />
          </button>

          {/* RIGHT */}
          <button
            onPointerDown={() => startMoving("right")}
            onPointerUp={stopMoving}
            onPointerCancel={stopMoving}
            className="absolute right-1 inset-y-0 my-auto w-11 h-12 bg-slate-800/95 hover:bg-slate-700/95 active:bg-emerald-600/80 rounded-r-xl border-r border-y border-slate-600 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Move Right"
          >
            <ChevronRight className="w-6 h-6 text-slate-200" />
          </button>
        </div>
      )}

      {/* ACTION BUTTONS (A & B) Right Side (or Left if Left-Handed) */}
      <div className="pointer-events-auto flex items-center gap-3.5 pb-2 touch-none">
        {/* Button B: Mochila / Cancelar */}
        <button
          onClick={() => {
            androidBridge.hapticAction();
            onCancelOrBackpack();
          }}
          className="w-14 h-14 bg-gradient-to-br from-amber-600/90 to-amber-900/90 active:from-amber-500 active:to-amber-800 border-2 border-amber-400/80 rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform text-white font-bold font-mono cursor-pointer"
          aria-label="Button B"
        >
          <span className="text-base leading-none">B</span>
          <span className="text-[8px] text-amber-200 uppercase tracking-tighter">Mochila</span>
        </button>

        {/* Button A: Interact / Examine */}
        <button
          onClick={() => {
            androidBridge.hapticAction();
            onAction();
          }}
          className="w-16 h-16 bg-gradient-to-br from-emerald-500/90 to-emerald-800/90 active:from-emerald-400 active:to-emerald-700 border-2 border-emerald-300/90 rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform text-white font-extrabold font-mono ring-2 ring-emerald-500/30 cursor-pointer"
          aria-label="Button A"
        >
          <span className="text-lg leading-none">A</span>
          <span className="text-[9px] text-emerald-100 uppercase tracking-tighter">Acción</span>
        </button>
      </div>
    </div>
  );
}


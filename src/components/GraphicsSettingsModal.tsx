import React from "react";
import {
  GraphicsConfig,
  GraphicsPreset,
  applyPreset,
  saveGraphicsConfig,
} from "../lib/graphicsEngine";
import { Language } from "../types";
import {
  Sparkles,
  Sun,
  Moon,
  Eye,
  Sliders,
  X,
  Layers,
  Wind,
  Activity,
  Tv,
  CheckCircle2,
} from "lucide-react";

interface GraphicsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GraphicsConfig;
  onChangeConfig: (newConfig: GraphicsConfig) => void;
  language: Language;
}

export default function GraphicsSettingsModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  language,
}: GraphicsSettingsModalProps) {
  if (!isOpen) return null;

  const handleSelectPreset = (preset: GraphicsPreset) => {
    const updated = applyPreset(preset);
    onChangeConfig(updated);
    saveGraphicsConfig(updated);
  };

  const handleToggle = (key: keyof GraphicsConfig) => {
    const updated = { ...config, [key]: !config[key] };
    onChangeConfig(updated);
    saveGraphicsConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-slate-950 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-cyan-400 flex items-center gap-2">
                {language === "es" ? "MOTOR GRÁFICO HD" : "HD GRAPHICS ENGINE"}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  v2.0 NEXT-GEN
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {language === "es"
                  ? "Configuración visual, iluminación y partículas en tiempo real"
                  : "Visual settings, dynamic lighting, and real-time particles"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block mb-3">
              {language === "es" ? "Perfiles Predefinidos" : "Quick Presets"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: "ultra" as GraphicsPreset,
                  title: "Ultra HD",
                  desc: language === "es" ? "Máxima fidelidad 60 FPS" : "Max visual fidelity",
                  color: "from-cyan-500 to-blue-600",
                },
                {
                  id: "cinematic" as GraphicsPreset,
                  title: "Cinemático",
                  desc: language === "es" ? "Atmósfera y rayos de luz" : "Deep atmospheric mood",
                  color: "from-amber-500 to-orange-600",
                },
                {
                  id: "high" as GraphicsPreset,
                  title: "Balanceado",
                  desc: language === "es" ? "Alto rendimiento fluido" : "Fluid high performance",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  id: "retro" as GraphicsPreset,
                  title: "Retro 8-Bit",
                  desc: language === "es" ? "Pixel Art con Scanlines" : "Classic Pixel Art",
                  color: "from-purple-500 to-pink-600",
                },
              ].map((p) => {
                const isActive = config.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isActive
                        ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-display text-sm text-white">
                          {p.title}
                        </span>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1 leading-snug">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Toggles */}
          <div>
            <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block mb-3">
              {language === "es" ? "Ajustes Avanzados del Renderizador" : "Advanced Renderer Options"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dynamic Lighting */}
              <div
                onClick={() => handleToggle("dynamicLighting")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.dynamicLighting
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Iluminación Dinámica" : "Dynamic 2D Lighting"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Fuentes de luz y lámparas" : "Point lights & lamps"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.dynamicLighting ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.dynamicLighting ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Volumetric God Rays */}
              <div
                onClick={() => handleToggle("volumetricGodRays")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.volumetricGodRays
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Rayos de Luz / God Rays" : "Volumetric God Rays"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Haces de luz por ventanas" : "Window sunlight beams"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.volumetricGodRays ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.volumetricGodRays ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Weather & Particles */}
              <div
                onClick={() => handleToggle("weatherAndParticles")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.weatherAndParticles
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-teal-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Clima & Partículas" : "Weather & Particles"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Polvo, hojas, pasos y vapor" : "Dust, leaves, footsteps"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.weatherAndParticles ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.weatherAndParticles ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Sub-pixel Smooth Motion */}
              <div
                onClick={() => handleToggle("smoothSubpixelMotion")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.smoothSubpixelMotion
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Movimiento Suave 60 FPS" : "Sub-pixel Motion"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Interpolación fluida de pasos" : "Smooth walk interpolation"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.smoothSubpixelMotion ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.smoothSubpixelMotion ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Ambient Occlusion */}
              <div
                onClick={() => handleToggle("ambientOcclusion")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.ambientOcclusion
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Oclusión Ambiental" : "Ambient Occlusion"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Sombras de contacto de muebles" : "Furniture contact shadows"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.ambientOcclusion ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.ambientOcclusion ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Day / Night Atmospheric Cycle */}
              <div
                onClick={() => handleToggle("dayNightAtmosphere")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.dayNightAtmosphere
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Atmósfera Día/Noche" : "Day/Night Lighting"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Graduación de color por hora" : "Hour-based color grading"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.dayNightAtmosphere ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.dayNightAtmosphere ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* CRT Scanlines */}
              <div
                onClick={() => handleToggle("scanlines")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.scanlines
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tv className="w-5 h-5 text-rose-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Scanlines CRT Retro" : "CRT Scanlines"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Efecto arcade retro 80s" : "Arcade retro filter"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.scanlines ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.scanlines ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Vignette */}
              <div
                onClick={() => handleToggle("vignette")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  config.vignette
                    ? "border-cyan-500/50 bg-cyan-950/30 text-cyan-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="font-bold text-xs font-mono text-white">
                      {language === "es" ? "Viñeta Cinemática" : "Cinematic Vignette"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === "es" ? "Sombreado en los bordes" : "Edge border gradient"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.vignette ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.vignette ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Android Controls & Mobile Performance Section */}
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <span>📱</span>
                {language === "es" ? "Controles Táctiles y Batería Android" : "Android Touch Controls & Battery"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target FPS / Battery Saver */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs font-mono text-white flex items-center gap-2">
                      <span>🔋</span> {language === "es" ? "Tasa de Cuadros (FPS)" : "Frame Rate (FPS)"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {language === "es" ? "Modo Eco 30 FPS ahorra hasta 40% de batería" : "Eco 30 FPS saves up to 40% battery"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const updated = { ...config, targetFps: 60 as const };
                        onChangeConfig(updated);
                        saveGraphicsConfig(updated);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                        config.targetFps === 60
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      ⚡ 60 FPS
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...config, targetFps: 30 as const };
                        onChangeConfig(updated);
                        saveGraphicsConfig(updated);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                        config.targetFps === 30
                          ? "bg-amber-500/20 text-amber-300 border-amber-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      🌱 Eco 30 FPS
                    </button>
                  </div>
                </div>

                {/* Gamepad Control Mode: D-Pad vs Joystick */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs font-mono text-white flex items-center gap-2">
                      <span>🕹️</span> {language === "es" ? "Estilo de Control" : "Control Style"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {language === "es" ? "D-Pad clásico o Stick analógico táctil" : "Classic D-Pad or touch thumbstick"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const updated = { ...config, gamepadControlMode: "dpad" as const };
                        onChangeConfig(updated);
                        saveGraphicsConfig(updated);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                        config.gamepadControlMode !== "joystick"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      ✝️ D-PAD
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...config, gamepadControlMode: "joystick" as const };
                        onChangeConfig(updated);
                        saveGraphicsConfig(updated);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                        config.gamepadControlMode === "joystick"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      🕹️ STICK
                    </button>
                  </div>
                </div>

                {/* Left-Handed Mode Toggle */}
                <div
                  onClick={() => {
                    const updated = { ...config, gamepadLeftHanded: !config.gamepadLeftHanded };
                    onChangeConfig(updated);
                    saveGraphicsConfig(updated);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    config.gamepadLeftHanded
                      ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
                      : "border-slate-800 bg-slate-950/40 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🖐️</span>
                    <div>
                      <div className="font-bold text-xs font-mono text-white">
                        {language === "es" ? "Modo Zurdos" : "Left-Handed Mode"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === "es" ? "Invierte el D-Pad y botones A/B" : "Swaps D-Pad and A/B buttons"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      config.gamepadLeftHanded ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        config.gamepadLeftHanded ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                {/* Gamepad Opacity Slider */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs font-mono text-white flex items-center gap-1.5">
                      <span>👁️</span> {language === "es" ? "Opacidad Gamepad" : "Gamepad Opacity"}
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {config.gamepadOpacity ?? 85}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={config.gamepadOpacity ?? 85}
                    onChange={(e) => {
                      const updated = { ...config, gamepadOpacity: Number(e.target.value) };
                      onChangeConfig(updated);
                      saveGraphicsConfig(updated);
                    }}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>30% ({language === "es" ? "Sutil" : "Subtle"})</span>
                    <span>100% ({language === "es" ? "Sólido" : "Solid"})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            {language === "es"
              ? "Los cambios se aplican y guardan instantáneamente"
              : "Changes are applied & saved instantly"}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
          >
            {language === "es" ? "LISTO" : "DONE"}
          </button>
        </div>
      </div>
    </div>
  );
}

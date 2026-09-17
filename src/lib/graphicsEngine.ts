// Graphics Engine (Motor Gráfico HD) for CKY RPG
// Provides Dynamic 2D Lighting, Volumetric God Rays, World Particles,
// Ambient Occlusion, Sub-pixel Motion Smoothing, and Post-Processing Shaders.

export type GraphicsPreset = "ultra" | "high" | "retro" | "cinematic";

export interface GraphicsConfig {
  preset: GraphicsPreset;
  dynamicLighting: boolean;
  volumetricGodRays: boolean;
  ambientOcclusion: boolean;
  weatherAndParticles: boolean;
  smoothSubpixelMotion: boolean;
  dayNightAtmosphere: boolean;
  surfaceReflections: boolean;
  emissiveBloom: boolean;
  vignette: boolean;
  scanlines: boolean;
  shadowQuality: "soft" | "crisp" | "simple";
  particleDensity: number; // 0.5 to 1.5
  targetFps: 60 | 30;
  gamepadControlMode: "dpad" | "joystick";
  gamepadOpacity: number;
  gamepadLeftHanded: boolean;
}

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string; // hex or rgba
  intensity: number; // 0 to 1
  flicker?: boolean;
  flickerSpeed?: number;
  flickerAmount?: number;
  coneAngle?: number; // direction in radians
  coneSpread?: number; // angular width
  isEmissive?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  type: "dust" | "rain" | "leaf" | "footstep" | "sparkle" | "steam" | "splash" | "glow";
  rotation?: number;
  vRot?: number;
  scale?: number;
}

export const DEFAULT_GRAPHICS_CONFIG: GraphicsConfig = {
  preset: "ultra",
  dynamicLighting: true,
  volumetricGodRays: true,
  ambientOcclusion: true,
  weatherAndParticles: true,
  smoothSubpixelMotion: true,
  dayNightAtmosphere: true,
  surfaceReflections: true,
  emissiveBloom: true,
  vignette: true,
  scanlines: false,
  shadowQuality: "soft",
  particleDensity: 1.0,
  targetFps: 60,
  gamepadControlMode: "dpad",
  gamepadOpacity: 85,
  gamepadLeftHanded: false,
};

const STORAGE_KEY = "cky_graphics_settings_v2";

export function loadGraphicsConfig(): GraphicsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_GRAPHICS_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load graphics settings from localStorage", e);
  }
  return { ...DEFAULT_GRAPHICS_CONFIG };
}

export function saveGraphicsConfig(config: GraphicsConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to save graphics settings to localStorage", e);
  }
}

export function applyPreset(preset: GraphicsPreset): GraphicsConfig {
  switch (preset) {
    case "ultra":
      return {
        preset: "ultra",
        dynamicLighting: true,
        volumetricGodRays: true,
        ambientOcclusion: true,
        weatherAndParticles: true,
        smoothSubpixelMotion: true,
        dayNightAtmosphere: true,
        surfaceReflections: true,
        emissiveBloom: true,
        vignette: true,
        scanlines: false,
        shadowQuality: "soft",
        particleDensity: 1.2,
        targetFps: 60,
        gamepadControlMode: "dpad",
        gamepadOpacity: 75,
        gamepadLeftHanded: false,
      };
    case "high":
      return {
        preset: "high",
        dynamicLighting: true,
        volumetricGodRays: true,
        ambientOcclusion: true,
        weatherAndParticles: true,
        smoothSubpixelMotion: true,
        dayNightAtmosphere: true,
        surfaceReflections: false,
        emissiveBloom: true,
        vignette: true,
        scanlines: false,
        shadowQuality: "soft",
        particleDensity: 0.8,
        targetFps: 60,
        gamepadControlMode: "dpad",
        gamepadOpacity: 75,
        gamepadLeftHanded: false,
      };
    case "cinematic":
      return {
        preset: "cinematic",
        dynamicLighting: true,
        volumetricGodRays: true,
        ambientOcclusion: true,
        weatherAndParticles: true,
        smoothSubpixelMotion: true,
        dayNightAtmosphere: true,
        surfaceReflections: true,
        emissiveBloom: true,
        vignette: true,
        scanlines: false,
        shadowQuality: "soft",
        particleDensity: 1.5,
        targetFps: 60,
        gamepadControlMode: "dpad",
        gamepadOpacity: 75,
        gamepadLeftHanded: false,
      };
    case "retro":
      return {
        preset: "retro",
        dynamicLighting: false,
        volumetricGodRays: false,
        ambientOcclusion: false,
        weatherAndParticles: false,
        smoothSubpixelMotion: false,
        dayNightAtmosphere: false,
        surfaceReflections: false,
        emissiveBloom: false,
        vignette: false,
        scanlines: true,
        shadowQuality: "crisp",
        particleDensity: 0.0,
        targetFps: 60,
        gamepadControlMode: "dpad",
        gamepadOpacity: 75,
        gamepadLeftHanded: false,
      };
  }
}

// Particle Engine Class
export class ParticleEngine {
  private particles: Particle[] = [];
  private maxParticles: number = 250;
  private lastTime: number = Date.now();

  constructor() {
    this.particles = [];
  }

  public clear() {
    this.particles = [];
  }

  public emit(p: Omit<Particle, "life">) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift(); // Evict oldest
    }
    this.particles.push({ ...p, life: p.maxLife });
  }

  public spawnBurst(x: number, y: number, count: number, type: Particle["type"], baseColor: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      this.emit({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 1.5 + Math.random() * 3,
        color: baseColor,
        alpha: 0.9,
        maxLife: 300 + Math.random() * 400,
        type,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
      });
    }
  }

  public spawnFootstep(x: number, y: number, isWater: boolean = false) {
    const count = isWater ? 4 : 2;
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 1.0;
      const vy = (Math.random() - 0.5) * 0.5 - 0.2;
      this.emit({
        x: x + (Math.random() - 0.5) * 6,
        y: y + 10 + (Math.random() - 0.5) * 3,
        vx,
        vy,
        size: isWater ? 2.5 + Math.random() * 2 : 1.5 + Math.random() * 1.5,
        color: isWater ? "rgba(147, 197, 253, 0.7)" : "rgba(180, 160, 140, 0.4)",
        alpha: 0.6,
        maxLife: 200 + Math.random() * 150,
        type: isWater ? "splash" : "footstep",
      });
    }
  }

  public update(
    dt: number,
    mapWidth: number,
    mapHeight: number,
    mapType: string,
    densityMultiplier: number
  ) {
    const now = Date.now();
    const effectiveDt = Math.min(dt, 50); // clamp for lag spikes

    // Background ambient particle generation based on map type
    if (densityMultiplier > 0) {
      if (mapType === "bedroom" || mapType === "hallway" || mapType === "classroom") {
        // Floating indoor sun dust motes
        if (Math.random() < 0.25 * densityMultiplier) {
          this.emit({
            x: Math.random() * mapWidth,
            y: Math.random() * mapHeight,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -0.15 - Math.random() * 0.15,
            size: 1 + Math.random() * 1.5,
            color: "rgba(254, 240, 138, 0.6)",
            alpha: 0.5,
            maxLife: 2500 + Math.random() * 2000,
            type: "dust",
          });
        }
      } else if (mapType === "street" || mapType === "schoolyard" || mapType === "cemetery") {
        // Falling autumn leaves & ambient wind particles
        if (Math.random() < 0.35 * densityMultiplier) {
          const colors = [
            "rgba(249, 115, 22, 0.75)", // Orange leaf
            "rgba(234, 179, 8, 0.75)",  // Yellow leaf
            "rgba(185, 28, 28, 0.75)",  // Crimson leaf
            "rgba(132, 204, 22, 0.6)",  // Pale olive leaf
          ];
          this.emit({
            x: Math.random() * (mapWidth + 100) - 50,
            y: -10,
            vx: 0.6 + Math.random() * 1.2,
            vy: 0.8 + Math.random() * 0.9,
            size: 2.5 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.8,
            maxLife: 4000 + Math.random() * 2500,
            type: "leaf",
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.05,
          });
        }
      } else if (mapType === "limbo") {
        // Ethereal magic sparkles
        if (Math.random() < 0.5 * densityMultiplier) {
          this.emit({
            x: Math.random() * mapWidth,
            y: mapHeight + 10,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.6 - Math.random() * 0.8,
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? "rgba(6, 182, 212, 0.8)" : "rgba(192, 132, 252, 0.8)",
            alpha: 0.9,
            maxLife: 2000 + Math.random() * 1500,
            type: "sparkle",
          });
        }
      } else if (mapType === "bathroom") {
        // Bathroom warm steam
        if (Math.random() < 0.3 * densityMultiplier) {
          this.emit({
            x: mapWidth * 0.7 + (Math.random() - 0.5) * 40,
            y: mapHeight * 0.4 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.4 - Math.random() * 0.3,
            size: 3 + Math.random() * 4,
            color: "rgba(240, 249, 255, 0.3)",
            alpha: 0.4,
            maxLife: 1500 + Math.random() * 800,
            type: "steam",
          });
        }
      }
    }

    // Step physics & cull expired particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= effectiveDt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      if (p.type === "leaf") {
        p.vx += Math.sin(now / 300 + p.y * 0.05) * 0.03; // Gentle wind oscillation
        p.x += p.vx;
        p.y += p.vy;
        if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot;
      } else if (p.type === "steam") {
        p.size += 0.03; // Steam expands as it rises
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === "dust") {
        p.x += p.vx + Math.sin(now / 500 + p.x) * 0.05;
        p.y += p.vy;
      } else {
        p.x += p.vx;
        p.y += p.vy;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const progress = p.life / p.maxLife; // 1 to 0
      const currentAlpha = p.alpha * Math.sin(progress * Math.PI); // Smooth fade in and out

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

      if (p.type === "leaf") {
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      } else if (p.type === "sparkle") {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        // Cross sparkle
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.size * 1.2, p.y);
        ctx.lineTo(p.x + p.size * 1.2, p.y);
        ctx.moveTo(p.x, p.y - p.size * 1.2);
        ctx.lineTo(p.x, p.y + p.size * 1.2);
        ctx.stroke();
      } else if (p.type === "steam") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "dust") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "splash" || p.type === "footstep") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 1.4, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

// Lighting Engine & Time of Day System
export interface TimeOfDayAtmosphere {
  name: string;
  ambientColor: string; // rgba
  ambientOpacity: number;
  skyTint: string;
  sunlightColor: string;
  sunlightIntensity: number;
  shadowAngle: number;
  shadowLength: number;
}

export function getTimeOfDayAtmosphere(hour: number, minute: number): TimeOfDayAtmosphere {
  const timeInMinutes = hour * 60 + minute;

  // 00:00 - 05:30: Deep Midnight
  if (timeInMinutes < 330) {
    return {
      name: "Medianoche",
      ambientColor: "rgba(11, 13, 27, 0.85)",
      ambientOpacity: 0.85,
      skyTint: "#0b0d1b",
      sunlightColor: "rgba(147, 197, 253, 0.12)", // Pale moonlight
      sunlightIntensity: 0.15,
      shadowAngle: Math.PI * 0.75,
      shadowLength: 0.4,
    };
  }
  // 05:30 - 07:00: Dawn / Sunrise
  if (timeInMinutes < 420) {
    const progress = (timeInMinutes - 330) / 90;
    return {
      name: "Amanecer",
      ambientColor: `rgba(45, 21, 48, ${0.75 - progress * 0.45})`,
      ambientOpacity: 0.75 - progress * 0.45,
      skyTint: "#f472b6",
      sunlightColor: `rgba(251, 146, 60, ${0.3 + progress * 0.4})`, // Warm amber sunrise
      sunlightIntensity: 0.3 + progress * 0.4,
      shadowAngle: Math.PI * 0.85,
      shadowLength: 1.4 - progress * 0.6,
    };
  }
  // 07:00 - 12:00: Morning Sunlight
  if (timeInMinutes < 720) {
    return {
      name: "Mañana",
      ambientColor: "rgba(254, 249, 195, 0.05)",
      ambientOpacity: 0.05,
      skyTint: "#38bdf8",
      sunlightColor: "rgba(254, 240, 138, 0.25)",
      sunlightIntensity: 0.8,
      shadowAngle: Math.PI * 0.6,
      shadowLength: 0.6,
    };
  }
  // 12:00 - 17:00: Bright Afternoon
  if (timeInMinutes < 1020) {
    return {
      name: "Tarde",
      ambientColor: "rgba(255, 255, 255, 0.0)",
      ambientOpacity: 0.0,
      skyTint: "#0ea5e9",
      sunlightColor: "rgba(255, 255, 255, 0.3)",
      sunlightIntensity: 0.9,
      shadowAngle: Math.PI * 0.5,
      shadowLength: 0.3,
    };
  }
  // 17:00 - 19:30: Golden Hour / Sunset
  if (timeInMinutes < 1170) {
    const progress = (timeInMinutes - 1020) / 150;
    return {
      name: "Atardecer",
      ambientColor: `rgba(124, 45, 18, ${0.15 + progress * 0.45})`,
      ambientOpacity: 0.15 + progress * 0.45,
      skyTint: "#f97316",
      sunlightColor: `rgba(249, 115, 22, ${0.6 - progress * 0.2})`,
      sunlightIntensity: 0.7,
      shadowAngle: Math.PI * 0.25,
      shadowLength: 1.2 + progress * 0.6,
    };
  }
  // 19:30 - 24:00: Twilight / Night
  const nightProgress = (timeInMinutes - 1170) / 270;
  return {
    name: "Noche",
    ambientColor: `rgba(15, 23, 42, ${0.65 + nightProgress * 0.2})`,
    ambientOpacity: 0.65 + nightProgress * 0.2,
    skyTint: "#0f172a",
    sunlightColor: "rgba(96, 165, 250, 0.15)",
    sunlightIntensity: 0.2,
    shadowAngle: Math.PI * 0.75,
    shadowLength: 0.5,
  };
}

// Render dynamic soft shadow beneath objects
export function drawSoftShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  quality: "soft" | "crisp" | "simple" = "soft"
) {
  ctx.save();
  if (quality === "soft") {
    const grad = ctx.createRadialGradient(x, y, rx * 0.2, x, y, rx);
    grad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
    grad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
  } else if (quality === "crisp") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  }

  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Render Volumetric Light Cone (God Ray)
export function drawVolumetricGodRay(
  ctx: CanvasRenderingContext2D,
  startX1: number,
  startX2: number,
  startY: number,
  endX1: number,
  endX2: number,
  endY: number,
  color: string = "rgba(254, 240, 138, 0.2)",
  pulseSpeed: number = 800
) {
  const pulse = Math.sin(Date.now() / pulseSpeed) * 0.15 + 0.85;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const grad = ctx.createLinearGradient(
    (startX1 + startX2) / 2,
    startY,
    (endX1 + endX2) / 2,
    endY
  );
  grad.addColorStop(0, color);
  grad.addColorStop(0.7, color.replace(/[\d.]+\)$/, `${0.08 * pulse})`));
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(startX1, startY);
  ctx.lineTo(startX2, startY);
  ctx.lineTo(endX2, endY);
  ctx.lineTo(endX1, endY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Render Point Light Bloom
export function drawPointLightBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number = 0.5,
  flicker: boolean = false
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const flickerMul = flicker ? Math.sin(Date.now() / 150) * 0.08 + (Math.random() * 0.04) + 0.94 : 1.0;
  const effectiveRadius = radius * flickerMul;

  const grad = ctx.createRadialGradient(x, y, 2, x, y, effectiveRadius);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, color.replace(/[\d.]+\)$/, `${intensity * 0.35 * flickerMul})`));
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, effectiveRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Post-Processing: Cinematic Vignette & CRT Scanlines
export function applyPostProcessing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GraphicsConfig
) {
  if (config.vignette) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(0.7, "rgba(0, 0, 0, 0.15)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (config.scanlines) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
    ctx.restore();
  }
}

// Smooth Motion Sub-pixel Lerp state manager
export class MotionInterpolator {
  public currentX: number;
  public currentY: number;
  public targetX: number;
  public targetY: number;
  public isMoving: boolean = false;
  public stepDistance: number = 0;
  private lerpSpeed: number = 0.28; // Speed of tile-to-tile transition

  constructor(startX: number, startY: number) {
    this.currentX = startX;
    this.currentY = startY;
    this.targetX = startX;
    this.targetY = startY;
  }

  public setTarget(tx: number, ty: number) {
    this.targetX = tx;
    this.targetY = ty;
  }

  public teleport(x: number, y: number) {
    this.currentX = x;
    this.currentY = y;
    this.targetX = x;
    this.targetY = y;
    this.isMoving = false;
  }

  public update(): { x: number; y: number; justStepped: boolean } {
    const dx = this.targetX - this.currentX;
    const dy = this.targetY - this.currentY;
    const distSq = dx * dx + dy * dy;

    let justStepped = false;

    if (distSq > 0.0001) {
      this.isMoving = true;
      this.currentX += dx * this.lerpSpeed;
      this.currentY += dy * this.lerpSpeed;
      this.stepDistance += Math.sqrt(distSq);

      // Snap if very close
      if (distSq < 0.001) {
        this.currentX = this.targetX;
        this.currentY = this.targetY;
        this.isMoving = false;
        justStepped = true;
      }
    } else {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.isMoving = false;
    }

    return { x: this.currentX, y: this.currentY, justStepped };
  }
}

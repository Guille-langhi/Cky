import React, { useState, useEffect, useRef } from "react";
import { Language, InventoryItem } from "../types";
import { 
  Shield, 
  Sparkles, 
  Smartphone, 
  Award, 
  Flame, 
  Brain, 
  Heart, 
  RotateCcw, 
  Zap, 
  Package, 
  Play, 
  Pause, 
  Swords, 
  Crosshair,
  Star,
  Info,
  FastForward,
  Bot,
  Eye
} from "lucide-react";
import { androidBridge } from "../lib/androidMobileBridge";
import { soundEngine } from "../lib/soundEngine";

interface FloatingText {
  id: string;
  text: string;
  color: string;
  isPlayerTarget: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: "circle" | "spark" | "star" | "ring";
}

interface CombatSimulatorProps {
  language: Language;
  inventory?: InventoryItem[];
  onWin: () => void;
  onLose: () => void;
  isSilent: boolean;
  enemyNameEs?: string;
  enemyNameEn?: string;
  enemySubEs?: string;
  enemySubEn?: string;
  companionActive?: boolean;
}

export default function CombatSimulator({
  language,
  inventory = [],
  onWin,
  onLose,
  isSilent,
  enemyNameEs = "Sombra Rencorosa",
  enemyNameEn = "Spiteful Shadow",
  enemySubEs = "Invocada por la Vecina",
  enemySubEn = "Summoned by the Neighbor",
  companionActive = true,
}: CombatSimulatorProps) {
  // Player & Enemy Battle Stats
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [delayedPlayerHp, setDelayedPlayerHp] = useState<number>(100);
  const [playerMp, setPlayerMp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(180);
  const [delayedEnemyHp, setDelayedEnemyHp] = useState<number>(180);
  const maxEnemyHp = 180;

  // Active Time Battle (ATB) Gauges (0 to 100)
  const [playerAtb, setPlayerAtb] = useState<number>(60);
  const [enemyAtb, setEnemyAtb] = useState<number>(20);

  // ATB Settings
  const [atbMode, setAtbMode] = useState<"active" | "wait">("active");
  const [activeTab, setActiveTab] = useState<"skills" | "angela" | "combos" | "items">("angela");

  // RPG Elite: Synergy / Supernova Ultimate Meter (0 to 100)
  const [synergyMeter, setSynergyMeter] = useState<number>(35);
  const [showSupernovaCutin, setShowSupernovaCutin] = useState<boolean>(false);

  // RPG Elite: Auto-Battle & Combat Speed Controls
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2>(1);

  // RPG Elite: Tactical Weakness Scanner Modal
  const [showTacticalScan, setShowTacticalScan] = useState<boolean>(false);

  // Angela quips and reaction bubble state
  const [angelaQuip, setAngelaQuip] = useState<string>(
    language === "es"
      ? "¡A ver a ver! ¿Quién es este fantasma desubicado que viene a arruinar el picnic con salame? ¡Pegale donde no le da el sol, CKY!"
      : "Look at this rude ghost ruining our picnic! Hit him where the sun doesn't shine, CKY!"
  );

  // Battle Status Effects & Conditions
  const [hasRevealedWeakness, setHasRevealedWeakness] = useState<boolean>(false);
  const [enemyStunned, setEnemyStunned] = useState<boolean>(false);
  const [enemyBlinded, setEnemyBlinded] = useState<boolean>(false);
  const [combatEnd, setCombatEnd] = useState<boolean>(false);

  // Visual Effects & Animations
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [shakeEnemy, setShakeEnemy] = useState<boolean>(false);
  const [shakePlayer, setShakePlayer] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<"red" | "gold" | "white" | null>(null);
  const [attackAnimation, setAttackAnimation] = useState<"light_beam" | "prismatic_laser" | "backpack_slam" | "celestial_wave" | "item_glow" | "angela_kiss" | "angela_taunt" | null>(null);

  // Battle BGM lifecycle hook
  useEffect(() => {
    soundEngine.unlockAudio();
    const prevTrack = soundEngine.getCurrentTrack();
    soundEngine.playBgm("battle");
    return () => {
      if (prevTrack) soundEngine.playBgm(prevTrack);
      else soundEngine.stopBgm();
    };
  }, []);

  // Lagging health bar drain synchronization
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedPlayerHp(playerHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [playerHp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedEnemyHp(enemyHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [enemyHp]);

  // Battle Logs Feed
  const [logs, setLogs] = useState<string[]>([]);

  // Canvas particle engine ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Sound generator helper
  const playSound = (freq: number, type: OscillatorType = "sine", duration = 0.1) => {
    if (isSilent) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.log("Audio API failed", e);
    }
  };

  useEffect(() => {
    if (language === "es") {
      setLogs([
        "⚔️ ¡SISTEMA ATB CHRONO-TRIGGER ACTIVADO!",
        "¡Un ESPÍRITU OSCURO acecha en el Limbo!",
        "⚡ Espera a que tu barra ATB se llene para realizar un ataque o Técnica Combinada.",
        "🎒 PISTA: Puedes usar objetos de tu Mochila o combinar Habilidades para combos masivos."
      ]);
    } else {
      setLogs([
        "⚔️ CHRONO-TRIGGER ATB SYSTEM ACTIVATED!",
        "A DARK SPIRIT lurks in the Limbo!",
        "⚡ Wait for your ATB gauge to fill up to launch an attack or Dual Tech Combo.",
        "🎒 HINT: Use Backpack items or combine Skills for massive damage."
      ]);
    }
  }, [language]);

  // Real-time Canvas Particle Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Seed ambient dust particles if empty
    if (particlesRef.current.length === 0) {
      const initialParticles: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        initialParticles.push({
          x: Math.random() * 500,
          y: Math.random() * 220,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.6 - 0.2,
          size: Math.random() * 2.5 + 0.5,
          color: Math.random() < 0.4 ? "#c084fc" : Math.random() < 0.7 ? "#38bdf8" : "#facc15",
          alpha: Math.random() * 0.7 + 0.2,
          life: Math.random() * 100,
          maxLife: 120,
          shape: "circle"
        });
      }
      particlesRef.current = initialParticles;
    }

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Cosmic Gradient Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.8);
      bgGrad.addColorStop(0, "#1e1b4b");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#020617");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Neon Grid Line Pattern
      const time = Date.now() / 1000;
      ctx.strokeStyle = "rgba(168, 85, 247, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // 3. Laser Sweep Line
      const sweepY = ((time * 45) % (h + 40)) - 20;
      const sweepGrad = ctx.createLinearGradient(0, sweepY - 10, 0, sweepY + 10);
      sweepGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      sweepGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.15)");
      sweepGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, sweepY - 10, w, 20);

      // 4. Hero Divine Aura Pedestal (x=22%)
      const ckyX = w * 0.22;
      const ckyY = h * 0.75;
      if (playerAtb >= 100) {
        ctx.save();
        const auraGrad = ctx.createRadialGradient(ckyX, ckyY, 5, ckyX, ckyY, 50);
        auraGrad.addColorStop(0, "rgba(250, 204, 21, 0.45)");
        auraGrad.addColorStop(0.7, "rgba(234, 179, 8, 0.12)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(ckyX, ckyY, 50, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(250, 204, 21, ${0.5 + Math.sin(time * 6) * 0.3})`;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.ellipse(ckyX, ckyY, 38 + Math.sin(time * 4) * 3, 14 + Math.sin(time * 4) * 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 5. Spirit Boss Dark Shadow Aura (x=78%)
      const bossX = w * 0.78;
      const bossY = h * 0.55;
      ctx.save();
      const bossAura = ctx.createRadialGradient(bossX, bossY, 10, bossX, bossY, 70);
      bossAura.addColorStop(0, hasRevealedWeakness ? "rgba(236, 72, 153, 0.4)" : "rgba(147, 51, 234, 0.35)");
      bossAura.addColorStop(0.75, "rgba(88, 28, 135, 0.12)");
      bossAura.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = bossAura;
      ctx.beginPath();
      ctx.arc(bossX, bossY, 70, 0, Math.PI * 2);
      ctx.fill();

      // Weakness Target Reticle
      if (hasRevealedWeakness) {
        ctx.strokeStyle = `rgba(236, 72, 153, ${0.7 + Math.sin(time * 8) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bossX, bossY - 15, 28 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bossX - 35, bossY - 15); ctx.lineTo(bossX + 35, bossY - 15);
        ctx.moveTo(bossX, bossY - 50); ctx.lineTo(bossX, bossY + 20);
        ctx.stroke();
      }
      ctx.restore();

      // 6. Particle Updates & Draw Loop
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;

        if (p.shape === "spark") {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "ring") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Respawn background ambient particles
        if (p.life >= p.maxLife && p.shape === "circle" && p.vx >= -0.5 && p.vx <= 0.5) {
          p.x = Math.random() * w;
          p.y = h + 10;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = -Math.random() * 0.6 - 0.2;
          p.life = 0;
        }
      });

      // Filter dead non-ambient particles
      particlesRef.current = particlesRef.current.filter(
        p => p.life < p.maxLife || (p.shape === "circle" && p.vx >= -0.5 && p.vx <= 0.5)
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [hasRevealedWeakness, playerAtb]);

  // Main ATB Loop Timer (with battleSpeed 1x / 2x support)
  useEffect(() => {
    if (combatEnd) return;

    const intervalTime = battleSpeed === 2 ? 50 : 100;
    const interval = setInterval(() => {
      // Advance Player ATB if not full
      setPlayerAtb(prev => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 1.8 * battleSpeed);
      });

      // Advance Enemy ATB if not full and not stunned
      setEnemyAtb(prev => {
        if (enemyStunned) return prev;
        if (prev >= 100) return 100;
        const enemySpeed = enemyBlinded ? 0.6 : 1.2;
        return Math.min(100, prev + enemySpeed * battleSpeed);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [combatEnd, enemyStunned, enemyBlinded, battleSpeed]);

  // Auto-Battle AI Trigger when Player ATB is full
  useEffect(() => {
    if (!isAutoBattle || playerAtb < 100 || combatEnd) return;

    const autoTimer = setTimeout(() => {
      if (synergyMeter >= 100) {
        handleSupernova();
      } else if (!hasRevealedWeakness && playerMp >= 25) {
        handlePlayerSkill("see_invisible");
      } else if (playerMp >= 15) {
        handlePlayerSkill("light");
      } else {
        handleAngelaSkill("distraccion");
      }
    }, 250);

    return () => clearTimeout(autoTimer);
  }, [isAutoBattle, playerAtb, combatEnd, synergyMeter, hasRevealedWeakness, playerMp]);

  // Enemy Action Trigger when Enemy ATB reaches 100%
  useEffect(() => {
    if (enemyAtb >= 100 && !combatEnd && !enemyStunned) {
      executeEnemyAttack();
    }
  }, [enemyAtb, combatEnd, enemyStunned]);

  // Particle Burst Spawners for Attack FX
  const spawnParticlesForFx = (fx: "light_beam" | "prismatic_laser" | "backpack_slam" | "celestial_wave" | "item_glow" | "angela_kiss" | "angela_taunt") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width || 500;
    const h = canvas.height || 220;
    const bossX = w * 0.78;
    const bossY = h * 0.55;
    const ckyX = w * 0.22;
    const ckyY = h * 0.55;

    const newParticles: Particle[] = [];

    if (fx === "light_beam") {
      // Stream of golden beam sparks + explosion at Spirit
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        newParticles.push({
          x: bossX,
          y: bossY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1.5,
          color: Math.random() < 0.5 ? "#facc15" : "#fef08a",
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          shape: "spark"
        });
      }
    } else if (fx === "prismatic_laser") {
      // Rainbow nova burst
      const rainbowColors = ["#c084fc", "#38bdf8", "#f472b6", "#facc15", "#4ade80"];
      for (let i = 0; i < 65; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        newParticles.push({
          x: bossX,
          y: bossY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 2,
          color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 40 + 20,
          shape: "spark"
        });
      }
      // Expanding shockwave ring
      newParticles.push({
        x: bossX,
        y: bossY,
        vx: 0,
        vy: 0,
        size: 10,
        color: "#c084fc",
        alpha: 1,
        life: 0,
        maxLife: 25,
        shape: "ring"
      });
    } else if (fx === "backpack_slam") {
      // Heavy shockwave + book debris
      for (let i = 0; i < 35; i++) {
        newParticles.push({
          x: bossX,
          y: bossY,
          vx: (Math.random() - 0.5) * 7,
          vy: -Math.random() * 6 - 1,
          size: Math.random() * 5 + 2,
          color: Math.random() < 0.5 ? "#f59e0b" : "#b45309",
          alpha: 1,
          life: 0,
          maxLife: 35,
          shape: "spark"
        });
      }
    } else if (fx === "celestial_wave") {
      // Concentric divine wave rings & cyan dust
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          x: ckyX + (bossX - ckyX) * Math.random(),
          y: ckyY + (Math.random() - 0.5) * 40,
          vx: Math.random() * 4 + 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 4 + 1,
          color: Math.random() < 0.5 ? "#38bdf8" : "#818cf8",
          alpha: 1,
          life: 0,
          maxLife: 30,
          shape: "spark"
        });
      }
    } else if (fx === "angela_kiss") {
      // Pink and rose glowing hearts and sparks flowing from Angela to CKY
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          x: ckyX + (Math.random() - 0.5) * 30,
          y: ckyY - 20 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 1,
          size: Math.random() * 5 + 2,
          color: Math.random() < 0.6 ? "#f472b6" : "#fb7185",
          alpha: 1,
          life: 0,
          maxLife: 40,
          shape: "spark"
        });
      }
    } else if (fx === "angela_taunt") {
      // Hot pink explosion of confusion stars and hearts on boss
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        newParticles.push({
          x: bossX,
          y: bossY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 2,
          color: Math.random() < 0.4 ? "#f43f5e" : Math.random() < 0.7 ? "#e879f9" : "#fbbf24",
          alpha: 1,
          life: 0,
          maxLife: 35,
          shape: "spark"
        });
      }
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // Floating text emitter helper
  const addFloatingText = (text: string, color: string, isPlayerTarget: boolean) => {
    const id = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id, text, color, isPlayerTarget }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1200);
  };

  const addLog = (es: string, en: string) => {
    setLogs(prev => [language === "es" ? es : en, ...prev]);
  };

  // Enemy Attack Logic
  const executeEnemyAttack = () => {
    const rng = Math.random();
    let dmg = 0;
    let attackNameEs = "";
    let attackNameEn = "";

    if (enemyBlinded && rng < 0.4) {
      addFloatingText("¡FALLÓ! (Cegado)", "#38bdf8", true);
      addLog(
        "El Espíritu Oscuro intenta atacarte pero se ciega por el perfume de mamá. ¡Ataque fallido!",
        "The Dark Spirit tries to attack but is blinded by mom's perfume. Attack missed!"
      );
      setEnemyAtb(0);
      return;
    }

    if (rng < 0.65) {
      dmg = 18;
      attackNameEs = "Garras Espectrales";
      attackNameEn = "Spectral Claws";
    } else {
      dmg = 28;
      attackNameEs = "Aullido del Limbo";
      attackNameEn = "Limbo Howl";
    }

    setPlayerHp(prev => {
      const next = Math.max(0, prev - dmg);
      if (next <= 0) triggerDefeat();
      if (next > 0 && next < 30) androidBridge.hapticHeartbeat();
      return next;
    });

    addFloatingText(`-${dmg} HP`, "#ef4444", true);
    setShakePlayer(true);
    setScreenFlash("red");
    setTimeout(() => {
      setShakePlayer(false);
      setScreenFlash(null);
    }, 450);
    androidBridge.hapticImpact();
    playSound(140, "sawtooth", 0.35);

    addLog(
      `¡Ataque enemigo! El Espíritu usa ${attackNameEs} e inflige ${dmg} de daño a CKY.`,
      `Enemy Attack! Dark Spirit uses ${attackNameEn}, dealing ${dmg} damage to CKY.`
    );

    setSynergyMeter(prev => Math.min(100, prev + 12));
    setEnemyAtb(0);
  };

  // RPG Elite: Supernova Triple (CKY + Ángela + W)
  const handleSupernova = () => {
    if (synergyMeter < 100 || combatEnd) return;

    setShowSupernovaCutin(true);
    setScreenFlash("gold");
    androidBridge.hapticCritical();
    playSound(920, "sine", 0.6);

    const dmg = hasRevealedWeakness ? 175 : 130;
    triggerAttackFx("prismatic_laser");

    setTimeout(() => {
      setEnemyHp(prev => {
        const next = Math.max(0, prev - dmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      setPlayerHp(prev => Math.min(100, prev + 40));
      setPlayerMp(prev => Math.min(100, prev + 40));
      setEnemyStunned(true);
      setTimeout(() => setEnemyStunned(false), 3500);

      addFloatingText(`-${dmg} ¡SUPERNOVA!`, "#f59e0b", false);
      addFloatingText("+40 HP/+40 MP (BENDICIÓN)", "#22c55e", true);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 600);

      addLog(
        `✨ ¡SUPERNOVA TRIPLE! CKY, Ángela y W desatan un estallido celestial cósmico de ${dmg} de daño, aturdiendo al enemigo y restaurando al grupo.`,
        `✨ TRIPLE SUPERNOVA! CKY, Angela, and W unleash a cosmic celestial blast dealing ${dmg} damage, stunning the enemy and restoring the party.`
      );

      setSynergyMeter(0);
      setPlayerAtb(0);
      setShowSupernovaCutin(false);
    }, 1400);
  };

  // Player Skills Action Handler
  const handlePlayerSkill = (skill: "light" | "see_invisible" | "meditate") => {
    if (playerAtb < 100 || combatEnd) return;

    if (skill === "light") {
      const cost = 15;
      if (playerMp < cost) {
        addLog("¡Insuficiente Enfoque Espiritual (MP)!", "Not enough Spiritual Focus (MP)!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      setSynergyMeter(prev => Math.min(100, prev + 15));
      const baseDmg = hasRevealedWeakness ? 55 : 22;
      const critical = Math.random() < 0.25;
      const totalDmg = critical ? Math.floor(baseDmg * 1.5) : baseDmg;

      triggerAttackFx("light_beam");
      if (critical) {
        setScreenFlash("gold");
        setTimeout(() => setScreenFlash(null), 300);
        androidBridge.hapticCritical();
      } else {
        androidBridge.hapticImpact();
      }

      setEnemyHp(prev => {
        const next = Math.max(0, prev - totalDmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      addFloatingText(`-${totalDmg} ${critical ? "CRÍTICO!" : ""}`, "#facc15", false);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 400);
      playSound(critical ? 750 : 550, "sine", 0.3);

      addLog(
        `Atacas con Rayo de Luz Espiritual infligiendo ${totalDmg} de daño ${critical ? "(¡GOLPE CRÍTICO!)" : ""}.`,
        `You attack with Spiritual Light Ray dealing ${totalDmg} damage ${critical ? "(CRITICAL HIT!)" : ""}.`
      );

    } else if (skill === "see_invisible") {
      const cost = 25;
      if (playerMp < cost) {
        addLog("¡Insuficiente Enfoque Espiritual (MP)!", "Not enough Spiritual Focus (MP)!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      setHasRevealedWeakness(true);
      androidBridge.hapticAction();
      playSound(880, "triangle", 0.4);

      addFloatingText("¡NÚCLEO EXPUESTO! (3x Daño)", "#ec4899", false);
      addLog(
        "Utilizas 'VER LO INVISIBLE'. El núcleo del espíritu queda expuesto. ¡Todos los ataques causarán daño triple!",
        "You use 'VER LO INVISIBLE'. The spirit's core is exposed. All attacks will deal triple damage!"
      );

    } else if (skill === "meditate") {
      setPlayerMp(prev => Math.min(100, prev + 35));
      setPlayerHp(prev => Math.min(100, prev + 20));
      androidBridge.hapticAction();
      playSound(420, "sine", 0.35);

      setAngelaQuip(
        language === "es"
          ? "¡Respirá hondo, reina! Me encanta cuando te concentrás así... te ponés divina."
          : "Breathe deep queen! I love when you focus like that... looks gorgeous."
      );

      addFloatingText("+20 HP / +35 MP", "#22c55e", true);
      addLog(
        "Te concentras y meditas. Recuperas +20 HP de Cordura y +35 MP de Enfoque.",
        "You focus and meditate. Recovering +20 Sanity HP and +35 Focus MP."
      );
    }

    setPlayerAtb(0);
  };

  // Angela Companion Skill Action Handler
  const handleAngelaSkill = (skill: "distraccion" | "beso" | "furia") => {
    if (playerAtb < 100 || combatEnd) return;

    if (skill === "distraccion") {
      const cost = 15;
      if (playerMp < cost) {
        addLog("¡Insuficiente Enfoque Espiritual (MP) para la habilidad de Ángela!", "Not enough MP for Angela's ability!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      const dmg = hasRevealedWeakness ? 60 : 35;

      setAngelaQuip(
        language === "es"
          ? "¡Mirá lo que te estás perdiendo por no tener cuerpo, fantasma amargado! ¡Seguro nunca viste una curva tan linda! 😏"
          : "Look at what you're missing by having no body, grumpy ghost! Bet you've never seen curves like this! 😏"
      );

      triggerAttackFx("angela_taunt");
      androidBridge.hapticImpact();
      setEnemyBlinded(true);
      setTimeout(() => setEnemyBlinded(false), 5000);

      setEnemyHp(prev => {
        const next = Math.max(0, prev - dmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      addFloatingText(`-${dmg} ¡DIST coin!`, "#f43f5e", false);
      addFloatingText("¡ENEMIGO DESCONCENTRADO!", "#e879f9", false);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 400);
      playSound(820, "triangle", 0.4);

      addLog(
        `👻 ¡ÁNGELA: DISTRACCIÓN PICANTE! Ángela tira un chiste con doble sentido que deja al espíritu atónito y con la guardia baja. Daño: ${dmg}.`,
        `👻 ANGELA: SPICY TAUNT! Angela drops a saucy joke, leaving the spirit stunned and exposed. Damage: ${dmg}.`
      );

    } else if (skill === "beso") {
      const cost = 20;
      if (playerMp < cost) {
        addLog("¡Insuficiente Enfoque Espiritual (MP) para la habilidad de Ángela!", "Not enough MP for Angela's ability!");
        return;
      }

      setPlayerMp(prev => Math.min(100, prev - cost + 30));
      setPlayerHp(prev => Math.min(100, prev + 45));

      setAngelaQuip(
        language === "es"
          ? "Un piquito con amor para darte energía donde más te gusta, bombón... 😉 ¿Te gustó la caricia?"
          : "A little sweet kiss to energize you right where it feels best, honey... 😉 Liked that touch?"
      );

      triggerAttackFx("angela_kiss");
      androidBridge.hapticAction();
      playSound(950, "sine", 0.4);

      addFloatingText("+45 HP / +30 MP (Beso Espectral)", "#f472b6", true);
      addLog(
        "💋 ¡ÁNGELA: BESO ESPECTRAL! Ángela te da un piquito juguetón. Restaura +45 HP y +30 MP.",
        "💋 ANGELA: SPECTRAL KISS! Angela gives you a playful sweet kiss. Restores +45 HP and +30 MP."
      );

    } else if (skill === "furia") {
      const cost = 35;
      if (playerMp < cost) {
        addLog("¡Insuficiente Enfoque Espiritual (MP) para la habilidad de Ángela!", "Not enough MP for Angela's ability!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      const dmg = hasRevealedWeakness ? 135 : 85;

      setAngelaQuip(
        language === "es"
          ? "¡A este le vamos a dar hasta que pida la hora! ¡Sentí el poder del salame y el más allá!"
          : "We're gonna smack this one silly! Feel the power of spiritual salami and ectoplasm!"
      );

      triggerAttackFx("prismatic_laser");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      setEnemyStunned(true);
      setTimeout(() => setEnemyStunned(false), 3000);

      setEnemyHp(prev => {
        const next = Math.max(0, prev - dmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      addFloatingText(`-${dmg} ¡FURIA DEL MÁS ALLÁ!`, "#ec4899", false);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 600);
      playSound(740, "sawtooth", 0.45);

      addLog(
        `⚡ ¡ÁNGELA: FURIA DEL MÁS ALLÁ! Desata una ráfaga ectoplásmica que estremece al enemigo causando ${dmg} de daño demoledor.`,
        `⚡ ANGELA: FURY OF THE BEYOND! Unleashes an ectoplasmic burst dealing ${dmg} devastating damage.`
      );
    }

    setPlayerAtb(0);
  };

  // Player Dual Tech / Combo Action Handler
  const handlePlayerCombo = (combo: "prismatic_laser" | "backpack_slam" | "celestial_wave") => {
    if (playerAtb < 100 || combatEnd) return;

    if (combo === "prismatic_laser") {
      const cost = 30;
      if (playerMp < cost) {
        addLog("¡Insuficiente MP para TÉCNICA COMBINADA!", "Not enough MP for DUAL TECH!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      const totalDmg = hasRevealedWeakness ? 110 : 75;

      triggerAttackFx("prismatic_laser");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      setEnemyBlinded(true);
      setTimeout(() => setEnemyBlinded(false), 6000);

      setEnemyHp(prev => {
        const next = Math.max(0, prev - totalDmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      addFloatingText(`-${totalDmg} ¡TÉCNICA DUAL!`, "#a855f7", false);
      addFloatingText("¡ENEMIGO CEGADO!", "#38bdf8", false);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 600);
      playSound(920, "square", 0.45);

      addLog(
        `⚡ ¡TÉCNICA COMBINADA: RAYO PRISMÁTICO! Combinas la fragancia de mamá con la luz divina. Infliges ${totalDmg} de daño y CIEGAS al espíritu.`,
        `⚡ DUAL TECH: PRISMATIC RAY! You combine mom's fragrance with divine light. Dealing ${totalDmg} damage and BLINDING the spirit.`
      );

    } else if (combo === "backpack_slam") {
      const cost = 20;
      if (playerMp < cost) {
        addLog("¡Insuficiente MP para TÉCNICA COMBINADA!", "Not enough MP for DUAL TECH!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      const totalDmg = hasRevealedWeakness ? 90 : 55;

      triggerAttackFx("backpack_slam");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      setEnemyStunned(true);
      setTimeout(() => setEnemyStunned(false), 4000);

      setEnemyHp(prev => {
        const next = Math.max(0, prev - totalDmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      addFloatingText(`-${totalDmg} ¡MOCHILAZO!`, "#f59e0b", false);
      addFloatingText("¡ATURDIDO! (Stun)", "#eab308", false);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 500);
      playSound(300, "sawtooth", 0.4);

      addLog(
        `⚡ ¡TÉCNICA COMBINADA: MOCHILAZO ESPIRITUAL! Lanzaste tus libros pesados de la escuela. Infliges ${totalDmg} de daño y ATURDES al enemigo.`,
        `⚡ DUAL TECH: SPIRITUAL BACKPACK SLAM! You throw your heavy school books. Dealing ${totalDmg} damage and STUNNING the enemy.`
      );

    } else if (combo === "celestial_wave") {
      const cost = 25;
      if (playerMp < cost) {
        addLog("¡Insuficiente MP para TÉCNICA COMBINADA!", "Not enough MP for DUAL TECH!");
        return;
      }

      setPlayerMp(prev => prev - cost);
      const totalDmg = hasRevealedWeakness ? 100 : 65;

      triggerAttackFx("celestial_wave");
      androidBridge.hapticCritical();
      setScreenFlash("gold");
      setTimeout(() => setScreenFlash(null), 300);
      setEnemyHp(prev => {
        const next = Math.max(0, prev - totalDmg);
        if (next <= 0) triggerVictory();
        return next;
      });

      addFloatingText(`-${totalDmg} ¡ONDA CELESTE!`, "#38bdf8", false);
      setShakeEnemy(true);
      setTimeout(() => setShakeEnemy(false), 500);
      playSound(780, "triangle", 0.45);

      addLog(
        `⚡ ¡TÉCNICA COMBINADA: ONDA CELESTE! Usas la pantalla de tu celular para emitir una frecuencia sagrada. Infliges ${totalDmg} de daño.`,
        `⚡ DUAL TECH: CELESTIAL WAVE! You use your phone screen to emit a sacred frequency. Dealing ${totalDmg} damage.`
      );
    }

    setPlayerAtb(0);
  };

  // Player Item Action Handler
  const handlePlayerItem = (itemType: "sandwich" | "bottle" | "perfume") => {
    if (playerAtb < 100 || combatEnd) return;

    if (itemType === "sandwich") {
      setPlayerHp(prev => Math.min(100, prev + 50));
      triggerAttackFx("item_glow");
      androidBridge.hapticItemPickup();
      addFloatingText("+50 HP (Sándwich)", "#22c55e", true);
      playSound(520, "sine", 0.3);

      addLog(
        "🥪 Comes el Sándwich de Salame y Queso. Restauras +50 de Cordura/Salud.",
        "🥪 You eat the Salami & Cheese Sandwich. Restoring +50 Sanity HP."
      );

    } else if (itemType === "bottle") {
      setPlayerMp(prev => Math.min(100, prev + 40));
      triggerAttackFx("item_glow");
      androidBridge.hapticAction();
      addFloatingText("+40 MP (Agua)", "#06b6d4", true);
      playSound(620, "sine", 0.3);

      addLog(
        "🧴 Bebes de tu Botella de Agua Favorita. Restauras +40 de Enfoque Espiritual MP.",
        "🧴 You drink from your Favorite Water Bottle. Restoring +40 Spiritual Focus MP."
      );

    } else if (itemType === "perfume") {
      setEnemyBlinded(true);
      setTimeout(() => setEnemyBlinded(false), 5000);
      triggerAttackFx("item_glow");
      androidBridge.hapticAction();
      addFloatingText("¡PERFUME CEGADOR!", "#ec4899", false);
      playSound(700, "triangle", 0.35);

      addLog(
        "🌸 Rocías el Perfume Favorito de Mamá. La fragancia deslumbra al Espíritu Oscuro reduciendo su velocidad ATB.",
        "🌸 You spray Mom's Favorite Perfume. The fragrance dazzles the Dark Spirit slowing down its ATB."
      );
    }

    setPlayerAtb(0);
  };

  const triggerAttackFx = (fx: "light_beam" | "prismatic_laser" | "backpack_slam" | "celestial_wave" | "item_glow" | "angela_kiss" | "angela_taunt") => {
    setAttackAnimation(fx);
    spawnParticlesForFx(fx);
    setTimeout(() => setAttackAnimation(null), 800);
  };

  const triggerVictory = () => {
    setCombatEnd(true);
    setScreenFlash("white");
    setTimeout(() => setScreenFlash(null), 500);
    androidBridge.hapticLevelUp();
    playSound(900, "sine", 0.6);
    addLog(
      "🏆 ¡VICTORIA ESPIRITUAL! Has disipado las sombras con tu poder divino y táctico.",
      "🏆 SPIRITUAL VICTORY! You dispelled the shadows with your divine tactical power."
    );
  };

  const triggerDefeat = () => {
    setCombatEnd(true);
    playSound(80, "sawtooth", 0.8);
    addLog(
      "💀 Tu cordura se quiebra... El Limbo reclama tu espíritu.",
      "💀 Your sanity shatters... Limbo claims your spirit."
    );
  };

  return (
    <div className="flex flex-col bg-slate-950 border-2 border-purple-900/60 rounded-3xl p-4 sm:p-6 w-full max-w-xl shadow-[0_0_50px_rgba(112,26,117,0.4)] relative overflow-hidden">
      
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-slate-950/40 to-slate-950 pointer-events-none" />

      {/* Screen Hit / Skill Flash Overlay */}
      {screenFlash && (
        <div
          className={`absolute inset-0 pointer-events-none z-50 transition-opacity duration-150 ${
            screenFlash === "red"
              ? "bg-red-600/40 animate-pulse"
              : screenFlash === "gold"
              ? "bg-amber-400/35"
              : "bg-white/60"
          }`}
        />
      )}

      {/* Combat Header & ATB Mode Controller */}
      <div className="relative z-10 flex items-center justify-between border-b border-purple-900/40 pb-3 mb-3">
        <div className="flex items-center gap-2 font-mono font-bold text-xs text-amber-400">
          <Swords className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="tracking-widest uppercase filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            BATALLA ATB CHRONO-TRIGGER HD
          </span>
        </div>

        {/* ATB Mode Toggle Button */}
        <button
          onClick={() => setAtbMode(prev => prev === "active" ? "wait" : "active")}
          className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1 rounded-full border transition-all shadow-md ${
            atbMode === "active"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          }`}
        >
          {atbMode === "active" ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3 text-cyan-400" />}
          <span>{atbMode === "active" ? "MODO ATB ACTIVO" : "MODO ATB ESPERA"}</span>
        </button>
      </div>

      {/* Action Order Timeline (Turn Sequence Tracker) */}
      <div className="relative z-10 mb-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/40 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>TURNO:</span>
          </span>
          {/* Dynamic timeline bubbles sorted by readiness */}
          <div className="flex items-center gap-1.5">
            {/* Player CKY */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold transition-all ${
              playerAtb >= 100 
                ? "bg-cyan-500/30 text-cyan-300 border-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              <span>👩 CKY</span>
              <span className="text-[8px] text-cyan-400 font-bold">{Math.floor(playerAtb)}%</span>
            </div>

            {/* Companion Ángela */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold transition-all ${
              playerAtb >= 100
                ? "bg-pink-500/30 text-pink-300 border-pink-400 animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.8)]"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              <span>👻 Ángela</span>
              <span className="text-[8px] text-pink-400 font-bold">{Math.floor(playerAtb)}%</span>
            </div>

            <span className="text-slate-600 text-xs">➔</span>

            {/* Enemy Boss */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold transition-all ${
              enemyAtb >= 100
                ? "bg-red-500/30 text-red-300 border-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              <span>😈 Sombra</span>
              <span className="text-[8px] text-red-400 font-bold">{Math.floor(enemyAtb)}%</span>
            </div>
          </div>
        </div>

        {/* Quick Battle Tools (Auto / Speed / Scan) */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setIsAutoBattle(prev => !prev)}
            className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
              isAutoBattle 
                ? "bg-emerald-500/30 text-emerald-300 border-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Combate Automático Asistido"
          >
            <Bot className="w-3 h-3" />
            <span>{isAutoBattle ? "AUTO ON" : "AUTO"}</span>
          </button>

          <button
            onClick={() => setBattleSpeed(prev => prev === 1 ? 2 : 1)}
            className="px-2 py-1 rounded-lg text-[9px] font-mono font-bold bg-slate-800 border border-slate-700 text-amber-300 hover:border-amber-500 transition-all flex items-center gap-0.5 cursor-pointer"
            title="Velocidad de Batalla"
          >
            <FastForward className="w-3 h-3" />
            <span>{battleSpeed}X</span>
          </button>

          <button
            onClick={() => setShowTacticalScan(true)}
            className="px-2 py-1 rounded-lg text-[9px] font-mono font-bold bg-purple-950/60 border border-purple-600/50 text-purple-300 hover:bg-purple-900/80 transition-all flex items-center gap-1 cursor-pointer"
            title="Escanear Debilidades del Enemigo"
          >
            <Eye className="w-3 h-3 text-purple-400" />
            <span>ESCANEAR</span>
          </button>
        </div>
      </div>

      {/* Visual Battle Arena Stage */}
      <div className="relative z-10 bg-slate-950 border-2 border-slate-800 rounded-2xl h-60 flex items-center justify-between overflow-hidden shadow-2xl my-1">
        
        {/* Real-time HTML5 Particle Engine Canvas */}
        <canvas
          ref={canvasRef}
          width={520}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* CRT Scanline Shader Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-60" />

        {/* Attack Animation Overlay */}
        {attackAnimation === "light_beam" && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-ping">
            <svg className="w-full h-full filter drop-shadow-[0_0_20px_rgba(250,204,21,1)]" viewBox="0 0 200 100">
              <line x1="40" y1="50" x2="160" y2="50" stroke="#facc15" strokeWidth="10" strokeDasharray="12 6" />
              <circle cx="160" cy="50" r="30" fill="#fef08a" opacity="0.9" />
            </svg>
          </div>
        )}

        {attackAnimation === "prismatic_laser" && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-pulse">
            <svg className="w-full h-full filter drop-shadow-[0_0_25px_rgba(192,132,252,1)]" viewBox="0 0 200 100">
              <line x1="30" y1="50" x2="170" y2="50" stroke="#c084fc" strokeWidth="16" />
              <line x1="30" y1="50" x2="170" y2="50" stroke="#38bdf8" strokeWidth="8" />
              <line x1="30" y1="50" x2="170" y2="50" stroke="#fef08a" strokeWidth="3" />
              <circle cx="170" cy="50" r="35" fill="#e879f9" opacity="0.95" />
            </svg>
          </div>
        )}

        {attackAnimation === "backpack_slam" && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-end pr-10 animate-bounce">
            <span className="text-7xl filter drop-shadow-[0_0_25px_rgba(245,158,11,1)]">📚🎒</span>
          </div>
        )}

        {attackAnimation === "celestial_wave" && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-4 border-cyan-400 animate-ping opacity-80 filter drop-shadow-[0_0_15px_rgba(6,182,212,1)]" />
            <div className="w-56 h-56 rounded-full border-2 border-violet-500 animate-ping opacity-60 absolute filter drop-shadow-[0_0_20px_rgba(139,92,246,1)]" />
          </div>
        )}

        {/* Floating Damage Text Emissions */}
        {floatingTexts.map(ft => (
          <div
            key={ft.id}
            className={`absolute z-40 font-mono font-black text-sm sm:text-base animate-bounce tracking-wider filter drop-shadow-[0_4px_12px_rgba(0,0,0,1)] ${
              ft.isPlayerTarget ? "left-6 top-8" : "right-6 top-8"
            }`}
            style={{ color: ft.color }}
          >
            {ft.text}
          </div>
        ))}

        {/* Hero Party: CKY + Angela Spirit Companion */}
        <div className="relative z-10 flex items-center gap-2 pl-3 sm:pl-5">
          {/* CKY Hero Fighter Unit */}
          <div className={`flex flex-col items-center transition-transform ${shakePlayer ? "animate-shake" : ""}`}>
            <div className="relative group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400/30 to-purple-600/30 border-2 border-amber-400/80 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">👩‍🦰</span>
              </div>
              <span className="absolute -top-1 -right-1 text-base animate-bounce">✨</span>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-amber-300 mt-1 tracking-wider uppercase drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]">
              CKY
            </div>

            {/* CKY HP & MP Metallic Status Bars */}
            <div className="space-y-1 mt-1.5 w-24 sm:w-26 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
              <div className="flex justify-between text-[8px] font-mono text-slate-200 font-bold">
                <span className="text-pink-400">HP</span>
                <span>{playerHp}/100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-pink-500/40 p-0.5 relative">
                {/* Trailing damage bar */}
                <div
                  className="h-full bg-red-700/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                  style={{ width: `${delayedPlayerHp}%` }}
                />
                <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300 h-full rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(244,63,94,0.8)] relative z-10" style={{ width: `${playerHp}%` }} />
              </div>

              <div className="flex justify-between text-[8px] font-mono text-slate-200 font-bold">
                <span className="text-cyan-400">MP</span>
                <span>{playerMp}/100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-cyan-500/40 p-0.5">
                <div className="bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-300 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]" style={{ width: `${playerMp}%` }} />
              </div>

              {/* ATB Action Gauge */}
              <div className="pt-0.5">
                <div className="flex justify-between text-[7px] font-mono font-bold text-amber-300">
                  <span>ATB</span>
                  <span>{playerAtb >= 100 ? "¡READY!" : `${Math.floor(playerAtb)}%`}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-amber-500/60 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${
                      playerAtb >= 100 
                        ? "bg-gradient-to-r from-amber-400 to-yellow-200 shadow-[0_0_12px_rgba(250,204,21,1)] animate-pulse" 
                        : "bg-amber-500/80"
                    }`} 
                    style={{ width: `${playerAtb}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Angela Spirit Companion */}
          {companionActive && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-500/20 border-2 border-pink-400/90 flex items-center justify-center shadow-[0_0_20px_rgba(244,114,182,0.6)]">
                  <span className="text-2xl sm:text-3xl filter drop-shadow-[0_0_8px_rgba(236,72,153,1)]">👻</span>
                </div>
                <span className="absolute -top-1 -right-1 text-xs animate-spin">💖</span>
              </div>
              <div className="text-[9px] font-mono font-extrabold text-pink-300 mt-1 tracking-wider uppercase drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]">
                ÁNGELA
              </div>
              <div className="text-[7px] font-mono font-bold text-pink-400/90 bg-pink-950/80 px-1 rounded border border-pink-500/30 mt-0.5">
                ESPÍRITU PÍCARO
              </div>
            </div>
          )}
        </div>

        {/* VS / Center Combat Divider */}
        <div className="flex flex-col items-center justify-center gap-1 z-10 px-1">
          <span className="text-xl sm:text-2xl font-black font-display text-purple-400/80 tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">VS</span>
          {enemyStunned && (
            <span className="text-[8px] font-mono font-bold bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-bounce">
              ¡ATURDIDO!
            </span>
          )}
          {enemyBlinded && (
            <span className="text-[8px] font-mono font-bold bg-pink-500 text-white px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)] animate-pulse">
              ¡CEGADO!
            </span>
          )}
        </div>

        {/* Enemy Spirit Boss Unit */}
        <div className={`relative z-10 flex flex-col items-center pr-3 sm:pr-5 transition-transform ${shakeEnemy ? "animate-shake" : ""}`}>
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-900/40 to-pink-900/40 border-2 border-violet-500/80 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)]">
              <span className={`text-4xl sm:text-5xl transition-all duration-300 ${
                hasRevealedWeakness 
                  ? "filter drop-shadow-[0_0_20px_rgba(236,72,153,1)] opacity-100" 
                  : "opacity-85 filter brightness-90"
              }`}>
                👾
              </span>
            </div>
            {hasRevealedWeakness && (
              <span className="absolute -top-2 -right-2 text-base animate-ping">🎯</span>
            )}
          </div>
          <div className="text-[11px] font-mono font-extrabold text-violet-300 mt-1 tracking-wider uppercase drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] text-center">
            {language === "es" ? enemyNameEs : enemyNameEn}
          </div>
          <div className="text-[8px] font-mono text-purple-400/90 text-center">
            {language === "es" ? enemySubEs : enemySubEn}
          </div>

          {/* Enemy HP Shield & ATB */}
          <div className="space-y-1 mt-1.5 w-24 sm:w-28 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
            <div className="flex justify-between text-[8px] font-mono text-slate-200 font-bold">
              <span className="text-violet-400">SHIELD</span>
              <span>{enemyHp}/{maxEnemyHp}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-violet-500/40 p-0.5 relative">
              {/* Trailing damage bar */}
              <div
                className="h-full bg-amber-600/60 absolute top-0 left-0 transition-all duration-500 ease-out"
                style={{ width: `${(delayedEnemyHp / maxEnemyHp) * 100}%` }}
              />
              <div 
                className="bg-gradient-to-r from-violet-600 via-purple-500 to-purple-300 h-full rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(168,85,247,0.8)] relative z-10" 
                style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }} 
              />
            </div>

            {/* Enemy ATB Gauge */}
            <div className="pt-0.5">
              <div className="flex justify-between text-[7px] font-mono font-bold text-red-400">
                <span>ENEMY ATB</span>
                <span>{enemyAtb >= 100 ? "¡ATTACK!" : `${Math.floor(enemyAtb)}%`}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-red-500/60 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-150 ${
                    enemyAtb >= 100 
                      ? "bg-gradient-to-r from-red-500 to-rose-300 shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse" 
                      : "bg-red-600/80"
                  }`} 
                  style={{ width: `${enemyAtb}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Angela Dialogue Bubble Banner */}
      {companionActive && (
        <div className="relative z-10 my-1.5 bg-pink-950/40 border border-pink-500/50 rounded-2xl p-2.5 flex items-start gap-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.2)]">
          <div className="text-xl shrink-0 filter drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]">👻</div>
          <div className="flex-1">
            <div className="text-[10px] font-mono font-black text-pink-300 tracking-wider uppercase flex items-center gap-1">
              <span>Ángela</span>
              <span className="text-[8px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded border border-pink-400/40">Espíritu Alegre</span>
            </div>
            <p className="text-xs font-serif italic text-pink-100/90 mt-0.5 leading-snug">
              "{angelaQuip}"
            </p>
          </div>
        </div>
      )}

      {/* Terminal Battle Log Feed */}
      <div className="relative z-10 my-1.5 bg-black/90 border border-purple-900/50 rounded-xl p-2 h-16 overflow-y-auto font-mono text-[9px] leading-relaxed space-y-0.5 shadow-inner">
        {logs.map((log, idx) => (
          <div 
            key={idx} 
            className={idx === 0 ? "text-amber-300 font-bold border-l-2 border-amber-500 pl-2" : "text-slate-400"}
          >
            {log}
          </div>
        ))}
      </div>

      {/* Synergy Ultimate Bar */}
      <div className="relative z-10 my-2 p-2 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/80 border border-amber-500/40 backdrop-blur-md">
        <div className="flex items-center justify-between text-[9px] font-mono font-bold mb-1">
          <span className="text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>SINERGIA ASTRAL DE GRUPO (CKY + ÁNGELA + W)</span>
          </span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${synergyMeter >= 100 ? "bg-amber-400 text-slate-950 animate-pulse shadow-[0_0_10px_rgba(250,204,21,1)]" : "text-amber-400/90 bg-amber-950/60"}`}>
            {synergyMeter >= 100 ? "✨ ¡SUPERNOVA LISTA! ✨" : `${Math.floor(synergyMeter)}%`}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-amber-500/50 p-0.5 relative">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              synergyMeter >= 100
                ? "bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-300 shadow-[0_0_15px_rgba(250,204,21,1)] animate-pulse"
                : "bg-gradient-to-r from-amber-600 via-purple-600 to-pink-500"
            }`}
            style={{ width: `${synergyMeter}%` }}
          />
        </div>

        {/* Supernova Button when 100% */}
        {synergyMeter >= 100 && !combatEnd && (
          <button
            onClick={handleSupernova}
            className="mt-2 w-full py-2 px-3 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.8)] border-2 border-amber-200 flex items-center justify-center gap-2 active:scale-95 transition-transform animate-bounce cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>¡DESATAR SUPERNOVA TRIPLE! (-150 HP + RECARGA)</span>
            <Sparkles className="w-4 h-4 text-slate-950" />
          </button>
        )}
      </div>

      {/* Action Dashboard & Submenu Category Tabs */}
      {!combatEnd ? (
        <div className="relative z-10 space-y-2 mt-1">
          
          {/* Submenu Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[10px] font-mono backdrop-blur-md">
            <button
              onClick={() => setActiveTab("angela")}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                activeTab === "angela"
                  ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md font-extrabold"
                  : "text-pink-400 hover:text-pink-200"
              }`}
            >
              <span>👻</span>
              <span>ÁNGELA</span>
            </button>

            <button
              onClick={() => setActiveTab("skills")}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                activeTab === "skills"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>CKY</span>
            </button>

            <button
              onClick={() => setActiveTab("combos")}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                activeTab === "combos"
                  ? "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>COMBOS</span>
            </button>

            <button
              onClick={() => setActiveTab("items")}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                activeTab === "items"
                  ? "bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3 h-3" />
              <span>MOCHILA</span>
            </button>
          </div>

          {/* Action Buttons Panel depending on Active Tab */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* --- TAB 0: ANGELA'S POWERS --- */}
            {activeTab === "angela" && (
              <>
                <button
                  onClick={() => handleAngelaSkill("distraccion")}
                  disabled={playerAtb < 100}
                  className="p-2 rounded-xl border border-pink-500/60 bg-pink-950/40 hover:bg-pink-900/60 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs flex flex-col justify-between shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-pink-300">
                    <span>💋</span>
                    <span>Distracción Picante (15 MP)</span>
                  </div>
                  <p className="text-[8px] text-pink-200/80 mt-1">Chiste de doble sentido: 35 daño + Ciega enemigo.</p>
                </button>

                <button
                  onClick={() => handleAngelaSkill("beso")}
                  disabled={playerAtb < 100}
                  className="p-2 rounded-xl border border-rose-500/60 bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs flex flex-col justify-between shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <span>💖</span>
                    <span>Beso Espectral (20 MP)</span>
                  </div>
                  <p className="text-[8px] text-rose-200/80 mt-1">Piquito juguetón: Restaura +45 HP y +30 MP.</p>
                </button>

                <button
                  onClick={() => handleAngelaSkill("furia")}
                  disabled={playerAtb < 100}
                  className="col-span-2 p-2 rounded-xl border border-purple-500/70 bg-gradient-to-r from-purple-950/70 via-pink-950/60 to-purple-950/70 hover:from-purple-900/80 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-pink-200">
                    <Zap className="w-3.5 h-3.5 text-pink-400" />
                    <span>Furia del Más Allá (35 MP)</span>
                  </div>
                  <span className="text-[9px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">85-135 DAÑO + ATURDE</span>
                </button>
              </>
            )}
            
            {/* --- TAB 1: INDIVIDUAL SKILLS --- */}
            {activeTab === "skills" && (
              <>
                <button
                  onClick={() => handlePlayerSkill("light")}
                  disabled={playerAtb < 100}
                  className="p-2.5 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/25 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs flex flex-col justify-between shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Rayo de Luz (15 MP)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Ataque elemental de luz directo.</p>
                </button>

                <button
                  onClick={() => handlePlayerSkill("see_invisible")}
                  disabled={playerAtb < 100 || hasRevealedWeakness}
                  className="p-2.5 rounded-xl border border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/25 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs flex flex-col justify-between shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-pink-300">
                    <Crosshair className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span>Ver lo Invisible (25 MP)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Expone el núcleo (3x Daño).</p>
                </button>

                <button
                  onClick={() => handlePlayerSkill("meditate")}
                  disabled={playerAtb < 100}
                  className="col-span-2 p-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs flex items-center justify-between shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <Brain className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Meditación y Enfoque (+35 MP, +20 HP)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">RESCATE</span>
                </button>
              </>
            )}

            {/* --- TAB 2: DUAL TECH COMBOS --- */}
            {activeTab === "combos" && (
              <>
                <button
                  onClick={() => handlePlayerCombo("prismatic_laser")}
                  disabled={playerAtb < 100}
                  className="p-2.5 rounded-xl border border-purple-500/60 bg-purple-950/50 hover:bg-purple-900/70 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Rayo Prismático (30 MP)</span>
                  </div>
                  <p className="text-[9px] text-purple-200/70 mt-1">Luz + Perfume: 80 daño + Ciega enemigo.</p>
                </button>

                <button
                  onClick={() => handlePlayerCombo("backpack_slam")}
                  disabled={playerAtb < 100}
                  className="p-2.5 rounded-xl border border-amber-500/60 bg-amber-950/50 hover:bg-amber-900/70 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mochilazo (20 MP)</span>
                  </div>
                  <p className="text-[9px] text-amber-200/70 mt-1">Libros + Fuerza: 65 daño + Aturde.</p>
                </button>

                <button
                  onClick={() => handlePlayerCombo("celestial_wave")}
                  disabled={playerAtb < 100}
                  className="col-span-2 p-2.5 rounded-xl border border-cyan-500/60 bg-cyan-950/50 hover:bg-cyan-900/70 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Onda Celeste Celular (25 MP)</span>
                  </div>
                  <p className="text-[9px] text-cyan-200/70 mt-0.5">Celular + Frecuencia Sagrada: 75 daño divino.</p>
                </button>
              </>
            )}

            {/* --- TAB 3: BACKPACK ITEMS --- */}
            {activeTab === "items" && (
              <>
                <button
                  onClick={() => handlePlayerItem("sandwich")}
                  disabled={playerAtb < 100}
                  className="p-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <span>🥪</span>
                    <span>Sándwich (+50 HP)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Restaura cordura mental inmediatamente.</p>
                </button>

                <button
                  onClick={() => handlePlayerItem("bottle")}
                  disabled={playerAtb < 100}
                  className="p-2.5 rounded-xl border border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/25 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <span>🧴</span>
                    <span>Agua Favorita (+40 MP)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Recupera Enfoque Espiritual MP.</p>
                </button>

                <button
                  onClick={() => handlePlayerItem("perfume")}
                  disabled={playerAtb < 100}
                  className="col-span-2 p-2.5 rounded-xl border border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/25 active:scale-95 disabled:opacity-40 transition-all text-left font-mono text-xs shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-pink-300">
                    <span>🌸</span>
                    <span>Perfume Favorito (Ciega al Enemigo)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">Deslumbra al espíritu ralentizando su barra ATB.</p>
                </button>
              </>
            )}

          </div>
        </div>
      ) : (
        /* Victory or Defeat Action Modal Banner */
        <div className="relative z-10 mt-3">
          {enemyHp <= 0 ? (
            <button
              onClick={onWin}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:to-amber-700 text-slate-950 font-display font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(250,204,21,0.6)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>{language === "es" ? "¡RECLAMAR VICTORIA Y SEGUIR!" : "CLAIM VICTORY & CONTINUE!"}</span>
            </button>
          ) : (
            <button
              onClick={onLose}
              className="w-full py-3.5 px-4 bg-slate-900 border-2 border-red-500 text-red-400 hover:bg-red-950/60 font-mono font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === "es" ? "VOLVER DEL LIMBO (MISIONES)" : "RETURN FROM LIMBO (QUESTS)"}</span>
            </button>
          )}
        </div>
      )}

      {/* Supernova Triple Screen Cutin Banner */}
      {showSupernovaCutin && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in text-center">
          <div className="flex items-center justify-center gap-4 mb-4 animate-bounce">
            <span className="text-5xl">👩</span>
            <span className="text-4xl text-amber-400">⚡</span>
            <span className="text-5xl">👻</span>
            <span className="text-4xl text-cyan-400">⚡</span>
            <span className="text-5xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 tracking-widest uppercase filter drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
            ¡SUPERNOVA TRIPLE!
          </h2>
          <p className="text-xs font-mono text-amber-200 mt-2 max-w-sm">
            CKY, Ángela y W combinan sus almas en una descarga de luz cósmica sagrada.
          </p>
        </div>
      )}

      {/* Tactical Weakness Scanner Modal */}
      {showTacticalScan && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="w-full max-w-md bg-slate-900 border-2 border-purple-500 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/40 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black font-display text-purple-300 uppercase tracking-wider">
                  ANÁLISIS TÁCTICO DE COMBATE
                </h3>
              </div>
              <button
                onClick={() => setShowTacticalScan(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-amber-400">🎯 {enemyNameEs} ({enemySubEs})</p>
                <p className="text-slate-400 text-[11px] mt-1">
                  Entidad espectral nacida del rencor vecinal y las fisuras del Limbo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                  <p className="text-[10px] font-bold text-emerald-300">💥 DEBILIDADES:</p>
                  <ul className="text-[10px] text-emerald-200/90 mt-1 space-y-0.5">
                    <li>• Luz Astral (3x daño con 'Ver lo Invisible')</li>
                    <li>• Distracción picante de Ángela</li>
                    <li>• Perfume de mamá (Causa ceguera)</li>
                  </ul>
                </div>
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/40">
                  <p className="text-[10px] font-bold text-red-300">🛡️ RESISTENCIAS:</p>
                  <ul className="text-[10px] text-red-200/90 mt-1 space-y-0.5">
                    <li>• Ataques físicos comunes</li>
                    <li>• Resiste daño sombrío</li>
                    <li>• Inmune a veneno terrenal</li>
                  </ul>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-200">
                <p className="font-bold text-amber-300">💡 CONSEJO DE ÁNGELA:</p>
                <p className="italic mt-0.5">
                  "¡Usá 'Ver lo Invisible' primero para exponer el núcleo y después dale con la Supernova o el Rayo Prismático! No seas tonta, aprovechá las debilidades."
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTacticalScan(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              VOLVER A LA BATALLA
            </button>
          </div>
        </div>
      )}

    </div>
  );
}


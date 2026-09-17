// Audio and Music Engine for CKY RPG using native Web Audio API
// Fully compatible with desktop and Android/mobile touch-unlock policies

export type BgmTrack = "house" | "street" | "school" | "mystery" | "battle" | "boss" | "climax" | "ending" | "none";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: BgmTrack | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private isMuted: boolean = false;
  private bgmVolume: number = 0.35;
  private sfxVolume: number = 0.5;

  constructor() {
    // Auto-unlock on first user touch/pointer interaction on Android/mobile
    if (typeof window !== "undefined") {
      const unlockHandler = () => {
        this.unlockAudio();
        window.removeEventListener("pointerdown", unlockHandler);
        window.removeEventListener("touchstart", unlockHandler);
      };
      window.addEventListener("pointerdown", unlockHandler, { once: true, passive: true });
      window.addEventListener("touchstart", unlockHandler, { once: true, passive: true });
    }
  }

  public suspendAudio() {
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend().catch(() => {});
    }
  }

  public resumeAudio() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlockAudio() {
    this.initContext();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  // --- SOUND EFFECTS (SFX) ---
  public playTone(freq: number, type: OscillatorType = "sine", duration: number = 0.1, gainMultiplier: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3 * gainMultiplier, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  public playStep(surface: "wood" | "tile" | "asphalt" | "stone" = "wood") {
    const freqs: Record<string, number> = {
      wood: 180,
      tile: 320,
      asphalt: 210,
      stone: 150,
    };
    const freq = freqs[surface] || 180;
    this.playTone(freq + Math.random() * 20 - 10, "triangle", 0.05, 0.4);
  }

  public playDialogueBlip(pitch: number = 440) {
    this.playTone(pitch + Math.random() * 40 - 20, "sine", 0.04, 0.25);
  }

  public playEatCrunch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    [260, 420, 180].forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "sawtooth", 0.08, 0.3);
      }, idx * 60);
    });
  }

  public playDoorOpen() {
    this.playTone(190, "sawtooth", 0.12, 0.4);
    setTimeout(() => this.playTone(280, "triangle", 0.15, 0.3), 80);
  }

  public playWaterPour() {
    [400, 480, 560, 620].forEach((f, idx) => {
      setTimeout(() => this.playTone(f + Math.random() * 30, "sine", 0.06, 0.2), idx * 45);
    });
  }

  public playItemGet() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => this.playTone(f, "sine", 0.12, 0.5), idx * 80);
    });
  }

  public playCombatHit(isCrit: boolean = false) {
    this.playTone(isCrit ? 120 : 160, "sawtooth", isCrit ? 0.25 : 0.15, isCrit ? 0.8 : 0.5);
    if (isCrit) {
      setTimeout(() => this.playTone(80, "square", 0.2, 0.6), 50);
    }
  }

  public playSupernova() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    [150, 220, 330, 440, 660, 880, 1320].forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, "sawtooth", 0.4, 0.6);
      }, idx * 70);
    });
  }

  public playSfx(type: "hit" | "critical" | "heal" | "buff" | "magic" | "fanfare" | "dialogue" | "supernova" | string) {
    this.initContext();
    switch (type) {
      case "hit":
        this.playCombatHit(false);
        break;
      case "critical":
        this.playCombatHit(true);
        break;
      case "heal":
        [330, 440, 554.37, 659.25].forEach((f, idx) => {
          setTimeout(() => this.playTone(f, "sine", 0.12, 0.4), idx * 60);
        });
        break;
      case "buff":
        [220, 277.18, 329.63, 440, 554.37].forEach((f, idx) => {
          setTimeout(() => this.playTone(f, "triangle", 0.08, 0.35), idx * 50);
        });
        break;
      case "magic":
        [440, 587.33, 739.99, 880, 1174.66].forEach((f, idx) => {
          setTimeout(() => this.playTone(f, "sine", 0.1, 0.4), idx * 45);
        });
        break;
      case "fanfare":
        this.playItemGet();
        break;
      case "dialogue":
        this.playDialogueBlip();
        break;
      case "supernova":
        this.playSupernova();
        break;
      case "coin":
        this.playTone(987.77, "sine", 0.08, 0.35);
        setTimeout(() => this.playTone(1318.51, "sine", 0.18, 0.4), 80);
        break;
      case "purchase":
        this.playTone(587.33, "triangle", 0.06, 0.3);
        setTimeout(() => this.playTone(880, "sine", 0.08, 0.35), 60);
        setTimeout(() => this.playTone(1174.66, "sine", 0.15, 0.4), 130);
        break;
      default:
        this.playTone(440, "sine", 0.1, 0.4);
        break;
    }
  }

  // --- PROCEDURAL BGM (Background Music) ---
  public playBgm(theme: "house" | "street" | "school" | "mystery" | "battle" | "boss" | "climax" | "ending" | "none") {
    if (this.currentTrack === theme && this.isBgmPlaying) return;
    this.stopBgm();

    if (theme === "none") {
      this.currentTrack = null;
      return;
    }

    this.initContext();
    this.currentTrack = theme;
    this.isBgmPlaying = true;

    // Melody chord loops per theme
    const themes: Record<string, { notes: number[]; speed: number; wave: OscillatorType }> = {
      house: {
        // Warm lo-fi acoustic feeling (C - G - Am - F)
        notes: [261.63, 329.63, 392.00, 329.63, 196.00, 246.94, 293.66, 246.94, 220.00, 261.63, 329.63, 261.63, 174.61, 220.00, 261.63, 220.00],
        speed: 280,
        wave: "triangle",
      },
      street: {
        // Upbeat urban town stroll (F - C - Dm - Bb)
        notes: [349.23, 440.00, 523.25, 440.00, 261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23, 233.08, 293.66, 349.23, 293.66],
        speed: 240,
        wave: "sine",
      },
      school: {
        // Playful energetic school routine
        notes: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99, 293.66, 220.00, 329.63, 392.00, 493.88, 392.00, 261.63, 329.63, 392.00, 329.63],
        speed: 220,
        wave: "triangle",
      },
      mystery: {
        // Melancholic, suspended mystic echoes (Limbo, ruins, cemetery)
        notes: [220.00, 261.63, 311.13, 392.00, 311.13, 261.63, 220.00, 164.81, 196.00, 246.94, 293.66, 369.99, 293.66, 246.94, 196.00, 146.83],
        speed: 400,
        wave: "sine",
      },
      battle: {
        // Fast 16-bit RPG battle theme
        notes: [220.00, 220.00, 261.63, 293.66, 329.63, 293.66, 261.63, 220.00, 196.00, 196.00, 246.94, 293.66, 329.63, 293.66, 246.94, 196.00],
        speed: 150,
        wave: "sawtooth",
      },
      boss: {
        // Dramatic and tense boss showdown
        notes: [164.81, 196.00, 220.00, 246.94, 261.63, 246.94, 220.00, 196.00, 146.83, 174.61, 196.00, 220.00, 233.08, 220.00, 196.00, 174.61],
        speed: 130,
        wave: "sawtooth",
      },
      climax: {
        // Grand celestial organ arpeggios (Alanis, betrayal, supernova)
        notes: [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5, 783.99, 293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66, 880.00],
        speed: 180,
        wave: "sine",
      },
      ending: {
        // Sweet nostalgic farewell melody
        notes: [392.00, 329.63, 261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 261.63, 349.23, 440.00, 392.00, 329.63, 261.63, 293.66, 261.63],
        speed: 320,
        wave: "triangle",
      },
    };

    const config = themes[theme] || themes.house;
    let step = 0;

    const playLoopStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const freq = config.notes[step % config.notes.length];
      step++;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = config.wave;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const dur = (config.speed / 1000) * 0.9;
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start();
        osc.stop(this.ctx.currentTime + dur);
      } catch {
        // Handle interruption
      }
    };

    // Play first note immediately and loop with setInterval
    playLoopStep();
    this.bgmIntervalId = window.setInterval(playLoopStep, config.speed);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    this.currentTrack = null;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public getCurrentTrack(): "house" | "street" | "school" | "mystery" | "battle" | "boss" | "climax" | "ending" | "none" | null {
    return this.currentTrack;
  }
}

export const soundEngine = new SoundEngine();

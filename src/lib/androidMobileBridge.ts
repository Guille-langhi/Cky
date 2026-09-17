// Android Mobile Enhancement Bridge: Wake Lock, Storage Persistence, and Advanced Haptic Engine 2.0

class AndroidMobileBridge {
  private wakeLockSentinel: any = null;
  private isWakeLockSupported: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      this.isWakeLockSupported = true;
    }
  }

  // --- 1. Screen Wake Lock (Keeps mobile screen on during gameplay & dialogues) ---
  public async requestWakeLock(): Promise<boolean> {
    if (!this.isWakeLockSupported) return false;
    try {
      if (document.visibilityState === "visible") {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
        this.wakeLockSentinel.addEventListener("release", () => {
          this.wakeLockSentinel = null;
        });
        return true;
      }
    } catch (err) {
      // Screen Wake Lock can fail if low battery or permission denied
      console.warn("WakeLock request ignored or failed:", err);
    }
    return false;
  }

  public releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch {
        // Safe fallback
      }
      this.wakeLockSentinel = null;
    }
  }

  // Handle visibility change to restore wake lock when player returns to app
  public initAutoWakeLock(): () => void {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await this.requestWakeLock();
      } else {
        this.releaseWakeLock();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      // Initial request
      this.requestWakeLock();
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        this.releaseWakeLock();
      }
    };
  }

  // --- 2. Android Storage Persistence (Prevents OS from purging saved games) ---
  public async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (isPersisted) return true;
        return await navigator.storage.persist();
      } catch (e) {
        console.warn("Storage persist request error:", e);
      }
    }
    return false;
  }

  // --- 3. Advanced Haptic Feedback Engine 2.0 ---
  public vibrate(pattern: number | number[]): void {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  }

  // Light tap for D-Pad steps, UI buttons
  public hapticTap(): void {
    this.vibrate(10);
  }

  // Action button / Examine
  public hapticAction(): void {
    this.vibrate(18);
  }

  // Coin / Money pickup or item acquired (double crisp chirp)
  public hapticItemPickup(): void {
    this.vibrate([15, 25, 20]);
  }

  // Dialogue progression / text blip
  public hapticDialogue(): void {
    this.vibrate(8);
  }

  // Supernatural tension / heartbeat (Vecina / Limbo / Ghosts)
  public hapticHeartbeat(): void {
    this.vibrate([35, 75, 35, 75]);
  }

  // Battle impact / damage dealt or taken
  public hapticImpact(): void {
    this.vibrate([45, 30, 75]);
  }

  // Critical hit / Boss explosion
  public hapticCritical(): void {
    this.vibrate([60, 40, 110]);
  }

  // Cosmic Supernova climax / Godly burst
  public hapticSupernova(): void {
    this.vibrate([80, 40, 120, 50, 180]);
  }

  // Level up celebratory fanfare vibration
  public hapticLevelUp(): void {
    this.vibrate([30, 50, 40, 50, 80]);
  }

  // Warning / cooldown not ready
  public hapticWarning(): void {
    this.vibrate([25, 40, 25]);
  }
}

export const androidBridge = new AndroidMobileBridge();

/**
 * Web Audio API synthesizer & Vibration API manager for native mobile tactile feel
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedSound = window.localStorage.getItem('chatbai_sound_enabled');
      if (savedSound !== null) this.soundEnabled = savedSound === 'true';

      const savedHaptics = window.localStorage.getItem('chatbai_haptics_enabled');
      if (savedHaptics !== null) this.hapticsEnabled = savedHaptics === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(val: boolean) {
    this.soundEnabled = val;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('chatbai_sound_enabled', String(val));
    }
  }

  public setHapticsEnabled(val: boolean) {
    this.hapticsEnabled = val;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('chatbai_haptics_enabled', String(val));
    }
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // --- HAPTICS (Vibration API) ---

  public triggerHaptic(pattern: number | number[] = 15) {
    if (!this.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Safe failover
      }
    }
  }

  /** Quick tactile tap on buttons */
  public hapticTap() {
    this.triggerHaptic(12);
  }

  /** Light micro-feedback on selection / tabs */
  public hapticLight() {
    this.triggerHaptic(8);
  }

  /** Dynamic dual-pulse on sending a message */
  public hapticSend() {
    this.triggerHaptic([15, 30, 20]);
  }

  /** Gentle tactile arrival on receiving an AI response */
  public hapticReceive() {
    this.triggerHaptic([12, 40, 16]);
  }

  /** Error vibration alert */
  public hapticError() {
    this.triggerHaptic([40, 35, 40]);
  }

  // --- SOUND EFFECTS (Web Audio API) ---

  public playSend() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {}
  }

  public playReceive() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch (e) {}
  }

  public playTap() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }
}

export const sound = new SoundManager();

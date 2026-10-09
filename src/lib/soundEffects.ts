/**
 * Web Audio API Sound Effects Utility
 * Synthesizes crisp, responsive, zero-latency sound effects without relying on external audio files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Check if sound effects are enabled in user settings (default true) */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const direct = localStorage.getItem('gty_sound_effects');
    if (direct !== null) {
      return direct === 'true';
    }
    const raw = localStorage.getItem('gty_game_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.soundEffects === 'boolean') {
        return parsed.soundEffects;
      }
    }
  } catch {}
  return true;
}

/**
 * Play a bright, uplifting "Ready!" / "Start Game" chime
 */
export function playReadySound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 587.33, time: 0, dur: 0.16 }, // D5
    { freq: 880.0, time: 0.12, dur: 0.32 }, // A5
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.24, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * Play a percussive, wooden/digital countdown tick (for 3, 2, 1)
 */
export function playCountdownTick(stepIndex: number = 0): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Step 0 -> 480Hz, Step 1 -> 560Hz, Step 2 -> 660Hz
  const baseFreq = stepIndex === 0 ? 480 : stepIndex === 1 ? 560 : 660;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.08);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Play a celebratory triumphant fanfare flourish for "GO!"
 */
export function playCountdownGo(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Bright ascending arpeggio: C5, E5, G5, C6
  const notes = [
    { freq: 523.25, time: 0, dur: 0.18 }, // C5
    { freq: 659.25, time: 0.06, dur: 0.2 }, // E5
    { freq: 783.99, time: 0.12, dur: 0.24 }, // G5
    { freq: 1046.5, time: 0.18, dur: 0.45 }, // C6
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.28, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * Play a tactile, satisfying lock-in sound (bubble pop + padlock thunk)
 */
export function playLockInSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Resonant bubble pop
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(320, now);
  osc1.frequency.exponentialRampToValueAtTime(140, now + 0.14);

  gain1.gain.setValueAtTime(0.32, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.16);

  // 2. Crisp mechanical latch click
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(960, now + 0.04);
  osc2.frequency.exponentialRampToValueAtTime(420, now + 0.09);

  gain2.gain.setValueAtTime(0, now + 0.04);
  gain2.gain.linearRampToValueAtTime(0.22, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.04);
  osc2.stop(now + 0.11);
}

/**
 * Play a magical celebratory chime when the partner locks in their answer on the locked page
 */
export function playPartnerAnsweredSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Sparkle chime arpeggio: E5 -> G#5 -> B5 -> E6
  const notes = [
    { freq: 659.25, time: 0, dur: 0.28 }, // E5
    { freq: 830.61, time: 0.08, dur: 0.32 }, // G#5
    { freq: 987.77, time: 0.16, dur: 0.38 }, // B5
    { freq: 1318.51, time: 0.24, dur: 0.55 }, // E6
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.25, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * Play a playful double bubble "boop-boop" for Nudge
 */
export function playNudgeSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const boops = [
    { freq: 520, time: 0, dur: 0.08 },
    { freq: 720, time: 0.1, dur: 0.12 },
  ];

  boops.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + time + dur * 0.5);

    gain.gain.setValueAtTime(0.26, now + time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * Play a subtle click/tap sound for option selections
 */
export function playTapSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * Play a triumphant harmony chord for correct answers
 */
export function playCorrectSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chord = [
    { freq: 523.25, time: 0, dur: 0.4 }, // C5
    { freq: 659.25, time: 0.04, dur: 0.45 }, // E5
    { freq: 783.99, time: 0.08, dur: 0.55 }, // G5
  ];

  chord.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.2, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

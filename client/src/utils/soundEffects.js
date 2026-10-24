// client/src/utils/soundEffects.js
// Retro 8-bit fantasy audio synthesizer using the native Web Audio API
// 100% self-contained, zero external asset dependencies, zero 404s/CORS issues

let audioCtx = null;
let bgmOscillators = [];
let bgmGainNode = null;
let isBgmPlaying = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Check localStorage / user settings for sound preference
export function isSoundEnabled() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("math_sound_enabled");
  return stored !== "false";
}

export function setSoundEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem("math_sound_enabled", enabled ? "true" : "false");
  if (!enabled && isBgmPlaying) {
    stopBgm();
  }
}

export function isMusicEnabled() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("math_music_enabled");
  return stored !== "false";
}

export function setMusicEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem("math_music_enabled", enabled ? "true" : "false");
  if (!enabled) {
    stopBgm();
  } else if (isSoundEnabled()) {
    startBgm();
  }
}

/**
 * Play a high-pitched golden coin ping (B5 -> E6)
 */
export function playCoinSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.debug("Audio play error:", err);
  }
}

/**
 * Play correct answer celebration chime (arpeggio: C5 -> E5 -> G5 -> C6)
 */
export function playCorrectSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const step = 0.09;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * step);

      gain.gain.setValueAtTime(0.2, now + idx * step);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * step);
      osc.stop(now + idx * step + 0.3);
    });
  } catch (err) {
    console.debug("Audio play error:", err);
  }
}

/**
 * Play soft friendly incorrect buzzer
 */
export function playWrongSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.debug("Audio play error:", err);
  }
}

/**
 * Boss damage impact sound (punchy impact burst)
 */
export function playBossHitSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.debug("Audio play error:", err);
  }
}

/**
 * Victory Fanfare for mission/boss complete
 */
export function playVictorySound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.14 }, // C5
      { f: 523.25, d: 0.14 }, // C5
      { f: 523.25, d: 0.14 }, // C5
      { f: 659.25, d: 0.28 }, // E5
      { f: 783.99, d: 0.22 }, // G5
      { f: 1046.5, d: 0.55 }, // C6
    ];

    let t = now;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.d);

      t += n.d * 0.85;
    });
  } catch (err) {
    console.debug("Audio play error:", err);
  }
}

/**
 * UI button click blip
 */
export function playClickSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {}
}

/**
 * Gentle looping 8-bit fantasy ambient music synthesizer
 */
export function startBgm() {
  if (!isSoundEnabled() || !isMusicEnabled() || isBgmPlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    stopBgm(); // clean up any existing

    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(0.045, ctx.currentTime);
    bgmGainNode.connect(ctx.destination);

    // Warm chord progression (C - G - Am - F) in ambient arpeggiation
    const chordFrequencies = [
      [261.63, 329.63, 392.0], // C major
      [196.0, 246.94, 293.66], // G major
      [220.0, 261.63, 329.63], // A minor
      [174.61, 220.0, 261.63], // F major
    ];

    let chordIdx = 0;
    const intervalMs = 2400;

    const playChordLoop = () => {
      if (!isBgmPlaying || !bgmGainNode) return;
      const now = ctx.currentTime;
      const notes = chordFrequencies[chordIdx % chordFrequencies.length];
      chordIdx++;

      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.12);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        osc.connect(noteGain);
        noteGain.connect(bgmGainNode);

        osc.start(now);
        osc.stop(now + 2.3);
      });
    };

    isBgmPlaying = true;
    playChordLoop();
    const timer = setInterval(() => {
      if (!isBgmPlaying) {
        clearInterval(timer);
      } else {
        playChordLoop();
      }
    }, intervalMs);
  } catch (err) {
    console.debug("BGM start error:", err);
  }
}

export function stopBgm() {
  isBgmPlaying = false;
  if (bgmGainNode) {
    try {
      bgmGainNode.disconnect();
    } catch {}
    bgmGainNode = null;
  }
}

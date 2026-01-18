// Sound system using Web Audio API with generated sounds
// No external audio files needed - pure synthesis

type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'gameEnd' | 'illegal';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Envelope
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + duration * 0.3);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume: number = 0.15): void {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  source.start(ctx.currentTime);
}

const soundEffects: Record<SoundType, () => void> = {
  // Simple wood-like thock for regular move
  move: () => {
    playTone(200, 0.08, 'triangle', 0.25);
    playNoise(0.05, 0.1);
  },

  // Heavier impact for capture
  capture: () => {
    playTone(150, 0.1, 'triangle', 0.35);
    playTone(100, 0.15, 'sine', 0.2);
    playNoise(0.08, 0.15);
  },

  // Alert tone for check
  check: () => {
    playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(550, 0.15, 'sine', 0.25), 100);
  },

  // Two-part sound for castling
  castle: () => {
    playTone(200, 0.08, 'triangle', 0.25);
    playNoise(0.05, 0.1);
    setTimeout(() => {
      playTone(250, 0.08, 'triangle', 0.25);
      playNoise(0.05, 0.1);
    }, 150);
  },

  // Ascending tone for promotion
  promote: () => {
    playTone(300, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(400, 0.1, 'sine', 0.25), 80);
    setTimeout(() => playTone(500, 0.15, 'sine', 0.3), 160);
  },

  // Fanfare for game end
  gameEnd: () => {
    playTone(262, 0.2, 'sine', 0.3); // C4
    setTimeout(() => playTone(330, 0.2, 'sine', 0.3), 200); // E4
    setTimeout(() => playTone(392, 0.3, 'sine', 0.35), 400); // G4
  },

  // Error buzz for illegal move
  illegal: () => {
    playTone(150, 0.15, 'sawtooth', 0.2);
  },
};

export function playSound(type: SoundType): void {
  try {
    soundEffects[type]();
  } catch {
    // Silently fail if audio context isn't available
  }
}

// Initialize audio context on first user interaction
export function initAudio(): void {
  if (!audioContext) {
    audioContext = new AudioContext();
    // Resume if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
}

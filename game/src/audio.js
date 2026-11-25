// Every sound the kitchen makes, synthesised with WebAudio — no audio
// files, no network. A short blip for a pick-up, a filtered-noise sizzle
// while something grills, a two-note ding when a dish is served, a low buzz
// for a mistake, and a tick when an order is about to walk out.

const NOTE = { ding: 880, dingHigh: 1318, error: 160, pickup: 520, chop: 300 };

export function createAudio() {
  let context = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(frequency, seconds, type, gainValue, when = 0) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.02);
  }

  function noise(seconds, filterFrequency, gainValue) {
    const ctx = ensure();
    if (!ctx || muted) return null;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFrequency;
    const gain = ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { source, gain };
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    isMuted() {
      return muted;
    },
    pickup() {
      tone(NOTE.pickup, 0.08, 'triangle', 0.12);
    },
    chop() {
      noise(0.06, 1800, 0.18);
      tone(NOTE.chop, 0.05, 'square', 0.05);
    },
    place() {
      tone(340, 0.07, 'triangle', 0.1);
    },
    grillStart() {
      tone(220, 0.1, 'sawtooth', 0.05);
    },
    serve() {
      tone(NOTE.ding, 0.12, 'sine', 0.16);
      tone(NOTE.dingHigh, 0.22, 'sine', 0.16, 0.1);
    },
    error() {
      tone(NOTE.error, 0.18, 'sawtooth', 0.1);
    },
    tick() {
      tone(980, 0.05, 'square', 0.06);
    },
    expire() {
      tone(196, 0.3, 'sawtooth', 0.12);
      tone(147, 0.4, 'sawtooth', 0.12, 0.15);
    },
    startSizzle() {
      if (sizzleNodes || muted) return;
      const ctx = ensure();
      if (!ctx) return;
      const length = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4200;
      filter.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.035;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      sizzleNodes = { source, gain };
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try {
        sizzleNodes.source.stop();
      } catch {
        // Already stopped: nothing to do.
      }
      sizzleNodes = null;
    },
  };
}

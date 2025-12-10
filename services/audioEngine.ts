
import { DeckId, EffectType } from "../types";

class DeckSynth {
  ctx: AudioContext;
  
  // Audio Nodes
  inputGain: GainNode; // Trim/Gain
  filterNode: BiquadFilterNode; // EQ/Filter
  faderGain: GainNode; // Channel Volume
  
  // Effects Nodes
  delayNode: DelayNode;
  delayFeedback: GainNode;
  wetGain: GainNode;
  distortionNode: WaveShaperNode;
  
  // State
  isPlaying: boolean = false;
  bpm: number = 128;
  deckId: DeckId;

  // Synth specific
  nextNoteTime: number = 0;
  timerID: number | undefined;
  beatCount: number = 0;

  // File Playback specific
  audioBuffer: AudioBuffer | null = null;
  sourceNode: AudioBufferSourceNode | null = null;
  startedAt: number = 0;
  pausedAt: number = 0;
  
  constructor(ctx: AudioContext, deckId: DeckId) {
    this.ctx = ctx;
    this.deckId = deckId;
    
    // Initialize Nodes
    this.inputGain = ctx.createGain(); // Pre-fader Gain
    this.filterNode = ctx.createBiquadFilter();
    this.faderGain = ctx.createGain(); // Post-fader Volume
    
    // Effects Init
    this.delayNode = ctx.createDelay();
    this.delayNode.delayTime.value = 0.375; // Approx 3/16th at 120bpm
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.4;
    this.wetGain = ctx.createGain();
    this.wetGain.gain.value = 0; // Default dry
    this.distortionNode = ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(0); // No distortion initially
    
    // Chain Wiring:
    // Source -> InputGain -> Distortion -> Filter -> FaderGain -> Output
    //                    |-> Delay -> WetGain -> Filter -> ...
    
    // For simplicity in this structure, we'll put effects in parallel before the filter
    
    // 1. Source connects to InputGain (done in play/schedule)
    
    // 2. InputGain connects to main path
    this.inputGain.connect(this.distortionNode);
    this.distortionNode.connect(this.filterNode);
    
    // 3. Effects Path (Delay)
    this.inputGain.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode); // Feedback loop
    this.delayNode.connect(this.wetGain);
    this.wetGain.connect(this.filterNode);
    
    // 4. Filter connects to Fader
    this.filterNode.connect(this.faderGain);
    
    // Default Levels
    this.faderGain.gain.value = 0; 
    this.inputGain.gain.value = 1;
  }

  // Helper for distortion
  makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    let x;
    for (let i = 0; i < n_samples; ++i) {
      x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  updateEffects(effects: EffectType[]) {
    // Check for Delay
    if (effects.includes(EffectType.DELAY)) {
        this.wetGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.1);
    } else {
        this.wetGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }

    // Check for Bitcrush/Distortion
    if (effects.includes(EffectType.BITCRUSH)) {
        this.distortionNode.curve = this.makeDistortionCurve(400); // Heavy distortion
        this.distortionNode.oversample = '4x';
    } else {
        this.distortionNode.curve = this.makeDistortionCurve(0);
        this.distortionNode.oversample = 'none';
    }
  }

  async loadTrack(url: string): Promise<number> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.pausedAt = 0;
      this.startedAt = 0;
      return this.audioBuffer.duration;
    } catch (e) {
      console.error("Failed to load audio", e);
      this.audioBuffer = null;
      return 0;
    }
  }

  setInputGain(val: number) {
      // Input Trim: 0.0 to 2.0 (allowing boost)
      this.inputGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.02);
  }

  setVolume(vol: number) {
    // Channel Fader: 0.0 to 1.0
    this.faderGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.02);
  }

  setFilter(value: number) {
    // Value is -100 to 100
    if (value < -5) {
      this.filterNode.type = 'lowpass';
      const percentage = (100 + value) / 95; 
      const freq = 100 + (percentage * percentage) * 10000;
      this.filterNode.frequency.setTargetAtTime(Math.max(100, freq), this.ctx.currentTime, 0.1);
      this.filterNode.Q.value = 1;
    } else if (value > 5) {
      this.filterNode.type = 'highpass';
      const freq = (value / 100) * 8000;
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
      this.filterNode.Q.value = 1;
    } else {
      this.filterNode.type = 'peaking';
      this.filterNode.frequency.setTargetAtTime(1000, this.ctx.currentTime, 0.1);
      this.filterNode.gain.value = 0;
    }
  }

  scheduleNote(time: number) {
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    
    // Connect to InputGain instead of filter directly to share effect chain
    osc.connect(noteGain);
    noteGain.connect(this.inputGain); 

    if (this.deckId === DeckId.A) {
      if (this.beatCount % 1 === 0) {
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        noteGain.gain.setValueAtTime(1.0, time);
        noteGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.start(time);
        osc.stop(time + 0.5);
      }
    } else {
      if (this.beatCount % 1 === 0.5) { 
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, time);
        osc.detune.value = (Math.random() * 200) - 100;
        noteGain.gain.setValueAtTime(0.5, time);
        noteGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
      }
    }
  }

  scheduler() {
    const secondsPerBeat = 60.0 / this.bpm;
    const scheduleAheadTime = 0.1;

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      this.nextNoteTime += (secondsPerBeat); 
      this.beatCount += 1;
    }
    
    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), 25);
    }
  }

  play() {
    if (this.isPlaying) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.isPlaying = true;

    if (this.audioBuffer) {
      this.sourceNode = this.ctx.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      // Connect to InputGain so effects/trim apply
      this.sourceNode.connect(this.inputGain); 
      this.sourceNode.loop = false; 
      
      const offset = this.pausedAt % this.audioBuffer.duration;
      this.startedAt = this.ctx.currentTime - offset;
      
      this.sourceNode.start(0, offset);
    } else {
      this.nextNoteTime = Math.max(this.ctx.currentTime, this.nextNoteTime);
      this.scheduler();
    }
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.audioBuffer && this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.pausedAt = this.ctx.currentTime - this.startedAt;
      } catch (e) {}
      this.sourceNode = null;
    } else {
      window.clearTimeout(this.timerID);
    }
  }
  
  seek(time: number) {
      const wasPlaying = this.isPlaying;
      if (wasPlaying) this.pause();
      this.pausedAt = time;
      if (wasPlaying) this.play();
  }
}

class AudioEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  deckA: DeckSynth;
  deckB: DeckSynth;
  
  constructor() {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    this.deckA = new DeckSynth(this.ctx, DeckId.A);
    this.deckB = new DeckSynth(this.ctx, DeckId.B);
    
    // Connect Decks Post-Fader Output to Master
    this.deckA.faderGain.connect(this.masterGain);
    this.deckB.faderGain.connect(this.masterGain);
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(vol: number) {
      // Vol is 0.0 to 1.0. 
      // Using a square curve feels more natural for volume
      this.masterGain.gain.setTargetAtTime(vol * vol, this.ctx.currentTime, 0.05);
  }

  async loadTrack(deckId: DeckId, url: string) {
      const deck = deckId === DeckId.A ? this.deckA : this.deckB;
      deck.pause(); 
      return await deck.loadTrack(url);
  }
  
  seek(deckId: DeckId, time: number) {
      const deck = deckId === DeckId.A ? this.deckA : this.deckB;
      deck.seek(time);
  }

  triggerSample(freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle') {
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

export const audioEngine = new AudioEngine();

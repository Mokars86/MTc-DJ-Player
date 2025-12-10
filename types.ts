
export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: number; // in seconds
  coverUrl: string;
  genre: string;
  moodIntensity: number; // 1-100
  audioSrc?: string; // URL for local file playback
}

export enum DeckId {
  A = 'A',
  B = 'B'
}

export interface DeckState {
  track: Track | null;
  isPlaying: boolean;
  volume: number; // Channel Fader
  gain: number; // Input Trim (0-100)
  pitch: number;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  filter: number; // -100 to 100 (LPF to HPF)
  loopActive: boolean;
  loopLength: number;
  cuePoints: (number | null)[]; // Array of timestamps
  currentTime: number;
  activeEffects: EffectType[];
}

export interface MixerState {
  crossfader: number; // -1 (A) to 1 (B)
  masterVolume: number;
}

export enum AppMode {
  DJ = 'DJ',
  MEDIA = 'MEDIA',
  LIVE = 'LIVE',
  STUDIO = 'STUDIO'
}

export enum EffectType {
  REVERB = 'Reverb Sphere',
  DELAY = 'Delay Tube',
  FLANGER = 'Flanger Cloud',
  BITCRUSH = 'Bitcrush Spark',
  FILTER_SWEEP = 'Sweep',
}

export interface Sample {
  id: string;
  name: string;
  color: string;
  type: 'drum' | 'fx' | 'vocal' | 'synth';
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

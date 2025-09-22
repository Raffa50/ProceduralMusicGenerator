import type { Mode } from './musicTheory'
import { NOTE_TO_PC, chordFromRoman, scalePitches } from './musicTheory'

export type Style = 'pop' | 'house' | 'lofi' | 'cinematic';

export type Params = {
  bpm: number;
  tonic: string; // 'C', 'D#', 'F#', etc.
  mode: Mode;
  progression: string[]; // e.g. ['I','V','vi','IV']
  bars: number; // total bars, multiple of 4 recommended
  style: Style;
  humanize: number; // 0..1
  densities: { drums: number; bass: number; chords: number; arp: number; lead: number; };
}

export type NoteEvent = {
  step: number;          // 16th-note step index from start
  midi: number;          // midi note number
  dur: number;           // duration in steps (1 step = 1/16)
  vel: number;           // 0..1
}

export type Song = {
  params: Params;
  tracks: {
    drumsKick: NoteEvent[];
    drumsSnare: NoteEvent[];
    drumsHat: NoteEvent[];
    bass: NoteEvent[];
    chords: NoteEvent[];
    arp: NoteEvent[];
    lead: NoteEvent[];
  }
};

const STEPS_PER_BAR = 16;

// PRNG deterministico (mulberry32)
export function mulberry32(seed: number) {
  let t = seed;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

function rand() { return Math.random(); }
function choice<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
function choiceSeeded<T>(arr: T[], randFn: () => number): T {
  return arr[Math.floor(randFn() * arr.length)];
}

export function defaultParams(): Params {
  return {
    bpm: 80,
    tonic: 'C',
    mode: 'major',
    progression: ['I','V','vi','IV'],
    bars: 8,
    style: 'pop',
    humanize: 0.15,
    densities: { drums: 0.9, bass: 1, chords: 1, arp: 0.7, lead: 0.9 }
  }
}

export function generate(params: Params, seed?: number): Song {
  const randFn = seed !== undefined ? mulberry32(seed) : Math.random;
  const tonicPc = NOTE_TO_PC[params.tonic] ?? 0;
  const stepsTotal = params.bars * STEPS_PER_BAR;
  const prog = params.progression;
  const tracks = {
    drumsKick: [] as NoteEvent[],
    drumsSnare: [] as NoteEvent[],
    drumsHat: [] as NoteEvent[],
    bass: [] as NoteEvent[],
    chords: [] as NoteEvent[],
    arp: [] as NoteEvent[],
    lead: [] as NoteEvent[],
  };

  // --- Harmony per bar ---
  const chordsPerBar: number[][] = [];
  for (let bar=0; bar<params.bars; bar++) {
    const roman = prog[bar % prog.length];
    const chord = chordFromRoman(roman, tonicPc, params.mode, 60);
    chordsPerBar.push(chord);
    // sustained chord
    if (rand() < params.densities.chords) {
      tracks.chords.push({
        step: bar*STEPS_PER_BAR,
        midi: chord[0],
        dur: STEPS_PER_BAR,
        vel: 0.7
      });
      // add third and fifth as stacked sustained notes
      tracks.chords.push({
        step: bar*STEPS_PER_BAR,
        midi: chord[1],
        dur: STEPS_PER_BAR,
        vel: 0.65
      });
      tracks.chords.push({
        step: bar*STEPS_PER_BAR,
        midi: chord[2],
        dur: STEPS_PER_BAR,
        vel: 0.65
      });
    }
  }

  // --- Drums ---
  const drumDensity = params.densities.drums;
  for (let bar=0; bar<params.bars; bar++) {
    const base = bar*STEPS_PER_BAR;
    // Kick patterns by style
    const kickBeats = params.style === 'house'
      ? [0, 4, 8, 12] // four-on-the-floor
      : [0, 8, (rand()<0.6?6:-1), (rand()<0.6?14:-1)].filter(x => x>=0);
    for (const k of kickBeats) {
      if (rand() <= drumDensity) tracks.drumsKick.push({ step: base+k, midi: 36, dur: 2, vel: 0.9 });
    }
    // Snare backbeats
    [4,12].forEach(s => {
      if (rand() <= drumDensity) tracks.drumsSnare.push({ step: base+s, midi: 38, dur: 2, vel: 0.9 });
    });
    // Hats 8th with small gaps
    for (let st=0; st<STEPS_PER_BAR; st+=2) {
      if (rand() < drumDensity * 0.9) tracks.drumsHat.push({ step: base+st, midi: 42, dur: 1, vel: 0.5 + (rand()*0.2-0.1) });
    }
  }

  // --- Bass: roots and passing ---
  for (let bar=0; bar<params.bars; bar++) {
    const base = bar*STEPS_PER_BAR;
    const chord = chordsPerBar[bar];
    const rootPc = chord[0] % 12;
    // place bass around C2 (36)
    const root = nearestPcInRange(rootPc, 36, 52);
    for (let beat=0; beat<4; beat++) {
      if (rand() < params.densities.bass) {
        const st = base + beat*4;
        const note = (beat===3 && rand()<0.6)
          ? nearestPcInRange((rootPc+11)%12, 36, 52) // leading tone below
          : root;
        tracks.bass.push({ step: st, midi: note, dur: 4, vel: 0.85 });
      }
    }
  }

  // --- Arpeggio ---
  for (let bar=0; bar<params.bars; bar++) {
    if (rand() > params.densities.arp) continue;
    const base = bar*STEPS_PER_BAR;
    const chord = chordsPerBar[bar];
    const arpNotes = [chord[0], chord[1], chord[2], chord[1]+12];
    const pattern = [0,1,2,1, 0,2,3,2, 0,1,2,3, 2,1,0,1];
    for (let i=0;i<16;i++) {
      tracks.arp.push({
        step: base+i,
        midi: arpNotes[pattern[i]%arpNotes.length],
        dur: 1,
        vel: 0.55
      });
    }
  }

  // --- Lead melody ---
  const scale = scalePitches(tonicPc, params.mode, 60, 84);
  const chordTones = (bar: number) => {
    const c = chordsPerBar[bar];
    return [c[0],c[1],c[2], c[0]+12, c[1]+12, c[2]+12];
  };
  let contourPeakBar = Math.max(1, Math.min(params.bars-2, Math.floor(params.bars*0.7)));
  for (let bar=0; bar<params.bars; bar++) {
    for (let st=0; st<16; st+=2) { // 8th notes
      if (rand() > params.densities.lead) continue;
      const base = bar*STEPS_PER_BAR + st;
      const useChord = rand() < 0.65;
      const pool = useChord ? chordTones(bar) : scale;
      // melodic contour: push higher near the peak bar
      const bias = Math.max(0, (bar - contourPeakBar));
      const n = pool[Math.floor(rand()*pool.length)];
      const add = (bias<0 ? 0 : Math.min(12, bias*2)); // rise after peak? (simple shaping)
      const midi = Math.min(90, n + add);
      const vel = 0.6 + (rand()*0.1-0.05);
      tracks.lead.push({ step: base, midi, dur: 2, vel });
    }
  }

  // humanize
  const jitter = Math.floor(2 * params.humanize * 100) / 100; // kept for player (timing offset in seconds)
  (tracks as any)._humanize = jitter;

  return { params, tracks };
}

function nearestPcInRange(pc: number, low: number, high: number): number {
  let best = low;
  let minDiff = 999;
  for (let m=low; m<=high; m++) {
    if (m % 12 === pc) {
      const diff = Math.abs(m - (low + high)/2);
      if (diff < minDiff) { minDiff = diff; best = m; }
    }
  }
  return best;
}
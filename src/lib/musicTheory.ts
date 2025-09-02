export type Mode = 'major' | 'minor';

export const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0
};

export const PC_NAMES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

export function romanToIndex(roman: string): number {
  const r = roman.replace(/[^IVi]/g,'').toUpperCase();
  const map: Record<string, number> = { I:0, II:1, III:2, IV:3, V:4, VI:5, VII:6 };
  return map[r] ?? 0;
}

export function scaleDegrees(mode: Mode): number[] {
  // semitone offsets from tonic
  return mode === 'major'
    ? [0,2,4,5,7,9,11]
    : [0,2,3,5,7,8,10]; // natural minor (aeolian)
}

export function triadQuality(mode: Mode, degreeIdx: number): 'maj'|'min'|'dim' {
  if (mode === 'major') {
    return (['maj','min','min','maj','maj','min','dim'] as const)[degreeIdx];
  } else {
    return (['min','dim','maj','min','min','maj','maj'] as const)[degreeIdx];
  }
}

export function triadIntervals(kind: 'maj'|'min'|'dim'): number[] {
  if (kind === 'maj') return [0,4,7];
  if (kind === 'min') return [0,3,7];
  return [0,3,6];
}

export function nearestMidiForPc(baseMidi: number, pc: number): number {
  // choose pitch between baseMidi and baseMidi+11 that matches pc
  for (let i=0;i<12;i++) {
    const cand = baseMidi + i;
    if (cand % 12 === pc) return cand;
  }
  return baseMidi;
}

export function chordFromRoman(roman: string, tonicPc: number, mode: Mode, baseMidi=60): number[] {
  const degIdx = romanToIndex(roman);
  const degs = scaleDegrees(mode);
  const rootPc = (tonicPc + degs[degIdx]) % 12;
  const qual = triadQuality(mode, degIdx);
  const ints = triadIntervals(qual);
  const rootMidi = nearestMidiForPc(baseMidi, rootPc);
  return ints.map(semi => rootMidi + semi);
}

export function scalePitches(tonicPc: number, mode: Mode, lowMidi=48, highMidi=84): number[] {
  const pcs = scaleDegrees(mode).map(d => (tonicPc + d) % 12);
  const out: number[] = [];
  for (let m=lowMidi; m<=highMidi; m++) {
    if (pcs.includes(m % 12)) out.push(m);
  }
  return out;
}

export function nameForPc(pc: number): string {
  return PC_NAMES[pc % 12];
}
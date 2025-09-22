import * as Tone from 'tone'
import type { Song, NoteEvent } from './generator'

export type Player = {
  start(): Promise<void>;
  stop(): void;
  dispose(): void;
  setVolumes(vols: Partial<Record<'kick'|'snare'|'hat'|'bass'|'chords'|'arp'|'lead'|'master', number>>): void;
  setFx(opts: { reverb: number; delay: number; pump: number }): void;
}

export async function createPlayer(song: Song): Promise<Player> {
  await Tone.start();

  // Master FX chain
  const comp = new Tone.Compressor({ threshold: -24, ratio: 3, attack: 0.01, release: 0.2 });
  const chorus = new Tone.Chorus({ wet: 0.0, frequency: 1.5, depth: 0.7 }).start();
  const dist = new Tone.Distortion(0.0);
  const reverb = new Tone.Reverb({ decay: 2.8, wet: 0.15 });
  const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.25, wet: 0.1 });
  const pump = new Tone.Tremolo({ frequency: '4n', depth: 0.0, spread: 0 }).start();

  // Catena effetti: comp -> chorus -> dist -> reverb -> delay -> pump -> master
  comp.connect(chorus);
  chorus.connect(dist);
  dist.connect(reverb);
  reverb.connect(delay);
  delay.connect(pump);
  pump.toDestination();

  // Instruments
  const kick = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 8, envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.2 }}).connect(comp);
  const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).connect(comp);
  const hat = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.08, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).connect(comp);
  const bass = new Tone.MonoSynth({ oscillator: { type: 'square' }, filter: { frequency: 600 }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.2 } }).connect(comp);
  const chords = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.6 } }).connect(comp);
  const arp = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.1 } }).connect(comp);
  const lead = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.2 } }).connect(comp);

  // Volumes (in dB)
  const vols = {
    kick: new Tone.Volume(-6).connect(comp),
    snare: new Tone.Volume(-10).connect(comp),
    hat: new Tone.Volume(-14).connect(comp),
    bass: new Tone.Volume(-8).connect(comp),
    chords: new Tone.Volume(-10).connect(comp),
    arp: new Tone.Volume(-14).connect(comp),
    lead: new Tone.Volume(-9).connect(comp),
    master: new Tone.Volume(0).connect(pump)
  };
  // rewire instruments through volumes
  kick.disconnect(); kick.connect(vols.kick);
  snare.disconnect(); snare.connect(vols.snare);
  hat.disconnect(); hat.connect(vols.hat);
  bass.disconnect(); bass.connect(vols.bass);
  chords.disconnect(); chords.connect(vols.chords);
  arp.disconnect(); arp.connect(vols.arp);
  lead.disconnect(); lead.connect(vols.lead);

  const parts: Tone.Part[] = [];

  function schedule(partEvents: NoteEvent[], cb: (time: number, ev: NoteEvent) => void) {
    const part = new Tone.Part((time, ev: NoteEvent) => {
      const jitter = (song.tracks as any)._humanize ?? 0;
      cb(time + (Math.random()*2-1) * jitter, ev);
    }, partEvents.map(ev => ({ time: stepToTime(ev.step), ...ev })) as any);
    part.start(0);
    parts.push(part);
  }

  function stepToTime(step: number): string {
    const bar = Math.floor(step / 16);
    const sInBar = step % 16;
    const beat = Math.floor(sInBar / 4);
    const sixteenth = sInBar % 4;
    return `${bar}:${beat}:${sixteenth}`;
  }

  // schedule tracks
  schedule(song.tracks.drumsKick, (time, ev) => {
    kick.triggerAttackRelease('C2', '8n', time, ev.vel);
  });
  schedule(song.tracks.drumsSnare, (time, ev) => {
    snare.triggerAttackRelease('8n', time, ev.vel);
  });
  schedule(song.tracks.drumsHat, (time, ev) => {
    hat.triggerAttackRelease('16n', time, ev.vel);
  });
  schedule(song.tracks.bass, (time, ev) => {
    bass.triggerAttackRelease(Tone.Frequency(ev.midi, 'midi').toNote(), '4n', time, ev.vel);
  });
  schedule(song.tracks.chords, (time, ev) => {
    chords.triggerAttackRelease([Tone.Frequency(ev.midi, 'midi').toNote()], '1m', time, ev.vel);
  });
  schedule(song.tracks.arp, (time, ev) => {
    arp.triggerAttackRelease([Tone.Frequency(ev.midi, 'midi').toNote()], '16n', time, ev.vel);
  });
  schedule(song.tracks.lead, (time, ev) => {
    lead.triggerAttackRelease(Tone.Frequency(ev.midi, 'midi').toNote(), '8n', time, ev.vel);
  });

  Tone.Transport.bpm.value = song.params.bpm;
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = 0;
  Tone.Transport.loopEnd = `${song.params.bars}:0:0`;

  // Funzione per aggiornare la catena degli effetti in base ai flag enabled
  function updateFxChain(opts: any) {
    // Scollega tutto
    comp.disconnect(); chorus.disconnect(); dist.disconnect(); reverb.disconnect(); delay.disconnect(); pump.disconnect();
    // Catena dinamica
    let last = comp;
    if (opts.compressorEnabled === false) last = comp;
    if (opts.chorusEnabled !== false) { last.connect(chorus); last = chorus; }
    if (opts.distorsionEnabled !== false) { last.connect(dist); last = dist; }
    if (opts.reverbEnabled !== false) { last.connect(reverb); last = reverb; }
    if (opts.delayEnabled !== false) { last.connect(delay); last = delay; }
    if (opts.pumpEnabled !== false) { last.connect(pump); last = pump; }
    last.toDestination();
  }

  // Funzione per aggiornare gli effetti
  function setFx(opts: any) {
    if (opts.reverb !== undefined) reverb.wet.value = opts.reverb;
    if (opts.reverbDecay !== undefined) reverb.decay = opts.reverbDecay;
    if (opts.delay !== undefined) delay.wet.value = opts.delay;
    if (opts.delayFeedback !== undefined) delay.feedback.value = opts.delayFeedback;
    if (opts.pump !== undefined) pump.depth.value = opts.pump;
    if (opts.compressorThreshold !== undefined) comp.threshold.value = opts.compressorThreshold;
    if (opts.compressorRatio !== undefined) comp.ratio.value = opts.compressorRatio;
    if (opts.chorusWet !== undefined) chorus.wet.value = opts.chorusWet;
    if (opts.chorusRate !== undefined) chorus.frequency.value = opts.chorusRate;
    if (opts.chorusDepth !== undefined) chorus.depth = opts.chorusDepth;
    if (opts.distorsionAmount !== undefined) dist.distortion = opts.distorsionAmount;
    // Aggiorna la catena degli effetti
    updateFxChain(opts);
  }

  return {
    start: async () => {
      await Tone.start();
      Tone.Transport.start();
    },
    stop: () => {
      Tone.Transport.stop();
      parts.forEach(p => p.clear());
    },
    dispose: () => {
      Tone.Transport.stop();
      parts.forEach(p => p.dispose());
      comp.dispose();
      chorus.dispose();
      dist.dispose();
      reverb.dispose();
      delay.dispose();
      pump.dispose();
      kick.dispose();
      snare.dispose();
      hat.dispose();
      bass.dispose();
      chords.dispose();
      arp.dispose();
      lead.dispose();
      Object.values(vols).forEach(v => v.dispose());
    },
    setVolumes: (v) => {
      Object.entries(v).forEach(([k, val]) => {
        if (vols[k as keyof typeof vols]) vols[k as keyof typeof vols].volume.value = val;
      });
    },
    setFx,
  }
}
import { Midi } from '@tonejs/midi';
import type { Song, NoteEvent } from './generator';

const TRACKS = [
  { key: 'drumsKick', name: 'Kick', channel: 9 },
  { key: 'drumsSnare', name: 'Snare', channel: 9 },
  { key: 'drumsHat', name: 'Hat', channel: 9 },
  { key: 'bass', name: 'Bass', channel: 1 },
  { key: 'chords', name: 'Chords', channel: 2 },
  { key: 'arp', name: 'Arp', channel: 3 },
  { key: 'lead', name: 'Lead', channel: 4 },
] as const;

type TrackKey = typeof TRACKS[number]['key'];
// Aggiungi il tipo TrackName per chiarezza
export type TrackName = 'bass' | 'chords' | 'arp' | 'lead';

export function exportSongToMidi(song: Song, instruments?: Record<TrackName, number>): Uint8Array {
  const midi = new Midi();
  console.log("Exporting song to MIDI with BPM:", song.params.bpm);
  midi.header.setTempo(song.params.bpm);

  for (const trackInfo of TRACKS) {
    const events: NoteEvent[] = song.tracks[trackInfo.key as TrackKey];
    const track = midi.addTrack();
    track.name = trackInfo.name;
    track.channel = trackInfo.channel;
    // Imposta il program change solo per le tracce melodiche
    if (instruments && ['bass','chords','arp','lead'].includes(trackInfo.key)) {
      track.instrument.number = instruments[trackInfo.key as TrackName] ?? 0;
    }
    for (const note of events) {
      track.addNote({
        midi: note.midi,
        time: note.step * 0.25, // 1 step = 0.25 quarter notes
        duration: note.dur * 0.25,
        velocity: note.vel,
      });
    }
  }
  return midi.toArray();
}

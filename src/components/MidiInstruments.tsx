import React from 'react';

export type MidiInstrument = { name: string; program: number };
export type TrackName = 'bass' | 'chords' | 'arp' | 'lead';

interface MidiInstrumentsProps {
  instruments: Record<TrackName, number>;
  setInstruments: (inst: Record<TrackName, number>) => void;
  GM_INSTRUMENTS: MidiInstrument[];
}

export const MidiInstruments: React.FC<MidiInstrumentsProps> = ({ instruments, setInstruments, GM_INSTRUMENTS }) => {
  const TRACKS: TrackName[] = ['bass', 'chords', 'arp', 'lead'];

  // Fallback di debug: mostra un messaggio se le props sono undefined/null
  if (!instruments || !setInstruments || !GM_INSTRUMENTS) {
    return <div style={{ color: 'red', padding: 16 }}>Error: MidiInstruments props not defined</div>;
  }

  function handleChange(track: TrackName, program: number) {
    setInstruments({ ...instruments, [track]: program });
  }

  return (
    <div style={{ padding: 16, minWidth: 260 }}>
      <h3>MIDI Instruments</h3>
      {TRACKS.map(track => (
        <div key={track} style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>{track.charAt(0).toUpperCase() + track.slice(1)}:</label>
          <select
            value={instruments[track]}
            onChange={e => handleChange(track, Number(e.target.value))}
          >
            {GM_INSTRUMENTS.map(inst => (
              <option key={inst.program} value={inst.program}>{inst.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

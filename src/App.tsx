import React from 'react'
import { StyleAndHarmony } from './components/StyleAndHarmony'
import { MixerFx } from './components/MixerFx'
import { defaultParams, generate, type Params, type Song } from './lib/generator'
import { createPlayer, type Player } from './lib/player'
import { exportSongToMidi } from './lib/midiExport'
import { MidiInstruments } from './components/MidiInstruments'
import { FxParams } from './lib/FxParams'

export default function App(){
  const [params, setParams] = React.useState<Params>(() => ({
    ...defaultParams(),
  }));
  const [song, setSong] = React.useState<Song | null>(null);
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [volumes, setVolumes] = React.useState<Record<'kick'|'snare'|'hat'|'bass'|'chords'|'arp'|'lead'|'master', number>>({
    kick: -6, snare: -10, hat: -14, bass: -8, chords: -10, arp: -14, lead: -9, master: 0
  });
  // Stato effetti esteso
  const [fx, setFx] = React.useState<FxParams>(new FxParams());
  const [seed, setSeed] = React.useState<number>(() => Math.floor(Math.random()*1000000));

  // Mappa strumenti General MIDI principali
  const GM_INSTRUMENTS = [
    { name: 'Acoustic Grand Piano', program: 0 },
    { name: 'Electric Piano', program: 4 },
    { name: 'Drawbar Organ', program: 16 },
    { name: 'Acoustic Guitar', program: 24 },
    { name: 'Electric Guitar', program: 27 },
    { name: 'Fingered Bass', program: 33 },
    { name: 'Synth Bass', program: 38 },
    { name: 'Strings', program: 48 },
    { name: 'Synth Strings', program: 51 },
    { name: 'Choir', program: 52 },
    { name: 'Trumpet', program: 56 },
    { name: 'Sax', program: 65 },
    { name: 'Synth Lead', program: 80 },
    { name: 'Synth Pad', program: 88 },
  ];

  const TRACKS = ['bass', 'chords', 'arp', 'lead'] as const;
  type TrackName = typeof TRACKS[number];

  const defaultInstruments: Record<TrackName, number> = {
    bass: 33, // Fingered Bass
    chords: 4, // Electric Piano
    arp: 80, // Synth Lead
    lead: 88, // Synth Pad
  };

  const [instruments, setInstruments] = React.useState<Record<TrackName, number>>(defaultInstruments);

  // Stato per la durata della canzone in secondi
  const [songDuration, setSongDuration] = React.useState(60); // default 60s

  function regen(){
    const s = generate(params, seed);
    setSong(s);
  }

  async function play(){
    if (!song) regen();
    const s = song ?? generate(params, seed);
    setSong(s);
    if (player) { player.dispose(); setPlayer(null); }
    const p = await createPlayer(s);
    p.setVolumes(volumes);
    p.setFx(fx);
    await p.start();
    setPlayer(p);
    setPlaying(true);
  }

  function stop(){
    player?.stop();
    player?.dispose();
    setPlayer(null);
    setPlaying(false);
  }

  async function exportMidi() {
    if (!song) return;
    const midiData = exportSongToMidi(song, instruments);
    // @ts-ignore
      const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'procedural-song.mid';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Aggiorna la song ogni volta che cambiano BPM, strumenti, durata, seed o params
  React.useEffect(() => {
    const s = generate(params, seed);
    setSong(s);
  }, [params.bpm, params.bars, instruments, seed]);

  // Aggiorna il numero di barre in base a durata e BPM
  React.useEffect(() => {
    const barSeconds = (60 / params.bpm) * 4;
    const bars = Math.max(4, Math.round(songDuration / barSeconds));
    setParams(p => ({ ...p, bars }));
  }, [songDuration, params.bpm]);

  React.useEffect(()=>{
    player?.setVolumes(volumes);
  }, [volumes, player]);

  React.useEffect(()=>{
    player?.setFx(fx);
  }, [fx, player]);

  return (
    <div className="app-container">
      <h1>🎛️ Procedural Music Generator</h1>
      <div className="panel">
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24 }}>
          <StyleAndHarmony
            tonic={params.tonic}
            setTonic={t => setParams(p => ({ ...p, tonic: t }))}
            mode={params.mode}
            setMode={m => setParams(p => ({ ...p, mode: m }))}
            progression={params.progression}
            setProgression={pr => setParams(p => ({ ...p, progression: pr }))}
            style={params.style}
            setStyle={s => setParams(p => ({ ...p, style: s }))}
            setBpm={n => setParams(p => ({ ...p, bpm: n }))}
          />
          <MidiInstruments
              instruments={instruments}
              setInstruments={newInstruments => setInstruments(newInstruments)}
              GM_INSTRUMENTS={GM_INSTRUMENTS}
            />
        </div>
        <div className="row" style={{marginTop: 10}}>
          <button className="btn" onClick={()=>regen()}>Rigenera fraseggio</button>
          <button className="btn" onClick={exportMidi} disabled={!song}>Esporta MIDI</button>
          <label style={{marginLeft:16}}>
            Seed:
            <input
              type="number"
              value={seed}
              min={0}
              max={999999999}
              style={{width:100, marginLeft:8}}
              onChange={e => setSeed(Number(e.target.value))}
            />
            <button style={{marginLeft:8}} onClick={()=>setSeed(Math.floor(Math.random()*1000000))}>Random</button>
          </label>
        </div>
        <div className="row" style={{marginTop: 16}}>
          <label>BPM:
            <input type="number" value={params.bpm} min={60} max={180} style={{width:60, marginLeft:8}}
              onChange={e=>setParams(p=>({...p, bpm: Math.max(60, Math.min(180, parseInt(e.target.value||'0')))}))} />
          </label>
          <label style={{marginLeft:16}}>Barre:
            <input type="number" value={params.bars} min={4} max={32} style={{width:40, marginLeft:8}}
              onChange={e=>setParams(p=>({...p, bars: Math.max(4, Math.min(32, parseInt(e.target.value||'0')))}))} />
          </label>
          <label style={{marginLeft:16}}>Durata (s):
            <input type="number" value={songDuration} min={10} max={600} style={{width:60, marginLeft:8}}
              onChange={e=>setSongDuration(Math.max(10, Math.min(600, parseInt(e.target.value||'0'))))} />
          </label>
          <label style={{marginLeft:16}}>Umanizzazione
            <input type="range" min={0} max={1} step={0.01} value={params.humanize}
              onChange={e=>setParams(p=>({...p, humanize: parseFloat(e.target.value)}))} />
          </label>

            {playing ? (
                <button className="btn danger" onClick={stop}>Stop</button>
            ) : (
                <button className="btn primary" onClick={play}>Play</button>
            )}
        </div>
      </div>
      <MixerFx
        volumes={volumes}
        setVolumes={(v)=>setVolumes(prev=>({...prev, ...v}))}
        fx={fx}
        setFx={(f)=>setFx(prev=>({...prev, ...f}))}
      />
      <div className="panel footer">
        <div>Scorciatoie: <span className="kbd">Play</span>/<span className="kbd">Stop</span>. Regola i volumi per bilanciare le parti.</div>
        <div className="small">MVP: export MIDI non ancora incluso. Se lo desideri, posso aggiungerlo con <i>midi-writer-js</i>.</div>
      </div>
    </div>
  )
}
import React from 'react'
import { TransportControls } from './components/Transport'
import { StyleAndHarmony } from './components/StyleAndHarmony'
import { MixerFx } from './components/MixerFx'
import { defaultParams, generate, type Params, type Song } from './lib/generator'
import { createPlayer, type Player } from './lib/player'
import { exportSongToMidi } from './lib/midiExport'

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
  const [fx, setFx] = React.useState({ reverb: 0.15, delay: 0.1, pump: 0.0 });

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
    const s = generate(params);
    setSong(s);
  }

  async function play(){
    if (!song) regen();
    const s = song ?? generate(params);
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
    <div className="container">
      <h1>🎛️ Procedural Music Generator</h1>
      <p className="small">Genera musica multi–traccia con armonia guidata. <span className="kbd">Play</span> per ascoltare, <span className="kbd">Stop</span> per fermare. Regola BPM, tonalità, progressioni ed effetti.</p>

      <div className="grid grid-2" style={{marginTop: 16}}>
        <div className="grid" style={{alignContent:'start'}}>
          <TransportControls
            bpm={params.bpm}
            setBpm={(n)=>setParams(p=>({...p, bpm: Math.max(60, Math.min(160, n))}))}
            onPlay={play}
            onStop={stop}
            playing={playing}
          />
          <StyleAndHarmony
            tonic={params.tonic}
            setTonic={v=>setParams(p=>({...p, tonic: v}))}
            mode={params.mode}
            setMode={v=>setParams(p=>({...p, mode: v}))}
            progression={params.progression}
            setProgression={v=>setParams(p=>({...p, progression: v}))}
            style={params.style}
            setStyle={v=>setParams(p=>({...p, style: v}))}
            setBpm={n=>setParams(p=>({...p, bpm: n}))}
          />
          <div className="panel">
            <h3>Controllo generazione</h3>
            <div className="row" style={{marginTop: 10}}>
              <button className="btn" onClick={()=>regen()}>Rigenera fraseggio</button>
              <button className="btn" onClick={exportMidi} disabled={!song}>Esporta MIDI</button>
              <div>
                <label>Umanizzazione</label>
                <input type="range" min={0} max={1} step={0.01} value={params.humanize}
                       onChange={e=>setParams(p=>({...p, humanize: parseFloat(e.target.value)}))} />
              </div>
              <div>
                <label>Barre</label>
                <input type="number" min={4} max={32} value={params.bars}
                       onChange={e=>setParams(p=>({...p, bars: Math.max(4, Math.min(32, parseInt(e.target.value||'0')))}))} />
              </div>
              <div>
                <label>Durata (secondi)</label>
                <input type="number" min={10} max={600} value={songDuration}
                       onChange={e=>setSongDuration(Math.max(10, Math.min(600, parseInt(e.target.value||'0'))))} />
              </div>
            </div>
            <div style={{marginTop: 16}}>
              <h4>Strumenti MIDI</h4>
              {TRACKS.map(track => (
                <div key={track} style={{marginBottom: 8}}>
                  <label style={{marginRight: 8, minWidth: 60, display: 'inline-block'}}>{track.charAt(0).toUpperCase() + track.slice(1)}:</label>
                  <select
                    value={instruments[track]}
                    onChange={e => setInstruments(prev => ({ ...prev, [track]: parseInt(e.target.value) }))}
                  >
                    {GM_INSTRUMENTS.map(inst => (
                      <option key={inst.program} value={inst.program}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <p className="small">Tip: usa <b>I–V–vi–IV</b> per pop, <b>ii–V–I</b> per sapore jazz, <b>i–VII–VI–V</b> per mood andaluso.</p>
          </div>
        </div>
        <div className="grid" style={{alignContent:'start'}}>
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
      </div>
    </div>
  )
}
import React from 'react'

export function MixerFx(props: {
  volumes: Record<'kick'|'snare'|'hat'|'bass'|'chords'|'arp'|'lead'|'master', number>,
  setVolumes: (v: Partial<Record<'kick'|'snare'|'hat'|'bass'|'chords'|'arp'|'lead'|'master', number>>) => void,
  fx: { reverb: number; delay: number; pump: number },
  setFx: (f: { reverb?: number; delay?: number; pump?: number }) => void
}){
  const names: Array<[keyof typeof props.volumes, string]> = [
    ['kick','Kick'], ['snare','Snare'], ['hat','Hat'], ['bass','Basso'], ['chords','Accordi'], ['arp','Arp'], ['lead','Lead'], ['master','Master']
  ];
  return (
    <div className="panel">
      <h3>Mixer & FX</h3>
      <div className="stack">
        {names.map(([k,label]) => (
          <div key={k} className="item">
            <div className="small">{label}</div>
            <input className="vol" type="range" min="-30" max="6" step="1" value={props.volumes[k]}
                   onChange={e=>props.setVolumes({[k]: parseFloat(e.target.value)})} />
          </div>
        ))}
      </div>
      <div className="row" style={{marginTop:12}}>
        <div>
          <label>Riverbero (wet)</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.reverb}
                 onChange={e=>props.setFx({reverb: parseFloat(e.target.value)})} />
        </div>
        <div>
          <label>Delay (wet)</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.delay}
                 onChange={e=>props.setFx({delay: parseFloat(e.target.value)})} />
        </div>
        <div>
          <label>Sidechain / Pump</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.pump}
                 onChange={e=>props.setFx({pump: parseFloat(e.target.value)})} />
        </div>
      </div>
    </div>
  )
}
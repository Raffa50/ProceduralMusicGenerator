import React from 'react'
import { FxParams } from '@/lib/FxParams'

export function MixerFx(props: {
  volumes: Record<'kick'|'snare'|'hat'|'bass'|'chords'|'arp'|'lead'|'master', number>,
  setVolumes: (v: Partial<Record<'kick'|'snare'|'hat'|'bass'|'chords'|'arp'|'lead'|'master', number>>) => void,
  fx: FxParams,
  setFx: (f: Partial<FxParams>) => void
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
      <div className="row" style={{marginTop:12, flexWrap:'wrap', gap:24}}>
        <div>
          <label>
            <input type="checkbox" checked={props.fx.reverbEnabled} onChange={e=>props.setFx({reverbEnabled: e.target.checked})} /> Riverbero
          </label>
          <label>Wet</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.reverb}
                 onChange={e=>props.setFx({reverb: parseFloat(e.target.value)})} disabled={!props.fx.reverbEnabled} />
          <label>Decay</label>
          <input className="slider" type="range" min="0.5" max="6" step="0.1" value={props.fx.reverbDecay}
                 onChange={e=>props.setFx({reverbDecay: parseFloat(e.target.value)})} disabled={!props.fx.reverbEnabled} />
        </div>
        <div>
          <label>
            <input type="checkbox" checked={props.fx.delayEnabled} onChange={e=>props.setFx({delayEnabled: e.target.checked})} /> Delay
          </label>
          <label>Wet</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.delay}
                 onChange={e=>props.setFx({delay: parseFloat(e.target.value)})} disabled={!props.fx.delayEnabled} />
          <label>Feedback</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.delayFeedback}
                 onChange={e=>props.setFx({delayFeedback: parseFloat(e.target.value)})} disabled={!props.fx.delayEnabled} />
        </div>
        <div>
          <label>
            <input type="checkbox" checked={props.fx.pumpEnabled} onChange={e=>props.setFx({pumpEnabled: e.target.checked})} /> Sidechain / Pump
          </label>
          <label>Depth</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.pump}
                 onChange={e=>props.setFx({pump: parseFloat(e.target.value)})} disabled={!props.fx.pumpEnabled} />
        </div>
        <div>
          <label>
            <input type="checkbox" checked={props.fx.compressorEnabled} onChange={e=>props.setFx({compressorEnabled: e.target.checked})} /> Compressor
          </label>
          <label>Threshold</label>
          <input className="slider" type="range" min="-60" max="0" step="1" value={props.fx.compressorThreshold}
                 onChange={e=>props.setFx({compressorThreshold: parseFloat(e.target.value)})} disabled={!props.fx.compressorEnabled} />
          <label>Ratio</label>
          <input className="slider" type="range" min="1" max="10" step="0.1" value={props.fx.compressorRatio}
                 onChange={e=>props.setFx({compressorRatio: parseFloat(e.target.value)})} disabled={!props.fx.compressorEnabled} />
        </div>
        <div>
          <label>
            <input type="checkbox" checked={props.fx.chorusEnabled} onChange={e=>props.setFx({chorusEnabled: e.target.checked})} /> Chorus
          </label>
          <label>Wet</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.chorusWet}
                 onChange={e=>props.setFx({chorusWet: parseFloat(e.target.value)})} disabled={!props.fx.chorusEnabled} />
          <label>Rate</label>
          <input className="slider" type="range" min="0.1" max="5" step="0.1" value={props.fx.chorusRate}
                 onChange={e=>props.setFx({chorusRate: parseFloat(e.target.value)})} disabled={!props.fx.chorusEnabled} />
          <label>Depth</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.chorusDepth}
                 onChange={e=>props.setFx({chorusDepth: parseFloat(e.target.value)})} disabled={!props.fx.chorusEnabled} />
        </div>
        <div>
          <label>
            <input type="checkbox" checked={props.fx.distorsionEnabled} onChange={e=>props.setFx({distorsionEnabled: e.target.checked})} /> Distorsion
          </label>
          <label>Amount</label>
          <input className="slider" type="range" min="0" max="1" step="0.01" value={props.fx.distorsionAmount}
                 onChange={e=>props.setFx({distorsionAmount: parseFloat(e.target.value)})} disabled={!props.fx.distorsionEnabled} />
        </div>
      </div>
    </div>
  )
}
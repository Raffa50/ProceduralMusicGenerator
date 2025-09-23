import React from 'react'
import type { Mode } from '@/lib/musicTheory'

const KEYS = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const PRESETS = [
  { id: 'pop', name: 'Pop easy', mode: 'major' as Mode, tempo: [96,110], progression: ['I','V','vi','IV'] },
  { id: 'house', name: 'House', mode: 'minor' as Mode, tempo: [120,126], progression: ['i','VI','III','VII'] },
  { id: 'lofi', name: 'Lo-Fi', mode: 'minor' as Mode, tempo: [75,85], progression: ['i','iv','VI','V'] },
  { id: 'cinematic', name: 'Cinematic', mode: 'minor' as Mode, tempo: [60,80], progression: ['i','VI','III','VII'] },
];

export function StyleAndHarmony(props: {
  tonic: string, setTonic: (s:string)=>void,
  mode: Mode, setMode: (m:Mode)=>void,
  progression: string[], setProgression: (p:string[])=>void,
  style: 'pop'|'house'|'lofi'|'cinematic', setStyle: (s:any)=>void,
  setBpm: (n:number)=>void
}){
  function applyPreset(id: string) {
    const p = PRESETS.find(x=>x.id===id)!;
    props.setStyle(id as any);
    props.setMode(p.mode);
    props.setProgression(p.progression);
    const mid = Math.round((p.tempo[0]+p.tempo[1])/2);
    props.setBpm(mid);
  }
  return (
    <div className="panel">
      <h3>Style & Harmony</h3>
      <div className="row" style={{marginTop: 8}}>
        <div>
          <label>Preset</label>
          <select value={props.style} onChange={e=>applyPreset(e.target.value)}>
            {PRESETS.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Key</label>
          <select value={props.tonic} onChange={e=>props.setTonic(e.target.value)}>
            {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="seg">
          <button className={props.mode==='major'?'active':''} onClick={()=>props.setMode('major')}>Major</button>
          <button className={props.mode==='minor'?'active':''} onClick={()=>props.setMode('minor')}>Minor</button>
        </div>
      </div>
      <div style={{marginTop: 12}}>
        <label>Chord progression</label>
        <div className="row">
          <select value={props.progression.join('-')} onChange={e=>props.setProgression(e.target.value.split('-'))}>
            <option value="I-V-vi-IV">I–V–vi–IV (Pop)</option>
            <option value="ii-V-I-I">ii–V–I–I (Jazz/Pop)</option>
            <option value="i-VII-VI-V">i–VII–VI–V (Andalusian)</option>
            <option value="i-iv-VI-V">i–iv–VI–V (Lo-Fi)</option>
          </select>
          <span className="small">Tip: change the key to alter the color without changing the structure.</span>
        </div>
      </div>
    </div>
  )
}
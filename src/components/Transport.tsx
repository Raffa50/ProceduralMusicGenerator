import React from 'react'

export function TransportControls(props: {
  bpm: number,
  setBpm: (n:number)=>void,
  onPlay: ()=>void,
  onStop: ()=>void,
  playing: boolean
}) {
  return (
    <div className="panel">
      <h3>Trasporto</h3>
      <div className="row" style={{marginTop: 8}}>
        <div>
          <label>BPM</label>
          <input type="number" value={props.bpm} min={60} max={180} onChange={e=>props.setBpm(parseInt(e.target.value||'0'))} />
        </div>
        {props.playing ? (
          <button className="btn danger" onClick={props.onStop}>Stop</button>
        ) : (
          <button className="btn primary" onClick={props.onPlay}>Play</button>
        )}
        <span className="pill">Loop</span>
      </div>
    </div>
  )
}
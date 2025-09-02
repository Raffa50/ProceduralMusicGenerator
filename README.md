# Procedural Music WebApp (React + TypeScript + Vite + Tone.js)

**Caratteristiche MVP**
- Generazione di musica procedurale multi–traccia: drums, bass, chords, arp, lead.
- Controlli: BPM, tonalità (maggiore/minore), giri di accordi noti, numero di barre, umanizzazione.
- Preset rapidi (Pop, House, Lo-Fi, Cinematic).
- Mixer per volumi delle tracce e FX master (riverbero, delay, sidechain/pump).
- Loop automatico dell’intera struttura (8 barre di default, modificabile).

**Requisiti**
- Node.js 18+ e pnpm / npm / yarn.

**Setup**
```bash
npm install
npm run dev
# apri il link locale mostrato in console
```

**Build**
```bash
npm run build
npm run preview
```

**Note**
- L’audio parte solo dopo un'interazione utente (limitazioni del browser).
- Se vuoi l’export MIDI, chiedi pure: aggiungerò una traccia offline con <code>midi-writer-js</code> o <code>jsmidgen</code>.
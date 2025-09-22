export class FxParams {
  reverb: number = 0.15;
  reverbEnabled: boolean = true;
  reverbDecay: number = 2.8;
  delay: number = 0.1;
  delayEnabled: boolean = true;
  delayFeedback: number = 0.25;
  pump: number = 0.0;
  pumpEnabled: boolean = true;
  compressorThreshold: number = -24;
  compressorEnabled: boolean = true;
  compressorRatio: number = 3;
  chorusWet: number = 0.0;
  chorusEnabled: boolean = true;
  chorusRate: number = 1.5;
  chorusDepth: number = 0.7;
  distorsionAmount: number = 0.0;
  distorsionEnabled: boolean = true;

  constructor(init?: Partial<FxParams>) {
    Object.assign(this, init);
  }
}

export class FxParams {
  reverb: number = 0.15;
  reverbDecay: number = 2.8;
  delay: number = 0.1;
  delayFeedback: number = 0.25;
  pump: number = 0.0;
  compressorThreshold: number = -24;
  compressorRatio: number = 3;
  chorusWet: number = 0.0;
  chorusRate: number = 1.5;
  chorusDepth: number = 0.7;
  distorsionAmount: number = 0.0;

  constructor(init?: Partial<FxParams>) {
    Object.assign(this, init);
  }
}


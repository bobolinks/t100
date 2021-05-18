import { Finger, FingerCurl, FingerDirection } from './FingerDescription';

type QRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export default class GestureDescription {
  name: string;
  curls: QRecord<Finger, any>;
  directions: QRecord<Finger, any>;
  weights: number[];
  weightsRelative: number[];

  constructor(name: string) {

    // name (should be unique)
    this.name = name;

    this.curls = {};
    this.directions = {};

    this.weights = [1.0, 1.0, 1.0, 1.0, 1.0];
    this.weightsRelative = [1.0, 1.0, 1.0, 1.0, 1.0];
  }

  addCurl(finger: Finger, curl: FingerCurl, confidence: number) {
    if (typeof this.curls[finger] === 'undefined') {
      this.curls[finger] = [];
    }
    this.curls[finger].push([curl, confidence]);
  }

  addDirection(finger: Finger, position: FingerDirection, confidence: number) {
    if (typeof this.directions[finger] === 'undefined') {
      this.directions[finger] = [];
    }
    this.directions[finger].push([position, confidence]);
  }

  setWeight(finger: Finger, weight: number) {

    this.weights[finger] = weight;

    // recalculate relative weights
    let total = this.weights.reduce((a, b) => a + b, 0);
    this.weightsRelative = this.weights.map(el => el * 5 / total);
  }

  matchAgainst(detectedCurls: QRecord<Finger, any>, detectedDirections: QRecord<Finger, any>) {

    let confidence = 0.0;

    // look at the detected curl of each finger and compare with
    // the expected curl of this finger inside current gesture
    for (let fingerIdx in detectedCurls) {
      const detectedCurl = detectedCurls[fingerIdx as unknown as Finger];
      const expectedCurls = this.curls[fingerIdx as unknown as Finger];

      if (typeof expectedCurls === 'undefined') {
        // no curl description available for this finger
        // add default confidence of "1"
        confidence += this.weightsRelative[fingerIdx as unknown as Finger];
        continue;
      }

      // compare to each possible curl of this specific finger
      for (const [expectedCurl, score] of expectedCurls) {
        if (detectedCurl == expectedCurl) {
          confidence += score * this.weightsRelative[fingerIdx as unknown as Finger];
          break;
        }
      }
    }

    // same for detected direction of each finger
    for (let fingerIdx in detectedDirections) {
      let detectedDirection = detectedDirections[fingerIdx as unknown as Finger];
      let expectedDirections = this.directions[fingerIdx as unknown as Finger];

      if (typeof expectedDirections === 'undefined') {
        // no direction description available for this finger
        // add default confidence of "1"
        confidence += this.weightsRelative[fingerIdx as unknown as Finger];
        continue;
      }

      // compare to each possible direction of this specific finger
      for (const [expectedDirection, score] of expectedDirections) {
        if (detectedDirection == expectedDirection) {
          confidence += score * this.weightsRelative[fingerIdx as unknown as Finger];
          break;
        }
      }
    }

    return confidence;
  }
}

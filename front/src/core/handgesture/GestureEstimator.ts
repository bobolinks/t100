import FingerPoseEstimator, { EstimatorOptions } from './FingerPoseEstimator';
import { Finger, FingerCurl, FingerDirection } from './FingerDescription';

export default class GestureEstimator {
  estimator: FingerPoseEstimator;
  gestures: any;

  constructor(knownGestures: any, estimatorOptions = {}) {

    this.estimator = new FingerPoseEstimator(estimatorOptions as unknown as EstimatorOptions);

    // list of predefined gestures
    this.gestures = knownGestures;
  }

  estimate(landmarks: { [x: string]: any; }, minConfidence: number) {

    let gesturesFound = [];

    // step 1: get estimations of curl / direction for each finger
    const est = this.estimator.estimate(landmarks);

    let debugInfo = [];
    for (let fingerIdx of Finger.all) {
      debugInfo.push([
        Finger.getName(fingerIdx),
        FingerCurl.getName(est.curls[fingerIdx]),
        FingerDirection.getName(est.directions[fingerIdx])
      ]);
    }

    // step 2: compare gesture description to each known gesture
    for (let gesture of this.gestures) {
      let confidence = gesture.descriptor.matchAgainst(est.curls, est.directions);
      if (confidence >= minConfidence) {
        gesturesFound.push({
          name: gesture.descriptor.name,
          confidence: confidence
        });
      }
    }

    return {
      poseData: debugInfo,
      gestures: gesturesFound
    };
  }
}

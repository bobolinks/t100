export enum Finger {
  Thumb = 0,
  Index,
  Middle,
  Ring,
  Pinky,
};
export namespace Finger {
    // just for convenience
  export const all = [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky];

  const nameMapping = {
    [Finger.Thumb]: 'Thumb',
    [Finger.Index]: 'Index',
    [Finger.Middle]: 'Middle',
    [Finger.Ring]: 'Ring',
    [Finger.Pinky]: 'Pinky'
  };

  // Describes mapping of joints based on the 21 points returned by handpose.
  // Handpose indexes are defined as follows:
  // (all fingers use last index as "finger tip")
  // ---------------------------------------------------------------------------
  // [0]     Palm
  // [1-4]   Thumb
  // [5-8]   Index
  // [9-12]  Middle
  // [13-16] Ring
  // [17-20] Pinky
  const pointsMapping = {
    [Finger.Thumb]: [[0, 1], [1, 2], [2, 3], [3, 4]],
    [Finger.Index]: [[0, 5], [5, 6], [6, 7], [7, 8]],
    [Finger.Middle]: [[0, 9], [9, 10], [10, 11], [11, 12]],
    [Finger.Ring]: [[0, 13], [13, 14], [14, 15], [15, 16]],
    [Finger.Pinky]: [[0, 17], [17, 18], [18, 19], [19, 20]]
  };

  export function getName(value: Finger) {
    return nameMapping[value];
  }

  export function getPoints(value: Finger) {
    return pointsMapping[value] || false;
  }
}

export enum FingerCurl {
  NoCurl = 0,
  HalfCurl,
  FullCurl,
};
export namespace FingerCurl {
  const nameMapping = {
    [FingerCurl.NoCurl]: 'No Curl',
    [FingerCurl.HalfCurl]: 'Half Curl',
    [FingerCurl.FullCurl]: 'Full Curl'
  };

  export function getName(value: FingerCurl) {
    return nameMapping[value];
  }
};

export enum FingerDirection {
  VerticalUp = 0,
  VerticalDown,
  HorizontalLeft,
  HorizontalRight,
  DiagonalUpRight,
  DiagonalUpLeft,
  DiagonalDownRight,
  DiagonalDownLeft,
};

export namespace FingerDirection {
  const nameMapping = {
    0: 'Vertical Up',
    1: 'Vertical Down',
    2: 'Horizontal Left',
    3: 'Horizontal Right',
    4: 'Diagonal Up Right',
    5: 'Diagonal Up Left',
    6: 'Diagonal Down Right',
    7: 'Diagonal Down Left',
  };

  export function getName(value: FingerDirection) {
    return nameMapping[value];
  }
};

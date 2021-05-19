import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';


// describe victory gesture ✌️
const description = new GestureDescription('five');


// thumb:
description.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.5);
description.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.1);
description.addDirection(Finger.Thumb, FingerDirection.DiagonalUpRight, 0.5);

// index:
description.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
description.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 0.5);
description.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.5);

// middle:
description.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
description.addDirection(Finger.Middle, FingerDirection.DiagonalUpLeft, 0.5);
description.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.5);

// ring:
description.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
description.addDirection(Finger.Ring, FingerDirection.DiagonalUpLeft, 0.5);
description.addDirection(Finger.Ring, FingerDirection.DiagonalUpRight, 0.5);

// pinky:
description.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
description.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.5);
description.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.5);

// give additional weight to index and ring fingers

export default description;

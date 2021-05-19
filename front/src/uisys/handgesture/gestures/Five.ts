import { Finger, FingerCurl, FingerDirection } from '../FingerDescription';
import GestureDescription from '../GestureDescription';


// describe victory gesture ✌️
const description = new GestureDescription('fist');


// thumb:
description.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);

// index:
description.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);

// middle:
description.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);

// ring:
description.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);

// pinky:
description.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);

export default description;

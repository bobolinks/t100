import { Effector, RenderResult, EffectionCountDown, EffectionImage, Effection, Point, Size, Rect, EffectionText, EffectionImageWithAni, EffectionRectangle, EffectionStyles, EffectionGif } from '../effector';
import { AnimationFunction, AnimationFunctions } from '../animation';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * 100) % max;
}

class EffectionScaning extends EffectionImage {
  beginTime: number;
  constructor(image: HTMLImageElement, rect: Rect) {
    super(image, rect);
    this.beginTime = Date.now();
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    if (!this.image) {
      return RenderResult.none;
    }
    let clipArea = new Path2D();
    clipArea.rect( -this.size.width/2, -this.size.height/2, this.size.width, this.size.height );
    // Set the clip to be the intersection of the circle and the square
    ctx.save();
    ctx.clip(clipArea);
    const diff = now - this.beginTime;
    const isDown = Math.ceil(diff / 3000) % 2 ? true : false;
    const sin = (diff % 3000) / 3000;
    const maskHeight = this.size.height / 3;
    const maskPosY = this.size.height * sin;
    if (isDown) {
      ctx.drawImage(this.image, -this.size.width/2, maskPosY, this.size.width, maskHeight);
      const maskHeightLeft = maskHeight + maskPosY - this.size.height;
      if (maskHeightLeft) {
        ctx.scale(1, -1);
        ctx.drawImage(this.image, -this.size.width/2, maskHeightLeft - maskHeight, this.size.width, maskHeight);
      }
    } else {
      const maskHeightLeft = maskHeight + maskPosY - this.size.height;
      if (maskHeightLeft) {
        ctx.drawImage(this.image, -this.size.width/2, maskHeightLeft - maskHeight, this.size.width, maskHeight);
      }
      ctx.scale(1, -1);
      ctx.drawImage(this.image, -this.size.width/2, maskPosY, this.size.width, maskHeight);
    }
    ctx.restore();
    return RenderResult.none;
  }
  reset() {
    this.beginTime = Date.now();
  }
};

class EffectionCountDownCircle extends EffectionCountDown {
  radius: number;
  options: { bgColor?: string, bdColor?: string, bdWitdh?: number, fontSize?: number, fontColor?: string };
  constructor(seconds: number, position: Point, radius: number, options: { bgColor?: string, bdColor?: string, bdWitdh?: number, fontSize?: number, fontColor?: string }) {
    super(seconds, options.fontSize, position, options.fontColor, false);
    this.radius = radius;
    this.options = options;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    ctx.lineWidth = this.options.bdWitdh || 1;
    ctx.strokeStyle = this.options.bdColor || 'black';
    ctx.fillStyle = this.options.bgColor || 'white';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    return super.render(ctx, delta, now);
  }
}

type ScaleAnchor = 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';

interface ImagePlace extends Rect {
  image?: HTMLImageElement;
  anchor?: ScaleAnchor;
  animation?: {
    target: ImagePlace;
    begin: number;
    duration: number;
    function: AnimationFunction;
  }
};
class EffectionAlbumWall implements Effection {
  position: Point;
  size: Size;
  places: Array<ImagePlace>;
  swapList: Array<number>;
  scaleList: Array<number>;
  scaleValue: number;
  isScaled: boolean;
  rotate: boolean;
  shadow: boolean;
  animateDuration: number;
  constructor(images: Array<ImagePlace>, rect: Rect) {
    this.position = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    this.size = {width: rect.width, height: rect.height};
    this.places = images;
    // hardcode 2,3,4 to swap
    this.swapList = [2, 3];
    this.scaleList = [];
    this.scaleValue = 1.4;
    // create a blank splace to scale
    this.places.push({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    this.places.forEach( (e,index) => {
      if (e.anchor) {
        this.scaleList.push(index);
      }
    });
    this.isScaled = false;
    this.rotate = false;
    this.shadow = false;
    this.animateDuration = 1000;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    ctx.save();

    // line
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'white';
    // Shadow
    if (this.shadow) {
      ctx.shadowColor = 'gray';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;
    }

    let lazyDraw: any = {
      progress: 1,
      rect: {},
      place: undefined,
    };
    let placeToSwap: ImagePlace | undefined = undefined;
    let animating = false;
    for (const index in this.places) {
      const place = this.places[index];
      if (!place.image) {
        continue;
      }

      const rect = {left: place.left, top: place.top, width: place.width, height: place.height, };
      if (place.animation) {
        const targetPlace = place.animation.target;
        const deltaBegin = now - place.animation.begin;
        // animation completed
        if (deltaBegin >= place.animation.duration) {
          if (place.image) {
            placeToSwap = place;
          }
          rect.left = targetPlace.left;
          rect.top = targetPlace.top;
          rect.width = targetPlace.width;
          rect.height = targetPlace.height;
        } else {
          rect.left = place.animation.function(deltaBegin, place.left, targetPlace.left - place.left, place.animation.duration);
          rect.top = place.animation.function(deltaBegin, place.top, targetPlace.top - place.top, place.animation.duration);
          rect.width = place.animation.function(deltaBegin, place.width, targetPlace.width - place.width, place.animation.duration);
          rect.height = place.animation.function(deltaBegin, place.height, targetPlace.height - place.height, place.animation.duration);
        }
        animating = true;
        if (!targetPlace.animation) {
          // is scale
          Object.assign(lazyDraw.rect, rect);
          lazyDraw.place = place;
          lazyDraw.progress = deltaBegin / place.animation.duration;
          if (lazyDraw.progress >= 1) {
            lazyDraw.progress = 1;
          }
          continue;
        }
      }
      if (this.shadow) {
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      }
      ctx.drawImage(place.image, rect.left - this.size.width/2, rect.top - this.size.height/2, rect.width, rect.height);
      if (this.shadow) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      ctx.strokeRect(rect.left - this.size.width/2, rect.top - this.size.height/2, rect.width, rect.height);
    }
    if (lazyDraw.place) {
      ctx.translate(lazyDraw.rect.left + lazyDraw.rect.width/2 - this.size.width/2, lazyDraw.rect.top + lazyDraw.rect.height/2 - this.size.height/2);
      if (this.rotate) {
        ctx.rotate(Math.PI * 2 * lazyDraw.progress);
      }
      if (this.shadow) {
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      }
      ctx.drawImage(lazyDraw.place.image, -lazyDraw.rect.width/2, -lazyDraw.rect.height/2, lazyDraw.rect.width, lazyDraw.rect.height);
      if (this.shadow) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      ctx.strokeRect(-lazyDraw.rect.width/2, -lazyDraw.rect.height/2, lazyDraw.rect.width, lazyDraw.rect.height);
    }
    ctx.restore();

    // swap image and stop animations both of all
    if (placeToSwap?.animation) {
      const targetPlace = placeToSwap.animation.target;
      const targetImage = targetPlace.image;
      targetPlace.image = placeToSwap.image;
      placeToSwap.image = targetImage;
      targetPlace.animation = undefined;
      placeToSwap.animation = undefined;
    }

    if (!animating) {
      const seconds = now / 1000;
      const wantAnimation = Math.floor(seconds % 3) === 1;
      if (wantAnimation) {
        // reset image scaled or ...
        if (this.isScaled || getRandomInt(3) !== 1) {
          const targetPlace = this.places.find(e => !e.image);
          if (!targetPlace) {
            throw new Error("internal error");
          }
          if (this.isScaled) {
            // get last one
            const place = this.places[this.places.length - 1];
            place.animation = {
              target: targetPlace,
              function: AnimationFunctions.easeInQuad,
              duration: this.animateDuration,
              begin: now,
            };
          } else {
            const imageSelected = getRandomInt(this.scaleList.length);
            const index = this.scaleList[imageSelected];
            const place = this.places[index];
            if (place.anchor === 'left-top') {
              targetPlace.left = place.left;
              targetPlace.top = place.top;
            } else if (place.anchor === 'left-bottom') {
              targetPlace.left = place.left;
              targetPlace.top = place.top + place.height * ( 1 -  this.scaleValue);
            } else if (place.anchor === 'right-top') {
              targetPlace.left = place.left + place.width * ( 1 -  this.scaleValue);
              targetPlace.top = place.top;
            } else {
              targetPlace.left = place.left + place.width * ( 1 -  this.scaleValue);
              targetPlace.top = place.top + place.height * ( 1 -  this.scaleValue);
            }
            targetPlace.width = place.width * this.scaleValue;
            targetPlace.height = place.height * this.scaleValue;
            place.animation = {
              target: targetPlace,
              function: AnimationFunctions.easeInQuad,
              duration: this.animateDuration,
              begin: now,
            };
          }
          this.isScaled = !this.isScaled;
        } else {
          // swap
          const indices = [...this.swapList];
          // indices.splice(getRandomInt(this.swapList.length), 1);
          this.places[indices[0]].animation = {
            target: this.places[indices[1]],
            function: AnimationFunctions.easeInQuad,
            duration: this.animateDuration,
            begin: now,
          };
          this.places[indices[1]].animation = {
            target: this.places[indices[0]],
            function: AnimationFunctions.easeInQuad,
            duration: this.animateDuration,
            begin: now,
          };
        }
      }
    }
    return RenderResult.none;
  }
}

class EffectionSide extends EffectionRectangle {
  image: HTMLImageElement;
  expired: number;
  miliseconds: number;
  pattern?: CanvasPattern;
  constructor(image: HTMLImageElement, duration: number, rect: Rect) {
    super(rect, { });
    this.miliseconds = duration;
    this.expired = Date.now() + duration;
    this.image = image;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    const diff = this.expired - now;
    if (diff > 0) {
      const percent = diff / this.miliseconds;
      const offsetY = -this.size.height/2 + this.size.height * percent;
      let clipArea = new Path2D();
      clipArea.rect( -this.size.width/2, offsetY, this.size.width, this.size.height );
      ctx.clip(clipArea);
    }
    const pattern = this.pattern || ctx.createPattern(this.image, 'repeat');
    if (pattern) {
      if (!this.pattern) this.pattern = pattern;
      ctx.fillStyle = pattern
    }
    return super.render(ctx, delta, now);
  }
  resetTime(expired?: number) {
    this.expired = expired || (Date.now() + this.miliseconds);
  }
}

declare type CvMat = any;
declare const cv: any;

export class EffectionImageCvMat implements Effection {
  position: Point;
  image?: CvMat;
  canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement, image?: CvMat) {
    this.position = { x: 0, y: 0};
    this.image = image;
    this.canvas = canvas;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    if (this.image) {
      cv.imshow(this.canvas, this.image);
    }
    return RenderResult.none;
  }
  setImage(image?: CvMat) {
    this.image = image;
  }
}

export class LayerMain extends Effector {
  images: Record<string, HTMLImageElement>;
  snapshot: EffectionImage;
  topTipSimle: EffectionImage;
  tipKeepSimle: EffectionImage;
  tipTimeLeftXxx: EffectionImage;
  tipTimeLeftCountdown: EffectionCountDown;
  tipScore: EffectionImage;
  tipScoreValue: EffectionText;
  tipScoreText: EffectionText;
  topCountdown: EffectionCountDownCircle;
  topTipCong: EffectionImage;
  topTipTicket: EffectionImage;
  ticket: EffectionImage;
  maskScan: EffectionScaning;
  albumWall: EffectionAlbumWall;
  qq: EffectionGif;
  qqSideBar: EffectionSide;
  resetList: Array<Effection>;
  tipTimeout: any;
  constructor(canvas: HTMLCanvasElement, qqduration: number) {
    super(canvas);
    // prepare images, preload in pages/index.vue, sotre in assets/images/
    this.images = {};
    const images = document.querySelectorAll('#images img');
    images.forEach(img => {
      const name = img.getAttribute('name');
      if (!name || !/^image_/.test(name)) {
        return;
      }
      this.images[name.substring(6)] = img as HTMLImageElement;
    });
    // keep a holder to show snapshot
    this.snapshot = new EffectionImage(undefined, {left: 0, top: 250, width: this.canvas.width, height: this.canvas.width});
    this.addEffection(this.snapshot);
    // add bg
    this.addEffection(new EffectionImage(this.images.bg, {left: 0, top: 0, width: this.canvas.width, height: this.canvas.height}) );
    // add tencent logo
    this.addEffection(new EffectionImage(this.images.logo_tencent, {left: 30, top: 30, width: 242, height: 33}) );
    // tip top smile
    this.topTipSimle = new EffectionImage(this.images.tip_top_smile, {left: 267, top: 87, width: 545, height: 131});
    // tip keep smile
    this.tipKeepSimle = new EffectionImage(this.images.tip_keep_smile, {left: 146.5, top: 245, width: 795, height: 78});
    // tip time left
    this.tipTimeLeftXxx = new EffectionImage(this.images.tip_time_left_xxx, {left: 330, top: 1380, width: 430, height: 120});
    this.tipTimeLeftCountdown = new EffectionCountDown(10, 160, {x: 376, y: 1430});
    // tip score
    this.tipScore = new EffectionImage(this.images.tip_score, {left: 55, top: 1073, width: 910, height: 160});
    this.tipScoreValue = new EffectionText('100',
      {left: 58, top: 1076, width: 175, height: 115},
      1.0,
      {
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#ffffff',
        font: '600 110px serif'
      }
    );
    this.tipScoreText = new EffectionText('你的微笑照亮了整个会场，旁人皆会因你而欢乐。',
      {left: 265, top: 1107, width: 660, height: 106},
      1.0,
      {
        textAlign: 'left',
        textBaseline: 'middle',
        fillStyle: '#242424',
        font: 'bold 40px PingFang SC'
      }
    );
    // tip top congratulations
    this.topTipCong = new EffectionImage(this.images.tip_top_cong, {left: 146, top: 87, width: 784, height: 131});
    // tip ticket
    this.topTipTicket = new EffectionImage(this.images.tip_top_ticket, {left: 266, top: 87, width: 545, height: 131});
    // this.topCountdown = new EffectionCountDown(3, 300, {x: 540, y: 460});
    this.topCountdown = new EffectionCountDownCircle(3, {x: 540, y: 460}, 70, {
      bdColor: '#fe661d',
      bgColor: '#ffffff',
      bdWitdh: 6,
      fontSize: 180,
      fontColor: '#fe661d',
    });
    // mask_scan
    this.maskScan = new EffectionScaning(this.images.mask_scan, {left: 70, top: 310, width: 880, height: 920});
    // album wall
    this.albumWall = new EffectionAlbumWall(
      [
        { left: 61, top: 241, width: 146, height: 186, image: this.images['01'], },
        { left: 81, top: 441, width: 126, height: 166, image: this.images['05'], },
        { left: 221, top: 204, width: 186, height: 126, image: this.images['02'], },
        { left: 221, top: 346, width: 186, height: 146, image: this.images['06'], },
        { left: 221, top: 506, width: 186, height: 226, image: this.images['07'], },
        { left: 442, top: 216, width: 286, height: 206, anchor: 'left-top', image: this.images['03'], },
        { left: 442, top: 436, width: 196, height: 156, anchor: 'left-bottom', image: this.images['04'], },
        { left: 742, top: 205, width: 206, height: 146, anchor: 'right-top', image: this.images['08'], },
        { left: 652, top: 436, width: 166, height: 206, anchor: 'right-bottom', image: this.images['09'], },
        { left: 830, top: 366, width: 166, height: 206, anchor: 'right-bottom', image: this.images['10'], },
      ],
      {left: 0, top: 1121, width: 1080, height: 778},
    );
    // ticket
    this.ticket = new EffectionImage(this.images.ticket, {left: 0, top: 1390, width: 1080, height: 530});
    // qq
    this.qq = new EffectionGif(this.images.qq3, {left: 945, top: 177, width: 125, height: 160}, 3, qqduration, false, {x: 1010, y: 1180});
    this.qqSideBar = new EffectionSide(this.images.arrow_up, qqduration, {left: 986, top: 241, width: 48, height: 986});

    this.resetList = [
      this.topTipSimle, this.tipKeepSimle,
      this.tipTimeLeftXxx, this.tipTimeLeftCountdown,
      this.tipScore, this.tipScoreValue, this.tipScoreText, this.topCountdown,
      this.topTipCong, this.topTipTicket, this.maskScan, this.albumWall,
      this.ticket, this.qq, this.qqSideBar
    ];
    this.startDetecting();
  }
  resetState() {
    this.snapshot.setImage(undefined);
    this.resetList.forEach(element => {
      this.removeEffection(element);
    });
  }
  startDetecting() {
    console.log('startDetecting');
    this.resetState();
    this.addEffection(this.topTipSimle);
    this.addEffection(this.maskScan);
    this.addEffection(this.albumWall);
    // this.addEffection(this.qqSideBar);
    // this.addEffection(this.qq);
    clearTimeout(this.tipTimeout);
  }
  startWaiting() {
    console.log('startWaiting');
    this.resetState();
    this.topCountdown.resetTime();
    this.addEffection(this.topCountdown);
    this.tipTimeout = setTimeout(() => {
      this.addEffection(this.tipKeepSimle);
    }, 1000);
    this.addEffection(this.topTipSimle);
    this.addEffection(this.albumWall);
    // this.addEffection(this.qqSideBar);
    // this.qq.resetTime(1);
    this.addEffection(this.qq);
  }
  startTracking() {
    console.log('startTracking');
    this.resetState();
    // this.topCountdown.resetTime();
    // this.addEffection(this.topCountdown);
    this.addEffection(this.tipKeepSimle);
    this.addEffection(this.topTipSimle);
    this.addEffection(this.albumWall);
    this.qqSideBar.resetTime();
    this.addEffection(this.qqSideBar);
    this.qq.resetTime();
    this.addEffection(this.qq);
  }
  startRestart() {
    console.log('startTracking');
    this.tipScoreValue.setText('0');
    this.tipScoreText.setText('未监测到笑脸，请重新微笑打分。');
    this.resetState();

    this.addEffection(this.topTipSimle);
    // this.addEffection(this.topTipCong);
    this.addEffection(this.tipScore);
    this.addEffection(this.tipScoreValue);
    this.addEffection(this.tipScoreText);
    this.addEffection(this.tipTimeLeftXxx);
    this.addEffection(this.qqSideBar);
    this.addEffection(this.qq);
    this.tipTimeLeftCountdown.resetTime();
    this.tipTimeLeftCountdown.setTimeout(5);
    this.addEffection(this.tipTimeLeftCountdown);
    clearTimeout(this.tipTimeout);
  }
  startPrinting(snapshot: CanvasImageSource, score: number, tip: string, padding: number): string {
    console.log('startPrinting');

    this.tipScoreValue.setText(score.toString());
    this.tipScoreText.setText(tip);

    this.resetState();
    this.snapshot.setImage(snapshot);
    this.addEffection(this.topTipTicket);
    this.addEffection(this.tipScore);
    this.addEffection(this.tipScoreValue);
    this.addEffection(this.tipScoreText);
    this.addEffection(this.ticket);
    this.addEffection(this.qqSideBar);
    this.addEffection(this.qq);
    this.redraw();

    // scale to fix photo frame
    const canvasPhoto = document.createElement('canvas');
    canvasPhoto.width = 960;
    canvasPhoto.height = 1440;
    const cxtPhoto = canvasPhoto.getContext('2d');
    if (!cxtPhoto) {
      throw new Error("failed to get context");
    }
    cxtPhoto.fillStyle = 'white';
    cxtPhoto.fillRect(0, 0, canvasPhoto.width, canvasPhoto.height);

    const photoH = 1440 - padding * 2;
    const photoW = Math.floor(photoH / 1920 * 1080);
    cxtPhoto.drawImage(this.canvas, (960 - photoW) / 2.0, padding, photoW, photoH);
    const data = canvasPhoto.toDataURL('image/jpeg', 0.8);

    this.resetState();
    this.snapshot.setImage(snapshot);
    this.addEffection(this.topTipSimle);
    // this.addEffection(this.topTipCong);
    this.addEffection(this.tipScore);
    this.addEffection(this.tipScoreValue);
    this.addEffection(this.tipScoreText);
    this.addEffection(this.tipTimeLeftXxx);
    this.addEffection(this.qqSideBar);
    this.addEffection(this.qq);
    this.tipTimeLeftCountdown.resetTime();
    this.tipTimeLeftCountdown.setTimeout(20);
    this.addEffection(this.tipTimeLeftCountdown);

    return data;
  }
}

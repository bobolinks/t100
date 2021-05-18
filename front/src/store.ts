export type State = 'detecting' | 'waiting' | 'tracking' | 'printing';

type Resolution = 'QCIF' | 'CIF' | '2CIF' | '2CIF-L' | '4CIF' | '4CIF' | '4CIF-L' | 'HALF' | 'WD1' | 'HD720P' | 'HD1080P' | 'HD1080P-X';
export const resolutions: { [key in Resolution]: { width: number; height: number; } } = {
  QCIF: {
    width: 176,
    height: 144,
  },
  CIF: {
    width: 352,
    height: 288,  //    VCD画质
  },
  '2CIF': {
    width: 704,
    height: 288,
  },
  '2CIF-L': {
    width: 288,
    height: 704,
  },
  '4CIF': {
    width: 704,
    height: 576,  //  DVD画质
  },
  '4CIF-L': {
    width: 576,
    height: 704,
  },
  HALF: {
    width: 704,
    height: 288,
  },
  WD1: {
    width: 960,
    height: 288,
  },
  HD720P: {
    width: 960,
    height: 720,
  },
  HD1080P: {
    width: 1080,
    height: 1920,
  },
  'HD1080P-X': {
    width: 1080,
    height: 1080,
  },
};

type CvMat = any;

export type Snapshot = {
  clarity: number;
  score: number;
  match: number;
  image: CvMat;
}

type FilterOptionValue = {
  value: number;
  min: number;
  max: number;
  description: string;
}

type Filter = {
  label: string;
  props: Record<string, FilterOptionValue>
}

export const filters: Record<string, Filter> = {
  beautify: {
    label: '美颜',
    props: {
      smooth: {
        value: 1,
        min: 1,
        max: 20,
        description: '磨皮细数',
      },
      detail: {
        value: 2,
        min: 1,
        max: 10,
        description: '细节系数',
      }
    }
  },
  /*
  bilateral: {
    label: '双边过滤器',
    props: {
      diameter: {
        value: 5,
        description: '块大小'
      },
      sigmaColor: {
        value: 15,
        description: '混色差',
      },
      sigmaSpace: {
        value: 75,
        description: '色距',
      }
    }
  },
  clahe: {
    label: '直方均衡',
    props: {
      clipLimit: {
        value: 2.0,
        description: '对比度阀值'
      },
      tileGridSize: {
        value: 8,
        description: '块大小'
      }
    }
  }
  */
};
export type FilterOptions = typeof filters;
export const profile = {
  device: '',
  filters,
  showDebug: false,
};

const store = {
  state: 'detecting' as State,
  sysinfo: {
    devices: [] as MediaDeviceInfo[],
    resolutions,
  },
  bestSnapshot: null as unknown as Snapshot,
  profile,
  profileRevision: 0,
};

export type Store = typeof store;
export const options = {
  fps: 30 as number,
  thresholds: {
    // in detecting state。前置检测阶段
    face: 0.9, // 人脸分数阈值
    // in tracking sate。笑脸识别阶段
    faceShoting: 0.5, // 人脸分数阈值
    happy: 0.1, // 人脸微笑阈值
    clarity: 0.3, // 人脸清晰度阈值
    match: 0.2, // 前后人脸结果相似度阈值
    // ms
    matchLost: 3000, // 相似人脸未匹配到的超时时间
    matchKeep: 3000,
    snapshotDelay: 200, // 匹配到合格人脸的间隔
    actionDelay: 1000,
    analizeInterval: 100, // runloop回调间隔
    // ms
    // tracking state period in miliseconds
    snapshoted: 1500, // 拍照时间
  },
  resolution: 'HALF' as Resolution,
  screen: {
    width: 1080,
    height: 1920,
  },
  // photo frame padding
  framePadding: 20,
  tips: [
    //71-80
    [
      '你的微笑很内敛，不仔细看没发现。',
      '你的微信好亲和，路过的人都想和你聊上几句。',
      '你的微笑像是一阵温暖的春风，沐浴着我们心中的感动。',
      '你温暖的笑脸一如从前，青春的魅力不减。',
      '你的微笑是清泉，为炎炎夏日播撒清凉空间。',
      '你的笑容是最美的涟漪，荡漾出最柔和的阳光。',
      '你微笑的脸像一道光圈，点亮快乐与我的明天。',
      '看你的笑容徐徐绽放，就想在天空自由翱翔。',
    ],

    //81-90
    [
      '你的微笑像山间摇曳的小花，让人心生温暖。',
      '你的微笑好迷人，迷倒了一片镜头后的小伙伴。',
      '你笑起来真好看，像美丽的花一样。',
      '喜欢的是你的微笑，整片天空被你照耀。',
      '你微笑时好美，美的好像春天的草莓，秋天的落叶。',
      '好喜欢你的甜美微笑，像蓝天里飘过的白云一样。',
      '你笑起来的样子最动人，散发出迷人的芬芳。',
      '你神采奕奕的微笑，能融化每个遇见你的心。',
      '你的笑容像夏天里太阳雨后掠过田野的云影，美丽的雨过天晴。',
    ],

    //91-99
    [
      '你的微笑照亮了整个会场，旁人皆会因你产生欢乐。',
      '你的嘴角带着草莓的味道，笑容里藏着无限的美好。',
      '糖果罐里有好多颜色，再多色彩也不如你的笑容甜。',
      '你的微笑洋溢着幸福，想必你的人生也充满了快乐。',
      '你笑起来的样子，让人陶醉，像喝了一杯Mojito一样。',
      '你嫣然的一笑如含苞待放，结束了所有疲倦。',
      '你笑起来的嘴角弧度似月牙般完美，它赶走了所有的阴霾。',
    ],
  ],
};

export type Options = typeof options;

export default store;

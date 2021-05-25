export type Mode = 'server' | 'teacher' | 'student';

export const mode = (location.hash.match(/mode=([^&]*)/) || [])[1] || 'server';

const store = {
  mode,
  sysinfo: {
    devices: [] as MediaDeviceInfo[],
  },
  qrcode: '',
  env: {},
};

export type Store = typeof store;
export const options = {
  fps: 30 as number,
  resolution: {
    width: 704,
    height: 288
  },
  screen: {
    width: 2048,
    height: 1080,
  }
};

export type Options = typeof options;

export default store;

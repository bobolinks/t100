export type Mode = 'server' | 'client';

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
};

export type Options = typeof options;

export default store;

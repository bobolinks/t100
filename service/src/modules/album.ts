import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Profile, RpcModule, } from '../types/types';
import { env } from '../environment';

let profile = {
  printer: {
    address: '',
    user: ''
  },
  camera: {
    device: '',
  }
};

export function loadModule() {
  const profilePath = path.resolve(env.paths.bin, 'profile.json');
  if (fs.existsSync(profilePath)) {
    profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  }
  const albumPath = path.resolve(env.paths.doc, 'album');
  if (!fs.existsSync(albumPath)) {
    fs.mkdirSync(albumPath);
  }
  return { name: 'album' };
}

export default <RpcModule>{
  profile(): Profile {
    return profile;
  },
  print(image: string): string {
    return '';
  },
  cancelPrint() {
    // 查看所有完成队列 lpstat -W completed -o
    // 查看所有未完成队列 lpstat -o
    exec('cancel -a -x');
  }
};

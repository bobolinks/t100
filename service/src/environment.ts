import os from 'os';
import fs from 'fs';
import path from 'path';
import { Environment, } from './types/types';
import { version } from './version';
import argsParse, { ArgAnnotation } from './args';

let cmd = 'o';
let argOffset = 2;
if (process.argv.length > 2) {
  if (process.argv[2][0] !== '-') { // is commond
    // eslint-disable-next-line prefer-destructuring
    cmd = process.argv[2];
    argOffset = 3;
  }
}

export const argsAnno: Record<string, ArgAnnotation> = {
  bin: {
    alias: 'b',
    description: '指定album的程序路径，默认为album的安装路径',
  },
  port: {
    alias: 'p',
    description: '指定服务器端口，默认为随机端口',
  },
  open: {
    alias: 'o',
    description: '运行mind-test时是否同时打开浏览器',
  },
};

const { args } = argsParse(argsAnno, process.argv.slice(argOffset));

export const env: Environment = {
  debug: process.env.NODE_ENV !== 'production',
  version,
  platform: <any>os.platform,
  net: {
    address: 'http://localhost:5040/?mode=client',
  },
  paths: {
    bin: args.bin || process.cwd() || __dirname,
    doc: args.doc || (path.join(os.homedir(), 'exh-show')),
  },
  cmd,
  args,
};

for (const name of ['doc']) {
  const namePath = env.paths[name];
  if (!fs.existsSync(namePath)) {
    fs.mkdirSync(namePath);
  }
}

export default env;

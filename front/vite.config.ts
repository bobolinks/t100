import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin, send } from 'vite';
import vue from '@vitejs/plugin-vue';

// declare const __dirname: any;

const project = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.vide/project.json'), 'utf-8'));

// @ts-ignore
const argv = JSON.parse(process.env.npm_config_argv || '{}').original || [];
const xenv: any = {};
argv.filter(e => e.startsWith('--xenv:')).map(e=>{
  const [k,v] = e.substring(7).split('=');
  xenv[k] = v;
});

const videPlug: Plugin = {
  name: 'videPlug',
  enforce: 'pre',
  apply: 'serve',
  configureServer({ middlewares, }) {
    middlewares.use(async (req: any, res: any, next: any) => {
      const filePath = req._parsedUrl.pathname;
      if (xenv.base && filePath.endsWith('/.vide/project.json')) {
        const code = fs.readFileSync(path.resolve(__dirname, '.vide/project.json'), 'utf-8');
        const jso = JSON.parse(code);
        if (!jso.options) jso.options = {};
        jso.options.base = xenv.base;
        return send(req, res, `export default ${JSON.stringify(jso)}`, 'js');
      }

      return next();
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{
      find: /^@\//,
      replacement: '/src/',
    }],
  },
  plugins: [videPlug, vue()],
  // @ts-ignore
  base: xenv.base || project.options.base || '/',
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
    // only for debug
    minify: process.env.NODE_ENV === 'production',
  }
});

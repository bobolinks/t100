import path from 'path';
import url from 'url';
import express from 'express';
import proxy from 'express-http-proxy';
import bodyParser from 'body-parser';
import open from 'open';
import env from './environment';
import { logger } from './logger';
import rpc from'./rpc';

if (!env.debug) {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err.toString());
    if (err.stack) {
      logger.error(err.stack);
    }
  });
}

/** modules */
const album = require('./modules/album');
const modules = [album];
const expr = express();

/** config express */
expr.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.end('OK');
  } else {
    next();
  }
});

/** apply express routing rules */
function applyRoutingRules () {
  expr.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
  expr.use(bodyParser.json({ limit: '5mb' }));

  if (env.debug) {
    expr.use('/', proxy('http://localhost:3000'));
  } else {
    const webPath = path.join(env.paths.bin, 'web');
    logger.info(`Web root[${webPath}]`);
    expr.use('/', express.static(webPath));
  }
}

applyRoutingRules();

function loadModules(app: any) {
  const mos = {};
  for (const mo of modules) {
    if (mo.loadModule) {
      const info = mo.loadModule();
      logger.info(`Module ${info.name} loaded!`);
      mos[info.name] = mo.default;
    }
  }
  rpc.init(app, mos);
}

// lsof -i:3080
logger.info('Album deamon initializing...');
const upgradeEvents = {};
const app = expr.listen(env.args.port, () => {
  /** init express upgrade hook */
  app.onUpgrade = function (name, cb) {
    upgradeEvents[name] = cb;
  };
  app.downUpgrade = (name) => delete upgradeEvents[name];

  app.on('upgrade', (request, socket, head) => {
    const pathInfo = request.url ? url.parse(request.url) : { pathname: undefined };
    const { pathname } = pathInfo;
    const cb = upgradeEvents[pathname];
    if (cb) cb(request, socket, head);
  });

  loadModules(app);

  const port = app.address().port;

  process.stdout.write(`[port=${port}]\n`);

  app.setTimeout(120000);
  if (env.args.open) {
    open(`http://localhost:${port}/`, { app: 'chrome' });
  }
  logger.info(`Album deamon started, open link to access : http://localhost:${port}/`);
});

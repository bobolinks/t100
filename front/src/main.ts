import { createApp, openBlock, resolveComponent, createBlock } from 'vue';
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { createStore } from "vuex";
import 'element-plus/lib/theme-chalk/index.css';
import ElementPlus from 'element-plus/lib/index';
import './assets/app.css';
import './assets/iconfont/iconfont.css';
import appLifeCircle from './app';
import project from '../.vide/project.json';
import routes from './router';
import store from './store';

if (!(window as any).setImmediate) {
  ((window as any)).setImmediate = window.setTimeout;
}

if (!(window as any).$) {
  ((window as any)).$ = (selector: string, doc?: Document) => (doc || document).querySelector(selector);
}

document.title = project.options.title || 'unnamed';

// const app = createApp(appVue);
const app = createApp({
  render: () => (openBlock(), createBlock(resolveComponent('router-view'))),
});

// @ts-ignore
window.__app = app;

const __store = createStore({
  state: store
});

// @ts-ignore
window.__store = __store;

// setup store
app.use(__store);

// setup router
const routerMode = (project.options || {}).mode || 'history';
// @ts-ignore
const baseUrl = (project.options || {base: '/'}).base || '/';
const history = routerMode === 'history' ? createWebHistory(baseUrl) : createWebHashHistory(baseUrl);
const router = createRouter({
  history,
  routes
});
app.use(router);
app.use(ElementPlus);

appLifeCircle.beforeLaunch(app, __store, router);

const vue = app.mount('#app');

// @ts-ignore
window.__vue = vue;

vue.$nextTick(() => {
  appLifeCircle.onLaunched(app, __store, router);
});

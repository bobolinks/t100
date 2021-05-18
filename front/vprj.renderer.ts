/* in esm mode */
import { createApp, } from 'vue/dist/vue.esm-bundler';
import * as Vue from 'vue/dist/vue.esm-bundler';
import { createRouter, createWebHashHistory, } from "vue-router";
import { createStore } from "vuex";
// Load element-plus stylesheets
import 'element-plus/lib/theme-chalk/index.css';
import './src/assets/app.css';
import './src/assets/iconfont/iconfont.css';
import state from './src/store';

declare const window: any;

window.Vue = Vue;

// Create vuex instance
const store = createStore({
  state
});

// Create router for vue
const router = createRouter({
  history: createWebHashHistory('/'),
  routes: [{
    path: '/:pathMatch(.*)*',
    component: {
      template: '<div class="editor-element-page"><span>子页面</span></div>',
    },
  }]
});

// Render function
export default async function render(_vm, el) {
  // Load element-plus in cjs mode with <script src=>
  await window.loadModule('Element', {
    path: 'node_modules/element-plus/lib/index.full.js',
  });
  // Create a vue3 instance
  const app = createApp(_vm);
  // Setup store
  app.use(store);
  // Setup router
  app.use(router);
  // Register element-plus
  app.use(window.ElementPlus);
  // Then mount
  window._vue = app.mount(el);
};

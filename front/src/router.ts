/* eslint-disable */
import index from './pages/index.vue';
import client from './pages/client.vue';
import { mode } from './store';

export default [
  { path: '/', redirect: mode === 'client' ? '/client' : '/index' },
  { path: '/index', component: index },
  { path: '/client', component: client },
]

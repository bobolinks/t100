/* eslint-disable */
import index from './pages/index.vue';
import student from './pages/student.vue';
import teacher from './pages/teacher.vue';
import { mode } from './store';

export default [
  { path: '/', redirect: mode ? `/${mode}` : '/index' },
  { path: '/index', component: index },
  { path: '/student', component: student },
  { path: '/teacher', component: teacher },
]

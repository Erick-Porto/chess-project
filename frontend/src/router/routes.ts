import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), // Ou layout vazio se preferir
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }, // Login
      { path: 'game', component: () => import('pages/GamePage.vue') }, // Jogo
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

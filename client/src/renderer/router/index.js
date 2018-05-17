import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: require('@/components/login').default,
    },
    {
      path: '/main',
      name: 'main',
      component: require('@/components/game-main').default,
    },
    {
      path: '/main/firstTimeLogin',
      name: 'firstTime',
      component: require('@/components/firstTimeLogin').default,
    },
    {
      path: '/main/battle',
      name: 'battle',
      component: require('@/components/game/battle').default,
    },
  ],
});

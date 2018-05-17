import Vue from 'vue';
import axios from 'axios';
import VueSocketIo from 'vue-socket.io';
import BootstrapVue from 'bootstrap-vue';
import Transitions from 'vue2-transitions';
import VueI18n from 'vue-i18n';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import App from './App';
import router from './router';
import store from './store';
Vue.use(VueSocketIo, 'https://desolate-dusk-83163.herokuapp.com');
Vue.use(BootstrapVue);
Vue.use(Transitions);
Vue.use(VueI18n);
if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

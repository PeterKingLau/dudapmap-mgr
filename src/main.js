// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// import 'amfe-flexible'
import 'lib-flexible'
Vue.config.productionTip = false
import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap,{
  ak:'92ocG5CWALrKFvPODxhE2KqKlSbr6o53'
})

import axios  from 'axios'
Vue.prototype.axios = axios


import Vuex from 'vuex'
import store from  './store'
Vue.use(Vuex)
import Vant from 'vant'
import "vant/lib/index.css"
Vue.use(Vant)
import { Toast } from 'vant';
Vue.use(Toast);
import '../static/base.css'
/* eslint-disable no-new */

import JsonExcel from 'vue-json-excel'
Vue.component('downloadExcel',JsonExcel)
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

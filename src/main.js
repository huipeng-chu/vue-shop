import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import './assets/css/global.css'
import treeTable from 'vue-table-with-tree-grid'

Vue.config.productionTip = false
Vue.component('tree-table', treeTable)
Vue.prototype.$http = axios
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use((config) => {
  // 在发送请求之前做些什么
  config.headers.authorization = window.sessionStorage.getItem('token')
  return config
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

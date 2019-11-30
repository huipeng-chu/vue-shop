import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import './assets/css/global.css'
import treeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.config.productionTip = false
Vue.component('tree-table', treeTable)
Vue.filter('dataFormat', function (val) {
  let date = new Date(val)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDay() + '').padStart(2, '0')
  const hours = (date.getHours() + '').padStart(2, '0')
  const minutes = (date.getMinutes() + '').padStart(2, '0')
  const second = (date.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hours}-${minutes}-${second}`
})
Vue.use(VueQuillEditor)
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

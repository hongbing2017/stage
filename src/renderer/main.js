
import Vue from 'vue'

import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import EleForm from 'vue-ele-form/dist/vue-ele-form.umd'
import EleFormJsonEditor from '~/components/vue-ele-form-json-editor/lib/EleFormJsonEditor'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(EleForm)

Vue.component('json-editor', EleFormJsonEditor)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

import Vue from 'vue'
import Vuex from 'vuex'

// 以下插件用于跨进程实现状态共享，一般没有需要可以注释掉，如果有需要需要参考其github使用，否则会发现commit无效
// 注意：electron基于chrome,一个独立browerWindow就是一个独立进程，所以如果你有两个独立窗口就大概率需要这种
// import { createPersistedState, createSharedMutations } from 'vuex-electron'

import modules from './modules'

// import createMutationsSharer from 'vuex-shared-mutations'  //使用localstorage性能太差，不适合播放器的时间控制
import { registerVuexNode } from './vuex-electron-ipc.js'

Vue.use(Vuex)

var store = new Vuex.Store({
  modules,
  plugins: [
    // createPersistedState(), // 这个负责状态的持久化，也就是说你关闭后重新打开数据依然在
    // createSharedMutations() // 这个负责跨进程共享状态
    // createMutationsSharer({
    //   predicate: (mutation, state) => true
    // })
    registerVuexNode
  ],
  strict: process.env.NODE_ENV !== 'production'
})

export default store

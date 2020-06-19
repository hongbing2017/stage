import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'desk',
      // component: resolve=>require(['@/desk'],resolve).default  //懒加载，这样每个窗口只加载属于自己的页面
      component: () => import('@/desk')
    },
    {
      path: '/live',
      name: 'live',
      // component: resolve=>require(['@/live'],resolve).default
      component: () => import('@/live')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

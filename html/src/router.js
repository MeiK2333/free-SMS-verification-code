import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const routes = [
    {
        path: '/',
        component: () => import('@/views/index')
    },
    {
        path: '/404',
        component: () => import('@/views/404')
    },
    {
        path: '*',
        redirect: '/404'
    }
]

export default new Router({ routes })

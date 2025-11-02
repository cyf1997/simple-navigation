import {createRouter, createWebHistory} from "vue-router";

new createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@/views/home/index.vue')
        }
    ]
})
import Vue from 'vue'
import Router from 'vue-router'
import DetailPage from 'components/DetailPage'
import FeedPage from 'components/FeedPage'
import CreatePage from 'components/CreatePage'
import DraftsPage from 'components/DraftsPage'
import NotFoundPage from 'components/NotFoundPage'
import Callback from 'components/Callback'
Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Feed',
      component: FeedPage
    },
    {
        path: '/detail/:id',
        name: 'Detail',
        component: DetailPage
    },
    {
        path: '/create',
        name: 'Create',
        component: CreatePage,
        beforeEnter: (to, from, next) => {
          if (!router.app.$auth.isAuthenticated()) { router.app.$auth.login() }
          next()
        }
    },
    {
        path: '/drafts',
        name: 'Drafts',
        component: DraftsPage,
        beforeEnter: (to, from, next) => {
          if (!router.app.$auth.isAuthenticated()) { router.app.$auth.login() }
          next()
        }
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {   path: '*',
        component: NotFoundPage
    }
  ]
})

export default router

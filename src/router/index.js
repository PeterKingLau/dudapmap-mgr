import Vue from 'vue'
import store from '../store'
import { Notify } from 'vant'
import Router from 'vue-router'
import login from '@/components/login'
import index from '@/components/index'
import forRole from '@/components/forRole'
import equipment from '@/components/equipment'
import households from '@/components/households'
import householdsLists from '@/components/householdsLists'
import findAllYyue from '@/components/findAllYyue'
import finAllYyueSearch from '@/components/finAllYyueSearch'
import rider from '@/components/rider'
import leaveMgr from '@/components/leaveMgr'
import task from '@/components/task'
import clockTotal from '@/components/clockTotal'
import taskLists from '@/components/taskLists'
import journal from '@/components/journal'
import clockOpt from '@/components/clockOpt'
import driverquery from '@/components/driverquery'
import dirverqueryList from '@/components/dirverqueryList'
import drivequeryupdate from '@/components/drivequeryupdate'
import clockIn from '@/components/clockIn'
import trajectory from '@/components/trajectory'
import clockInMonth from '@/components/clockInMonth'
import clockInDay from '@/components/clockInDay'
import clockInMonthPeople from '@/components/clockInMonthPeople'
import clockInDayPeople from '@/components/clockInDayPeople'
import unclockedClickIn from '@/components/unclockedClickIn'
import palyClockIntime from '@/components/palyClockIntime'
import userMgr from '@/components/userMgr'
Vue.use(Router)
const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'login',
            component: login
        },
        {
            path: '/index',
            name: 'index',
            component: index
        },
        {
            path: '/forRole',
            name: 'forRole',
            component: forRole
        },
        {
            path: '/equipment',
            name: 'equipment',
            component: equipment
        },
        {
            path: '/households',
            name: 'households',
            component: households
        },
        {
            path: '/householdsLists',
            name: 'householdsLists',
            component: householdsLists
        },
        {
            path: '/findAllYyue',
            name: 'findAllYyue',
            component: findAllYyue
        },
        {
            path: '/finAllYyueSearch',
            name: 'finAllYyueSearch',
            component: finAllYyueSearch
        },
        {
            path: '/rider',
            name: 'rider',
            component: rider
        },
        {
            path: '/task',
            name: 'task',
            component: task
        },
        {
            path: '/taskLists',
            name: 'taskLists',
            component: taskLists
        },
        {
            path: '/journal',
            name: 'journal',
            component: journal
        },
        {
            path: '/clockOpt',
            name: 'clockOpt',
            component: clockOpt
        },
        {
            path: '/driverquery',
            name: 'driverquery',
            component: driverquery
        },
        {
            path: '/dirverqueryList',
            name: 'dirverqueryList',
            component: dirverqueryList
        },
        {
            path: '/drivequeryupdate',
            name: 'drivequeryupdate',
            component: drivequeryupdate
        },
        {
            path: '/clockIn',
            name: 'clockIn',
            component: clockIn
        },
        {
            path: '/trajectory',
            name: 'trajectory',
            component: trajectory

        },

        {
            path: '/clockInMonth',
            name: 'clockInMonth',
            component: clockInMonth
        },
        {
            path: '/clockInDay',
            name: 'clockInDay',
            component: clockInDay
        },
        {
            path: '/clockInMonthPeople',
            name: 'clockInMonthPeople',
            component: clockInMonthPeople
        },
        {
            path: '/clockInDayPeople',
            name: 'clockInDayPeople',
            component: clockInDayPeople
        },
        {
            path: '/unclockedClickIn',
            name: 'unclockedClickIn',
            component: unclockedClickIn
        },
        {
            path: '/palyClockIntime',
            name: 'palyClockIntime',
            component: palyClockIntime
        },
        {
            path: '/userMgr',
            name: 'userMgr',
            component: userMgr
        },
        {
            path: '/leaveMgr',
            name: 'leaveMgr',
            component: leaveMgr
        },
        {
            path: '/clockTotal',
            name: 'clockTotal',
            component: clockTotal
        },


    ]
})
// console.log('缓存',store.getters.getLogin)
//全局前置路由守卫————初始化的时候被调用、每次路由切换之前被调用

router.beforeEach((to, from, next) => {
    if (store.getters.getLogin) {
        next()
    } else {
        if (to.path == '/') {
            next()
        } else {
            Notify({ type: 'danger', message: '请登录后进行查看！' })
            next({ path: "/" })
        }
    }


})
export default router
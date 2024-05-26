//配置vuex 持久化
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedstate from  'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
     state:{ //存值
         center:{//经纬度
             lat:0,
             lng:0
         },
         address:'',//定位地址
         login:false //是否登录
     },
     getters:{//取值
          getCenter(state){
            return state.center
          },
          getAddress(state){
             return state.address
          },
          getLogin(state){
            return state.login
          }
     }, 
     mutations:{//异步调用。别的页面调取这个获取值
        updateCenter(state,data){
            state.center.lat = data.lat
            state.center.lng = data.lng
        },
        updateAddress(state,data){
            state.address=data
        },
        updateLogin(state,data){
            state.login=data
        }
     },
  
    //  actions:{//异步调用mutations方法
    //     asyncUpdateCenter(context,center){
    //          context.commit('updateCenter',center)
    //     }
    //  },
     modules:{},
     plugins:[
         createPersistedstate({
              reducer(val){
                 return val
              }
         })
     ]
})

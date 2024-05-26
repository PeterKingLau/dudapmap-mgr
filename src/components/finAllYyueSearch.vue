<template>
     <div class="houserholdsLists">
         <!--搜索页面-->
         <van-search
            v-model="value"
            shape="round"
             show-action
            background="#4fc08d"
            placeholder="请输入电话号码"
            @input='writeInput'
            >
            <template #action>
                <div class="searchBtn" @click="onSearch" >搜索</div>
            </template>
        </van-search>

       <div style="overflow-y:auto;position: relative;">
           <div  class="lis"  v-if="showSearch">
                <ul>

                     <li>
                        <span>联系方式:</span>
                        <div class="recordText">{{searchLis.userphone}}</div>
                    </li>
                     <li>
                        <span>开始时间:</span>
                        <div class="recordText">{{searchLis.from}}</div>
                    </li>
                     <li>
                        <span>结束时间:</span>
                        <div class="recordText">{{searchLis.to}}</div>
                    </li>

                    <li>
                        <span>详细地址:</span>
                        <div class="recordText">{{searchLis.location}}</div>
                    </li>

                    <li>
                        <span>经度:</span>
                        <div class="recordText">{{searchLis.lo}}</div>
                    </li>

                    <li>
                        <span>纬度:</span>
                        <div class="recordText">{{searchLis.la}}</div>
                    </li>
                </ul>
           </div><!--/subscribeLis-->
          </div>

        <div class="nodate" v-if="ts">
            <img src="../assets/images/noDate.png" alt="">
            <p>暂无详细信息！</p>
        </div>  



     </div>
</template>

<script>
import {apiUrl, getlisting} from '../utils/apiUrl'
export default {
    data(){
        return{
          value:"18380569831",
          searchLis:[],
          showSearch:false,
          ts:false
        }
    },
    mounted(){

    },
    methods:{
        onSearch(){
             console.log('搜索:',this.value.length)
           if(this.value.length<11){
               this.$toast('请输入11位电话号码！')
               return
             }

             if(this.value.length>11){
               this.$toast('请输入11位电话号码！')
               return
             }
         this.getSearch(this.value)
        },
        getSearch(value){
            getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdappointmentfindByPhone,{params:{phone:value}})
            .then(res=>{
                let  oBj =Object.getOwnPropertyNames(res.data).length!=0//!=0 为有值
               
                console.log(oBj)
                if(oBj && res.data!=''){// 判断返回的res.data 对象是否为空，
                     this.$toast.loading({
                    message: '正在搜索...',
                    forbidClick: true,
                    });
                    
                    setTimeout(()=>{
                        this.showSearch=true
                        this.ts=false
                        this.searchLis=res.data
                    },2000)
                }else{
                    this.showSearch=false
                    this.ts=true
                }
            })
        },
        writeInput(){
            this.showSearch=false;
             this.ts=false
        }
    }
}
</script>

<style lang='scss'>
  .searchBtn{color:#fff}
  .van-search__action:focus{background: none;}
</style>
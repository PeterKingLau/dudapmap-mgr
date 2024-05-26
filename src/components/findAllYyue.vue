<template>
     <!--查询预约-->
     <div class="houserholdsLists">
       <div v-if="show" style="overflow-y:auto;position: relative;">
           <!--搜索预约信息（条件）按钮-->
          <div class="searchPos" @click="searchUrl"><img src="../assets/images/serachPos.png"> </div><!--/searchPos-->
           <div  class="lis" v-for="(item,index) in subscribeAry" :key="item.from">
            <!--删除按钮-->
              <div class="close"><img src="../assets/images/del.png" alt="" @click="del(index,item.id)"></div>
                <ul>

                     <li>
                        <span>联系方式:</span>
                        <div class="recordText">{{item.userphone}}</div>
                    </li>
                     <li>
                        <span>开始时间:</span>
                        <div class="recordText">{{item.from}}</div>
                    </li>
                     <li>
                        <span>结束时间:</span>
                        <div class="recordText">{{item.to}}</div>
                    </li>

                    <li>
                        <span>详细地址:</span>
                        <div class="recordText">{{item.location}}</div>
                    </li>

                    <li>
                        <span>经度:</span>
                        <div class="recordText">{{item.lo}}</div>
                    </li>

                    <li>
                        <span>纬度:</span>
                        <div class="recordText">{{item.la}}</div>
                    </li>
                </ul>
           </div><!--/subscribeLis-->
          </div>

        <div class="nodate" v-else>
            <img src="../assets/images/noDate.png" alt="">
            <p>暂无详细信息！</p>
        </div>  

     </div><!--/subscribeLis-->
</template>

<script>
import {apiUrl, filetest,getlisting} from '../utils/apiUrl'
export default {
    data(){
        return{
           subscribeAry:[],
           show:false
        }
    },
    mounted(){
       this.getFindAll()
    },
    methods:{
        getFindAll(){
            getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdappointmentfindAll)
            .then(res=>{
                if(res.data.length){
                     this.subscribeAry=res.data
                }else{
                     this,show=true
                }
               
            })
        },
        searchUrl(){//点击搜索按钮，进入查询预约信息的页面 
               this.$router.push({path:'/finAllYyueSearch'})
        },
        del(index,id){
              const that= this
           
            getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdindoordeleteIndoorById,{params:{id:id}})
            .then(res=>{
            //     console.log('删除接口数据',res)
               that.$toast.success('删除成功！')
                setTimeout(()=>{
                     that.subscribeAry.splice(index,1)
                     if(!that.subscribeAry.length){//没有数据就返回上一个页面
                        this.$router.go(-1)
                     }
                },2000)
                
           })
        }
    }
}
</script>
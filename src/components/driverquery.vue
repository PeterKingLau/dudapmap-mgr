<template>
     <div class="contentHeight">
          <div class="content">
                 <ul>
                    <li v-for="(item,index) in lists" :key='index'>
                         <div>
                            <span>设备编号:</span>
                            <p>{{item.serialnumber}}</p>
                         </div>
                          <div>
                            <span>地址:</span>
                            <p>{{item.address}}</p>
                         </div>

                         <p>
                            <van-button color="linear-gradient(to right, #ff6034, #ee0a24)"  @click="dirverquery(index)">详情</van-button>
                             <van-button color="linear-gradient(to right, #01ec0c, #5ecef6)" @click="uplateDirverquery(index)">修改</van-button>
                         </p>
                    </li>
                 </ul>
          </div>

          <div style="height:50px"></div>
     </div>
</template>
  
<script>
import {apiUrl,getlisting} from '../utils/apiUrl'
export default {
    data(){
        return{
           lists:[]
        }
    },
    mounted(){
     this.getFindAll()
    },
    methods:{
        getFindAll(){
            //BASE_URL_HTTPS_TWO
             getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxddevicefindAll)
             .then(res=>{
                  if(res.data.length){
                      this.lists =res.data
                  }
             })
        },
        dirverquery(index){//查看详情
              this.$router.push({path:'../dirverqueryList',query:{arrindex:index}})
        },
        uplateDirverquery(index){
            this.$router.push({path:'../drivequeryupdate',query:{arrindex:index}})
        }
    }
}
</script>


<style lang='scss'  >
       .contentHeight{background: #e2e2e2;height: 100vh; overflow-y: auto;}
       .content{
        width: 95%; margin: auto;
               >ul{
                li{
                    padding: 2%; margin: 10px 0 0 0; background: #fff; border-radius: 5px; background: #fff;
                    >div{
                        display: flex; justify-content:space-between; align-items:flex-start; padding: 5px 0;border-bottom: 1px dashed #e2e2e2;
                        span{ display: inline-block; width: 80px; height: 20px; line-height: 20px; color: #333; font-size: 16px; text-align: left;}
                        >p{ width: calc(100% - 90px); text-align: left; font-size: 14px; color: #333;  }
                         &:last-child{ border-bottom: none;}
                    }
                    >p{
                        text-align: right;
                   
                        button{
                             width: 60px; height: 25px; font-size: 14px;
                        }
                    }
                }
               }
       }//content
</style>
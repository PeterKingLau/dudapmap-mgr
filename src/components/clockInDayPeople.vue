<template>
       <div class="clockincontent">
          
                     <van-divider
                                :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px', fontSize:'16px' }"
                                >
                                {{titleMonth}}日打卡信息
                        </van-divider>
                            
                        <van-sticky >
                                    <div class="tableUl vanSticky">
                                            <ul>
                                                <li>
                                                    <span>电话号码</span>
                                                    <span>打卡次数</span>
                                                </li>
                                            </ul>
                                </div>
             </van-sticky>
           <div class="tableUl tablePadding" v-if="Object.keys(lists).length">
               <ul>
                  <li >
                     <span>{{lists.tel}}</span>
                     <span>{{lists.clockInNumber}}次</span>
                  </li>
               </ul>
           </div>

           <van-empty v-else  description="暂无打卡信息" />

               <!--遮罩层显示加载-->
          <van-overlay :show="showLogin" @click="show = false">
            <div class="wrapper">
                <van-loading  vertical text-color="#fff"  color="#bfe4ff">正在请求数据、请稍后...</van-loading> 
            </div>
            </van-overlay>
       </div>
</template>

<script>
import {apiUrl, getlisting,filterTimemonth,filterTimeday} from '../utils/apiUrl'
export default {
       data(){
          return{
            showLogin:false,
             lists:{},
              arrKeys:[],
              titleMonth:this.$route.query.monthPeopledate,
          }
       },
       mounted(){
          let queryArry=this.$route.query
         this.gethxdrecordfindByDate(queryArry.monthPeopledate,queryArry.monthTel)
       },
       methods:{
          gethxdrecordfindByDate(date,phone){
              let  data={
                dates:date,
                phone:phone
              }
              this.showLogin=true
              getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdrecordfindSoloByPhone,{params:data})
                .then(res=>{
                   
                     if(res.data.length){
                        this.showLogin=false
                          this.lists={
                              clockInNumber:res.data.length,
                              tel:res.data[0].userphone
                          }
                         
                     }else{
                          this.showLogin=false
                     }
  
                })
           }
       }
}
</script>
<style lang='scss'>
   .clockincontent{ padding:0 2%; height: 100%; }  
   .alltitle{ text-align: left; font-size: 16px; padding:  0 0 10px 0; font-weight: 800; border-bottom: 1px solid #e2e2e2; color: #07c160;}
   .tableUl{
    ul{
        >li{  width: 100%; display: flex; align-content: center; padding: 3% 0; border-bottom: 1px solid #e2e2e2;
            >span{display: inline-block;  font-size: 14px; text-align: center;
             &:nth-child(1){ width:50%;}
               &:nth-child(2){ width: 50%;}
           
            }
        }
    }
   }
   .vanSticky{ background:#07c160; color: #fff;}
   .tablePadding{ margin:  0  0 50px 0;}
</style>
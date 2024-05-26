<template>
       <div class="clockincontent">
          
                    <van-divider
                                :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px', fontSize:'16px' }"
                                >
                                {{titleMonth}}日未打卡全部信息
                        </van-divider>



                        <!-- <div style="padding:0  0 10px 0; text-align:left">
                               <download-excel :data="excelpage"  :before-generate="startDownload" :fields="json_fields"
                                  :name = "jsName">
                                <van-button type="info" size='small '>导出excel</van-button>
                             </download-excel>
                        </div> -->
                        <van-sticky >
                                    <div class="tableUl vanSticky">
                                            <ul>
                                                <li>
                                                     <span>序号</span>
                                                    <span>名字</span>
                                                    <span>电话号码</span>
                                                    <span>打卡次数</span>
                                                </li>
                                            </ul>
                                </div>
             </van-sticky>
           <div class="tableUl tablePadding" v-if="arrKeys.length">
               <ul>
                  <li v-for="(item,index) in lists" :key="index*0.1">
                    <span>{{index+1}}</span>
                     <span>{{item.name}}</span>
                     <span>{{item.tel}}</span>
                     <span>{{item.clockNumber}}次</span>
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
              ycShow:false,
             lists:{},
             arrKeys:[],
             titleMonth:this.$route.query.day,
             //导出excel 
             excelpage:[],//存放勇于导出excel的数据
             json_fields:{
                 序号:'ID',
                 名字:'name',
                 电话号码:'tel',
                 打卡次数:'clockNumber',
             }

          }
       },
       mounted(){
        let queryArry=this.$route.query
         this.gethxdrecordfindByDate(queryArry.day)
       },
       methods:{
        //  async startDownload(){
        //         console.log('12332112')
        //         this.jsName=this.titleMonth+'日未打卡全部信息'
        //          for (var i = 0; i < this.lists.length; i++) {
        //               this.lists[i].ID = i + 1;
        //             }
        //         this.excelpage= this.lists
               
        //  },
          gethxdrecordfindByDate(date){
              let  data={
                date:date
              }
              this.showLogin=true
              getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdrecordFindByDate2,{params:data})
                .then(res=>{
                     this.showLogin=false
                     this.arrKeys = Object.keys(res.data);
                      if( this.arrKeys.length){
                        let values = Object.values(res.data)
                            this.lists=  values.map((item,index)=>{
                                console.log(item)
                            return {
                              name:`${item==null?'暂未上传名':item}`,
                              clockNumber:0,
                              tel: this.arrKeys[index]
                            }
                      })
                     }else{
                          this.showLogin=false
                     }
                   
                    
                })
           }
       }
}
</script>

<style lang='scss' scoped>
   .clockincontent{ padding:0 2%; height: 100%; }  
   .alltitle{ text-align: left; font-size: 16px; padding:  0 0 10px 0; font-weight: 800; border-bottom: 1px solid #e2e2e2; color: #07c160;}
   .tableUl{
    ul{
        >li{  width: 100%; display: flex; align-content: center; padding: 3% 0; border-bottom: 1px solid #e2e2e2;
            >span{display: inline-block;  font-size: 14px; text-align: center;
             &:nth-child(1){ width: 10%;}
               &:nth-child(2){ width: 30%;}
               &:nth-child(3){ width: 40%;}
               &:nth-child(4){ width: 20%;}
            }
        }
    }
   }
   .vanSticky{ background:#07c160; color: #fff;}
   .tablePadding{ margin:  0  0 50px 0;}
</style>
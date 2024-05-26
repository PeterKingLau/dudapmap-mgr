<template>
      <div class="task">
         <div class="vanGridTitle" ><img src="../assets/images/installer7.png"/> <span>任务详情</span></div>
         <div class='taskLists'>
             <ul>
             <li>
                 <span>施工员:</span>
                 <p>{{lists.worker==''?'暂无名字显示':lists.worker}}</p>
             </li>
             <li>
                 <span>电话:</span>
                 <p>{{lists.userphone==''?'暂无电话号码显示':lists.userphone}}</p>
             </li>
             <li>
                 <span>地址:</span>
                 <p>{{lists.adress==''?'暂无地址信息显示':lists.adress}}</p>
             </li>
             <li>
                 <span>经度:</span>
                 <p>{{lists.lng==''?'暂无经度信息显示':lists.lng}}</p>
             </li>
             <li>
                 <span>纬度:</span>
                 <p>{{lists.lat==''?'暂无纬度信息显示':lists.lat}}</p>
             </li>
             <li>
                 <span>时间:</span>
                 <p>{{lists.taskdate==''?'暂无时间信息显示':lists.taskdate}}</p>
             </li>
             <li>
                 <span>派单状态:</span>
                    <p  class=" yjpd_z" v-if="lists.infoflag==1">已经派发</p>
                    <p  class=" jspd_z" v-if="lists.infoflag==2">接受任务</p>
                    <p  class=" jjpd_z" v-if="lists.infoflag==3">拒绝任务</p>
                    <p  class=" yjpd_z" v-if="lists.infoflag==4">完成任务</p>
                    <p  class=" wpd_z" v-if="lists.infoflag==5">未派单</p>
             </li>

             <li v-if="lists.infoflag==5">
                 <span>接受派单:</span>
                 <p> 
                    <van-radio-group v-model="radio" direction="horizontal">
                        <van-radio name="1">接受</van-radio>
                        <van-radio name="2">拒绝</van-radio>
                   </van-radio-group>
                 </p>
             </li>

          </ul>
           <div class="taskBtn" v-if="lists.infoflag==5">
              <button @click="taskSubmit" >确定</button>
              <button @click="backUrl">返回</button>
           </div>

            <div class="taskBtn" v-else>
              <button @click="backUrl">返回</button>
           </div>
         </div>


         
      </div>
</template>

<script>
import {apiUrl,getlisting} from '../utils/apiUrl'
export default {
    data(){
         return{
            radio:"1",
            lists:JSON.parse(this.$route.query.lists),
            distinctionId:this.$route.query.distinctionId,//区分 1是列表传过来的。2是弹出层传过来的
         }
    },
    mounted(){
       // console.log(this.$route.query.distinctionId)
    },
    methods:{
        taskSubmit(){
                  console.log('this.radio',this.radio)
                  let that = this
                  switch(parseInt(this.radio)){
                       case 1: // 代表参数5 接受派单
                         this.acceptTask(that.lists.id)
                       break;
                       case 2://代表参数5 拒绝派单
                        this.refuseTask(that.lists.id)
                       break;
                  }
        },
        backUrl(){
              // this.$router.go(-1)   // // 返回上一步路由 ，浏览器自带的返回箭头还是会有效果
               //this.$router.replace({path:'/rider'}) //替换当前的路由，这个无效果
                if(this.distinctionId==1){
                                    this.$router.replace({path:'/taskLists'})
                                  }else{
                                     this.$router.replace({path:'/rider'})
                                  }
        },
        //接受任务
        acceptTask(id){
            
             this.$dialog.confirm({
                message: '确定接受任务吗？',
                className:"textFont"
                })
                .then(() => {
                    // on confirm
                      getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdtaskacceptask,{params:{id:id}})
                        .then(res=>{
                          //  console.log('res',res)
                             if(res.data==true){
                                this.$toast.success('已接受任务、正在返回上一页！')
                                  setTimeout(()=>{
                                    if(this.distinctionId==1){
                                    this.$router.replace({path:'/taskLists'})
                                        }else{
                                            this.$router.replace({path:'/rider'})
                                        }
                                  },2000)
                             }
                             //this.$router.replace({path:'/rider'})
                        })
                })
                .catch(() => {
                      //console.log('取消')
                });
            
        },
        //拒绝任务
        refuseTask(id){
               this.$dialog.confirm({
                message: '确定拒绝任务吗？',
                className:"textFont",
                })
                .then(() => {
                    // on confirm
                      getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdtaskdenyTask,{params:{id:id}})
                        .then(res=>{
                        //  console.log('res',res)
                        //  console.log('resTrue',res.data)
                            if(res.data==true){
                                 this.$toast.success('已拒绝任务、正在返回上一页！')
                                 setTimeout(()=>{
                                     if(this.distinctionId==1){
                                            this.$router.replace({path:'/taskLists'})
                                        }else{
                                            this.$router.replace({path:'/rider'})
                                        }
                                 },2000)
                             }
                        })
                })
                .catch(() => {
                      //console.log('取消')
                });
            
        }
    }
}
</script>


<style  lang='scss' scoped >
    .task{
        .taskLists{
            padding:  0 5%;
            >ul{
             >li{
                 color: #333; font-size: 14px; display: flex; justify-content: space-between;
                align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f5f6f7;
                >span{display: inline-block ; width: 80px; height: 20px; line-height: 20px; font-weight: 700; text-align: left;}
                >p{width: calc(100% - 90px); text-align: left;}
             }
         }
        }

        .taskBtn{
             padding: 5% 0; display:flex; justify-content: center; 
             >button{border: none;  height: 35px; width: 45%; font-size: 14px; border-radius: 20px; margin:  0 2.5%;
               &:nth-child(1){background: #5ecef6; color: #fff;}
               &:nth-child(2){background: #efefef;}
             }
        }
        
    }

    
</style>
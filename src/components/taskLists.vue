<template>
    <div>
          <div class="vanGrid" >  
               <div class="vanGridTitle"  ref="popupHeight"><img src="../assets/images/installer7.png"/> <span>全部任务</span></div>
               <div class="taskLis" v-if="newtasKLis.length" :style="`height:${contentHeight}px`" >
                      <ul>
                          <li v-for="(item,index) in newtasKLis" :key='item.id' @click="findAllUrl(item.infoflag,index)">
                              <div >
                                 <span>电话：</span>
                                 <p>{{item.userphone}}</p>
                              </div>

                                <div>
                                 <span>地址：</span>
                                 <p>{{item.adress}}</p>
                              </div>

                              <div>
                                 <span>日期：</span>
                                 <p>{{item.taskdate}}</p>
                              </div>
                              <span  class="rightType yjpd" v-if="item.infoflag==1">已经派发</span>
                              <span  class="rightType jspd" v-if="item.infoflag==2">接受任务</span>
                              <span  class="rightType jjpd" v-if="item.infoflag==3">拒绝任务</span>
                              <span  class="rightType yjpd" v-if="item.infoflag==4">完成任务</span>
                              <span  class="rightType wpd" v-if="item.infoflag==5">未派单</span>
                              <!-- <img src="../assets/images/yjpd.png" alt=""> -->

                               <!--删除按钮-->
                              <img @click.stop='del(item.id,index)' src="../assets/images/del.png"/>
                          </li>
                      </ul>
               </div><!--/taskLis-->

                <div v-else>
                     <div class="nodate">
                          <img src="../assets/images/noDate.png" alt="">
                          <p>暂无详细信息！</p>
                     </div>
                </div>
             </div>
    </div>
</template>
<script>
import {apiUrl,getlisting} from '../utils/apiUrl'
export default {
    data(){
        return{
            taskLis:[],//旧的
            contentHeight:0,
            screenHeight:0,
             newtasKLis:[],//新的全部任务列表
        }
    },
    mounted(){
          this.screenHeight = window.innerHeight;
         this.getFindAll()
         this.riderPopup()
    },
    methods:{
        riderPopup(){
            let that =this
              this.$nextTick(()=>{
                 let a =that.$refs.popupHeight.offsetHeight //标题高度
                 that.contentHeight=that.screenHeight-a
              })
          },
    getFindAll(){///查询全部任务信息
             getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdtaskfindAll)
             .then(res=>{
            //    console.log('查询全部',res)
              let resLists= res.data
               if(resLists.length){
                  this.taskLis=res.data
                   this.newtasKLis= resLists.map(item=>{
                        let a=  item.useraddress.split('&')
                         return {...item,
                                adress:a[0],
                                lng:a[1],
                                lat:a[2]
                            }
                         
                    })
               }
             })
         },
        //点击跳转到接受任务、拒绝任务的的页面
        findAllUrl(infoflag,index){
             let that =this;

              this.$router.push({path:'/task',query:{lists:JSON.stringify(that.newtasKLis[index]),distinctionId:1}})
            //   switch(parseInt(infoflag)){
            //       case 1:
            //          console.log('infoflag',infoflag)
                    
            //        break;
            //   }
        },
            del(delid,index){
            let that =this;
            let delidCs = encodeURI('/')+delid
             this.$dialog.confirm({
                message: '确定删除这个任务吗？',
                className:"textFont"
                })
                .then(() => {
                    // on confirm
                      getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdtaskdeleteTaskById+delidCs)
                        .then(res=>{
                            console.log('res',index)
                             that.newtasKLis.splice(index,1)
                      }) 
                })
                .catch(() => {
                      //console.log('取消')
                });
         },
          getRealLocation(){
                getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdlocationgetRealLocation)
                .then(res=>{
                   let  coordinates =Object.values(res.data);
              //    console.log(coordinates)
                  
                    let lat =[]
                      lat=coordinates.map((item)=>{
                        //   let strArr =  str.split('-')
                            return item.split('&')
                        })
                        let a =lat.map(item=>{
                            let  arr= item.slice(-2)//获取返回的数组后2个位置
                            let  newArr =  {lat:arr[0],lng:arr[1]}
                            return newArr
                        })
                         
                         this.tel =Object.keys(res.data)//取的对象的key值
                           
                          // this.center= this.center2[0]
                        //    console.log('aaa',a)
                           this.$nextTick(()=>{
                            this.center=a[0]
                             this.center2=a
                            console.log(this.center.lat,this.center.lng)
                          })
                       
                })
          }
    }
}
</script>
<template>
     <div class="rider">
         <!--当前骑手在线数量-->
         <div class="posFixed">
             <div>
                当前骑手在线数量<span>{{riderNumber?riderNumber:0}}</span>人
             </div>
         </div>
        <baidu-map v-if="center.lat && center.lng" class="map" :center="center" :zoom="19" :style="`height:${screenHeight}px`" > 
           <!--坐标点-->
                  <!-- :position="{lng:item.lng,lat:item.lat} -->       
                      <bm-marker v-for='(item,index) in center2' :key='index' :position="{lng:item.lng,lat:item.lat}"
                        :icon="{url: require('../assets/images/slc.png'), size: {width: 35, height: 60}}"
                        >
                    <!--信息窗体-->
                      <telOvcerlay :position="item"    :text="text" :number="index+1"  :tel='tel[index]'> </telOvcerlay>
                     </bm-marker>
               
       </baidu-map>

       <!--点击按钮 触发全部任务信息-->
       <div class="riderbottom"  >
           <div @click="riderPopup"><img src="../assets/images/more2.png" alt=""></div>
       </div>

       <!--底部弹出任务列表-->
       <van-popup v-model="showTask" position="bottom" :style="`height:${screenHeight -  100}px`"    closeable >
             <div class="vanGrid" >  
               <div class="vanGridTitle"  ref="popupHeight"><img src="../assets/images/installer7.png"/> <span>全部任务</span></div>
               <div class="taskLis" v-if="newtasKLis.length" :style="`height:${contentHeight}px`">
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
       </van-popup>
     </div>
</template>
<script>
import telOvcerlay from '../comm/telOvcerlay.vue'
import {apiUrl, filetest,getlisting} from '../utils/apiUrl'
export default {
     components:{
        telOvcerlay
     },
      data(){
        return{
         screenHeight:0,
         infoWindow: {
          show: true,
        },
            center:{},
            center2:[],
            text:{
                name:'模拟测试'
            },
            tel:[],

            listZb:[
                {
                   lng: 104.683172,
                lat:31.474094 
                },
                {
                    lng: 104.685921,
                   lat:31.468766
                },{
                    lng: 104.687502,
                lat:31.474125
                }
                ,{
                    lng: 104.68355,
                    lat:31.472955
                },
                {
                    lng: 104.687071,
                    lat:31.472215
                },
                 {
                   lng: 104.683172,
                lat:31.474094 
                },
                {
                    lng: 104.685921,
                   lat:31.468766
                },{
                    lng: 104.687502,
                lat:31.474125
                }
                ,{
                    lng: 104.68355,
                    lat:31.472955
                },
                {
                    lng: 104.687071,
                    lat:31.472215
                },
                 {
                   lng: 104.683172,
                lat:31.474094 
                },
                {
                    lng: 104.685921,
                   lat:31.468766
                },{
                    lng: 104.687502,
                lat:31.474125
                }
                ,{
                    lng: 104.68355,
                    lat:31.472955
                },
                {
                    lng: 104.687071,
                    lat:31.472215
                }
                ],

             showTask:false,
             taskLis:[],//旧的
             contentHeight:0,//内容高度
             newtasKLis:[],//新的全部任务列表
             riderNumber:0,//当前骑手在线数量
        }
      },
      mounted(){
               this.screenHeight = window.innerHeight;
              this.getRealLocation() 
            //    this.$nextTick(()=>{
            //      for(let i=0;i<=this.listZb.length;i++){
            //           setTimeout(()=>{
            //             //直接this.center =this.listZb[i]会报错
            //                 let  a={} //需要这么写
            //                 a.lat=this.listZb[i].lat
            //                 a.lng=this.listZb[i].lng
            //                 this.center=a
                            
            //           },3000*i)
            //     }
            //    })
            // this.$nextTick(()=>{
            //     setInterval(()=>{
            //          this.getRealLocation() 
            //     },3000)
            // })
          this.riderOnline()//当前骑手在线数量
         this.getFindAll()
         const chatTimer = setInterval(() => {
            this.getRealLocation() ;
            this.riderOnline()
          }, 3000);
        this.$once('hook:beforeDestroy', () => { clearInterval(chatTimer); })

      },
      methods:{
          riderPopup(){
            let that =this
              this.showTask=true
              this.$nextTick(()=>{
                 let a =that.$refs.popupHeight.offsetHeight //标题高度
                 that.contentHeight=that.screenHeight-a-100
              })
          },
         getFindAll(){///查询全部任务信息
             getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdtaskfindAll)
             .then(res=>{
            //    console.log('查询全部',res)]
              let resLists =res.data
            //   console.log(resLists.length)
               if(res.data.length){
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
               else{

               }
             })
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
        //点击跳转到接受任务、拒绝任务的的页面
        findAllUrl(infoflag,index){
             let that =this;
              switch(parseInt(infoflag)){
                  case 1:
                     console.log('infoflag',infoflag)
                     this.$router.push({path:'/task',query:{lists:JSON.stringify(that.newtasKLis[index])}})
                   break;
              }
        },
         //当前在线骑手数量
          riderOnline(){
              getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdusergetServerBasicNumber)
              .then(res=>{
                  console.log(res)
                  this.riderNumber=res.data
              })
          },
          getRealLocation(){
                getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxdlocationgetRealLocation)
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

<style lang='scss' scoped>
     .rider{ 
        position: relative;
        .posFixed{position: fixed; top:0; left: 0; right: 0; z-index: 10; padding: 5px; border-radius:   0  0 5px  5px;
        background: #00ec09;
          >div{ font-size: 16px;
            >span{ font-size: 18px; margin:  0 5px;color: #f00;}
          }
          }
       .riderbottom{
        position: fixed;
        bottom: 0; left: 0; right: 0;
        >div{ width: 40px; height: 40px; margin: auto; animation:  scaleAn 2s infinite;
        >img{ width: 40px; height: 40px;}}
       }

     }

@keyframes scaleAn{
    0% {
        transform: translate(0px, 0px) scale(0.9); 
    }
    50% {
        transform: translate(0px, -5px) scale(1,1);
    }
    100% {
        transform: translate(0px, 0px) scale(0.9);
    }

}

.taskAll{ border: 1px solid red;

}


</style>

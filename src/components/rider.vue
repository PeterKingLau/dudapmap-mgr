<template>
     <div class="rider">
         <!--当前骑手在线数量-->
         <div class="posFixed">
             <div>
                 <!-- {{listZb[0]}} -->
                当前骑手在线数量<span>{{riderNumber?riderNumber:0}}</span>人
             </div>

              <img v-if="properLists.length>=2" src="../assets/images/lookCk.png" alt="" @click="lookCk">
         </div>
        <baidu-map class="map" :center="oneself" :zoom="15" :style="`height:${screenHeight}px`" @ready="handler"> 
           <!--坐标点-->
                  <!-- :position="{lng:item.lng,lat:item.lat} -->  
                      <!-- <bm-marker v-if="zbShow" :position="center4" -->
                    <bm-marker v-for='(item,index) in center2' :key='index' :position="{lng:item.lng,lat:item.lat}"    
                        :icon="{url: require('../assets/images/slc.png'), size: {width: 35, height: 35}}"
                        >
                    <!--信息窗体-->
                    <!-- <telOvcerlay :position="center4"    :text="text" :number="1"  :tel='13800138000'> </telOvcerlay> -->
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


       <!--选择查看人员坐标-->
      <van-popup v-model="showPropleZb" position="bottom" :style="`height:${screenHeight -  100}px`"    closeable >
        <div class="vanGrid" >  
               <div class="vanGridTitle"  ref="popupHeight"><img src="../assets/images/present.png"/> <span>人员坐标</span></div>
                <div class="peopleZb"  :style="`height:${contentHeight}px`" >
                       <ul>
                          <li v-for="(item,index) in properLists" :key="item.phone"  @click="jumpCoordinate(item.lng,item.lat)">
                             <p>人员{{index+1}}号</p>
                             <p>电话号码:{{item.phone}}</p>
                             <p>地址:{{item.adress}}</p>
                             <!-- <p>经度:{{item.lng}}</p>
                             <p>经度:{{item.lat}}</p> -->
                          </li>
                       </ul>
               </div><!--/taskLis-->
        </div>
      </van-popup>

     </div>
</template>
<script>
import telOvcerlay from '../comm/telOvcerlay.vue'
import { BmlLushu} from 'vue-baidu-map'
import {apiUrl, filetest,getlisting} from '../utils/apiUrl'
export default {
     components:{
        telOvcerlay,BmlLushu
     },
      data(){
        return{
      play: true,
      path: [],
      icon: {
        url: 'http://api.map.baidu.com/library/LuShu/1.2/examples/car.png',
        size: {width: 52, height: 26},
        opts: {anchor: {width: 27, height:13}}
      },
         screenHeight:0,
         infoWindow: {
          show: true,
        },
           oneself:{lng: 0, lat: 0},//当前用户的位置
            center:{},
            center2:[],
            text:{
                name:'人员'
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
             center4:{},
              center5:{lng: 0, lat: 0},
              abc:[],
              zbShow:false,//坐标延迟显示
              showPropleZb:false,//显示人员坐标的列表
              properLists:[],//人员坐标列表
        }
      },
      mounted(){
            this.screenHeight = window.innerHeight;
            this.getRealLocation() 
            this.riderOnline()//当前骑手在线数量
            this.getFindAll()
            const chatTimer = setInterval(() => {
                   this.getRealLocation() ;
                   this.riderOnline()
                }, 3000);
             this.$once('hook:beforeDestroy', () => { clearInterval(chatTimer); })//防止setInterval多次请求
               //let arry =[]
            //  this.$nextTick(()=>{
            //      for(let i=0;i<=this.listZb.length;i++){
            //           setTimeout(()=>{
            //             //直接this.center =this.listZb[i]会报错
            //                 let  a={} //需要这么写
            //                 a.lat=this.listZb[i].lat
            //                 a.lng=this.listZb[i].lng
            //                 this.center4=a
                          
            //             //  this.abc =[...{},{a:1,b:2}]
            //                this.abc.push(a)
            //                console.log(this.center4)
            //           },3000*i)
            //     }
               
            //    }) 

            setTimeout(()=>{ //延迟1秒显示，不延迟的话，坐标是飞入的状态
                this.zbShow=true
            },1000)
          
            //    console.log('abv',abc)
            // this.$nextTick(()=>{
            //     setTimeout(()=>{
            //         console.log('this.center4',this.center4)
            //     },1000)
            // })
      },
      methods:{
        //获取自己的位置
        handler({ BMap, map }) {
            const that = this;
            var geolocation = new BMap.Geolocation();
            
            geolocation.getCurrentPosition(function(r) {
              if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                //console.log('rrr',r)
                 that.$nextTick(()=>{
                    that.oneself.lng = r.longitude;
                    that.oneself.lat = r.latitude;
                 })
               // console.log(that.center);
                // setTimeout(()=>{
                //   that.showDq=true
                // },500)
              } else {
                alert("failed" + this.getStatus());
              }
            });
          },
           getHeight(){//获取高度
            let that =this
            this.$nextTick(()=>{
                let a =that.$refs.popupHeight.offsetHeight //标题高度
                that.contentHeight=that.screenHeight-a-100
            
            })
           },
          riderPopup(){
              this.showTask=true
              this.getHeight()
          },
         lookCk(){//点击出现全部人员的列表。点击列表进行坐标点定位
                this.showPropleZb=true
                 this.getHeight()
         },

         getFindAll(){///查询全部任务信息
             getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdtaskfindAll)
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
                           // console.log('res',index)
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
              this.$router.push({path:'/task',query:{lists:JSON.stringify(that.newtasKLis[index])}})
        },
         //当前在线骑手数量
          riderOnline(){
              getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdusergetServerBasicNumber)
              .then(res=>{
                 // console.log(res)
                  this.riderNumber=res.data
              })
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
                           // console.log(this.center.lat,this.center.lng)
                          })
                  

                     //把lat里的 数组转成[{a:1,b:1,:c:1,d:1}] , 再把电话号码加进去
                      this.properLists= lat.map((item,index)=>{
                      //   console.log('item',item)
                          return {
                            adress:item[0],
                            lat:item[1],
                            lng:item[2],
                            phone:this.tel[index]
                         }
                     })       
               //   console.log('this.properLists',this.properLists)
                })
          },
          jumpCoordinate(lng,lat){
                this.oneself={
                    lng:lng,
                    lat:lat
                }
               // console.log(this.oneself)
                this.showPropleZb=false
          }
      }
}
</script>

<style lang='scss' >
     .rider{ 
        position: relative;
        .posFixed{position: fixed; top:0; left: 0; right: 0; z-index: 10; padding: 5px; border-radius:   0  0 5px  5px;
        background: #00ec09;
          >div{ font-size: 16px;
            >span{ font-size: 18px; margin:  0 5px;color: #f00;}
          }

          >img{position: absolute; top:50%; right: 2%; width: 25px; height: 25px; margin-top:-12.5px }
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

.taskAll{ border: 1px solid red;}

.rider .BMap_noprint{
     transition: all 2s!important;
     background: url('../assets/images/slc2.png') no-repeat !important;
     background-size: cover !important;;
}
.rider .sample{
    transition: all 2s!important; 
   
}

  .peopleZb{
       padding: 0 2.5%;
      >ul{
         >li{
          padding: 2%; background: #e2e2e2; border-radius: 5px; margin:  0 0  10px 0;
            >p{text-align: left; font-size: 14px; padding: 5px 0;}
          }
      }
    }


</style>

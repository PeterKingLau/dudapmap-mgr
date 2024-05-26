<template>
   <div class="content" >
       <div class="contentPadding">
         <div class="mapBox">
          <baidu-map class="map" :center="center" :zoom="15" :scroll-wheel-zoom="true" :style="`height:${screenHeight-130}px`"
           @click="getMapInfos" @ready="handler" >
            <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :showAddressBar="true" :autoLocation="true"></bm-geolocation>
          
          <!--当前位置-->
            <bm-marker v-if='showDq' :position="center" :dragging="false" anum> </bm-marker>
             <!--坐标围绕--> 
            <div v-if="embrace">
             
                <bm-circle  :center="scopeCircle" :radius="radius" stroke-color="red" :stroke-opacity="1" :stroke-weight="2" :massClear='true'  ></bm-circle>
                 <bm-polygon :path="polygonPath" stroke-color="#f00" :stroke-opacity="1" :stroke-weight="2" ></bm-polygon>
              <!--超出坐标点显示-->
              <div  v-for="item in exceedArry" :key="item.lng"> 
                  <MyOverlayBlue
                    :position="{lng:item.lng,lat:item.lat}"  
                  >
                 </MyOverlayBlue>
              </div>
             </div><!--/embrace-->
            <!-- <bm-point-collection :points="exceedArry" shape="BMAP_POINT_SHAPE_STAR" color="red" size="BMAP_POINT_SIZE_SMALL"></bm-point-collection> -->
            <!--点击地图添加位置-->
            <div v-if='addCoordShow'>
              <div >
               <MyOverly
                  :position="addCoord"
                  :active="active"
                  @mouseover.native="active = true"
                  @mouseleave.native="active = false">
                </MyOverly>
              </div> -->

              <!-- <bm-marker v-if='addCoordShow' :position="addCoord" :dragging="false" :icon="{url:addLoactinImg,size:{width:30,height:30}}"  animation="BMAP_ANIMATION_BOUNCE"> </bm-marker> -->
              <!--点击地图添加位置，再以点半径100的位置覆盖园-->
            <bm-circle  :center="addCoord" :radius="radius" stroke-color="red" :stroke-opacity="0.5" :stroke-weight="2" :massClear='true'  ></bm-circle>
            </div>
        </baidu-map>
         </div>

        <!--安装人员-->
        <div class="installer">
             <ul>
                <li v-for="(item,index) in navSelect" :key="item.userInfo" @click="installerProup(index)">
                   <img :src="item.imgSrc" alt="">
                   <p>{{item.userInfo}}</p>
                </li>
             </ul>
        </div><!--/installer-->
       </div><!--/contentPadding-->

       <!--安装员列表-->
       <van-popup ref="vanpopup"  v-model='show'   position="bottom" :style="{ height:`${screenHeight-200}px` , background:'#f2f2f2'}" @close='clearVirtualStaff' >
                  <!--角色选择-->
                  <div >
                    <van-tabs animated color='#5ecef6' title-active-color='#5ecef6' @click='tabsSelect'>
                      <van-tab v-for="item in userroleList" :title="item" :key="item.username"   >
                        <!-- @scroll="scrollBottom" ref='scrollSpringback' -->
                          <div class="findAll" :style="{ height:`${screenHeight-250}px` }" >
                               
                               <van-list
                                   v-model="loading"
                                   :finished="finished"
                                   finished-text="暂无更多施工人员！"
                                   :offset='20'
                                   :immediate-check='false'
                                   @load="onLoad"
                                  >
                                    <ul v-if="findAll.length">
                                      <li v-for="item in findAll" :key='item.username' >
                                          <div><div>姓名:<span></span></div> <span>{{item.username}}</span></div>
                                          <div><div>职位:<span></span></div> 
                                            <span v-if="item.infoflag==1 || item.infoflag==3">{{item.userrole}}</span>
                                            <span v-else style="color:#5ecef6" @click="forRoleUrl(item.userrole,item.userphone)">{{item.userrole}} <img src="../assets/images/look.png" alt=""></span>
                                        </div>
                                          <div><div>电话号码:<span></span></div><span>{{item.userphone}}</span></div>
                                          <div><div>时间:<span></span></div> <span>{{item.userdate}}</span></div>

                                          <img v-if="item.infoflag==2" src="../assets/images/change.png" alt="">
                                      </li>
                                    </ul>
                                </van-list>
                              

                                  <!-- <div v-else  class="inforTs">
                                      <img src="../assets/images/noDate.png" alt="">
                                      <p>暂无施工人员对应的信息！</p>
                                  </div> -->

                                  <!--滚动到底部显示正在加载更多-->
                                  <!--<div class="moreTs" v-show="moreShow"> 
                                    <van-loading size="24px">正在加载数据...</van-loading>
                                  </div> -->
                              </div>
                      </van-tab>
                    </van-tabs>
                  </div>
       </van-popup>

       <!--指定员工查询-->
       <van-popup  v-model='userPopup'   :style="{  width:'70%', background:'#fff',borderRadius:'5px'}" >
                <div class="userContent">
                      <h4> <img src="../assets/images/installer.png" alt=""> 指定员工查询</h4>
                      <div class="searchUser"> 
                            <div class="searchUserLi" :style="telShow==true?'border:1px solid #f00':'border:1px solid #e2e2e2'">
                               <span>员工电话:</span>
                                <input type="tel" placeholder="请输入员工电话" v-model="userTel"   @input="writeInput"/> 
                            </div>
                            
                            <div class="telTs" v-show='telShow'>请输入正确的手机号码！</div>

                            <div class="searchUserLi">
                                <span>选择日期:</span>
                                <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly> 
                            </div>
                            <div class="telTs" v-show='datsShow'>请选择日期！</div>
                            <div class="searchUserbutton"> 
                               <button @click="searchUserInfo">查询</button>
                            </div>
                      </div><!--/searchUser-->
                </div><!--/userContent-->
       </van-popup>

      <van-popup  v-model='userDatsShow'   position="bottom" :style="{ height:'40%' , background:'#f2f2f2'}" >
              <van-datetime-picker
                  v-model="currentDate"
                  type="date"
                  title=" 选择时间"
                   :columns-order="['year', 'month', 'day']"
                  :formatter="formatter" @confirm='selectDats' @cancel='closeDatspopup'
                />
      </van-popup>

      <!--点击地图生成点的弹出层-->
         <van-popup  v-model='createShow'   :style="{  width:'70%', background:'#fff',borderRadius:'5px'}" >
                <div class="userContent">
                      <h4> <img src="../assets/images/present.png" alt="">当前位置</h4>
                      <div class="currentPostion">
                           <ul>
                             <li>
                               <span>当前位置:</span>
                               <p>{{propaddress}}</p>
                             </li>

                             <li>
                                <span> 当前经度:</span>
                                <p>{{longitude}}</p>
                             </li>

                               <li>
                                <span> 当前纬度:</span>
                                <p>{{latitude}}</p>
                             </li>
                           </ul>
                      </div>

                      <div class="addLocation">
                             <button @click='addCoordClick'>添加位置</button>  
                             <button @click="anew">重新添加</button>
                      </div><!--/addLocation-->
                </div><!--/userContent-->
       </van-popup>

   </div>
</template>
<script>
import {apiUrl, filetest,getlisting} from '../utils/apiUrl'
import MyOverly from '../comm/MyOverlay.vue'
import MyOverlayBlue from '../comm/MyOverlayBlue.vue'

export default {
  components:{
    MyOverly,MyOverlayBlue
  },
    data(){
      return{
         loading: false,
      finished: false,
        showDq:false,// 当前位置显示
        wheelZoom:true,
        polygonPath:[],//坐标围绕
        screenHeight:0,
        show:false,//安装员列表
        selectGz:'',//工种
        userPopup:false,//指定员工查询弹出层
       //  center: {lng:104.648323, lat:31.525121},
       center: {lng: 0, lat: 0},
        zoom:15,
        longitude:0,//经度
        latitude:0,//维度
        propprovince:'',//省
        propcity :'',//市
        propcounty :'',//县
        propaddress:'',//详细地址
        findAll:[],
        userroleList:['全部','小工','大工','宣传员','督导员','安装员','配送员',],
        navSelect:[
          {imgSrc:require('../assets/images/installer.png'),
           userInfo:'施工人员'
          },
          {imgSrc:require('../assets/images/installer2.png'),
           userInfo:'查询'
          }
        ],

         //指定员工电话\日期查询字段
         userDatsShow:false,
         userDats:'',
         userTel:'18380569831',
         telShow:false,
          datsShow:false,
        //指定员工选择时间
         currentDate: new Date(),
        //点击地图生成点显示弹出层
        createShow:false,
        addCoordShow:false,//点击地图显示坐标点
        addCoord:{lng:0,lat:0}, //点击地图店家坐标点
        addLoactinImg:require('../assets/images/gcs.png'),
        radius:100,//半径100
         active: false,
         //超出坐标点
         exceedArry:[],
         zbImg:require('../assets/images/zb.png'),
          exccedImg:require('../assets/images/excced.png'),
          scopeCircle:{lng: 0, lat: 0},//范围
          embrace:false,
        //安装人员列表  滚动到底部加载虚拟人员
          moreShow:false
      }
    },
    mounted(){
      this.screenHeight = window.innerHeight;
      this.getFillAll()//获取全部施工人员的信息
      this.clearVirtualStaff()//进入页面默认清除一次虚拟人员的信息
    },
    methods:{
      //获取用户当前所在的经纬度
      handler({ BMap, map }) {
            const that = this;
            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function(r) {
              if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                that.center.lng = r.longitude;
                that.center.lat = r.latitude;
                console.log(that.center);
                setTimeout(()=>{
                  that.showDq=true
                },500)
              } else {
                alert("failed" + this.getStatus());
              }
            });
          },

      //地图获取
      getMapInfos(e){
           console.log('e',e)
          let that = this;
          this.longitude= e.point.lng;//经度
          this.latitude= e.point.lat;//维度
          let  geocoder  = new BMap.Geocoder()//创建地址解析
          console.log('geocoder',geocoder)
          geocoder.getLocation(e.point,(res)=>{
              console.log('1231',res)
              that.propaddress =res.address
              that.longitude= e.point.lng;//经度
              that.latitude= e.point.lat;//维度
              that.createShow=true//显示坐标详细弹层
              that.addCoordShow=false //显示坐标
          })

      },

     //点击地图触发弹层显示当前经纬度以及详细位置
      addCoordClick(){
          this.addCoord={
              lng:this.longitude,
              lat:this.latitude
          }
          // this.center={
          //     lng:this.longitude,
          //     lat:this.latitude
          // }
      
          this.addCoordShow=true //显示坐标
          this.createShow=false //隐藏坐标详细弹层
          console.log(' this.addCoord', this.addCoord)
      },
     //重新选择经纬度
     anew(){
          this.addCoord={
                lng:0,
                lat:0
            }
          this.addCoordShow=false //隐藏坐标
          this.createShow=false
     },


        installerProup(index){
           switch(index){
              case 0:
                this.show=true
            
               // this.getPopup()
              break;
              case 1:
                this.userPopup=true 
                 this.userDats='';
                 this.userTel='18380569831';
                 this.telShow=false;
                 this.datsShow=false;
                 break;
           }
        },

        //点击弹出层里的tabs切换对应的施工人员的信息
        tabsSelect(name,title){
               this.selectGz= title
                
               switch(title){
                 case '全部':
                     this.getFillAll()
                       this.loading = false
                  break;
                  case '小工':
                     this.getAnZuser(title)
                     this.loading = true, this.finish = false
                  break;
                  case '大工':
                     this.getAnZuser(title)
                     this.loading = true, this.finish = false
                  break;
                  case '宣传员':
                     this.getAnZuser(title)
                     this.loading = true, this.finish = false
                  break;
                  case '督导员':
                     this.getAnZuser(title)
                     this.loading = true, this.finish = false
                  break;
                  case '安装员':
                     this.getAnZuser(title)
                     this.loading = true, this.finish = false
                  break;
                  case '配送员':
                     this.getAnZuser(title)
                     this.loading = true, this.finish = false
                  break;
             
               }

              
        },
        //获取全部施工人员的信息
        getFillAll(){
            getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxduserfindAll)
              .then(res=>{
                this.findAll=res.data
                console.log(res.data)
              })
        },

      onLoad() {
      // 异步更新数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
          setTimeout(() => {
            // 加载状态结束
               this.loading = false;
               this.getVirtualStaff()
          
          }, 1000);
      },
        //滚动到页面底部添加虚拟员工
        // scrollBottom(e){
        //     let  that =this
          
        //       if (e.srcElement.scrollTop + e.srcElement.clientHeight == e.srcElement.scrollHeight) {
        //             console.log("我在底部触发了")
        //                this.moreShow=true
        //               this.getVirtualStaff()
        //         }

                
                
        // },

   //获取虚拟员工信息
        getVirtualStaff(){
           getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxduseraddUserBatch)
           .then(res=>{
              this.getFillAll()
           })
        },
        //清楚虚拟员工信息
        clearVirtualStaff(){
          console.log('1231清除')
              getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxduserdeleteUserBatch)
           .then(res=>{
             console.log(res)
              this.getFillAll()
           })
        },

        // 申请变更角色 跳转新页面 
        forRoleUrl(changeName,tel){
           this.$router.push({path:'/forRole',query:{changeName:changeName,tel:tel}})
        },
        //获取指定人员的的信息
        getAnZuser(userAnz){
             let data={
                  userrole:userAnz
             }
             getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxduserfindUserByRole,{params:data})
             .then(res=>{
              console.log('指定人员',res.data)
               if(!res.data.length==0){
                     this.findAll=[]
                     this.findAll=res.data
                       this.finished=true
                     if(this.findAll.length<10){
                        this.finished=true//安装员除全部选项外，其他的的小于10条就不生成更多加载
                     }
               }else{ this.findAll=[]}
             })
        },

      //点击选择时间出现选择时间弹层
      selectDaspopup(){
         this.userDatsShow=true
      },

      //选择时间
       formatter(type, val) {
          if (type === 'year') {
            return val + '年';
          }
          if (type === 'month') {
            return val + '月';
          }
          if (type === 'day') {
            return val + '日';
          }
          return val;
        },
        //中国时间转换2023-02-20
        filterTime(time) {
          var date = new Date(time);
          var y = date.getFullYear();
          var m = date.getMonth() + 1;
          m = m < 10 ? "0" + m : m;
          var d = date.getDate();
          d = d < 10 ? "0" + d : d;
          // var h = date.getHours();
          // h = h < 10 ? "0" + h : h;
          // var minute = date.getMinutes();
          // minute = minute < 10 ? "0" + minute : minute;
          // var s = date.getSeconds();
          // s = s < 10 ? "0" + s : s;
          return y + "-" + m + "-" + d ;
          // return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + s;
         },
      selectDats(e){
        this.userDats=this.filterTime(e)
        this.userDatsShow=false
      },

      //关闭时间选择
      closeDatspopup(){
        this.userDatsShow=false
      },
  
       writeInput(){
            if(this.userTel.length==11){
               this.telShow=false
           } 
       },
   
      //输入查找指定员工的定位信息
      searchUserInfo(){
         
           if(this.userTel.length>11 ||this.userTel.length<11){
               this.telShow=true
               return
           } else{this.telShow=false}
         
           if(this.userDats==''){
               this.datsShow=true
               return
           } else{this.datsShow=false}

            let data= {
              phone:this.userTel,
              dats:this.userDats
            }
          getlisting(process.env.BASE_URL_HTTPS +apiUrl.hxdlocationfindAll,{params:data})
          .then(res=>{
              console.log(res.data.length)
              if(res.data.length==0){
                this.$toast('暂无员工的定位信息！')
              }else{
                this.gerUserPos(data)
                this.userPopup=false 
                this.addCoordShow=false
                this.embrace=true
              }
          })
          
      },

       //获取指定员工的定位信息
     gerUserPos(data){
      let that = this
        getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdlocationfindAll,{params:data})
        .then(res=>{
          let  coordinates = res.data;
          // coordinates.map((item)=>{
          //    let  str=item.locationinfo
          //    let lengthZf = str.lastIndexOf('-')
          //    let str2 =str.substr(0,str.lastIndexOf('-',lengthZf-1))
          //    console.log('str2',str2)
          // })
          
           let lat =[]
           lat=coordinates.map((item)=>{
             let  str=item.locationinfo
           //   let strArr =  str.split('-')
               return str.split('-')
          })
          //获取数组后2个位置,坐标的位置
          let latArray=[]
          latArray=lat.map(item=>{
               let  arr= item.slice(-2)//获取返回的数组后2个位置
               let  newArr =  {lat:arr[0],lng:arr[1]}
               return newArr
          })
          // that.center=latArray[0]//点击查询指定员工位置后，重新定位滴入中心点
          that.polygonPath=latArray
           that.center.lng= that.polygonPath[0].lng
           that.center.lat= that.polygonPath[0].lat

         //重新用embrace 获取下经纬度  不能center 有冲突
          that.scopeCircle.lng= that.polygonPath[0].lng
           that.scopeCircle.lat= that.polygonPath[0].lat

           //查询数组里是否infoflag是否有2，  1 正常  、2超出
           let  exceed=[]
            exceed=coordinates.filter(item=>{ //过滤
              if(item.infoflag=='2'){
                return item
              }
           })
           
           let exceedCc=[]
          exceedCc= exceed.map(item=>{
             let  str=item.locationinfo
           //   let strArr =  str.split('-')
               return str.split('-').slice(-2)
           })
          this.exceedArry= exceedCc.map(item=>{
                    //   let  str  = item[0].toString()
                    // console.log((typeof str))
                  return {lat: item[0] ,lng:item[1]}
           })
         console.log('this.exceedArry=',this.exceedArry)
        })  
     },
    }
}
</script>

<style  lang='scss'>
.content{ background: #5ecef6;  height: 100vh; overflow: hidden;}
.contentPadding{ width: 95%; margin: auto;  margin: 10px auto auto auto;}
.mapBox{padding: 5px; background: #fff; border-radius: 10px;}
.map { border-radius: 10px; overflow: hidden;}
.installer{ border-radius: 10px; background: #fff; margin: 10px auto auto auto;  padding: 5px 0;
  >ul{
    display: flex; justify-content:space-around;
    >li{
      img{width:30px; height: 30px;} padding: 5px 0; 
      p{ font-size: 12px;}
    }
  }//ull
}//installer
.findAll{
   width: 95%; margin: auto;  overflow-y:auto;
  ul{
    >li{
     margin: 10px 0 0 0;  background: #fff; position: relative;
       padding: 2%; border-radius: 5px; box-shadow:  0 0 5px  #e2e2e2 ; overflow: hidden;
       >img{position: absolute; top:0; right: 0;}
      >div{
        display: flex; justify-content: flex-start; align-items: center;  padding: 1px 0;
        >div{
          font-size: 14px; 
          width: 70px; text-align: justify; height: 25px; line-height: 25px; font-weight: 600;
          >span{display: inline-block;
			  	padding-left: 100%;
             }
        }
        >span{font-size: 14px;
        display: flex; justify-content: flex-end; align-items: center; height: 25px; margin:  0  0 0 10px;
          >img{width:15px; height: 15px; margin:  0 0  0 5px ;}
        }

      }
    }//lo
  }//ul
}//findAll

.userContent{ width: 90%; margin: auto; padding: 5% 0;
       >h4{text-align:left; font-size: 16px; color: #5ecef6;
          >img{ width: 20px; height: 20px; vertical-align: -3px; margin:  0 5px 0  0;}
        }
       .searchUser{
            .searchUserLi{  border: 1px solid #e2e2e2; border-radius: 5px; margin: 20px 0 0 0;
              display: flex; justify-content: space-between; align-items: center; width: 90%; padding: 2% 5%;
               >span{ font-size: 14px; display: inline-block; width: 70px;  text-align: left;}
                input{ width: calc(100% - 80px);font-size: 14px; height: 25px;  border:none}
            }//searchUserLi
            .telTs{font-size: 12px; color: #f00; text-align: left;padding:  5px 0 0 70px;}
            .searchUserbutton{
                text-align: center; margin: 10px 0 0 0;
               >button{ width: 80px; height:30px; font-size: 14px; background: #5ecef6; color: #FFF; border: none; border-radius: 5px;}
            }
       }//searchUser
}

.inforTs{
  padding: 15% 0 0 0;
   >img{width: 40px;height: 40px;}
   >p{font-size: 14px; color:#999}
}

.currentPostion{
  ul{
    >li{
      display: flex; justify-content: flex-start;   align-items: flex-start; margin: 10px 0 0 0;
      span{ font-size: 14px; color: #333; font-weight: 800; display: inline-block; width: 70px; height: 20px; line-height: 20px;}
      >p{font-size: 14px; color: #333; line-height: 25px; width: calc(100% - 80px); text-align: left; line-height: 20px;}
    }
  }
}//currentPostion

.addLocation{
  margin: 10px 0 0 0; display: flex; justify-content:space-between;
   >button{width: 45%; height: 30px; font-size: 14px; outline: none; border-radius: 5px;color: #fff;
     &:nth-child(1){background: #5ecef6; border: 1px solid #5ecef6; }
    &:nth-child(2){background: #e2e2e2; border: 1px solid #e2e2e2; color: #333;}
   }
}//addLocation 
.radar {
 width: 40px;
 height: 40px;
 border-radius: 50%;
 background-color: red;
}
.moreTs{ padding: 2% 0 5% 0;}
</style>
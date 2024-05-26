<template>
    <div class="equipment">
          <div class="equipmentTitle">
              <img src="../assets/images/equipment.png" alt="">
               <span>设备增加</span>
          </div>

          <div class="equipmentForm">
               <van-form @submit="onSubmit">
                    <van-field
                        v-model="sbbh"
                        name="serial_number"
                        left-icon=""
                        label="设备编号"
                        placeholder="设备编号"
                        :rules="[{ required: true, message: '请填设备编号' }]"
                    />
                   <van-field
                        v-model="sbnx"
                        name="device_type_id"
                        label="设备类型编号"
                        placeholder="设备类型编号"
                    />

                    <van-field
                        readonly
                        clickable
                        name="name"
                        :value="sbmcvalue"
                        label="设备名称"
                        placeholder="点击选择设备名称"
                        @click="showSbmc = true"
                        />
                        <van-popup v-model="showSbmc" position="bottom">
                            <van-picker
                                show-toolbar
                                :columns="sbmcColumns"
                                @confirm="onConfirm"
                                @cancel="showPicker = false"
                            />
                        </van-popup>

                    <van-field name="pic" label="设备图片">
                        <template #input>
                            <van-uploader v-model="pic" multiple :max-count="1"  :after-read='afterRead' accept="image/*"  />
                        </template>
                    </van-field>

                    <van-field name="face" label="人脸识别">
                        <template #input>
                            <van-radio-group v-model="radio" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="phone" label="手机短信验证">
                        <template #input>
                            <van-radio-group v-model="verify" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="qrcode" label="二维码登录">
                        <template #input>
                            <van-radio-group v-model="qrcode" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="card" label="刷卡登录">
                        <template #input>
                            <van-radio-group v-model="card" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field
                        v-model="sbqy"
                        name="device_area"
                        label="设备区域"
                        placeholder="设备区域"
                    />

                    <van-field
                        v-model="whry"
                        name="maintenance_staff"
                        label="维护人员"
                        placeholder="维护人员"
                    />

                   <van-field
                        v-model="yyry"
                        name="Operators"
                        label="运营人员"
                        placeholder="运营人员"
                    />


                    <van-field
                        readonly
                        clickable
                        name="create_time"
                        :value="crateTimevalue"
                        label="创建时间"
                        placeholder="创建时间"
                        @click="showCrateTime = true"
                        />
                        <van-popup v-model="showCrateTime" position="bottom">
                        <van-datetime-picker
                            type="date"
                            v-model="currentDate"
                            @confirm="createTime"
                            @cancel="showCrateTime = false"
                        />
                        </van-popup>

                    <van-field
                        v-model="createStaff"
                        name="create_staff"
                        label="创建人"
                        placeholder="创建人"
                    />

                    <van-field
                        readonly
                        clickable
                        name="update_time"
                        :value="upateTimevalue"
                        label="修改时间"
                        placeholder="修改时间"
                        @click="showUpateTime = true"
                        />
                        <van-popup v-model="showUpateTime" position="bottom">
                        <van-datetime-picker
                            type="date"
                            v-model="currentDate"
                            @confirm="upateTime"
                            @cancel="showPicker = false"
                        />
                        </van-popup>

                     <van-field
                        v-model="updateStaff"
                        name="update_staff"
                        label="修改人"
                        placeholder="修改人"
                    />

                     <van-field
                        v-model="imei"
                        name="imei"
                        label="设备imei"
                        placeholder="设备imei"
                    />
                    
                    <van-field
                        readonly
                        clickable
                        name="activation_time"
                        :value="activationTimevalue"
                        label="激活时间"
                        placeholder="激活时间"
                        @click="showActivationTime = true"
                        />
                        <van-popup v-model="showActivationTime" position="bottom">
                            <van-datetime-picker
                                type="date"
                                v-model="currentDate"
                                @confirm="activationTime"
                                @cancel="showActivationTime = false"
                            />
                        </van-popup>

                    <van-field
                        readonly
                        clickable
                        name="online_time"
                        :value="onlineTimevalue"
                        label="最后在线时间"
                        placeholder="最后在线时间"
                        @click="showOnlineTime = true"
                        />
                    <van-popup v-model="showOnlineTime" position="bottom">
                        <van-datetime-picker
                            type="date"
                            v-model="currentDate"
                            @confirm="lastOnlineTime"
                            @cancel="showOnlineTime = false"
                        />
                    </van-popup>
                
                     <van-field name="status" label="状态">
                        <template #input>
                            <van-radio-group v-model="status" >
                              <van-radio name="1" style="margin:0  10px  10px 0">待使用</van-radio>
                              <van-radio name="2" style="margin:0  10px  10px 0">使用中</van-radio>
                              <van-radio name="3" style="margin:0  10px  10px 0">已禁用</van-radio>
                              <van-radio name="4" style="margin:0  10px  10px 0">故障</van-radio>
                              <van-radio name="5" style="margin:0  10px  10px 0">已欠费</van-radio>
                              <van-radio name="6" style="margin:0  10px  10px 0">未激活</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field
                        v-model="address"
                        name="address"
                        label="设备安装地址"
                        placeholder="设备安装地址"
                    />

                    <van-field
        
                        v-model="lat"
                        name="lat"
                        label="纬度"
                        placeholder="纬度"
                    />

                     <van-field
                        v-model="lng"
                        name="lng"
                        label="经度"
                        placeholder="经度"
                    />

                      <van-field
                        readonly
                        clickable
                        name="department_id"
                        :value="departmentvalue"
                        label="设备所属部门"
                        placeholder="点击选择设备所属部门"
                        @click="showdepartment = true"
                        />
                        <van-popup v-model="showdepartment" position="bottom">
                            <van-picker
                                show-toolbar
                                :columns="departmentColumns"
                                @confirm="onConfirmdepartment"
                                @cancel="showPicker = false"
                            />
                        </van-popup>

                     <van-field
                        v-model="ruleId"
                        name="rule_id"
                        label="运营规则id"
                        placeholder="运营规则id"
                    />
                     
                     <van-field name="activation" label=" 是否激活">
                        <template #input>
                            <van-radio-group v-model="activation" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                     <van-field name="correct" label=" 是否校准">
                        <template #input>
                            <van-radio-group v-model="correct" direction="horizontal">
                            <van-radio name="0">是</van-radio>
                            <van-radio name="1">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <div style="margin: 16px;">
                        <van-button round block type="info" native-type="submit">提交</van-button>
                    </div>
                </van-form>
          </div><!--/equipmentForm-->

          <!--地图经纬度  详细地址获取-->
          <van-popup v-model="lngLatShow" :style="{ height: 'auto' , width:'90%', borderRadius:'10px'}" >
             <div class="mapPopup" ref="mapPopupHeight" >
                 <div class="selectAdress" ref='selectAdressHeight'> 
                    <img src="../assets/images/present.png" alt="">
                    <span>选择地址</span>
                 </div>
                 <!--关闭弹窗按钮-->
                 <div class="closeTopRight" @click="lngLatShow=false">
                    <img src="../assets/images/close.png" alt="">
                 </div>
                 <baidu-map class="map" :center="center" :zoom="15" :style="{height:`${mapHeight}px` }"  @ready='handler' @click="getMapInfos"></baidu-map>
             </div>
          </van-popup>
          
    </div>
</template>
<script>
import {apiUrl, filetest,getlisting,postlisting } from '../utils/apiUrl'
export default {
    data(){
        return{
             btIco:require('../assets/images/bt.png'),
             sbbh: '',
             sbnx: '',
             sbmcvalue:'',
             showSbmc: false,
             sbmcColumns: ['设备名称1', '设备名称2', '设备名称3', '设备名称4', '设备名称5'],
             pic: [],
             picImg:'',
             radio:'1',
             verify:'1',
             qrcode:'1',
             card:'1',
             sbqy:'',
             whry:'',
             yyry:'',
            
             crateTimevalue:'',
             showCrateTime:false,


             createStaff:'',
             updateTime:'',
             upateTimevalue:'',
             showUpateTime:false,
             currentDate: new Date(),


             updateStaff:'',
             imei:'',

             activationTimevalue:'',
             showActivationTime:false,

             onlineTime:'',
             onlineTimevalue:'',
             showOnlineTime:false,

             status:'1',

             lngLatShow:false,
             address:'',
             lat:'',
             lng:'',



             departmentvalue:'',
             showdepartment: false,
             departmentColumns: ['部门1', '部门2', '部门3', '部门4', '部门5'],

             ruleId:'',
             activation:'1',
             correct:'0',
             center:{lng: 116.404, lat: 39.915},
             mapHeight:0,
        }
    },
    mounted(){
        
    },
    methods:{
        onSubmit(values) {
            values.pic=[this.picImg].toString()// 修改表单对象里pic的值
            console.log('onSubmit', values);
            let data={
                data:values
            }
            postlisting(process.env.BASE_URL_HTTPS+apiUrl.hxddeviceaddDevice,values)
            .then(res=>{
           //    console.log('设备添加',res)
               if(res.data==true){
                    this.$toast.loading({
                        message: '正在提交...',
                        forbidClick: true,
                        loadingType: 'spinner',
                    })
                  setTimeout(()=>{
                       this.$toast.success({
                            message: '提交成功、返回上一页！ ',
                            forbidClick: true,
                
                      })
                    },2000)

                    setTimeout(() => {
                        //this.$router.go(-1)
                         this.$router.back(0)
                    },4000);
               }
            })
        },
         onConfirm(value) {//设备名称
          this.sbmcvalue = value;
           this.showSbmc = false;
        },
        afterRead(file){//设备图片
           const that = this
           console.log('file',file)
          const imgFile = new FormData();
           imgFile.append('fileImage',file.file)
           console.log('imgFile__',imgFile)
           postlisting(process.env.BASE_URL_HTTPS+apiUrl.fileupload,imgFile,{
            headers: {
                'content-type': 'multipart/form-data'
             }    
           })
           .then(res=>{
             //console.log('图片上传__',res)
             if(res.status=='200'){
                 this.picImg=res.data
             }
           })  

        },
        onConfirmdepartment(value){//设备所属部门
            this.departmentvalue = value;
           this.showdepartment = false;
        },
        createTime(time){//创建时间
             this.crateTimevalue = this.filterTime(time);
            this.showCrateTime = false;
        },
        upateTime(time){//修改时间
             this.upateTimevalue = this.filterTime(time);
            this.showUpateTime = false;
        },
        activationTime(time){//激活时间
            this.activationTimevalue = this.filterTime(time);
            this.showActivationTime = false;
        },
        lastOnlineTime(time){//最后在线时间
            this.onlineTimevalue = this.filterTime(time);
            this.showOnlineTime = false;
        },
        //点击触发经纬度弹窗
        getLnglat(){
                this.lngLatShow=true
                this.$nextTick(()=>{
                 let mapPopupHeight=this.$refs.mapPopupHeight.offsetHeight,
                     selectAdressHeight=this.$refs.selectAdressHeight.offsetHeight;
                     this.mapHeight= mapPopupHeight-selectAdressHeight
                })
        },

        handler({ BMap, map }) {
           const that= this
           let geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                var mk = new BMapGL.Marker(r.point);
                map.addOverlay(mk);
                map.panTo(r.point);
               // console.log('您的位置：' + r.point.lng + ',' + r.point.lat);
                that.center={
                    lng:r.point.lng,
                    lat:r.point.lat
                }
            }
            else {
                alert('failed' + this.getStatus());
            }  
            })
        },

        //点击地图获取详细的地址和经纬度
        getMapInfos(e){
          console.log('e',e)
          let that = this;
          this.longitude= e.point.lng;//经度
          this.latitude= e.point.lat;//维度
          let  geocoder  = new BMap.Geocoder()//创建地址解析
          geocoder.getLocation(e.point,(res)=>{
              that.address =res.address
              that.lng= e.point.lng;//经度
              that.lat= e.point.lat;//维度
              that.lngLatShow=false
          })
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
    }
}
</script>

<style  lang='scss'>
 html,body{background: #fff;}
 .equipment{ width: 95%; margin: auto;
   .equipmentTitle{
      display: flex; align-items: center; justify-content:  flex-start; padding: 5% 0 2% 0; border-bottom: 1px solid #f5f6f7;
     >img{ width: 25px; height: 25px;}
     >span{ font-size: 16px; color: #333; font-weight: 700; margin:  0 0 0 10px;}
   }//equipmentTitle

   .mapPopup{ widows: 100%; height: 400PX; position: relative; 
     .selectAdress{
        display: flex; align-items: center; justify-content:flex-start; padding: 10px ;
        >img{width: 20px; height: 20px;}
        span{ font-size: 16px; color: #5ecef6; margin:  0  0 0 5px;}
     }//selectAdress
     .closeTopRight{
          width: 20px; height: 20px;  position: absolute; top:10px; right: 10px;
          >img{ width: 20px; height: 20px; }
     }//closeTopRight
   }//mapPopup
 }    
</style>
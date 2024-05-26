<template>
    <div class="dirverqueryheight">
         <div class="dirverquery">
              <div class="equipmentForm">
               <van-form @submit="onSubmit">
                    <van-field
                        v-model="lists.serialnumber"
                        name="serialnumber"
                        left-icon=""
                        label="设备编号"
                        placeholder="设备编号"
                    />
                   <van-field
                        v-model="lists.devicetypeid"
                        name="devicetypeid"
                        label="设备类型编号"
                        placeholder="设备类型编号"
                    />

                    <van-field
                         v-model="lists.name"
                        name="name"
                        label="设备名称"
                        placeholder="点击选择设备名称"
                        />
                    <!-- <van-field name="pic" label="设备图片">
                        <template #input>
                            <van-uploader v-model="picImg" :max-count='1'  :after-read='afterRead'  accept="image/*"/>
                        </template>
                    </van-field> -->

                    <van-field name="face" label="人脸识别">
                        <template #input>
                            <van-radio-group v-model="lists.face" direction="horizontal" >
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="phone" label="手机短信验证">
                        <template #input>
                            <van-radio-group v-model="lists.phone" direction="horizontal" >
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="qrcode" label="二维码登录">
                        <template #input>
                            <van-radio-group v-model="lists.qrcode" direction="horizontal" >
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="card" label="刷卡登录">
                        <template #input>
                            <van-radio-group v-model="lists.card" direction="horizontal" >
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field
                        v-model="lists.devicearea"
                        name="devicearea"
                        label="设备区域"
                        placeholder="设备区域"
                    />

                    <van-field
                        v-model="lists.maintenancestaff"
                        name="maintenancestaff"
                        label="维护人员"
                        placeholder="维护人员"
                    />

                   <van-field
                        v-model="lists.operators"
                        name="operators"
                        label="运营人员"
                        placeholder="运营人员"
                    />

                     <van-field
                        readonly
                        clickable
                        name="createtime"
                         :value="lists.createtime"
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
                        v-model="lists.createstaff"
                        name="createstaff"
                        label="创建人"
                        placeholder="创建人"
                    />


                         <van-field
                            readonly
                            clickable
                            name="updatetime"
                            :value="lists.upatetime"
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
                        v-model="lists.updatestaff"
                        name="updatestaff"
                        label="修改人"
                        placeholder="修改人"
                    />

                     <van-field
                        v-model="lists.imei"
                        name="imei"
                        label="设备imei"
                        placeholder="设备imei"
                    />
                    
                           
                    <van-field
                        readonly
                        clickable
                        name="activationtime"
                       :value="lists.activationtime"
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
                        name="onlinetime"
                        :value="lists.onlinetime"
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
                            <van-radio-group v-model="lists.status" >
                              <van-radio name="1" style="margin:0  10px  10px 0" >待使用</van-radio>
                              <van-radio name="2" style="margin:0  10px  10px 0">使用中</van-radio>
                              <van-radio name="3" style="margin:0  10px  10px 0">已禁用</van-radio>
                              <van-radio name="4" style="margin:0  10px  10px 0">故障</van-radio>
                              <van-radio name="5" style="margin:0  10px  10px 0">已欠费</van-radio>
                              <van-radio name="6" style="margin:0  10px  10px 0">未激活</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field
                        v-model="lists.address"
                        name="address"
                         type="textarea"
                         autosize
                         rows="2"
                        label="设备安装地址"
                        placeholder="设备安装地址"
                    />

                    <van-field
                        v-model="lists.lat"
                        name="lat"
                        label="纬度"
                        type='number'
                        placeholder="纬度"
                    />

                     <van-field
                        v-model="lists.lng"
                        name="lng"
                        label="经度"
                        type='number'
                        placeholder="经度"
                    />

                      <van-field
                        name="departmentid"
                         v-model="lists.departmentid"
                        label="设备所属部门"
                        placeholder="点击选择设备所属部门"
                        />

                     <van-field
                        v-model="lists.ruleid"
                        name="ruleid"
                        label="运营规则id"
                        placeholder="运营规则id"
                    />
                     
                     <van-field name="activation" label=" 是否激活">
                        <template #input>
                            <van-radio-group v-model="lists.activation" direction="horizontal" >
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                     <van-field name="correct" label=" 是否校准">
                        <template #input>
                            <van-radio-group v-model="lists.correct" direction="horizontal" >
                            <van-radio name="0">是</van-radio>
                            <van-radio name="1">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    
              <div class="backBnt">
                <button style=" width: 40% " class="wpd"  native-type="submit">修改</button>
                <button style=" width: 40% " class="grey" @click="blackUrl">返回</button>
              </div>
                </van-form>
            </div><!--/equipmentForm-->

         </div>
    </div>
</template>
<script>
import {apiUrl,getlisting,postlisting} from '../utils/apiUrl'
export default {
     data(){
        return{
            url:apiUrl.url,
            index:this.$route.query.arrindex,
            lists:[],
            picImg:[],
            picImgUplate:'',//改变图片存放
            undateImg:false,//false 未改变、 TRUE  改变
             currentDate: new Date(),
            showCrateTime:false,//创建时间
            showUpateTime:false,//修改时间弹窗
            showActivationTime:false,//激活时间弹窗
            onlineTimevalue:'',//最后在线时间
            showOnlineTime:false,
        }
     },
     mounted(){
               console.log()
                this.getFindAll()
                 
     },
     methods:{
          getFindAll(){
            //BASE_URL_HTTPS_TWO
             getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxddevicefindAll)
             .then(res=>{
                  if(res.data.length){
                      this.lists =res.data[this.index]
                    console.log('修改this.lists.pic',this.lists.pic)
                      if(!this.lists.pic==null){
                          this.picImg=[{url:this.url+this.lists.pic}]
                      }else{
                        this.picImg=[]
                      }
                    
                     
                     // this.uplatePic(oriPic)
                  }
             })
        },


        afterRead(file){
                      const imgFile = new FormData();
                        imgFile.append('fileImage',file.file)
                        //console.log('imgFile__',imgFile)
                        postlisting(process.env.BASE_URL_HTTPS+apiUrl.fileupload,imgFile,{
                            headers: {
                                'content-type': 'multipart/form-data'
                            }    
                        })
                        .then(res=>{
                         console.log('图片上传__',res)
                            if(res.status=='200'){
                                this.picImgUplate=res.data
                                this.undateImg=true
                            }
                        })  
        },
           createTime(time){//创建时间
             this.lists.createtime = this.filterTime(time);
            this.showCrateTime = false;
        },
         upateTime(time){//修改时间
             this.lists.upatetime = this.filterTime(time);
            this.showUpateTime = false;
        },
          activationTime(time){//激活时间
            this.lists.activationtime = this.filterTime(time);
            this.showActivationTime = false;
        },
         lastOnlineTime(time){//最后在线时间
            this.lists.onlinetime = this.filterTime(time);
            this.showOnlineTime = false;
        },
        blackUrl(){
             this.$router.replace({path:'/driverquery'})
        },
          onSubmit(values) {//提交修改的设备信息
            if(!this.undateImg){
                  values.pic = this.lists.pic  //旧图片
                  values={...values,id:this.lists.id}
                //   console.log('未改变values',values)
            }else{
                 values.pic = this.picImgUplate //新图片
                  values={...values,id:this.lists.id}
             //    console.log('已改变values',values)
            }
               
              let data={
                data:values
            }

            //BASE_URL_HTTPS_TWO
            postlisting(process.env.BASE_URL_HTTPS+apiUrl.hxddeviceupdateDevice,values)
            .then(res=>{
           //    console.log('设备添加',res)
               if(res.data==true){
                    this.$toast.loading({
                        message: '正在修改...',
                        forbidClick: true,
                        loadingType: 'spinner',
                    })
                  setTimeout(()=>{
                       this.$toast.success({
                            message: '修改成功、返回上一页！ ',
                            forbidClick: true,
                
                      })
                    },2000)

                    setTimeout(() => {
                         this.$router.replace({path:'/driverquery'})
                    },4000);
               }
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

<style lang='scss'  >
    .dirverqueryheight{background: #fff; height: 100vh; overflow-y: auto;}
    .backBnt{
         padding:50px 0;
         >button{  border-radius: 20px; border:none; font-size: 16px; color: #fff; padding: 10px 0;}
    }
</style>
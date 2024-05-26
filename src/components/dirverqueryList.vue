<template>
    <div class="dirverqueryheight">
         <div class="dirverquery">
              <div class="equipmentForm">
               <van-form>
                    <van-field
                    readonly
                        v-model="lists.serialnumber"
                        name="serial_number"
                        left-icon=""
                        label="设备编号"
                        placeholder="设备编号"
                    />
                   <van-field
                        readonly
                        v-model="lists.devicetypeid"
                        name="device_type_id"
                        label="设备类型编号"
                        placeholder="设备类型编号"
                    />

                    <van-field
                       v-if='lists.name'
                        readonly
                         v-model="lists.name"
                        name="name"
                        label="设备名称"
                        placeholder="点击选择设备名称"
                        />
                    <!-- <van-field name="pic" label="设备图片" v-if="lists.pic">
                        <template #input>
                            <van-uploader v-model="picImg" :max-count='1' :deletable='false'/>
                        </template>
                    </van-field> -->

                    <van-field name="face" label="人脸识别">
                        <template #input>
                            <van-radio-group v-model="lists.face" direction="horizontal" disabled>
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="phone" label="手机短信验证">
                        <template #input>
                            <van-radio-group v-model="lists.phone" direction="horizontal" disabled>
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="qrcode" label="二维码登录">
                        <template #input>
                            <van-radio-group v-model="lists.qrcode" direction="horizontal" disabled>
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field name="card" label="刷卡登录">
                        <template #input>
                            <van-radio-group v-model="lists.card" direction="horizontal" disabled>
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                    <van-field
                        readonly
                        v-model="lists.devicearea"
                        name="device_area"
                        label="设备区域"
                        placeholder="设备区域"
                    />

                    <van-field
                        readonly
                        v-model="lists.maintenancestaff"
                        name="maintenance_staff"
                        label="维护人员"
                        placeholder="维护人员"
                    />

                   <van-field
                       readonly
                        v-model="lists.operators"
                        name="Operators"
                        label="运营人员"
                        placeholder="运营人员"
                    />


                    <van-field
                        readonly
                        name="lists.createtime"
                        :value="lists.createtime"
                        label="创建时间"
                        placeholder="创建时间"
                        />
                      

                    <van-field
                        readonly
                        v-model="lists.createstaff"
                        name="createstaff"
                        label="创建人"
                        placeholder="创建人"
                    />

                    <van-field
                        readonly
                        name="updatetime"
                        :value="lists.upatetime"
                        label="修改时间"
                        placeholder="修改时间"
                   
                        />
              
                     <van-field
                     readonly
                        v-model="lists.updatestaff"
                        name="update_staff"
                        label="修改人"
                        placeholder="修改人"
                    />

                     <van-field
                       readonly
                        v-model="lists.imei"
                        name="imei"
                        label="设备imei"
                        placeholder="设备imei"
                    />
                    
                    <van-field
                        readonly
                        name="lists.activationtime"
                        :value="lists.activationtime"
                        label="激活时间"
                        placeholder="激活时间"
                      
                        />
           

                    <van-field
                        readonly
                        name="online_time"
                        :value="lists.onlinetime"
                        label="最后在线时间"
                        placeholder="最后在线时间"
                        />
        
                
                     <van-field name="status" label="状态">
                        <template #input>
                            <van-radio-group v-model="lists.status" disabled>
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
                         readonly
                        v-model="lists.address"
                        name="address"
                         type="textarea"
                        autosize
                         rows="2"
                        label="设备安装地址"
                        placeholder="设备安装地址"
                    />

                    <van-field
                         readonly
                        v-model="lists.lat"
                        name="lat"
                        type='number'
                        label="纬度"
                        placeholder="纬度"
                    />

                     <van-field
                        readonly
                        v-model="lists.lng"
                        name="lng"
                        type='number'
                        label="经度"
                        placeholder="经度"
                    />

                      <van-field
                        readonly
                        name="department_id"
                        :value="lists.departmentid"
                        label="设备所属部门"
                        placeholder="点击选择设备所属部门"
                        />

                     <van-field
                       readonly
                        v-model="lists.ruleid"
                        name="rule_id"
                        label="运营规则id"
                        placeholder="运营规则id"
                    />
                     
                     <van-field name="activation" label=" 是否激活">
                        <template #input>
                            <van-radio-group v-model="lists.activation" direction="horizontal" disabled>
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>

                     <van-field name="correct" label=" 是否校准">
                        <template #input>
                            <van-radio-group v-model="lists.correct" direction="horizontal" disabled>
                            <van-radio name="0">是</van-radio>
                            <van-radio name="1">否</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>
                </van-form>
            </div><!--/equipmentForm-->

              <div class="backBnt">
                <button class="wpd" @click="blackUrl">返回</button>
              </div>
         </div>
    </div>
</template>
<script>
import {apiUrl,getlisting} from '../utils/apiUrl'
export default {
     data(){
        return{
            url:apiUrl.url,
            index:this.$route.query.arrindex,
            lists:[],
            picImg:[]
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
                      this.lists =res.data[this.index]
                    
                     this.picImg=[{url:this.url+this.lists.pic}]
                  }
             })
        },
        blackUrl(){
             this.$router.replace({path:'/driverquery'})
        }
     }
}
</script>
<style lang='scss'>
    .dirverqueryheight{background: #fff; height: 100vh; overflow-y: auto;}
    .backBnt{
         padding:50px 0;
         >button{ width: 80%  ; border-radius: 20px; border:none; font-size: 16px; color: #fff; padding: 10px 0;}
    }
</style>
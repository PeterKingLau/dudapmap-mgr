<template>
  <div class="equipment">
    <div class="equipmentTitle">
      <img src="../assets/images/equipment.png" alt="" />
      <span>打卡配置</span>
    </div>

    <div class="equipmentForm">
      <van-form @submit="onSubmit" label-width="100">
        <template v-if="rules.indexOf('10001') > -1">
          <van-field
            name="start1"
            clickable
            label="打卡时段一起"
            @focus="disablePhoneIpt()"
            :value="start1"
            placeholder="请选择"
            @click="showStart1 = true"
          />
          <van-popup v-model="showStart1" round position="bottom">
            <van-datetime-picker
              @cancel="showStart1 = false"
              @confirm="(val) => onConfirmDksd(val, 'start1', 'showStart1')"
              type="time"
              title="第一打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="end1"
            clickable
            label="打卡时段一止"
            :value="end1"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showEnd1 = true"
          />
          <van-popup v-model="showEnd1" round position="bottom">
            <van-datetime-picker
              @cancel="showEnd1 = false"
              @confirm="(val) => onConfirmDksd(val, 'end1', 'showEnd1')"
              type="time"
              title="第一打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="start2"
            clickable
            label="打卡时段二起"
            :value="start2"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showStart2 = true"
          />
          <van-popup v-model="showStart2" round position="bottom">
            <van-datetime-picker
              @cancel="showStart2 = false"
              @confirm="(val) => onConfirmDksd(val, 'start2', 'showStart2')"
              type="time"
              title="第二打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="end2"
            clickable
            label="打卡时段二止"
            :value="end2"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showEnd2 = true"
          />
          <van-popup v-model="showEnd2" round position="bottom">
            <van-datetime-picker
              @cancel="showEnd2 = false"
              @confirm="(val) => onConfirmDksd(val, 'end2', 'showEnd2')"
              type="time"
              title="第二打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="start3"
            clickable
            label="打卡时段三起"
            :value="start3"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showStart3 = true"
          />
          <van-popup v-model="showStart3" round position="bottom">
            <van-datetime-picker
              @cancel="showStart3 = false"
              @confirm="(val) => onConfirmDksd(val, 'start3', 'showStart3')"
              type="time"
              title="第三打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="end3"
            clickable
            label="打卡时段三止"
            :value="end3"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showEnd3 = true"
          />
          <van-popup v-model="showEnd3" round position="bottom">
            <van-datetime-picker
              @cancel="showEnd3 = false"
              @confirm="(val) => onConfirmDksd(val, 'end3', 'showEnd3')"
              type="time"
              title="第三打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="start4"
            clickable
            label="打卡时段四起"
            :value="start4"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showStart4 = true"
          />
          <van-popup v-model="showStart4" round position="bottom">
            <van-datetime-picker
              @cancel="showStart4 = false"
              @confirm="(val) => onConfirmDksd(val, 'start4', 'showStart4')"
              type="time"
              title="第四打卡时段起始时间"
            />
          </van-popup>

          <van-field
            name="end4"
            clickable
            label="打卡时段四止"
            :value="end4"
            @focus="disablePhoneIpt()"
            placeholder="请选择"
            @click="showEnd4 = true"
          />
          <van-popup v-model="showEnd4" round position="bottom">
            <van-datetime-picker
              @cancel="showEnd4 = false"
              @confirm="(val) => onConfirmDksd(val, 'end4', 'showEnd4')"
              type="time"
              title="第四打卡时段起始时间"
            />
          </van-popup>
        </template>

        <van-field
          name="metainfo1"
          v-if="rules.indexOf('10002') > -1"
          readonly
          clickable
          label="打卡次数"
          @focus="disablePhoneIpt()"
          :value="metainfo1"
          @touchstart.native.stop="showDkcs = true"
        />
        <van-number-keyboard
          v-model="metainfo1"
          :maxlength="3"
          close-button-text="完成"
          :show="showDkcs"
          @blur="showDkcs = false"
        />

        <van-field
          name="metainfo2"
          v-if="rules.indexOf('10003') > -1"
          readonly
          @focus="disablePhoneIpt()"
          clickable
          label="打卡范围（米）"
          :value="metainfo2"
          @touchstart.native.stop="showDkfw = true"
        />
        <van-number-keyboard
          v-model="metainfo2"
          :maxlength="6"
          close-button-text="完成"
          :show="showDkfw"
          @blur="showDkfw = false"
        />

        <!-- 
                <van-field v-model="sbbh" name="serialnumber" left-icon="" label="设备编号" placeholder="设备编号"
                    :rules="[{ required: true, message: '请填设备编号' }]" />
                <van-field v-model="sbnx" name="devicetypeid" label="设备类型编号" placeholder="设备类型编号" /> -->

        <!-- <van-field name="name" v-model="sbmcvalue" label="设备名称" placeholder="请输入设备名称" /> -->

        <!-- <van-field name="pic" label="设备图片">
                    <template #input>
                        <van-uploader v-model="pic" multiple :max-count="1" :after-read='afterRead' accept="image/*" />
                    </template>
                </van-field> -->

        <van-field
          name="face"
          @focus="disablePhoneIpt()"
          v-if="rules.indexOf('10004') > -1"
          label="是否开启提示"
        >
          <template #input>
            <van-radio-group v-model="metainfo3" direction="horizontal">
              <van-radio name="1">是</van-radio>
              <van-radio name="0">否</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <!-- <van-field name="phone" label="手机短信验证">
                    <template #input>
                        <van-radio-group v-model="verify" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                        </van-radio-group>
                    </template>
                </van-field> -->

        <!-- <van-field name="qrcode" label="二维码登录">
                    <template #input>
                        <van-radio-group v-model="qrcode" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                        </van-radio-group>
                    </template>
                </van-field> -->

        <!-- <van-field name="card" label="刷卡登录">
                    <template #input>
                        <van-radio-group v-model="card" direction="horizontal">
                            <van-radio name="1">是</van-radio>
                            <van-radio name="2">否</van-radio>
                        </van-radio-group>
                    </template>
                </van-field> -->
        <!-- 
                <van-field v-model="sbqy" name="devicearea" label="设备区域" placeholder="设备区域" />

                <van-field v-model="whry" name="maintenancestaff" label="维护人员" placeholder="维护人员" />

                <van-field v-model="yyry" name="Operators" label="运营人员" placeholder="运营人员" />


                <van-field readonly clickable name="createtime" :value="crateTimevalue" label="创建时间" placeholder="创建时间"
                    @click="showCrateTime = true" />
                <van-popup v-model="showCrateTime" position="bottom">
                    <van-datetime-picker type="date" v-model="currentDate" @confirm="createTime"
                        @cancel="showCrateTime = false" />
                </van-popup>

                <van-field v-model="createStaff" name="createstaff" label="创建人" placeholder="创建人" />

                <van-field readonly clickable name="updatetime" :value="upateTimevalue" label="修改时间" placeholder="修改时间"
                    @click="showUpateTime = true" />
                <van-popup v-model="showUpateTime" position="bottom">
                    <van-datetime-picker type="date" v-model="currentDate" @confirm="upateTime"
                        @cancel="showPicker = false" />
                </van-popup>

                <van-field v-model="updateStaff" name="updatestaff" label="修改人" placeholder="修改人" />

                <van-field v-model="imei" name="imei" label="设备imei" placeholder="设备imei" />

                <van-field readonly clickable name="activationtime" :value="activationTimevalue" label="激活时间"
                    placeholder="激活时间" @click="showActivationTime = true" />
                <van-popup v-model="showActivationTime" position="bottom">
                    <van-datetime-picker type="date" v-model="currentDate" @confirm="activationTime"
                        @cancel="showActivationTime = false" />
                </van-popup>

                <van-field readonly clickable name="onlinetime" :value="onlineTimevalue" label="最后在线时间" placeholder="最后在线时间"
                    @click="showOnlineTime = true" />
                <van-popup v-model="showOnlineTime" position="bottom">
                    <van-datetime-picker type="date" v-model="currentDate" @confirm="lastOnlineTime"
                        @cancel="showOnlineTime = false" />
                </van-popup>

                <van-field name="status" label="状态">
                    <template #input>
                        <van-radio-group v-model="status">
                            <van-radio name="1" style="margin:0  10px  10px 0">待使用</van-radio>
                            <van-radio name="2" style="margin:0  10px  10px 0">使用中</van-radio>
                            <van-radio name="3" style="margin:0  10px  10px 0">已禁用</van-radio>
                            <van-radio name="4" style="margin:0  10px  10px 0">故障</van-radio>
                            <van-radio name="5" style="margin:0  10px  10px 0">已欠费</van-radio>
                            <van-radio name="6" style="margin:0  10px  10px 0">未激活</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>

                <van-field v-model="$store.getters.getAddress" name="address" type="textarea" autosize rows="2"
                    label="设备安装地址" placeholder="设备安装地址" />

                <van-field v-model="$store.getters.getCenter.lat" name="lat" label="纬度" type='number' placeholder="纬度" />

                <van-field v-model="$store.getters.getCenter.lng" name="lng" label="经度" type='number' placeholder="经度" />

                <van-field name="departmentid" v-model="departmentvalue" label="设备所属部门" placeholder="设备所属部门" />


                <van-field v-model="ruleId" name="ruleid" label="运营规则id" placeholder="运营规则id" />

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
                </van-field> -->

        <div style="margin: 16px">
          <van-button round block type="info" native-type="submit">提交</van-button>
        </div>
      </van-form>
    </div>
    <!--/equipmentForm-->

    <!--地图经纬度  详细地址获取-->
    <van-popup
      v-model="lngLatShow"
      :style="{ height: 'auto', width: '90%', borderRadius: '10px' }"
    >
      <div class="mapPopup" ref="mapPopupHeight">
        <div class="selectAdress" ref="selectAdressHeight">
          <img src="../assets/images/present.png" alt="" />
          <span>选择地址</span>
        </div>
        <!--关闭弹窗按钮-->
        <div class="closeTopRight" @click="lngLatShow = false">
          <img src="../assets/images/close.png" alt="" />
        </div>
        <baidu-map
          class="map"
          :center="center"
          :zoom="15"
          :style="{ height: `${mapHeight}px` }"
          @ready="handler"
          @click="getMapInfos"
        ></baidu-map>
      </div>
    </van-popup>
  </div>
</template>
<script>
import { apiUrl, filetest, getlisting, postlisting } from "../utils/apiUrl";
import moment from "moment";
export default {
  data() {
    return {
      moment,
      btIco: require("../assets/images/bt.png"),
      dksd: "",
      // dksdColumns: ['时段1', '时段2', '时段3', '时段4'],
      // sbbh: '',
      // showDksd: false,

      start1: "", //第一打卡时段
      end1: "",
      start2: "", //第二打卡时段
      end2: "",
      start3: "", //第三打卡时段
      end3: "",
      start4: "", //第四打卡时段
      end4: "",

      showStart1: false,
      showEnd1: false,
      showStart2: false,
      showEnd2: false,
      showStart3: false,
      showEnd3: false,
      showStart4: false,
      showEnd4: false,

      limitinInfo: {}, //打卡时段查询返回值
      metaInfo: {}, //打卡配置信息返回值
      showDkcs: false, //打卡次数
      metainfo1: "",

      showDkfw: false, //打卡范围
      metainfo2: "",

      metainfo3: "0", //是否开启提示

      sbnx: "",
      sbmcvalue: "",
      showSbmc: false,
      sbmcColumns: ["设备名称1", "设备名称2", "设备名称3", "设备名称4", "设备名称5"],
      pic: [],
      picImg: "",
      radio: "1",
      verify: "1",
      qrcode: "1",
      card: "1",
      sbqy: "",
      whry: "",
      yyry: "",

      crateTimevalue: "",
      showCrateTime: false,

      createStaff: "",
      updateTime: "",
      upateTimevalue: "",
      showUpateTime: false,
      currentDate: new Date(),

      updateStaff: "",
      imei: "",

      activationTimevalue: "",
      showActivationTime: false,

      onlineTime: "",
      onlineTimevalue: "",
      showOnlineTime: false,

      status: "1",

      lngLatShow: false,
      address: "",
      lat: "",
      lng: "",

      departmentvalue: "",
      showdepartment: false,
      departmentColumns: ["部门1", "部门2", "部门3", "部门4", "部门5"],

      ruleId: "",
      activation: "1",
      correct: "0",
      center: { lng: 116.404, lat: 39.915 },
      mapHeight: 0,
      rules: [],
    };
  },
  mounted() {
    this.fetchhxdlimmitFindAll();
    this.fetchhxdmetaFindAll();
    this.getUserInfo();
  },
  methods: {
    disablePhoneIpt() {
      document.activeElement.blur();
    },
    getUserInfo() {
      let userphone = JSON.parse(sessionStorage.getItem("userInfo")).userphone;
      getlisting(
        process.env.BASE_URL_HTTPS + apiUrl.hxduserfindSolo + "?userphone=" + userphone
      ).then((res) => {
        if (res) {
          this.rules = res.data.recvcode.split(",");
          console.log(this.rules);
        }
      });
    },
    fetchhxdmetaFindAll() {
      postlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdmetaFindAll).then((res) => {
        res = res.data;
        let metaInfo = res.filter((item) => item.disname === apiUrl.softwafeLocation); //筛选出该地区配置
        if (metaInfo.length > 0) {
          this.metaInfo = metaInfo[0];
          this.metainfo1 = this.metaInfo.metainfo1;
          this.metainfo2 = this.metaInfo.metainfo2;
          this.metainfo3 = this.metaInfo.metainfo3;
        }
      });
    },
    fetchhxdlimmitFindAll() {
      postlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdlimmitFindAll).then((res) => {
        res = res.data;
        console.log(res);
        let locationInfo = res.filter((item) => item.disname === apiUrl.softwafeLocation); //筛选出该地区配置
        if (locationInfo.length > 0) {
          this.limitinInfo = locationInfo[0];
          this.start1 = this.limitinInfo.start1;
          this.start2 = this.limitinInfo.start2;
          this.start3 = this.limitinInfo.start3;
          this.start4 = this.limitinInfo.start4;
          this.end1 = this.limitinInfo.end1;
          this.end2 = this.limitinInfo.end2;
          this.end3 = this.limitinInfo.end3;
          this.end4 = this.limitinInfo.end4;
        }
      });
    },

    onConfirmDksd(value, name, shower) {
      console.log(value);

      this.$data[name] = value;
      this.$data[shower] = false;
    },
    //设备编号000318000059
    //纬度 31.463833、  经度：104.731107
    //安装地址 中国四川省绵阳市涪城区花园小区

    //000318000067
    //  31.464162           104.730655
    onSubmit(values) {
      let timer = {
        start1: this.start1,
        end1: this.end1,
        start2: this.start2,
        end2: this.end2,
        start3: this.start3,
        end3: this.end3,
        start4: this.start4,
        end4: this.end4,
        disname: sessionStorage.getItem("useravator") || undefined,
        id: this.limitinInfo.id || undefined,
      };

      let fetchUrl = this.limitinInfo.id ? apiUrl.hxdupdateLimit : apiUrl.hxdaddLimitinfo; //判断打卡时段是新增还是修改接口

      postlisting(process.env.BASE_URL_HTTPS + fetchUrl, timer).then((res) => {
        //    console.log('设备添加',res)
        if (res.data == true) {
          let metaParams = {
            metainfo1: this.metainfo1,
            metainfo2: this.metainfo2,
            metainfo3: this.metainfo3,
            id: this.metaInfo.id || undefined,
            disname: sessionStorage.getItem("useravator") || undefined,
          };

          let fetchMetaUrl = this.metaInfo.id
            ? apiUrl.hxdupdateMetaInfo
            : apiUrl.hxdaddMetaInfo; //判断打卡时段是新增还是修改接口
          postlisting(process.env.BASE_URL_HTTPS + fetchMetaUrl, metaParams).then(
            (res) => {
              //    console.log('设备添加',res)
              if (res.data == true) {
                this.$toast.loading({
                  message: "正在提交...",
                  forbidClick: true,
                  loadingType: "spinner",
                });
                setTimeout(() => {
                  this.$toast.success({
                    message: "提交成功、返回上一页！ ",
                    forbidClick: true,
                  });
                }, 2000);

                setTimeout(() => {
                  //this.$router.go(-1)
                  this.$router.back(0);
                }, 4000);
              }
            }
          );
        }
      });
    },
    onConfirm(value) {
      //设备名称
      this.sbmcvalue = value;
      this.showSbmc = false;
    },
    afterRead(file) {
      //设备图片
      const that = this;
      console.log("file", file);
      const imgFile = new FormData();
      imgFile.append("fileImage", file.file);
      console.log("imgFile__", imgFile);
      postlisting(process.env.BASE_URL_HTTPS + apiUrl.fileupload, imgFile, {
        headers: {
          "content-type": "multipart/form-data",
        },
      }).then((res) => {
        //console.log('图片上传__',res)
        if (res.status == "200") {
          this.picImg = res.data;
        }
      });
    },
    onConfirmdepartment(value) {
      //设备所属部门
      this.departmentvalue = value;
      this.showdepartment = false;
    },
    createTime(time) {
      //创建时间
      this.crateTimevalue = this.filterTime(time);
      this.showCrateTime = false;
    },
    upateTime(time) {
      //修改时间
      this.upateTimevalue = this.filterTime(time);
      this.showUpateTime = false;
    },
    activationTime(time) {
      //激活时间
      this.activationTimevalue = this.filterTime(time);
      this.showActivationTime = false;
    },
    lastOnlineTime(time) {
      //最后在线时间
      this.onlineTimevalue = this.filterTime(time);
      this.showOnlineTime = false;
    },
    //点击触发经纬度弹窗
    getLnglat() {
      this.lngLatShow = true;
      this.$nextTick(() => {
        let mapPopupHeight = this.$refs.mapPopupHeight.offsetHeight,
          selectAdressHeight = this.$refs.selectAdressHeight.offsetHeight;
        this.mapHeight = mapPopupHeight - selectAdressHeight;
      });
    },

    handler({ BMap, map }) {
      const that = this;
      let geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          var mk = new BMapGL.Marker(r.point);
          map.addOverlay(mk);
          map.panTo(r.point);
          // console.log('您的位置：' + r.point.lng + ',' + r.point.lat);
          that.center = {
            lng: r.point.lng,
            lat: r.point.lat,
          };
        } else {
          alert("failed" + this.getStatus());
        }
      });
    },

    //点击地图获取详细的地址和经纬度
    getMapInfos(e) {
      console.log("e", e);
      let that = this;
      this.longitude = e.point.lng; //经度
      this.latitude = e.point.lat; //维度
      let geocoder = new BMap.Geocoder(); //创建地址解析
      geocoder.getLocation(e.point, (res) => {
        that.address = res.address;
        that.lng = e.point.lng; //经度
        that.lat = e.point.lat; //维度
        that.lngLatShow = false;
      });
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
      return y + "-" + m + "-" + d;
      // return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + s;
    },
  },
};
</script>

<style lang="scss">
html,
body {
  background: #fff;
}

.equipment {
  width: 95%;
  margin: auto;

  .equipmentTitle {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5% 0 2% 0;
    border-bottom: 1px solid #f5f6f7;

    > img {
      width: 25px;
      height: 25px;
    }

    > span {
      font-size: 16px;
      color: #333;
      font-weight: 700;
      margin: 0 0 0 10px;
    }
  }

  //equipmentTitle

  .mapPopup {
    widows: 100%;
    height: 400px;
    position: relative;

    .selectAdress {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 10px;

      > img {
        width: 20px;
        height: 20px;
      }

      span {
        font-size: 16px;
        color: #5ecef6;
        margin: 0 0 0 5px;
      }
    }

    //selectAdress
    .closeTopRight {
      width: 20px;
      height: 20px;
      position: absolute;
      top: 10px;
      right: 10px;

      > img {
        width: 20px;
        height: 20px;
      }
    }

    //closeTopRight
  }

  //mapPopup
}
</style>

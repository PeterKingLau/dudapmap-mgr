<template>
  <div class="contentbox">
    <div class="contentPadding">
      <div class="mapBox">
        <!--超出范围时间显示-->
        <div class="minute" v-if="stoptime">
          <img src="../assets/images/out.png" />
          <span class="tsTitle">外出时间</span>
          <span class="tsRed" v-if="hours != 0">{{ hours }}小时</span>
          <span class="tsRed" v-if="minute != 0">{{ minute }}分钟</span>
        </div>
        <baidu-map
          class="map"
          :center="center"
          :zoom="zoom"
          :scroll-wheel-zoom="true"
          :style="`height:${screenHeight}px`"
          @click="getMapInfos"
          @ready="handler"
        >
          <bm-geolocation
            anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
            :showAddressBar="false"
            :autoLocation="true"
          ></bm-geolocation>

          <!--当前位置-->
          <bm-marker v-if="showDq" :position="center" :dragging="false" anum> </bm-marker>
          <!--坐标围绕-->
          <div v-if="embrace">
            <bm-circle
              :center="scopeCircle"
              :radius="radius"
              stroke-color="red"
              :stroke-opacity="1"
              :stroke-weight="2"
              :massClear="true"
            ></bm-circle>
            <bm-polygon
              :path="polygonPath"
              stroke-color="#f00"
              :stroke-opacity="1"
              :stroke-weight="2"
            ></bm-polygon>
            <!--超出坐标点显示-->
            <div v-for="item in exceedArry" :key="item.lng">
              <MyOverlayBlue :position="{ lng: item.lng, lat: item.lat }">
              </MyOverlayBlue>
            </div>
          </div>
          <!--/embrace-->
          <!-- <bm-point-collection :points="exceedArry" shape="BMAP_POINT_SHAPE_STAR" color="red" size="BMAP_POINT_SIZE_SMALL"></bm-point-collection> -->
          <!--点击地图添加位置-->
          <div v-if="addCoordShow">
            <div>
              <MyOverly
                :position="addCoord"
                :active="active"
                @mouseover.native="active = true"
                @mouseleave.native="active = false"
              >
              </MyOverly>
            </div>

            <!-- <bm-marker v-if='addCoordShow' :position="addCoord" :dragging="false" :icon="{url:addLoactinImg,size:{width:30,height:30}}"  animation="BMAP_ANIMATION_BOUNCE"> </bm-marker> -->
            <!--点击地图添加位置，再以点半径100的位置覆盖园-->
            <bm-circle
              :center="addCoord"
              :radius="radius"
              stroke-color="red"
              :stroke-opacity="0.5"
              :stroke-weight="2"
              :massClear="true"
            ></bm-circle>
          </div>
        </baidu-map>
      </div>

      <!--底部导航-->
      <div class="installer" ref="installerHeight">
        <ul>
          <li
            v-for="(item, index) in navSelect"
            :key="item.userInfo"
            @click="installerProup(index)"
          >
            <img :src="item.imgSrc" alt="" />
            <p>{{ item.userInfo }}</p>
          </li>
        </ul>
      </div>
      <!--/installer-->
    </div>
    <!--/contentPadding-->
    <!--底部导航更多显示右侧弹窗-->
    <van-popup
      v-model="showNav"
      closeable
      position="left"
      :style="{ height: '100%', width: '100%' }"
    >
      <div class="vanGrid">
        <div class="vanGridTitle">
          <img src="../assets/images/more.png" /> <span> 更多导航</span>
        </div>
        <van-grid :column-num="2">
          <van-grid-item
            :icon="require('../assets/images/dak.png')"
            text="督导员打卡查询"
            @click="clockIn"
          />
          <van-grid-item
            :icon="require('../assets/images/gj.png')"
            text="督导员点位查询"
            @click="trajectory"
          />
          <van-grid-item
            :icon="require('../assets/images/wdk.png')"
            text="某天未打卡查询"
            @click="toDayWdk"
          />
          <van-grid-item
            :icon="require('../assets/images/installer4.png')"
            text="入户信息"
            @click="ruHose"
          />
          <van-grid-item
            :icon="require('../assets/images/installer5.png')"
            text="预约信息"
            @click="subscribe"
          />
          <van-grid-item
            :icon="require('../assets/images/installer6.png')"
            text="坐标"
            @click="rider"
          />
          <van-grid-item
            :icon="require('../assets/images/installer7.png')"
            text="任务"
            @click="taskAll"
          />
          <van-grid-item
            :icon="require('../assets/images/installer9.png')"
            text="查看设备"
            @click="driverquery"
          />
          <van-grid-item
            :icon="require('../assets/images/installer8.png')"
            text="错误日志"
            @click="journal"
          />
          <van-grid-item
            v-if="myUserInfo.userrole === '管理员'"
            :icon="require('../assets/images/installer10.png')"
            text="打卡配置"
            @click="clockOpt"
          />
          <van-grid-item
            v-if="myUserInfo.userrole === '管理员'"
            :icon="require('../assets/images/installer11.png')"
            text="人员管理"
            @click="userInfo"
          />
          <van-grid-item
            :icon="require('../assets/images/installer12.png')"
            v-if="myUserInfo.userrole === '管理员'"
            text="请假管理"
            @click="aksForLeave"
          />
        </van-grid>
      </div>
    </van-popup>
    <!--安装员列表-->
    <van-popup
      ref="vanpopup"
      v-model="show"
      position="bottom"
      :style="{ height: `${screenHeight - 200}px`, background: '#f2f2f2' }"
      @close="clearVirtualStaff"
    >
      <!--角色选择-->
      <div>
        <van-tabs
          animated
          color="#5ecef6"
          title-active-color="#5ecef6"
          @click="tabsSelect"
        >
          <van-tab v-for="item in userroleList" :title="item" :key="item.username">
            <!-- @scroll="scrollBottom" ref='scrollSpringback' -->
            <div class="findAll" :style="{ height: `${screenHeight - 250}px` }">
              <ul v-if="findAll.length">
                <li v-for="item in findAll" :key="item.userphone">
                  <!-- <div ><div>姓名:<span></span></div> <span>{{item.username}}</span> </div> -->
                  <div>
                    <div>职位:<span></span></div>

                    <span v-if="item.infoflag == 1 || item.infoflag == 3">{{
                      item.userrole
                    }}</span>
                    <span
                      v-else
                      style="color: #5ecef6"
                      @click="forRoleUrl(item.userrole, item.userphone)"
                      >{{ item.userrole }} <img src="../assets/images/look.png" alt=""
                    /></span>
                  </div>
                  <div>
                    <div>电话号码:<span></span></div>
                    <span>{{ item.userphone }}</span>
                  </div>
                  <div>
                    <div>时间:<span></span></div>
                    <span>{{ item.userdate }}</span>
                  </div>

                  <img
                    v-if="item.infoflag == 2"
                    src="../assets/images/change.png"
                    alt=""
                  />
                </li>
              </ul>

              <div v-else class="inforTs">
                <img src="../assets/images/noDate.png" alt="" />
                <p>暂无施工人员对应的信息！</p>
              </div>

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
    <van-popup
      v-model="userPopup"
      :style="{ width: '70%', background: '#fff', borderRadius: '5px' }"
    >
      <div class="userContent">
        <h4><img src="../assets/images/installer.png" alt="" /> 指定员工查询</h4>
        <div class="searchUser">
          <div
            class="searchUserLi"
            :style="
              telShow == true ? 'border:1px solid #f00' : 'border:1px solid #e2e2e2'
            "
          >
            <span>员工电话:</span>
            <input
              type="tel"
              placeholder="请输入员工电话"
              v-model="userTel"
              readonly
              @click="phoneBottom"
            />
          </div>

          <div class="telTs" v-show="telShow">请输入正确的手机号码！</div>

          <div class="searchUserLi">
            <span>选择日期:</span>
            <input
              type="text"
              placeholder="请选择日期"
              v-model="userDats"
              @click="selectDaspopup"
              readonly
            />
          </div>
          <div class="telTs" v-show="datsShow">请选择日期！</div>
          <div class="searchUserbutton">
            <button @click="searchUserInfo">查询</button>
          </div>
        </div>
        <!--/searchUser-->
      </div>
      <!--/userContent-->
    </van-popup>

    <!-- 指定员工查询  电话号码层-->

    <van-action-sheet
      v-model="phoneShow"
      :actions="phoneLis"
      description="请选择您要查找的电话号码"
      cancel-text="取消"
      @select="onSelect"
    />

    <van-popup
      v-model="userDatsShow"
      position="bottom"
      :style="{ height: '40%', background: '#f2f2f2' }"
    >
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title=" 选择时间"
        :columns-order="['year', 'month', 'day']"
        :formatter="formatter"
        @confirm="selectDats"
        @cancel="closeDatspopup"
      />
    </van-popup>

    <!--点击地图生成点的弹出层-->
    <van-popup
      v-model="createShow"
      :style="{ width: '70%', background: '#fff', borderRadius: '5px' }"
    >
      <div class="userContent">
        <h4><img src="../assets/images/present.png" alt="" />当前位置</h4>
        <div class="currentPostion">
          <ul>
            <li>
              <span>当前位置:</span>
              <p>{{ propaddress }}</p>
            </li>

            <li>
              <span> 当前经度:</span>
              <p>{{ longitude }}</p>
            </li>

            <li>
              <span> 当前纬度:</span>
              <p>{{ latitude }}</p>
            </li>
          </ul>
        </div>

        <div class="addLocation">
          <button @click="addCoordClick">添加位置</button>
          <button @click="anew">重新添加</button>
        </div>
        <!--/addLocation-->
      </div>
      <!--/userContent-->
    </van-popup>

    <van-popup
      v-model="dwShow"
      :style="{ width: 'auto', background: '#fff', padding: '20px', borderRadius: '5px' }"
    >
      <!--请求路线提示-->
      <van-loading type="spinner" color="#5ecef6" size="24px" vertical
        >正在请求定位路线，请稍等！</van-loading
      >
    </van-popup>

    <!--某一天未打卡信息弹出层-->
    <van-popup
      v-model="wdkshow"
      :style="{ width: '90%', background: '#fff', borderRadius: '5px' }"
      closeable
    >
      <h4 class="title">查询某一天未打卡</h4>
      <div class="selecttime">
        <span>选择日期:</span>
        <input
          type="text"
          placeholder="请选择日期"
          v-model="dayValue"
          readonly
          @click="dtDatesClick"
        />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
      <div class="buttonStyle">
        <van-button
          square
          type="primary"
          style="height: 35px; width: 100px"
          @click="dtSearch"
          >查询</van-button
        >
      </div>
    </van-popup>

    <!-- 当天日期层 -->
    <van-popup
      v-model="dtDatsShow"
      position="bottom"
      :style="{ height: '40%', background: '#f2f2f2' }"
    >
      <van-datetime-picker
        :columns-order="['year', 'month', 'day']"
        v-model="dtCurrentDate"
        title="选择日期"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        :formatter="formatter"
        @confirm="dtConfirm"
        @cancel="dtDatsShow = false"
      />
    </van-popup>
  </div>
</template>
<script>
import {
  apiUrl,
  filetest,
  getlisting,
  hxduserfindAll,
  filterTimeday,
} from "../utils/apiUrl";
import MyOverly from "../comm/MyOverlay.vue";
import MyOverlayBlue from "../comm/MyOverlayBlue.vue";
import { Notify } from "vant";
import { ref } from "vue";
export default {
  components: {
    MyOverly,
    MyOverlayBlue,
  },
  setup() {
    const currentDate = ref(new Date());
    const formatter = (type, val) => {
      if (type === "year") {
        return `${val}年`;
      }
      if (type === "month") {
        return `${val}月`;
      }
      return val;
    };

    return {
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2025, 10, 1),
      formatter,
      currentDate: new Date(),
    };
  },
  data() {
    return {
      dtCurrentDate: new Date(),
      wdkshow: false,
      dayValue: "",
      dtDatsShow: false,
      showNav: false,
      loading: false,
      finished: false,
      showDq: false, // 当前位置显示
      wheelZoom: true,
      polygonPath: [], //坐标围绕
      screenHeight: 0,
      show: false, //安装员列表
      selectGz: "", //工种
      userPopup: false, //指定员工查询弹出层
      //  center: {lng:104.648323, lat:31.525121},
      center: { lng: 0, lat: 0 },
      zoom: 15,
      longitude: 0, //经度
      latitude: 0, //维度
      propprovince: "", //省
      propcity: "", //市
      propcounty: "", //县
      propaddress: "", //详细地址
      findAll: [],
      userroleList: ["全部", "小工", "大工", "宣传员", "督导员", "安装员", "配送员"],
      navSelect: [
        {
          imgSrc: require("../assets/images/installer.png"),
          userInfo: "施工人员",
        },
        {
          imgSrc: require("../assets/images/installer2.png"),
          userInfo: "查询",
        },
        {
          imgSrc: require("../assets/images/installer3.png"),
          userInfo: "增加设备",
        },
        {
          imgSrc: require("../assets/images/more.png"),
          userInfo: "更多",
        },
        //  {imgSrc:require('../assets/images/installer4.png'),
        //  userInfo:'入户信息'
        // },
        //  {imgSrc:require('../assets/images/installer5.png'),
        //  userInfo:'预约查询'
        // }
      ],

      //指定员工电话\日期查询字段
      userDatsShow: false,
      userDats: "",
      userTel: "",
      telShow: false,
      datsShow: false,
      //指定员工选择时间
      currentDate: new Date(),
      //点击地图生成点显示弹出层
      createShow: false,
      addCoordShow: false, //点击地图显示坐标点
      addCoord: { lng: 0, lat: 0 }, //点击地图店家坐标点
      addLoactinImg: require("../assets/images/gcs.png"),
      radius: 100, //半径100
      active: false,
      //超出坐标点
      exceedArry: [],
      zbImg: require("../assets/images/zb.png"),
      exccedImg: require("../assets/images/excced.png"),
      scopeCircle: { lng: 0, lat: 0 }, //范围
      embrace: false,
      //安装人员列表  滚动到底部加载虚拟人员
      moreShow: false,
      //安装人员超出范围逗留时间
      hours: 0,
      minute: 0,
      stoptime: false,
      equipmentAdress: "", //设备安装地址
      dwShow: false, //查看指定员工定位显示请求的等待效果
      phoneShow: false, //电话号码层显示
      phoneLis: [], //电话号码
      myUserInfo: {},
    };
  },
  mounted() {
    this.getUserInfo();
    this.screenHeight =
      document.documentElement.clientHeight -
      this.$refs.installerHeight.offsetHeight -
      50;
    window.onresize = () =>
      (() => {
        this.screenHeight = window.innerHeight;
      })();

    this.getFillAll(); //获取全部施工人员的信息
    this.clearVirtualStaff(); //进入页面默认清除一次虚拟人员的信息

    // for(let i=0;i<=20;i++){ //默认执行20次
    //    setTimeout(() => {
    //      this.getVirtualStaff()
    //    }, i*100);
    // }
    //
    this.getUserPhone(); //获取所有员工信息(电话号码)
  },
  watch: {
    center: {
      handler(newVal, oldVal) {
        this.$store.commit("updateCenter", newVal);
      },
      deep: true,
    },
    equipmentAdress: {
      handler(newVal, oldVal) {
        // console.log('12321213',newVal)
        this.$store.commit("updateAddress", newVal);
      },
      deep: true,
    },
  },
  methods: {
    getUserInfo() {
      let userphone = JSON.parse(sessionStorage.getItem("userInfo")).userphone;
      getlisting(
        process.env.BASE_URL_HTTPS + apiUrl.hxduserfindSolo + "?userphone=" + userphone
      ).then((res) => {
        if (res) {
          this.myUserInfo = res.data;
          console.log(this.rules);
        }
      });
    },
    //获取所有员工信息(电话号码)
    getUserPhone() {
      // getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdusergetUserPhone)
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindAll).then((res) => {
        let arrylis = res.data;
        this.phoneLis = arrylis.map((item) => {
          return { name: item.userphone };
        });
      });
    },
    //点击选择电话号码。，触发电话号码的弹窗
    phoneBottom() {
      this.phoneShow = true;
    },

    //电话号码层显示
    onSelect(item) {
      this.userTel = item.name;
      this.phoneShow = false;
    },

    //获取用户当前所在的经纬度
    async handler({ BMap, map }) {
      const that = this;
      var geolocation = new BMap.Geolocation({ maximumAge: 10 });
      geolocation.getCurrentPosition(function (r) {
        // console.log('this.getStatus()__',this.getStatus())
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          that.center.lng = r.longitude;
          that.center.lat = r.latitude;
          that.equipmentAdress =
            r.address.province + r.address.city + r.address.district + r.address.street;
          setTimeout(() => {
            that.showDq = true;
          }, 500);
        } else {
          alert("failed" + this.getStatus());
        }
      });
    },

    //地图获取
    getMapInfos(e) {
      //   console.log('e',e)
      let that = this;
      this.longitude = e.point.lng; //经度
      this.latitude = e.point.lat; //维度
      let geocoder = new BMap.Geocoder(); //创建地址解析
      //  console.log('geocoder',geocoder)
      geocoder.getLocation(e.point, (res) => {
        // console.log('1231',res)
        that.propaddress = res.address;
        that.longitude = e.point.lng; //经度
        that.latitude = e.point.lat; //维度
        that.createShow = true; //显示坐标详细弹层
        that.addCoordShow = false; //显示坐标
      });
    },

    //点击地图触发弹层显示当前经纬度以及详细位置
    addCoordClick() {
      this.addCoord = {
        lng: this.longitude,
        lat: this.latitude,
      };
      // this.center={
      //     lng:this.longitude,
      //     lat:this.latitude
      // }

      this.addCoordShow = true; //显示坐标
      this.createShow = false; //隐藏坐标详细弹层
      this.stoptime = false;
      this.embrace = false;
      //    console.log(' this.addCoord', this.addCoord)
    },
    //重新选择经纬度
    anew() {
      this.addCoord = {
        lng: 0,
        lat: 0,
      };
      this.addCoordShow = false; //隐藏坐标
      this.createShow = false;
    },

    installerProup(index) {
      switch (index) {
        case 0:
          this.show = true;
          // this.getPopup()
          break;
        case 1:
          this.userPopup = true;
          this.userDats = "";
          this.userTel = "";
          this.telShow = false;
          this.datsShow = false;
          this.embrac = false;
          this.stoptime = false;
          break;
        case 2: //增加设备页面跳转
          this.$router.push({ path: "/equipment" });
          break;
        // case 3 ://入户信息
        //    this.$router.push({path:'/households'})
        // break;
        // case 4 ://查询预约
        //     this.$router.push({path:'/findAllYyue'})
        //  break;
        case 3: //更多
          this.showNav = true;
          break;
      }
    },
    trajectory() {
      //指定时间段员工轨迹
      this.$router.push({ path: "/trajectory" });
    },
    //打卡
    clockIn() {
      this.$router.push({ path: "/clockIn" });
    },
    //某天未打卡
    toDayWdk() {
      this.wdkshow = true;
    },

    dtDatesClick() {
      //当天日期弹出层
      this.dtDatsShow = true;
    },

    dtConfirm(e) {
      console.log(filterTimeday(e));
      this.dtDatsShow = false;
      this.dayValue = filterTimeday(e);
    },

    dtSearch() {
      //某一天未打卡查询
      if (this.dayValue === "") {
        //  console.log('12321')
        Notify({ type: "warning", message: "请选择日期进行查询！" });
      } else {
        //  this.getClockIn()
        this.$router.push({ path: "/unclockedClickIn", query: { day: this.dayValue } });
      }
    },

    //入户信息 链接跳转
    ruHose() {
      this.$router.push({ path: "/households" });
    },

    //查询预约 链接跳转
    subscribe() {
      this.$router.push({ path: "/findAllYyue" });
    },
    //骑手坐标 链接跳转
    rider() {
      this.$router.push({ path: "/rider" });
    },
    //任务列表跳转
    taskAll() {
      this.$router.push({ path: "/taskLists" });
    },
    //查看设备
    driverquery() {
      this.$router.push({ path: "/driverquery" });
    },
    //错误日志
    journal() {
      this.$router.push({ path: "/journal" });
    },
    //打卡配置
    clockOpt() {
      this.$router.push({ path: "/clockOpt" });
    },
    userInfo() {
      this.$router.push({ path: "/userMgr" });
    },
    aksForLeave() {
      this.$router.push({ path: "/leaveMgr" });
    },

    //点击弹出层里的tabs切换对应的施工人员的信息
    tabsSelect(name, title) {
      this.selectGz = title;

      switch (title) {
        case "全部":
          this.getFillAll();
          this.loading = false;
          break;
        case "小工":
          this.getAnZuser(title);
          (this.loading = true), (this.finish = false);
          break;
        case "大工":
          this.getAnZuser(title);
          (this.loading = true), (this.finish = false);
          break;
        case "宣传员":
          this.getAnZuser(title);
          (this.loading = true), (this.finish = false);
          break;
        case "督导员":
          this.getAnZuser(title);
          (this.loading = true), (this.finish = false);
          break;
        case "安装员":
          this.getAnZuser(title);
          (this.loading = true), (this.finish = false);
          break;
        case "配送员":
          this.getAnZuser(title);
          (this.loading = true), (this.finish = false);
          break;
      }
    },
    //获取全部施工人员的信息
    getFillAll() {
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindAll).then((res) => {
        // this.findAll=res.data
        let lis = res.data;
        this.findAll = lis.map((item) => {
          switch (item.userrole) {
            case null:
              item.userrole = "督导员-督导员";
              item.infoflag = 2; //改变状态
              break;
            case "null-小工":
              item.userrole = "小工-小工";
              break;
            case "null-小工":
              item.userrole = "小工-小工";
              break;
            case "null-大工":
              item.userrole = "大工-大工";
              break;
            case "null-宣传员":
              item.userrole = "宣传员-宣传员";
              break;
            case "null-督导员":
              item.userrole = "督导员-督导员";
              break;
            case "null-安装员":
              item.userrole = "安装员-安装员";
              break;
            case "null-配送员":
              item.userrole = "配送员-配送员";
              break;
          }

          return item;
        });

        // console.log('新————————:',newLis)
      });
    },

    // onLoad() {
    // 异步更新数据
    // setTimeout 仅做示例，真实场景中一般为 ajax 请求
    //     setTimeout(() => {
    //       // 加载状态结束
    //          this.loading = false;
    //          this.getVirtualStaff()

    //     }, 1000);
    // },
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
    getVirtualStaff() {
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduseraddUserBatch).then((res) => {
        this.getFillAll();
      });
    },
    //清除虚拟员工信息
    clearVirtualStaff() {
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserdeleteUserBatch).then(
        (res) => {
          //console.log(res)
          this.getFillAll();
        }
      );
    },

    // 申请变更角色 跳转新页面
    forRoleUrl(changeName, tel) {
      this.$router.push({
        path: "/forRole",
        query: { changeName: changeName, tel: tel },
      });
    },
    //获取指定人员的的信息
    getAnZuser(userAnz) {
      let data = {
        userrole: userAnz,
      };
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindUserByRole, {
        params: data,
      }).then((res) => {
        if (!res.data.length == 0) {
          this.findAll = [];
          this.findAll = res.data;
        } else {
          this.findAll = [];
        }
      });
    },

    //点击选择时间出现选择时间弹层
    selectDaspopup() {
      this.userDatsShow = true;
    },

    //选择时间
    formatter(type, val) {
      if (type === "year") {
        return val + "年";
      }
      if (type === "month") {
        return val + "月";
      }
      if (type === "day") {
        return val + "日";
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
      return y + "-" + m + "-" + d;
      // return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + s;
    },
    selectDats(e) {
      this.userDats = this.filterTime(e);
      this.userDatsShow = false;
    },

    //关闭时间选择
    closeDatspopup() {
      this.userDatsShow = false;
    },

    writeInput() {
      if (this.userTel.length == 11) {
        this.telShow = false;
      }
    },

    //输入查找指定员工的定位信息
    async searchUserInfo() {
      if (this.userTel.length > 11 || this.userTel.length < 11) {
        this.telShow = true;
        return;
      } else {
        this.telShow = false;
      }

      if (this.userDats == "") {
        this.datsShow = true;
        return;
      } else {
        this.datsShow = false;
      }

      let data = {
        phone: this.userTel,
        dats: this.userDats,
      };
      //  console.log('点击查询',data)
      this.dwShow = true;
      this.userPopup = false;
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdlocationfindAll, {
        params: data,
      }).then((res) => {
        //  console.log(res)
        if (res.data.length == 0) {
          setTimeout(() => {
            this.dwShow = false;
          }, 2000);
          setTimeout(() => {
            this.$toast("暂无员工的定位信息！");
            this.embrace = false;
          }, 2500);
        } else {
          this.gerUserPos(res);
          this.userPopup = false;
          this.addCoordShow = false;
          this.embrace = true;
          this.zoom = 18;
        }
      });
    },

    //获取指定员工的定位信息
    gerUserPos(res) {
      // console.log('1232132213____',res)
      let that = this;
      if (res.data.length) {
        this.dwShow = false;

        // getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdlocationfindAll,{params:data})
        // .then(res=>{
        let coordinates = res.data;
        // coordinates.map((item)=>{
        //    let  str=item.locationinfo
        //    let lengthZf = str.lastIndexOf('-')
        //    let str2 =str.substr(0,str.lastIndexOf('-',lengthZf-1))
        //    console.log('str2',str2)
        // })

        let lat = [];
        lat = coordinates.map((item) => {
          let str = item.locationinfo;
          //   let strArr =  str.split('-')
          return str.split("&");
        });
        //获取数组后2个位置,坐标的位置
        let latArray = [];
        latArray = lat.map((item) => {
          let arr = item.slice(-2); //获取返回的数组后2个位置
          let newArr = { lat: arr[0], lng: arr[1] };
          return newArr;
        });
        // that.center=latArray[0]//点击查询指定员工位置后，重新定位中心点
        that.polygonPath = latArray;
        //   console.log(' that.polygonPath', that.polygonPath)
        that.center.lng = that.polygonPath[0].lng;
        that.center.lat = that.polygonPath[0].lat;

        //重新用embrace 获取下经纬度  不能center 有冲突
        that.scopeCircle.lng = that.polygonPath[0].lng;
        that.scopeCircle.lat = that.polygonPath[0].lat;

        //查询数组里是否infoflag是否有2，  1 正常  、2超出
        let exceed = [];
        exceed = coordinates.filter((item) => {
          //过滤
          if (item.infoflag == "2") {
            return item;
          }
        });

        let exceedCc = [];
        exceedCc = exceed.map((item) => {
          let str = item.locationinfo;
          //   let strArr =  str.split('-')
          return str.split("-").slice(-2);
        });

        this.exceedArry = exceedCc.map((item) => {
          //   let  str  = item[0].toString()
          // console.log((typeof str))
          return { lat: item[0], lng: item[1] };
        });
        //超出范围   infoflag为2的 坐标，计算出时间
        // console.log('123exceed',this.exceedArry)
        let a;
        if (this.exceedArry.length == 0) {
          a = 0;
          this.stoptime = false;
        } else {
          //  a = (this.exceedArry.length-1)*0.5
          a = (this.exceedArry.length - 1) * 6; //6 分钟
          this.stoptime = true;
        }

        // console.log('this.exceedArry',this.exceedArry)
        this.formatTime(a);
      } else {
      }

      // })
    },

    formatTime(num) {
      // num时间戳总毫秒数 除以 1000 转换成秒
      num / 1000;

      // 计算出时、分、秒 ， Math.floor是用于取整
      let h = Math.floor(num / 3600);
      let m = Math.floor((num - h * 3600) / 60);
      let s = Math.floor(num - h * 3600 - m * 60);

      // 如果只有一位数，转换成前缀是零的样式
      // if (h < 10) h = '0' + h
      // if (m < 10) m = '0' + m
      // if (s < 10) s = '0' + s
      if (h < 10) h = h;
      if (m < 10) m = m;
      if (s < 10) s = s;

      // 拼接并返回数据
      this.hours = m;
      this.minute = s;
      //return   m + ':' + s
    },
  },
};
</script>

<style lang="scss" scoped>
.van-action-sheet__item {
  position: relative;

  &::after {
    position: absolute;
    width: 90%;
    left: 5%;
    bottom: 0;
    border-bottom: 1px solid #f2f2f2;
    content: "";
  }
}

.contentbox {
  background: #5ecef6;
  height: 100vh;
  overflow: hidden;
}

.contentPadding {
  width: 95%;
  margin: auto;
  margin: 10px auto auto auto;
}

.mapBox {
  padding: 5px;
  background: #fff;
  border-radius: 10px;
  position: relative;

  .minute {
    position: absolute;
    top: -200px;
    left: 0;
    right: 0;
    height: 40px;
    z-index: 999;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 5px 5px #e2e2e2;
    border-radius: 5px 5px 0 0;
    animation: stopAnim 1s linear;
    animation-fill-mode: forwards;

    > img {
      display: inline-block;
      width: 25px;
      height: 25px;
    }

    > span {
      font-size: 18px;
      margin: 0 0 0 10px;
      font-weight: 700;

      &.tsTitle {
        color: #5ecef6;
      }

      &.tsRed {
        color: #f00;
      }
    }
  }
}

@keyframes stopAnim {
  from {
    top: -200px;
  }

  to {
    top: 0;
  }
}

.map {
  border-radius: 10px;
  overflow: hidden;
}

.installer {
  border-radius: 10px;
  background: #fff;
  margin: 10px auto auto auto;
  padding: 5px 0;

  > ul {
    display: flex;
    justify-content: space-around;

    > li {
      img {
        width: 30px;
        height: 30px;
      }

      padding: 5px 0;

      p {
        font-size: 12px;
      }
    }
  }

  //ull
}

//installer
.findAll {
  width: 95%;
  margin: auto;
  overflow-y: auto;

  ul {
    > li {
      margin: 10px 0 0 0;
      background: #fff;
      position: relative;
      padding: 2%;
      border-radius: 5px;
      box-shadow: 0 0 5px #e2e2e2;
      overflow: hidden;

      > img {
        position: absolute;
        top: 0;
        right: 0;
      }

      > div {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 1px 0;

        > div {
          font-size: 14px;
          width: 70px;
          text-align: justify;
          height: 25px;
          line-height: 25px;
          font-weight: 600;

          > span {
            display: inline-block;
            padding-left: 100%;
          }
        }

        > span {
          font-size: 14px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 25px;
          margin: 0 0 0 10px;

          > img {
            width: 15px;
            height: 15px;
            margin: 0 0 0 5px;
          }
        }
      }
    }

    //lo
  }

  //ul
}

//findAll

.userContent {
  width: 90%;
  margin: auto;
  padding: 5% 0;

  > h4 {
    text-align: left;
    font-size: 16px;
    color: #5ecef6;

    > img {
      width: 20px;
      height: 20px;
      vertical-align: -3px;
      margin: 0 5px 0 0;
    }
  }

  .searchUser {
    .searchUserLi {
      border: 1px solid #e2e2e2;
      border-radius: 5px;
      margin: 20px 0 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 90%;
      padding: 2% 5%;

      > span {
        font-size: 14px;
        display: inline-block;
        width: 70px;
        text-align: left;
      }

      input {
        width: calc(100% - 80px);
        font-size: 14px;
        height: 25px;
        border: none;
      }
    }

    //searchUserLi
    .telTs {
      font-size: 12px;
      color: #f00;
      text-align: left;
      padding: 5px 0 0 70px;
    }

    .searchUserbutton {
      text-align: center;
      margin: 10px 0 0 0;

      > button {
        width: 80px;
        height: 30px;
        font-size: 14px;
        background: #5ecef6;
        color: #fff;
        border: none;
        border-radius: 5px;
      }
    }
  }

  //searchUser
}

.inforTs {
  padding: 15% 0 0 0;

  > img {
    width: 40px;
    height: 40px;
  }

  > p {
    font-size: 14px;
    color: #999;
  }
}

.currentPostion {
  ul {
    > li {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      margin: 10px 0 0 0;

      span {
        font-size: 14px;
        color: #333;
        font-weight: 800;
        display: inline-block;
        width: 70px;
        height: 20px;
        line-height: 20px;
      }

      > p {
        font-size: 14px;
        color: #333;
        line-height: 25px;
        width: calc(100% - 80px);
        text-align: left;
        line-height: 20px;
      }
    }
  }
}

//currentPostion

.addLocation {
  margin: 10px 0 0 0;
  display: flex;
  justify-content: space-between;

  > button {
    width: 45%;
    height: 30px;
    font-size: 14px;
    outline: none;
    border-radius: 5px;
    color: #fff;

    &:nth-child(1) {
      background: #5ecef6;
      border: 1px solid #5ecef6;
    }

    &:nth-child(2) {
      background: #e2e2e2;
      border: 1px solid #e2e2e2;
      color: #333;
    }
  }
}

//addLocation
.radar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: red;
}

.moreTs {
  padding: 2% 0 5% 0;
}
</style>

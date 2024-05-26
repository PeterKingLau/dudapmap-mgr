<template>
  <div class="clockincontent">
    <div class="clockinLis" v-if="false">
      <div class="title">查询某一月打卡的全部信息</div>
      <!-- <van-divider>查询某一月打卡的全部信息</van-divider> -->
      <div class="selecttime">
        <span>选择日期:</span>
        <input type="text" placeholder="请选择日期" readonly />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
    </div>
    <!--/clockinLis-->

    <div class="clockinLis" v-if="false">
      <div class="title">查询某月其中一天打卡的全部信息</div>
      <!-- <van-divider>查询某月其中一天打卡的全部信息</van-divider> -->
      <div class="selecttime">
        <span>选择日期:</span>
        <input type="text" placeholder="请选择日期" readonly />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
    </div>
    <!--/clockinLis-->

    <van-grid :column-num="2" :icon-size="40">
      <van-grid-item :icon="require('../assets/images/dy.png')" text="指定月份查询" @click="dyclick()" />
      <van-grid-item :icon="require('../assets/images/dt.png')" text="指定日期查询" @click="dtclick()" />
      <van-grid-item :icon="require('../assets/images/dr.png')" text="指定人员查询当月" @click="drdyclick()" />
      <van-grid-item :icon="require('../assets/images/dr2.png')" text="指定人员查询当天" @click="drdtdyclick()" />
      <van-grid-item :icon="require('../assets/images/sc.png')" text="打卡时长" @click="playClockIn()" />
      <van-grid-item :icon="require('../assets/images/tj.png')" text="打卡信息统计" @click="toClockTotal()" />
    </van-grid>

    <!--当月弹出层-->
    <van-popup v-model="dyshow" :style="{ width: '90%', background: '#fff', borderRadius: '5px' }" closeable>
      <h4 class="title">查询某一月打卡的全部信息</h4>
      <div class="selecttime">
        <span>选择日期:</span>
        <input type="text" placeholder="请选择日期" v-model="monthValue" readonly @click="dyDatesClick" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
      <div class="buttonStyle">
        <van-button square type="primary" style="height: 35px; width: 100px" @click="dySearch">查询</van-button>
      </div>
    </van-popup>

    <!-- 当月日期层 -->
    <van-popup v-model="dyDatsShow" position="bottom" :style="{ height: '40%', background: '#f2f2f2' }">
      <van-datetime-picker :columns-order="['year', 'month']" v-model="currentDate" type="year-month" title="选择年月"
        :min-date="minDate" :max-date="maxDate" :formatter="formatter" @confirm="dyConfirm"
        @cancel="dyDatsShow = false" />
    </van-popup>

    <!--当天弹出层-->
    <van-popup v-model="dtshow" :style="{ width: '90%', background: '#fff', borderRadius: '5px' }" closeable>
      <h4 class="title">查询某月其中一天打卡的全部信息</h4>
      <div class="selecttime">
        <span>选择日期:</span>
        <input type="text" placeholder="请选择日期" v-model="dayValue" readonly @click="dtDatesClick" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
      <div class="buttonStyle">
        <van-button square type="primary" style="height: 35px; width: 100px" @click="dtSearch">查询</van-button>
      </div>
    </van-popup>

    <!-- 当天日期层 -->
    <van-popup v-model="dtDatsShow" position="bottom" :style="{ height: '40%', background: '#f2f2f2' }">
      <van-datetime-picker :columns-order="['year', 'month', 'day']" v-model="dtCurrentDate" title="选择日期" type="date"
        :min-date="minDate" :max-date="maxDate" :formatter="formatter" @confirm="dtConfirm"
        @cancel="dtDatsShow = false" />
    </van-popup>

    <!--查询指定人员当月打卡的信息-->
    <van-popup v-model="drshow" :style="{ width: '90%', background: '#fff', borderRadius: '5px' }" closeable>
      <h4 class="title">查询指定人员当月打卡的信息</h4>
      <!-- <div class="selecttime">
                                <span>姓名:</span>
                                <input type="text"  v-model="monthName" placeholder="请输入督导员姓名"  > 
                                <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly> 
                            </div> -->

      <div class="selecttime">
        <span>电话号码:</span>
        <input type="number" maxlength="11" v-model="monthTel" placeholder="请选择电话号码" readonly @click="selectAlltell" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>

      <div class="selecttime">
        <span>选择日期:</span>
        <input type="text" placeholder="请选择日期" v-model="monthPeopledate" readonly @click="drDatesClick" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
      <div class="buttonStyle">
        <van-button square type="primary" style="height: 35px; width: 100px" @click="drMonethSearch">查询</van-button>
      </div>
    </van-popup>

    <!-- 单人当月日期层 -->
    <van-popup v-model="drDatsShow" position="bottom" :style="{ height: '40%', background: '#f2f2f2' }">
      <van-datetime-picker :columns-order="['year', 'month']" v-model="currentDate" type="year-month" title="选择年月"
        :min-date="minDate" :max-date="maxDate" :formatter="formatter" @confirm="dypeopleConfirm"
        @cancel="drDatsShow = false" />
    </van-popup>

    <!--查询指定人员当天打卡的信息-->
    <van-popup v-model="drdtshow" :style="{ width: '90%', background: '#fff', borderRadius: '5px' }" closeable>
      <h4 class="title">查询指定人员当天打卡的信息</h4>
      <div class="selecttime">
        <span>电话号码:</span>
        <input type="number" placeholder="请输入电话号码" maxlength="11" v-model="drtelValue" readonly @click="selectAlltell2" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>

      <div class="selecttime">
        <span>选择日期:</span>
        <input type="text" placeholder="请选择日期" v-model="drtelValuedate" readonly @click="drdtDatesClick" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
      <div class="buttonStyle">
        <van-button square type="primary" style="height: 35px; width: 100px" @click="dayPeoleSearch">查询</van-button>
      </div>
    </van-popup>

    <!--查询指定人员当月打卡的信息 全部号码显示--->
    <van-popup v-model="vanPicker" position="bottom" :style="{ height: '40%', background: '#fff', borderRadius: '5px' }">
      <van-picker title="选择电话号码" show-toolbar :columns="tellAll" @confirm="telconfirm" @cancel="vanPicker = false" />
    </van-popup>

    <!-- 单人当天日期层 -->
    <van-popup v-model="drdtDatsShow" position="bottom" :style="{ height: '40%', background: '#f2f2f2' }">
      <van-datetime-picker :columns-order="['year', 'month', 'day']" v-model="dtCurrentDate" title="选择日期" type="date"
        :min-date="minDate" :max-date="maxDate" :formatter="formatter" @confirm="drpeopleConfirm"
        @cancel="drdtDatsShow = false" />
    </van-popup>

    <!--查询指定人员当天打卡的信息 全部号码显示--->
    <van-popup v-model="vanPicker2" position="bottom" :style="{ height: '40%', background: '#fff', borderRadius: '5px' }">
      <van-picker title="选择电话号码" show-toolbar :columns="tellAll2" @confirm="telconfirm2" @cancel="vanPicker2 = false" />
    </van-popup>

    <!--选择打卡时长时间段-->
    <van-popup v-model="clockShow" :style="{ width: '90%', background: '#fff', borderRadius: '5px' }" closeable>
      <h4 class="title">选择打卡时长时间段</h4>
      <div class="selecttime">
        <input type="text" placeholder="选择时间段" v-model="sjdDate" readonly @click="sjdShow = true" />
        <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
      </div>
      <div class="buttonStyle">
        <van-button square type="primary" style="height: 35px; width: 100px" @click="playClockSerach">查询</van-button>
      </div>
    </van-popup>
    <van-calendar v-model="sjdShow" type="range" @confirm="onConfirm" color="#07c160" :min-date="minDate"
      :max-date="maxDate" />
    <!-- <van-popup v-model="clockShow"   position="bottom"  :style="{ height:'40%' , background:'#fff',borderRadius:'5px'}">
               <van-picker
                     title="选择打卡时长时间段"
                     show-toolbar
                     :columns="tellAll2"
                     @confirm='telconfirm2'
                     @cancel='vanPicker2=false'
                     />
              </van-popup> -->
  </div>
</template>

<script>
import {
  apiUrl,
  getlisting,
  filterTimemonth,
  filterTimeday,
  validatePhoneNumber,
} from "../utils/apiUrl";
import { ref } from "vue";
import { Notify, Calendar } from "vant";
export default {
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
      a: false,
      dyshow: false,
      dyDatsShow: false,
      dtshow: false,
      dtDatsShow: false,
      dtCurrentDate: new Date(),
      drshow: false,
      drDatsShow: false,
      drdtshow: false,
      drdtDatsShow: false,
      lists: [],
      monthValue: "", //当月打卡全部次数
      dayValue: "", //当天打卡的次数

      monthTel: "", //当月指定人员查询，电话号码
      monthPeopledate: "", //当月指定人员查询，日期

      drtelValue: "",
      drtelValuedate: "",

      vanPicker: false,
      tellAll: [], //电话号码

      vanPicker2: false,
      tellAll2: [], //电话号码

      clockShow: false, // 打卡时长弹出层显示
      sjdShow: false,
      sjdDate: "",
      minDate: new Date(2023, 0, 1),
      maxDate: new Date(),
    };
  },
  mounted() { },
  methods: {
    dyclick() {
      //当月弹出层显示
      this.dyshow = true;
    },
    dyDatesClick() {
      //当月日期弹出层
      this.dyDatsShow = true;
    },
    dyConfirm(e) {
      //  console.log(filterTimemonth(e))
      this.monthValue = filterTimemonth(e);
      this.dyDatsShow = false;
    },
    dySearch() {
      if (this.monthValue === "") {
        //  console.log('12321')
        Notify({ type: "warning", message: "请选择日期进行查询！" });
      } else {
        //  this.getClockIn()
        this.$router.push({ path: "/clockInMonth", query: { month: this.monthValue } });
      }
    },
    dtclick() {
      //当天弹出层显示
      this.dtshow = true;
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
      //当天年月日查询
      if (this.dayValue === "") {
        //  console.log('12321')
        Notify({ type: "warning", message: "请选择日期进行查询！" });
      } else {
        //  this.getClockIn()
        this.$router.push({ path: "/clockInDay", query: { day: this.dayValue } });
      }
    },

    drdyclick() {
      //指定人员当月弹出层显示
      this.drshow = true;
      this.tellAll = [];
    },
    drDatesClick() {
      //指定人员当月日期弹出层
      this.drDatsShow = true;
    },
    dypeopleConfirm(e) {
      this.monthPeopledate = filterTimemonth(e);
      this.drDatsShow = false;
    },

    //拉取所有人的电话号码
    selectAlltell() {
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdusergetUserPhone).then((res) => {
        this.vanPicker = true;
        res.data = res.data.filter((item) => item.useravator === apiUrl.softwafeLocation);
        res.data.map((item) => {
          this.tellAll.push(
            `${item.username == null ? "暂未上传名" : item.username}-${item.userphone}`
          );
        });
      });
    },
    telconfirm(value) {
      // console.log(value.split('-')[1])
      this.monthTel = value.split("-")[1];
      this.vanPicker = false;
      this.tellAll = [];
    },
    drMonethSearch() {
      //当月指定人员查询，电话号码

      let tel = validatePhoneNumber(this.monthTel);
      if (tel != true) {
        Notify({ type: "warning", message: "请选择电话号码！" });
      } else if (this.monthPeopledate == "") {
        Notify({ type: "warning", message: "请选择日期进行查询！" });
      } else {
        this.$router.push({
          path: "/clockInMonthPeople",
          query: { monthPeopledate: this.monthPeopledate, monthTel: this.monthTel },
        });
      }
    },

    drdtdyclick() {
      //指定人员当日弹出层显示
      this.drdtshow = true;
      this.tellAll2 = [];
    },

    drdtDatesClick() {
      //指定人员当日日期弹出层
      this.drdtDatsShow = true;
    },
    drpeopleConfirm(e) {
      this.drtelValuedate = filterTimeday(e);
      this.drdtDatsShow = false;
    },

    //拉取所有人的电话号码
    selectAlltell2() {
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdusergetUserPhone).then((res) => {
        this.vanPicker2 = true;
        res.data = res.data.filter((item) => item.useravator === apiUrl.softwafeLocation);

        res.data.map((item) => {
          this.tellAll2.push(
            `${item.username == null ? "暂未上传名" : item.username}-${item.userphone}`
          );
        });
      });
    },
    telconfirm2(value) {
      // console.log(value.split('-')[1])
      this.drtelValue = value.split("-")[1];
      this.vanPicker2 = false;
      this.tellAll2 = [];
    },

    dayPeoleSearch() {
      let tel = validatePhoneNumber(this.drtelValue);
      if (tel != true) {
        Notify({ type: "warning", message: "请选择电话号码！" });
      } else if (this.drtelValuedate == "") {
        Notify({ type: "warning", message: "请选择日期进行查询！" });
      } else {
        this.$router.push({
          path: "/clockInDayPeople",
          query: { monthPeopledate: this.drtelValuedate, monthTel: this.drtelValue },
        });
      }
    },

    getClockIn() {
      let data = {
        date: "2023-04-17",
      };
      console.log(process.env.BASE_URL_HTTPS);
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdrecordfindByDate, {
        params: data,
      }).then((res) => {
        console.log(res);
      });
    },
    playClockIn() {
      //打卡时长
      this.clockShow = true;
      this.sjdDate = "";
    },
    toClockTotal() {
      this.$router.push({ path: "/clockTotal" });
    },
    onConfirm(date) {
      const [start, end] = date;
      this.sjdShow = false;
      this.sjdDate = `${filterTimeday(start)}至${filterTimeday(end)}`;
    },

    playClockSerach() {
      if (this.sjdDate == "") {
        Notify({ type: "warning", message: "请选择时间段进行查询！" });
      } else {
        let time = this.sjdDate.split("至");
        this.$router.push({
          path: "/palyClockIntime",
          query: { start: time[0], end: time[1] },
        });
      }
    },
  },
};
</script>

<style lang="scss">
.clockincontent {
  height: 100vh;
}
</style>

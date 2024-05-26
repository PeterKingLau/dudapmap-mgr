<template>
  <div class="mapSuperintendent">
    <!--搜索-->
    <div class="superintendenttop">
      <div>
        <input
          type="text"
          v-model="dates"
          readonly
          placeholder="选择日期"
          @click="datesSelect"
        />
        <input
          type="text"
          v-model="area"
          readonly
          placeholder="选择地区"
          @click="areaSelect"
        />
        <van-button square type="primary" style="height: 35px" @click="searchArea"
          >查找</van-button
        >
      </div>
    </div>
    <!--/superintendenttop-->
    <baidu-map
      class="map"
      :center="center"
      :zoom="15"
      :scroll-wheel-zoom="true"
      style="height: 100vh"
    >
      <div v-for="(item, index) in areaListsPoint" :key="index * 0.2">
        <bm-marker
          :position="{ lng: item.lng, lat: item.lat }"
          :dragging="false"
          @click="infoWindowOpen(item)"
        >
          <bm-label
            :content="item.userphone"
            :labelStyle="{ color: '#f00', fontSize: '16px', border: 'none' }"
            :offset="{ width: -40, height: -25 }"
          />
        </bm-marker>
      </div>
    </baidu-map>

    <van-popup
      v-model="selectDatesshow"
      position="bottom"
      :style="{ height: '40%', background: '#f2f2f2' }"
    >
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="selectConfirm"
        @cancel="selectDatesshow = false"
      />
    </van-popup>

    <van-popup
      v-model="selectAreashow"
      position="bottom"
      :style="{ height: '40%', background: '#f2f2f2' }"
    >
      <van-picker
        title="选择地区"
        :show-toolbar="true"
        :columns="columns"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>

    <van-popup
      v-model="ddyAreaShow"
      closeable
      position="center"
      :style="{ height: 'auto', width: '85%', background: '#f2f2f2' }"
    >
      <div class="areacont">
        <ul>
          <li><span>电话号码：</span>{{ telXs }}</li>
          <li><span>所在地址：</span>{{ adressXs }}</li>
        </ul>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref } from "vue";
import { Toast } from "vant";
import { Notify } from "vant";
import {
  apiUrl,
  getlisting,
  filterTimemonth,
  filterTimeday,
  validatePhoneNumber,
} from "../utils/apiUrl";
export default {
  setup() {
    const columns = ["绵阳", "安州", "广汉", "射洪"];
    // const onConfirm = (value, index) => {
    //    Toast(`当前值: ${value}, 当前索引: ${index}`);
    // };

    const currentDate = ref(new Date());
    return {
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2029, 10, 1),
      currentDate,
      columns,
    };
  },
  data() {
    return {
      center: { lng: 104.648323, lat: 31.525121 },
      dates: "",
      area: "",
      areaListsPoint: [],
      selectDatesshow: false,
      selectAreashow: false,
      ddyAreaShow: false,

      telXs: "",
      adressXs: "",
    };
  },
  methods: {
    datesSelect() {
      this.selectDatesshow = true;
    },
    selectConfirm(e) {
      this.dates = filterTimeday(e);
      this.selectDatesshow = false;
    },
    areaSelect() {
      // 选择地区
      this.selectAreashow = true;
    },
    onConfirm(value) {
      this.area = value;
      this.selectAreashow = false;
    },
    onCancel() {
      this.selectAreashow = false;
    },
    searchArea() {
      if (this.dates === "") {
        // Notify({ type: 'warning', message: '请选择日期进行查询！' })
        Toast("请选择日期进行查询！");
      } else if (this.area === "") {
        //  Notify({ type: 'warning', message: '请选择地址进行查询！' })
        Toast("请选择地址进行查询！");
      } else {
        //  this.getClockIn()
        this.getAreas(this.dates, this.area);
      }
    },
    getAreas(date, area) {
      let data = {
        date: date,
        dis: area,
      };
      getlisting(process.env.BASE_URL_HTTPS_TWO + apiUrl.getLocationDateAndDistrict, {
        params: data,
      }).then((res) => {
        if (res.data.length) {
          let areaPoint = res.data.map((item) => {
            return {
              locationdate: item.locationdate,
              userphone: item.userphone,
              adress: item.locationinfo.split("&")[0],
              lat: item.locationinfo.split("&")[1],
              lng: item.locationinfo.split("&")[2],
            };
          });
          this.center = {
            lng: areaPoint[0].lng,
            lat: areaPoint[0].lat,
          };
          this.areaListsPoint = areaPoint;
        } else {
          Toast(`${data.date}暂无`);
        }
      });
    },

    infoWindowOpen(item) {
      //坐标点点击
      this.telXs = item.userphone;
      this.adressXs = item.adress;
      this.ddyAreaShow = true;
    },
  },
};
</script>

<style lang="scss">
.mapSuperintendent {
  height: 100vh;
  position: relative;

  .superintendenttop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 2%;
    z-index: 100;
    background: #fff;

    > div {
      width: 95%;
      margin: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      > input {
        width: 30%;
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        padding: 0 2%;
        border: 1px solid #07c160;
      }
    }
  }
}

.areacont {
  padding: 10% 5%;

  > ul {
    > li {
      font-size: 16px;
      text-align: left;
      padding: 2% 0;

      span {
      }
    }
  }
}
</style>

<template>
  <div class="clockincontent">
    <div style="text-align: right">
      <van-button
        @click="exportExcel"
        icon="plus"
        type="primary"
        size="small"
        color="#07c160"
        >导出
      </van-button>
    </div>
    <van-divider
      :style="{
        color: '#1989fa',
        borderColor: '#1989fa',
        padding: '0 16px',
        fontSize: '16px',
      }"
    >
      {{ titleMonth }}月全部打卡信息
    </van-divider>

    <van-sticky>
      <div class="tableUl vanSticky">
        <ul>
          <li>
            <span>序号</span>
            <span>名字</span>
            <span>电话号码</span>
            <span>总在线时长</span>
            <span>缺卡次数</span>
          </li>
        </ul>
      </div>
    </van-sticky>
    <div class="tableUl tablePadding" v-if="arrKeys.length">
      <ul>
        <li v-for="(item, index) in lists" :key="index * 0.1">
          <span>{{ index + 1 }}</span>
          <span>{{
            item.name === "noname" || item.name === "null" ? "-" : item.name
          }}</span>
          <span>{{ item.tel }}</span>
          <span>{{ item.clockNumber }}</span>
          <span>{{ item.lostClock }}次</span>
        </li>
      </ul>
    </div>

    <van-empty v-else description="暂无打卡信息" />

    <!--excel表弹层 超15分钟-->
    <van-dialog
      v-model="excelShow"
      :title="'提示'"
      :show-cancel-button="false"
      :show-confirm-button="false"
    >
      <div class="excelTitle">
        是否要把<span>{{ $route.query.month }} 全部打卡信息</span>导出为Excel表?
      </div>
      <div class="excelFooter">
        <van-button @click="excelShow = false">取消 </van-button>
        <download-excel
          class="export-excel-wrapper"
          :data="lists"
          :header="excelName"
          :fields="json_fields"
          :name="excelName"
          :before-generate="startDownload"
        >
          <van-button style="width: 100%" @click="exportExcel">导出 </van-button>
        </download-excel>
      </div>
    </van-dialog>

    <!--遮罩层显示加载-->
    <van-overlay :show="showLogin" @click="show = false">
      <div class="wrapper">
        <van-loading vertical text-color="#fff" color="#bfe4ff"
          >正在请求数据、请稍后...</van-loading
        >
      </div>
    </van-overlay>
  </div>
</template>

<script>
import moment from "moment";
import { apiUrl, getlisting, filterTimemonth, filterTimeday } from "../utils/apiUrl";
export default {
  data() {
    return {
      showLogin: false,
      lists: {},
      arrKeys: [],
      titleMonth: this.$route.query.month,
      excelShow: false,
      excelName: "",
      json_fields: "",
    };
  },
  mounted() {
    let queryArry = this.$route.query;
    this.gethxdrecordfindByDate(queryArry.month);
  },
  methods: {
    exportExcel() {
      this.excelName = `${this.$route.query.month}未打卡人员`;
      this.excelShow = true;
    },
    async startDownload() {
      // 导出excel按钮 超出15分钟离岗人员
      console.log(this.lists);

      this.json_fields = {
        序号: "ID",
        名字: "name",
        电话号码: "tel",
        总在线时长: "clockNumber",
        离岗超过15分钟次数: "clockNumber",
      };
      for (var i = 0; i < this.lists.length; i++) {
        //添加序号
        this.lists[i].ID = i + 1;
      }
      this.excelpage = this.lists;

      this.excelShow = false;
      setTimeout(() => {
        this.$notify({
          title: "成功",
          message: `${this.excelName}人员导出Excel成功,下载完成，请自行打开Excel表！`,
          type: "success",
          duration: 6000,
        });
      }, 2000);
    },
    gethxdrecordfindByDate(date) {
      let startTime = moment(date).startOf("month").format("YYYY-MM-DD");
      let endTime = moment(date).endOf("month").format("YYYY-MM-DD");
      let data = {
        start: startTime,
        end: endTime,
      };
      this.showLogin = true;
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdrecordfindByDate, {
        params: data,
      }).then((res) => {
        this.arrKeys = Object.keys(res.data);

        if (this.arrKeys.length) {
          this.showLogin = false;
          let values = Object.values(res.data);
          this.lists = values.map((item, index) => {
            return {
              name: item.split("&")[0],
              clockNumber: item.split("&")[1],
              lostClock: item.split("&")[2],
              tel: Object.keys(res.data)[index],
            };
          });
        } else {
          this.showLogin = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.clockincontent {
  padding: 0 2%;
  height: 100%;
}

.alltitle {
  text-align: left;
  font-size: 16px;
  padding: 0 0 10px 0;
  font-weight: 800;
  border-bottom: 1px solid #e2e2e2;
  color: #07c160;
}

.tableUl {
  ul {
    > li {
      width: 100%;
      display: flex;
      align-content: center;
      padding: 3% 0;
      border-bottom: 1px solid #e2e2e2;

      > span {
        display: inline-block;
        font-size: 14px;
        text-align: center;

        &:nth-child(1) {
          width: 10%;
        }

        &:nth-child(2) {
          width: 20%;
        }

        &:nth-child(3) {
          width: 25%;
        }

        &:nth-child(4) {
          width: 30%;
        }
        &:nth-child(5) {
          width: 15%;
        }
      }
    }
  }
}

.vanSticky {
  background: #07c160;
  color: #fff;
}

.tablePadding {
  margin: 0 0 50px 0;
}

.excelTitle {
  padding: 20px 10px;
}

.excelFooter {
  display: flex;

  >>> .van-button--normal {
    flex: 1;
  }

  div {
    flex: 1;
  }
}
</style>

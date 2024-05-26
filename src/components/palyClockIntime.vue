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
    <!--打卡时长--->
    <van-divider
      :style="{
        color: '#1989fa',
        borderColor: '#1989fa',
        padding: '0 16px',
        fontSize: '16px',
      }"
    >
      {{ start }}至{{ end }}打卡时长
    </van-divider>

    <!-- <div style="padding:0  0 10px 0; text-align:left">
                               <download-excel :data="excelpage"  :before-generate="startDownload" :fields="json_fields"
                                  :name = "jsName">
                                <van-button type="info" size='small '>导出excel</van-button>
                             </download-excel>
                        </div> -->
    <van-sticky>
      <div class="tableUl vanSticky">
        <ul>
          <li>
            <span>序号</span>
            <span>名字</span>
            <span>电话号码</span>
            <span>打卡时长</span>
            <span>缺卡</span>
            <span>迟到</span>
            <span>早退</span>
          </li>
        </ul>
      </div>
    </van-sticky>
    <div class="tableUl tablePadding" v-if="arrKeys.length">
      <ul>
        <li v-for="(item, index) in lists" :key="index * 0.1">
          <span>{{ index + 1 }}</span>
          <span>{{ item.name }}</span>
          <span>{{ item.tel }}</span>
          <span>{{ item.clockTime }}</span>
          <span>{{ item.LackCard }}次</span>
          <span>{{ item.late }}次</span>
          <span>{{ item.leaveEarly }}次</span>
        </li>
      </ul>
    </div>

    <van-empty v-else description="暂无打卡信息" />

    <!--遮罩层显示加载-->
    <van-overlay :show="showLogin" @click="show = false">
      <div class="wrapper">
        <van-loading vertical text-color="#fff" color="#bfe4ff"
          >正在请求数据、请稍后...</van-loading
        >
      </div>
    </van-overlay>

    <van-dialog
      v-model="excelShow"
      :title="'提示'"
      :show-cancel-button="false"
      :show-confirm-button="false"
    >
      <div class="excelTitle">
        是否要把<span>{{ $route.query.start + "-" + $route.query.end }} 全部打卡信息</span
        >导出为Excel表?
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
  </div>
</template>

<script>
import { apiUrl, getlisting, filterTimemonth, filterTimeday } from "../utils/apiUrl";
export default {
  data() {
    return {
      showLogin: false,
      ycShow: false,
      lists: {},
      arrKeys: [],
      excelShow: false,
      excelName: "",
      titleMonth: this.$route.query.day,
      start: this.$route.query.start,
      end: this.$route.query.end,
      //导出excel
      excelpage: [], //存放勇于导出excel的数据
      json_fields: {
        序号: "ID",
        名字: "name",
        电话号码: "tel",
        打卡时长: "clockTime",
        缺卡: "LackCard",
        迟到: "late",
        早退: "leaveEarly",
      },
    };
  },
  mounted() {
    let queryArry = this.$route.query;
    //console.log(queryArry.start,queryArry.end)
    this.gethxdrecordfindByDate(queryArry.start, queryArry.end);
  },
  methods: {
    exportExcel() {
      this.excelName = `${
        this.$route.query.start + "-" + this.$route.query.end
      }人员打卡信息`;
      this.excelShow = true;
    },
    async startDownload() {
      // 导出excel按钮 超出15分钟离岗人员
      console.log(this.lists);

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
    //  async startDownload(){
    //         console.log('12332112')
    //         this.jsName=this.titleMonth+'日未打卡全部信息'
    //          for (var i = 0; i < this.lists.length; i++) {//添加序号
    //               this.lists[i].ID = i + 1;
    //             }
    //         this.excelpage= this.lists

    //  },
    gethxdrecordfindByDate(start, end) {
      let data = {
        start: start,
        end: end,
      };
      this.showLogin = true;
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdrecordfindByDate, {
        params: data,
      }).then((res) => {
        this.showLogin = false;
        this.arrKeys = Object.keys(res.data);
        if (this.arrKeys.length) {
          let values = Object.values(res.data);
          this.lists = values.map((item, index) => {
            return {
              name: `${item.split("&")[0] == "null" ? "暂未上传名" : item.split("&")[0]}`,
              clockTime: item.split("&")[1],
              LackCard: item.split("&")[2],
              late: item.split("&")[3],
              leaveEarly: item.split("&")[4],
              tel: this.arrKeys[index],
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
          width: 20%;
        }

        &:nth-child(5) {
          width: 10%;
        }

        &:nth-child(6) {
          width: 10%;
        }

        &:nth-child(7) {
          width: 10%;
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

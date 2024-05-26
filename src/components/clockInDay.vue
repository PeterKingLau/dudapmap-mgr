<template>
  <div class="clockincontent">
    <van-divider
      :style="{
        color: '#1989fa',
        borderColor: '#1989fa',
        padding: '0 16px',
        fontSize: '16px',
      }"
    >
      {{ titleMonth }}日全部打卡信息
    </van-divider>

    <van-sticky>
      <div class="tableUl vanSticky">
        <ul>
          <li>
            <span>序号</span>
            <span>名字</span>
            <span>电话号码</span>
            <span>打卡次数</span>
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
          <span>{{ item.clockNumber }}</span>
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
  </div>
</template>

<script>
import { apiUrl, getlisting, filterTimemonth, filterTimeday } from "../utils/apiUrl";
export default {
  data() {
    return {
      showLogin: false,
      lists: {},
      arrKeys: [],
      titleMonth: this.$route.query.day,
    };
  },
  mounted() {
    let queryArry = this.$route.query;
    this.gethxdrecordfindByDate(queryArry.day);
  },
  methods: {
    gethxdrecordfindByDate(date) {
      let data = {
        start: date,
        end: date,
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
              name: item.split("&")[0],
              clockNumber: item.split("&")[1],
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
          width: 30%;
        }

        &:nth-child(3) {
          width: 40%;
        }

        &:nth-child(4) {
          width: 20%;
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
</style>

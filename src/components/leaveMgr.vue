<template>
  <div>
    <div class="vanGrid">
      <div style="display: flex" class="flexBox">
        <div class="vanGridTitle" ref="popupHeight">
          <img src="../assets/images/installer11.png" /> <span>请假管理</span>
        </div>
        <!-- <van-button
          style="margin-left: 175px"
          @click="(showAddUser = true), (editTpye = 'add')"
          icon="clock-o"
          size="mini"
          type="info"
        >
          我要请假
        </van-button> -->
        <div></div>
      </div>

      <van-tabs v-model="activeLeaveList" @change="tabChange">
        <!-- 我的请假记录 -->
        <van-tab title="请假记录">
          <div class="taskLis" v-if="taskLis.length" :style="`height:${contentHeight}px`">
            <ul>
              <li
                v-for="(item, index) in taskLis"
                :key="item.id"
                @click="editLeave(item, index)"
              >
                <div>
                  <span>请假时间：</span>
                  <p>{{ item.startime }} ~ {{ item.endtime }}</p>
                </div>

                <div>
                  <span>审批人：</span>
                  <p>{{ item.manager }}</p>
                </div>

                <div v-if="item.remake">
                  <span>驳回理由：</span>
                  <p>{{ item.remake }}</p>
                </div>

                <div>
                  <span>状态：</span>
                  <span class="infoflag" v-if="!item.infoflag">待审核</span>
                  <span class="infoflag resolve" v-if="item.infoflag == '通过'"
                    >通过</span
                  >
                  <span class="infoflag reject" v-if="item.infoflag == '驳回'">驳回</span>
                </div>

                <!-- <div>
                  <span
                    class="infoflag back"
                    @click.stop="removeLeave(item)"
                    v-if="!item.infoflag"
                    ><van-icon name="revoke" />撤销</span
                  >
                </div> -->
              </li>
            </ul>
          </div>

          <div v-else>
            <div class="nodate">
              <img src="../assets/images/noDate.png" alt="" />
              <p>暂无详细信息！</p>
            </div>
          </div>
        </van-tab>
        <van-tab title="去审批">
          <div class="taskLis" v-if="taskLis.length" :style="`height:${contentHeight}px`">
            <ul>
              <li
                v-for="(item, index) in taskLis.filter((item) => !item.infoflag)"
                :key="item.id"
              >
                <div>
                  <span>请假时间：</span>
                  <p>{{ item.startime }} ~ {{ item.endtime }}</p>
                </div>

                <div>
                  <span>请假人：</span>
                  <p>{{ item.manager }}</p>
                </div>

                <div>
                  <span>状态：</span>
                  <p>{{ item.infoflag ? item.infoflag : "待审批" }}</p>
                </div>

                <div class="leavaTool">
                  <van-button
                    @click.stop="rosolveApprove(item)"
                    icon="clock-o"
                    size="mini"
                    type="primary"
                  >
                    通过
                  </van-button>
                  <van-button
                    @click.stop="rejectApprove(item)"
                    icon="clock-o"
                    size="mini"
                    type="danger"
                  >
                    驳回
                  </van-button>
                </div>
              </li>
            </ul>
          </div>

          <div v-else>
            <div class="nodate">
              <img src="../assets/images/noDate.png" alt="" />
              <p>暂无详细信息！</p>
            </div>
          </div>
        </van-tab>
      </van-tabs>
      <!-- <div class="taskLis" v-if="taskLis.length" :style="`height:${contentHeight}px`">
                <ul>
                    <li v-for="(item, index) in taskLis" :key='item.id' @click="findAllUrl(item.infoflag, index)">
                        <div>
                            <span>电话：</span>
                            <p>{{ item.userphone }}</p>
                        </div>

                        <div>
                            <span>姓名：</span>
                            <p>{{ item.username }}</p>
                        </div>

                        <div>
                            <span>区域：</span>
                            <p>{{ item.useravator === '1' ? '-' : item.useravator }}</p>
                        </div>

                        <img @click.stop='del(item.id, index)' src="../assets/images/del.png" />
                    </li>
                </ul>
            </div>

            <div v-else>
                <div class="nodate">
                    <img src="../assets/images/noDate.png" alt="">
                    <p>暂无详细信息！</p>
                </div>
            </div> -->

      <van-dialog
        v-model="showAddUser"
        :title="editTpye === 'add' ? '新增请假申请' : '修改请假申请'"
        :before-close="beforeCloseDialog"
        @confirm="onConfirmAddUser"
        show-cancel-button
      >
        <div class="vanButton">
          <van-form ref="form" @submit="onSubmit" label-width="100">
            <van-field
              readonly
              v-model="manager"
              clickable
              name="username"
              :value="manager"
              :rules="[{ required: true, message: '请选择审批人' }]"
              label="审批人"
              placeholder="点击选择"
              @click="showSbmc = true"
            />

            <van-field
              name="startime"
              v-model="startime"
              clickable
              label="请假时间起"
              :rules="[{ required: true, message: '请选择请假时间起' }]"
              :value="startime"
              placeholder="请选择"
              @click="showStart1 = true"
            />

            <van-field
              name="endtime"
              v-model="endtime"
              clickable
              label="请假时间止"
              :rules="[{ required: true, message: '请选择请假时间止' }]"
              :value="endtime"
              placeholder="请选择"
              @click="showEnd1 = true"
            />

            <van-field
              v-model="reason"
              :rules="[{ required: true, message: '请填请假原因' }]"
              rows="2"
              autosize
              label="请假原因"
              type="textarea"
              maxlength="1000"
              placeholder="请输入"
              show-word-limit
            />
          </van-form>
        </div>
      </van-dialog>

      <van-dialog
        v-model="rejectShow"
        @cancel="cancelReject"
        :title="'驳回请假信息'"
        @confirm="onConfirmReject"
        show-cancel-button
      >
        <div class="vanButton">
          <van-form @submit="onSubmitReject" label-width="100">
            <van-field
              v-model="remake"
              rows="2"
              autosize
              label="驳回原因"
              type="textarea"
              maxlength="1000"
              placeholder="请输入"
              show-word-limit
            />
          </van-form>
        </div>
      </van-dialog>

      <van-popup v-model="showSbmc" position="bottom">
        <van-picker
          show-toolbar
          :columns="userlist"
          value-key="username"
          @confirm="onConfirm"
          @cancel="showSbmc = false"
        />
      </van-popup>

      <van-popup v-model="showStart1" round position="bottom">
        <van-datetime-picker
          @cancel="showStart1 = false"
          :max-date="
            endtime
              ? new Date(
                  moment(endtime).subtract(30, 'minutes').format('YYYY-MM-DD HH:mm')
                )
              : new Date(2020, 0, 1)
          "
          @confirm="(val) => onConfirmDksd(val, 'startime', 'showStart1')"
          type="datetime"
          title="请假开始时间"
        />
      </van-popup>

      <van-popup v-model="showEnd1" round position="bottom">
        <van-datetime-picker
          @cancel="showEnd1 = false"
          :min-date="
            startime
              ? new Date(moment(startime).add(30, 'minutes').format('YYYY-MM-DD HH:mm'))
              : new Date(2030, 0, 1)
          "
          @confirm="(val) => onConfirmDksd(val, 'endtime', 'showEnd1')"
          type="datetime"
          title="请假结束时间"
        />
      </van-popup>
    </div>
  </div>
</template>
<script>
import moment from "moment";

import { mapGetters } from "vuex";
import { apiUrl, getlisting, postlisting, hxduserfindAll } from "../utils/apiUrl";
import { Notify } from "vant";
export default {
  data() {
    return {
      username: "",
      editTpye: "add",
      moment,
      activeLeaveList: 0,
      sbmcColumns: ["管理员", "督导员"],
      showSbmc: false,
      showAddUser: false,
      taskLis: [], //旧的
      userlist: [],
      contentHeight: 0,
      screenHeight: 0,
      newtasKLis: [], //新的全部任务列表
      manager: "",
      userphone: "",
      showStart1: false,
      startime: "",
      showEnd1: false,
      endtime: "",
      reason: "",
      chooseRow: {},
      approveList: [], //审批列表
      rejectShow: false,
      remake: "",
      dialogSubmit: false, //是否验证通过
    };
  },
  computed: {
    ...mapGetters({
      getLogin: "getLogin",
    }),
  },
  mounted() {
    this.screenHeight = window.innerHeight;
    this.getFindAll();
    this.getFindAllUser("管理员");
    this.riderPopup();
  },
  methods: {
    beforeCloseDialog(action, done) {
      if (action == "confirm" && !this.dialogSubmit) {
        return done(false);
      } else {
        this.manager = "";
        this.userphone = "";
        this.startime = "";
        this.endtime = "";
        this.reason = "";
        this.activeLeaveList = 0;
        return done(true);
      }
    },
    cancelReject() {
      this.rejectShow = false;
      this.remake = "";
    },
    onSubmitReject() {
      console.log(11);
    },
    onConfirmReject() {
      this.$dialog
        .confirm({
          message: "确定驳回该条审批信息？",
          className: "textFont",
        })
        .then(() => {
          let fetchUrl = apiUrl.hxdvocationUpdateVocation;
          let params = {
            infoflag: "驳回",
            id: this.chooseRow.id,
            remake: this.remake,
            userphone: this.chooseRow.userphone,
          };
          postlisting(process.env.BASE_URL_HTTPS + fetchUrl, params).then((res) => {
            if (res) {
              Notify({ type: "success", message: "保存成功" });
              this.remake = "";
              this.getFindAll();
            }
          });
        });
    },
    rosolveApprove(item) {
      this.$dialog
        .confirm({
          message: "确定通过该条审批信息？",
          className: "textFont",
        })
        .then(() => {
          let fetchUrl = apiUrl.hxdvocationUpdateVocation;
          let params = {
            infoflag: "通过",
            id: item.id,
            userphone: item.userphone,
          };
          postlisting(process.env.BASE_URL_HTTPS + fetchUrl, params).then((res) => {
            if (res) {
              Notify({ type: "success", message: "保存成功" });
              this.getFindAll();
            }
          });
        });
    },
    rejectApprove(item) {
      console.log(item);
      this.chooseRow = item;
      this.rejectShow = true;
    },
    editLeave(row) {
      this.showAddUser = true;
      this.editTpye = "edit";
      this.chooseRow = row;
      this.manager = row.manager;
      this.userphone = row.userphone;
      this.startime = row.startime;
      this.endtime = row.endtime;
      this.reason = row.reason;
    },
    onSubmit(values) {
      console.log(this.getLogin);
    },
    tabChange(value) {
      if (value == 1) {
        // this.fetchLeaveByManager()
      } else {
        console.log("请求请假记录");
        this.getFindAll();
      }
    },
    fetchLeaveByManager() {
      let userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
      let params = {
        manager: userinfo.userphone,
      };
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdfindAllByManager, {
        params,
      }).then((res) => {
        this.approveList = res.data;
      });
    },
    onConfirmDksd(value, name, shower) {
      console.log(value);
      this.$data[name] = this.moment(value).format("YYYY-MM-DD hh:mm");
      this.$data[shower] = false;
    },
    onConfirm(row) {
      //设备名称
      this.manager = row.username;
      let userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
      this.userphone = userinfo.userphone;

      this.showSbmc = false;
    },
    onConfirmAddUser() {
      this.$refs.form
        .validate()
        .then(() => {
          // 验证通过

          let params = {
            manager: this.manager,
            userphone: this.userphone,
            startime: this.startime,
            endtime: this.endtime,
            reason: this.reason,
            id: this.editTpye === "edit" ? this.chooseRow.id : undefined,
          };
          let fetchUrl =
            this.editTpye === "add"
              ? apiUrl.hxdvocationAddVocation
              : apiUrl.hxdvocationUpdateVocation;
          postlisting(process.env.BASE_URL_HTTPS + fetchUrl, params).then((res) => {
            if (res) {
              Notify({ type: "success", message: "保存成功" });

              this.manager = "";
              this.userphone = "";
              this.startime = "";
              this.endtime = "";
              this.reason = "";
              this.activeLeaveList = 0;
              this.dialogSubmit = true;
              this.showAddUser = false;
              this.getFindAll();
            } else {
              Notify({ type: "warning", message: "保存失败" });
            }
          });
        })
        .catch(() => {
          //验证失败
          this.dialogSubmit = false;
          console.log("失败");
        });
    },
    riderPopup() {
      let that = this;
      this.$nextTick(() => {
        let a = that.$refs.popupHeight.offsetHeight; //标题高度
        that.contentHeight = that.screenHeight - a;
      });
    },
    getFindAll() {
      ///查询全部请假
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdvocationFindAll).then((res) => {
        //    console.log('查询全部',res)
        let resLists = res.data;
        if (resLists.length) {
          this.taskLis = res.data;
        }
      });
    },
    getFindAllUser(type) {
      ///查询全部人员
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindAll).then((res) => {
        //    console.log('查询全部',res)
        let resLists = res.data;
        if (resLists.length) {
          if (type) {
            this.userlist = res.data.filter((item) => item.userrole === type);
          } else {
            this.userlist = res.data;
          }
        }
      });
    },
    //点击跳转到接受任务、拒绝任务的的页面
    findAllUrl(infoflag, index) {
      let that = this;

      this.$router.push({
        path: "/task",
        query: { lists: JSON.stringify(that.newtasKLis[index]), distinctionId: 1 },
      });
      //   switch(parseInt(infoflag)){
      //       case 1:
      //          console.log('infoflag',infoflag)

      //        break;
      //   }
    },
    removeLeave(row) {
      let that = this;
      let delidCs = row.id;
      this.$dialog
        .confirm({
          message: "确定撤销该请假信息吗？",
          className: "textFont",
        })
        .then(() => {
          // on confirm
          getlisting(
            process.env.BASE_URL_HTTPS + apiUrl.hxddeletevocationbyid + "/" + delidCs
          ).then((res) => {
            if (res) {
              Notify({ type: "success", message: "保存成功" });
              that.getFindAll();
            }
          });
        })
        .catch(() => {
          //console.log('取消')
        });
    },
    getRealLocation() {
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdlocationgetRealLocation).then(
        (res) => {
          let coordinates = Object.values(res.data);
          //    console.log(coordinates)

          let lat = [];
          lat = coordinates.map((item) => {
            //   let strArr =  str.split('-')
            return item.split("&");
          });
          let a = lat.map((item) => {
            let arr = item.slice(-2); //获取返回的数组后2个位置
            let newArr = { lat: arr[0], lng: arr[1] };
            return newArr;
          });

          this.tel = Object.keys(res.data); //取的对象的key值

          // this.center= this.center2[0]
          //    console.log('aaa',a)
          this.$nextTick(() => {
            this.center = a[0];
            this.center2 = a;
            console.log(this.center.lat, this.center.lng);
          });
        }
      );
    },
  },
};
</script>
<style scoped>
.flexBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.taskLis {
  margin-top: 5px;
}

.taskLis > ul > li {
  position: relative;
}

.taskLis > ul > li > .leavaTool {
  position: absolute;
  bottom: 8px;
  right: 15px;
}

.taskLis > ul > li > div > span {
  width: 70px;
  text-align: right;
}

.taskLis > ul > li {
  padding: 10px;
}

.infoflag {
  width: unset !important;
  padding: 0px 7px;
  background: rgb(87, 107, 149);
  border-radius: 4px;
  color: #fff !important;
  font-weight: 500;
  font-size: 12px;
}

.resolve {
  background: #07c160;
}

.reject {
  background: #ed6adc;
}

.back {
  background: #faab0c;
  position: absolute;
  right: 10px;
  top: 66px;
}
</style>

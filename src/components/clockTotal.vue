<template>
  <div>
    <div class="vanGrid">
      <div>
        <div class="vanGridTitle" ref="popupHeight"><img src="../assets/images/tj.png" /> <span>打卡统计</span>
        </div>
        <div class="userBox" :style="{ userBoxDay: date === '日' }">
          <van-field readonly clickable name="username" :value="username" label="被统计人" placeholder="点击选择"
            @click="showUser = true" />
          <van-field readonly clickable name="date" :value="date" label="统计周期" placeholder="点击选择"
            @click="showDate = true" />
          <van-field readonly clickable name="year" v-if="date === '月'" :value="year" label="年份" placeholder="点击选择"
            @click="showYear = true" />

          <!-- <div class="warning" v-if="date === '日'">
            <p><span></span> 全天考情正常</p>
            <p><span></span> 当天存在异常：迟到、早退、缺卡</p>
            <p><span></span> 当天提交过：请假、加班、出差、外出、补卡申请</p>
          </div> -->

          <div :style="{ marginTop: '10px' }">
            <van-calendar @month-show="onMonthShow" @select="selectDay" v-if="date === '日'" :min-date="minDate"
              :max-date="maxDate" :poppable="false" :show-confirm="false" :style="{ height: '385px', }" />
            <div v-else-if="date === '月'">
              <van-tabs v-model="activeTab" @change="monthChange">
                <van-tab v-for="index in 12" :title="index + '月'" :key="index">
                </van-tab>
              </van-tabs>
            </div>
          </div>
          <div v-if="date === '月'">
            <div class="flexBox">
              <div class="flexBoxColumn">
                <p>{{ totalData[1] || 0 }}</p>
                <p>总工时</p>
              </div>
              <div class="flexBoxColumn">
                <p>{{ totalData[2] || 0 }}</p>
                <p>缺卡次数</p>
              </div>
              <div class="flexBoxColumn">
                <p>{{ totalData[3] || 0 }}</p>
                <p>早退次数</p>
              </div>

              <div class="flexBoxColumn">
                <p>{{ totalData[4] || 0 }}</p>
                <p>出勤天数</p>
              </div>
              <div class="flexBoxColumn" v-if="false">
                <p>{{ totalData[5] || 0 }}</p>
                <p>严重迟到次数</p>
              </div>
              <div class="flexBoxColumn" v-if="false">
                <p style="color:orange">{{ totalData[6] || 0 }}</p>
                <p>严重早退次数</p>
              </div>

              <div class="flexBoxColumn" v-if="false">
                <p>{{ totalData[7] || 0 }}</p>
                <p>迟到时长</p>
              </div>
              <div class="flexBoxColumn" v-if="false">
                <p style="color:orange">{{ totalData[8] || 0 }}</p>
                <p>早退时长</p>
              </div>
              <div class="flexBoxColumn" v-if="false">
                <p>{{ totalData[9] || 0 }}</p>
                <p>严重迟到时长</p>
              </div>
              <div class="flexBoxColumn" v-if="false">
                <p>{{ totalData[10] || 0 }}</p>
                <p>严重早退时长</p>
              </div>

            </div>
          </div>


        </div>
        <!-- <div class="more">查看详情</div> -->
        <div class="more export" @click="exportAllRecord">导出所有员工考勤信息</div>
        <van-popup v-model="showYear" position="bottom">
          <van-picker show-toolbar :columns="yearlists" @confirm="onConfirmYear" @cancel="showYear = false" />
        </van-popup>
        <van-popup v-model="showUser" position="bottom">
          <van-picker show-toolbar :columns="userlists" value-key="username" @confirm="onConfirm"
            @cancel="showUser = false" />
        </van-popup>
        <van-popup v-model="showDate" position="bottom">
          <van-picker show-toolbar :columns="datelist" @confirm="onConfirmDate" @cancel="showDate = false" />
        </van-popup>

      </div>
    </div>

    <van-dialog v-model="showDayDk" @close="clearIpt" :title="'日统计'" show-cancel-button :show-confirm-button="false">
      <div v-for="item, idk in dayDkData" :key="idk">
        <p style="padding:10px"><span>第{{ idk + 1 }}次打卡时间：</span><span style="margin-left:20px">{{ item.recorddate
        }}</span></p>

      </div>
    </van-dialog>

    <van-dialog v-model="excelShow" :title="'提示'" :show-cancel-button="false" :show-confirm-button="false">
      <div class="excelTitle">
        是否要把<span>{{ activeTab + 1 }} 月全员考勤信息</span>导出为Excel表?
      </div>
      <div class="excelFooter">
        <van-button @click="excelShow = false">取消
        </van-button>
        <download-excel class="export-excel-wrapper" :data="lists" :header="excelName" :fields="json_fields"
          :name='excelName' :before-generate="startDownload">
          <van-button style="width:100%" @click="exportExcel">导出
          </van-button>
        </download-excel>
      </div>
    </van-dialog>

  </div>
</template>
<script>
import moment from 'moment'
import { Notify } from 'vant';
import { apiUrl, getlisting, postlisting, hxduserfindAll, } from '../utils/apiUrl'
export default {
  data() {
    return {
      excelName: '',
      json_fields: {
        姓名: 'name',
        电话: 'phone',
        缺卡次数: 'quekaNum',
        迟到次数: 'chidaoNum',
        早退次数: 'zaotuiNum',
        出勤天数: 'chuqinNum',
        严重迟到次数: 'warningChidaoNum',
        严重早退次数: 'warningZaotuiNum',
        迟到时长: 'chidaoTime',
        早退时长: 'zaotuiTime',
        严重迟到时长: 'warningChidaoTime',
        严重早退时长: 'warningZaotuiTime',
        总工时: 'workTime',
      },
      excelShow: false,
      dayDkData: [],
      showDayDk: false,
      activeTab: 0,
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2030, 0, 31),
      showYear: false,
      year: new Date().getFullYear(),
      showUser: false,
      username: '',
      userlists: [],
      yearlists: [],
      showDate: false,
      date: '月',
      datelist: ['日', '月'],
      totalData: [],
      userPhone: undefined,
      lists: [],
    }
  },
  mounted() {
    this.getFindAll()
    this.initTime()
  },
  methods: {
    exportExcel() {
      this.excelName = `${this.activeTab + 1}月全员考勤信息`
      // this.excelShow = true
      console.log('dddd',this.excelName)
    },
    async startDownload() { // 导出excel按钮 超出15分钟离岗人员

      for (var i = 0; i < this.lists.length; i++) {//添加序号
        this.lists[i].ID = i + 1;
      }
      console.log('startDownload',this.lists)


      this.excelShow = false
      setTimeout(() => {
        this.$notify({
          title: '成功',
          message: `${this.excelName}人员导出Excel成功,下载完成，请自行打开Excel表！`,
          type: 'success',
          duration: 6000
        });
      }, 2000)
    },
    exportAllRecord() {
      let startDay = moment(new Date(this.year + '-' + (this.activeTab + 1)).getTime()).startOf('months').format('YYYY-MM-DD')
      let endDay = moment(new Date(this.year + '-' + (this.activeTab + 1)).getTime()).endOf('months').format('YYYY-MM-DD')
      let params = {
        start: startDay,
        end: endDay
      }
      console.log('url',process.env.BASE_URL_HTTPS+apiUrl.hxdrecordfindByDate)
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdrecordfindByDate, { params }).then(res => {
        if (res.data) {
          console.log('data',res.data)
          for (let idk in res.data) {
            let itemArr = res.data[idk].split('&')
            this.lists.push({
              name: itemArr[0],
              phone: idk,
              workTime: itemArr[1],
              quekaNum: itemArr[2],
              chidaoNum: itemArr[3],
              zaotuiNum: itemArr[4],
              chuqinNum: itemArr[5],
              warningChidaoNum: itemArr[6],
              warningZaotuiNum: itemArr[7],
              chidaoTime: itemArr[8],
              zaotuiTime: itemArr[9],
              warningChidaoTime: itemArr[10],
              warningZaotuiTime: itemArr[11],
            })
          }
          this.excelShow = true

        }
      })
    },
    clearIpt() {

    },
    selectDay(day) {
      console.log(day)
      let time = moment(day).format('YYYY-MM-DD')
      // console.log(time)
      this.getDkMonthData(time)
    },

    initTime() {
      for (let i = 1980; i < new Date().getFullYear() + 1; i++) {
        this.yearlists.push(i)
      }
      this.yearlists = this.yearlists.sort((a, b) => b - a)
      this.activeTab = new Date().getMonth()
    },
    onConfirmYear(value) {
      this.year = value
      this.showYear = false;
      if (!this.userPhone) {
        Notify({ type: 'warning', message: '请选择被统计人！' })
      } else {
        this.getDkData()
      }
    },
    onConfirm(row) {
      console.log(row)
      this.username = row.username
      this.userPhone = row.userphone
      this.showUser = false
      if (this.date === '日') {

      } else {
        this.monthChange()
      }
    },
    onConfirmDate(value) {
      this.date = value
      this.showDate = false;
      if (value === '日') {

      }
    },
    getFindAll(type) {///查询全部人员
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindAll)
        .then(res => {
          //    console.log('查询全部',res)
          if (res.data.length) {
            if (type) {
              this.userlists = res.data.filter(item => item.userrole === type)
            } else {
              this.userlists = res.data
            }

          }
        })
    },
    monthChange() {
      if (!this.userPhone) {
        Notify({ type: 'warning', message: '请选择被统计人！' })
      } else {
        this.getDkData()
      }
    },
    onMonthShow(value) {

    },
    getDkMonthData(date) {
      let params = {
        phone: this.userPhone,
        dates: date,
      }
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdrecordfindSoloByPhone, { params }).then(res => {
        if (res.data) {
          console.log(res)
          // this.totalData = res.data[this.userPhone].split('&')
          // console.log(this.totalData)
          this.dayDkData = res.data
          if (!this.userPhone) {
            Notify({ type: 'warning', message: '请选择被统计人！' })
          } else {
            if (this.dayDkData.length == 0) {
              Notify({ type: 'warning', message: '当日无打卡信息！' })

            } else {
              this.showDayDk = true
            }
          }
        }
      })
    },
    getDkData() {
      let startDay = moment(new Date(this.year + '-' + (this.activeTab + 1)).getTime()).startOf('months').format('YYYY-MM-DD')
      let endDay = moment(new Date(this.year + '-' + (this.activeTab + 1)).getTime()).endOf('months').format('YYYY-MM-DD')
      let params = {
        phone: this.userPhone,
        start: startDay,
        end: endDay
      }
      getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdGetSomeingByPhone, { params }).then(res => {
        if (res.data) {
          console.log(res)
          this.totalData = res.data[this.userPhone].split('&')
          console.log(this.totalData)
        }
      })
    },


  },
}
</script>
<style lang="scss" scoped>
.userBox {
  margin: 10px;

  >>>.van-calendar__header-title {
    display: none;
  }
}

.vanGrid {
  background: #f1f1f1;
}

.vanGridTitle {
  background: #fff;
}

.userBox {
  >>>.van-cell {
    border-radius: 6px 6px 0 0;
  }

  >>>.van-calendar__day {
    height: 50px;
  }
}

.warning {
  font-size: 11px;
  background: #fff;

  padding: 10px;
  margin: 5px 0;

  p {
    text-align: left;

    &:nth-child(1) {
      span {
        background: green;
      }
    }

    &:nth-child(2) {
      span {
        background: orange;
      }
    }

    &:nth-child(3) {
      span {
        background: #ddd;
      }
    }

    span {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 5px;




    }

  }
}

.flexBox {
  display: flex;
  flex-wrap: wrap;
  background: #fff;

  .flexBoxColumn {
    display: flex;
    flex-direction: column;
    margin: 10px;
    width: 95px;
    padding: 10px 0;

    p {
      &:nth-child(1) {
        font-size: 13px;
      }

      &:nth-child(2) {
        font-size: 11px;
        color: #a0a0a0;
      }
    }


  }
}

.more {
  height: 40px;
  line-height: 40px;
  background: #fff;
  font-size: 14px;
  border-top: 1px solid #ddd;
  border-radius: 16px 16px 0 0;
  margin: 0 10px;

  &:active {
    background: #f3f3f3;
  }
}

.export {
  height: 40px;
  line-height: 40px;
  background: #fff;
  font-size: 14px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-radius: unset;

  &:active {
    background: #f3f3f3
  }
}

.userBoxDay {
  height: 70vh;
}

.excelTitle {
  padding: 20px 10px;
}

.excelFooter {
  display: flex;

  >>>.van-button--normal {
    flex: 1
  }

  div {
    flex: 1
  }
}
</style>

<template>
    <div>
        <div class="vanGrid">
            <div style="display:flex" class="flexBox">
                <div class="vanGridTitle" ref="popupHeight"><img src="../assets/images/installer11.png" /> <span>人员管理</span>

                </div>
                <van-field style="margin-left: 83px;width: 93px;" readonly clickable name="userType" :value="userType"
                    placeholder="类型选择" @click="showUserType = true" />
                <van-button @click="showEditUser = true, editTitle = '新增人员信息'" v-if="rules.indexOf('10005') > -1"
                    icon="https://img01.yzcdn.cn/vant/user-active.png" size="mini" type="info">
                    新增人员
                </van-button>

                <div>

                </div>
            </div>
            <div class="taskLis" v-if="taskLis.length" :style="`height:${contentHeight}px`">
                <ul>
                    <li v-for="(item, index) in taskLis" :key='item.id' @click="candleEdit(item)">
                        <div>
                            <span>电话：</span>
                            <p>{{ item.userphone }}</p>
                        </div>

                        <div>
                            <span>姓名：</span>
                            <p>{{ item.username }}</p>
                        </div>

                        <div>
                            <span>角色：</span>
                            <p>{{ item.userrole === '1' ? '-' : item.userrole }}</p>
                        </div>

                        <!--删除按钮-->
                        <img @click.stop='del(item.id, index)' v-if="rules.indexOf('10005') > -1"
                            src="../assets/images/del.png" />
                    </li>
                </ul>
            </div><!--/taskLis-->

            <div v-else>
                <div class="nodate">
                    <img src="../assets/images/noDate.png" alt="">
                    <p>暂无详细信息！</p>
                </div>
            </div>

            <van-dialog v-model="showEditUser" @close="clearIpt" :title="editTitle" @confirm="onConfirmAddUser"
                show-cancel-button :show-confirm-button="rules.indexOf('10005') > -1">
                <div class="vanButton">
                    <van-divider content-position="left">基本信息</van-divider>
                    <van-field readonly clickable name="userrole" :value="userrole" label="人员角色" placeholder="点击选择"
                        @click="showSbmc = true" />
                    <van-field v-model="userphone" name="userphone" label="电话号码" placeholder="请输入" maxlength="11" />
                    <!-- <input type="text" placeholder="请选择日期" v-model="userDats" @click='selectDaspopup' readonly>  -->
                    <van-field v-model="username" name="username" label="人员姓名" placeholder="请输入" />
                    <van-divider content-position="left">权限管理</van-divider>
                    <van-checkbox-group v-model="result">
                        <van-cell-group>
                            <van-cell v-for="(item, index) in list" clickable :key="index" :title="`${item.name}`"
                                @click="toggle(index)">
                                <template #right-icon>
                                    <van-checkbox :name="item.value" ref="checkboxes" />
                                </template>
                            </van-cell>
                        </van-cell-group>
                    </van-checkbox-group>

                </div>
            </van-dialog>

            <van-popup v-model="showSbmc" position="bottom">
                <van-picker show-toolbar :columns="sbmcColumns" @confirm="onConfirm" @cancel="showSbmc = false" />
            </van-popup>
            <van-popup v-model="showUserType" position="bottom">
                <van-picker show-toolbar :columns="showUserTypeColumns" @confirm="onConfirmUserType"
                    @cancel="showUserType = false" />
            </van-popup>
        </div>
    </div>
</template>
<script>
import { apiUrl, getlisting, postlisting, hxduserfindAll, } from '../utils/apiUrl'
import { Notify } from 'vant';
export default {
    data() {
        return {
            sbmcColumns: ['管理员', '督导员'],
            showSbmc: false,
            showEditUser: false,
            taskLis: [],//旧的
            contentHeight: 0,
            screenHeight: 0,
            newtasKLis: [],//新的全部任务列表
            useravator: '',
            userphone: '',
            username: '',
            userrole: '',
            editTitle: '新增人员信息',
            list: [
                { name: '可分配二级权限子功能', value: '10000' },
                { name: '可设置打卡时间段', value: '10001' },
                { name: '可设置打卡次数', value: '10002' },
                { name: '可打卡范围', value: '10003' },
                { name: '可开启提示信息', value: '10004' },
                { name: '可编辑人员信息', value: '10005' },
            ],
            result: [],
            userType: '',
            showUserTypeColumns: ['全部', '管理员', '督导员', '小工',],
            showUserType: false,
            selectId: '',
            rules: [],

        }
    },
    mounted() {
        this.screenHeight = window.innerHeight;
        this.getFindAll()
        this.riderPopup()
        this.getUserInfo()
    },
    methods: {
        getUserInfo() {
            let userphone = JSON.parse(sessionStorage.getItem('userInfo')).userphone
            getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindSolo + '?userphone=' + userphone).then(res => {
                if (res) {

                    this.rules = res.data.recvcode.split(',')
                    console.log(this.rules)
                }
            })
        },
        onConfirmUserType(type) {
            this.userType = type === '全部' ? '' : type
            console.log(type)
            this.showUserType = false
            this.getFindAll(this.userType)
        },
        toggle(index) {
            this.$refs.checkboxes[index].toggle();
        },
        clearIpt() {
            this.useravator = ''
            this.userphone = ''
            this.username = ''
            this.userrole = ''
            this.result = []
        },
        candleEdit(row) {
            this.useravator = row.useravator
            this.userphone = row.userphone
            this.username = row.username
            this.userrole = row.userrole
            this.showEditUser = true
            this.selectId = row.id
            this.result = row.recvcode && row.recvcode.length > 0 ? row.recvcode.split(',') : []
            this.editTitle = '修改人员信息'
        },
        onConfirm(value) {//设备名称
            this.userrole = value;
            this.showSbmc = false;
        },
        onConfirmAddUser() {
            console.log(this.result)

            let params = {
                userrole: this.userrole,
                userphone: this.userphone,
                username: this.username,
                recvcode: this.result.join(','),
                id: this.selectId || undefined,
                useravator: apiUrl.softwafeLocation || undefined
            }
            let fetchUrl = this.editTitle === '新增人员信息' ? apiUrl.hxduseraddUser : apiUrl.hxduserupdateUser
            postlisting(process.env.BASE_URL_HTTPS + fetchUrl, params).then(res => {
                if (res) {
                    Notify({ type: 'success', message: '保存成功' })
                    this.userrole = ''
                    this.userphone = ''
                    this.username = ''
                    this.getFindAll()
                } else {
                    Notify({ type: 'warning', message: '保存失败' })
                }
            })
        },
        riderPopup() {
            let that = this
            this.$nextTick(() => {
                let a = that.$refs.popupHeight.offsetHeight //标题高度
                that.contentHeight = that.screenHeight - a
            })
        },
        getFindAll(type) {///查询全部人员
            getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserfindAll)
                .then(res => {
                    //    console.log('查询全部',res)
                    let resLists = res.data
                    if (resLists.length) {
                        if (type) {
                            this.taskLis = res.data.filter(item => item.userrole === type)
                        } else {
                            this.taskLis = res.data
                        }

                    }
                })
        },
        //点击跳转到接受任务、拒绝任务的的页面
        findAllUrl(infoflag, index) {
            let that = this;

            this.$router.push({ path: '/task', query: { lists: JSON.stringify(that.newtasKLis[index]), distinctionId: 1 } })
            //   switch(parseInt(infoflag)){
            //       case 1:
            //          console.log('infoflag',infoflag)

            //        break;
            //   }
        },
        del(delid, index) {
            let that = this;
            let delidCs = encodeURI('/') + delid
            this.$dialog.confirm({
                message: '确定删除这个人员吗？',
                className: "textFont"
            })
                .then(() => {
                    // on confirm
                    getlisting(process.env.BASE_URL_HTTPS + apiUrl.deleteUserById + delidCs)
                        .then(res => {
                            console.log('res', index)
                            that.getFindAll()
                        })
                })
                .catch(() => {
                    //console.log('取消')
                });
        },
        getRealLocation() {
            getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxdlocationgetRealLocation)
                .then(res => {
                    let coordinates = Object.values(res.data);
                    //    console.log(coordinates)

                    let lat = []
                    lat = coordinates.map((item) => {
                        //   let strArr =  str.split('-')
                        return item.split('&')
                    })
                    let a = lat.map(item => {
                        let arr = item.slice(-2)//获取返回的数组后2个位置
                        let newArr = { lat: arr[0], lng: arr[1] }
                        return newArr
                    })

                    this.tel = Object.keys(res.data)//取的对象的key值

                    // this.center= this.center2[0]
                    //    console.log('aaa',a)
                    this.$nextTick(() => {
                        this.center = a[0]
                        this.center2 = a
                        console.log(this.center.lat, this.center.lng)
                    })

                })
        }
    }
}
</script>
<style scoped>
.flexBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.van-cell__title {
    text-align: left
}



.taskLis>ul>li>img {
    position: absolute;
    right: 17px;
    top: 50px;
    width: 20px;
    height: 20px;
}
</style>
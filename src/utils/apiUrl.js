import Vue from 'vue'
import axios from 'axios'
import { Toast } from 'vant'
Vue.use(Toast)

export let apiUrl = {
    //url:'http://192.168.110.140:8081/images/',//测试
    url: 'http://182.137.194.151:51000//images/',//正式
    location: sessionStorage.getItem('useravator') || '',
    softwafeLocation: '涪城',
    filetest: 'filetest',//员工定位上传
    hxduseraddUser: 'hxduser/addUser',//员工注册
    deleteUserById: '/hxduser/deleteUserById/', //删除员工
    hxdlocationfindAll: 'hxdlocation/findAll',//获取所指定员工的定位信息
    hxdlocationaddLocation: 'hxdlocation/addLocation',//获取所指定员工的定位信息
    hxduserupdateUser: 'hxduser/updateUser',//员工信息修改
    hxduserfindSolo: 'hxduser/findSolo',//查询单个员工信息
    hxdfindWorkeTime: 'hxdrecord/getWorkTimeByDisname',//查询单个员工或所有员工的工作时长
    hxdaddLimitinfo: 'hxdlimit/addLimitinfo',//新增打卡时间段设置
    hxdupdateLimit: 'hxdlimit/updateLimit',//修改打卡时间段设置
    hxdlimmitFindAll: 'hxdlimit/findAll', //查询打卡时段
    hxdmetaFindAll: 'hxdmeta/findAll', //查询打卡配置
    hxdaddMetaInfo: 'hxdmeta/addMetaInfo',//新增打卡配置设置
    hxdupdateMetaInfo: 'hxdmeta/updateMetaInfo',//修改打卡配置设置

    hxduserfindAll: 'hxduser/findAllByDisname',
    hxduserfindUserByRole: 'hxduser/findUserByRole',//查询所有员工(角色)
    hxduseragreeForRole: 'hxduser/agreeForRole',//同意变更角色
    hxduserdisagreeForRole: 'hxduser/disagreeForRole',//不同意变更角色
    hxduseraddUserBatch: 'hxduser/addUserBatch',//增加虚拟员工
    hxduserdeleteUserBatch: 'hxduser/deleteUserBatch',//删除虚拟员工
    hxddeviceaddDevice: 'hxddevice/addDevice',//增加设备信息
    hxddevicefindAll: 'hxddevice/findAll',//查询添加设备
    hxddeviceupdateDevice: 'hxddevice/updateDevice',//修改添加设备的信息

    hxddeviceaddDeviceMap: 'hxddevice/addDeviceMap',//增加设备信息2
    // http://192.168.110.140:8081/fileupload
    fileupload: 'fileupload',//图片上传
    hxdindoorfindAll: 'hxdindoor/findAll',//查询入户信息（全部）
    hxdindoorfindByPhone: 'hxdindoor/findByPhone',// 查询入户信息（条件）
    hxdindoordeleteIndoorById: 'hxdindoor/deleteIndoorById',// 删除入户信息

    hxdappointmentfindByPhone: 'hxdappointment/findByPhone',//查询预约信息（条件）
    hxdappointmentfindAll: 'hxdappointment/findAll', //查询预约信息（全部）
    hxdappointmentdeleteAppointById: 'hxdappointment/deleteAppointById',  //删除预约信息

    hxdtaskfindAll: 'hxdtask/findAll',//查询全部任务信息
    hxdtaskacceptask: 'hxdtask/acceptTask',//接受任务
    hxdtaskdenyTask: 'hxdtask/denyTask',//拒绝任务
    hxdlocationgetRealLocation: 'hxdlocation/getRealLocation', //查询全部骑手目前坐标(时时信息)
    hxdtaskdeleteTaskById: 'hxdtask/deleteTaskById',//删除任务

    hxderrorfindAll: 'hxderror/findAll',// 查询全部错误日志信息
    //hxdusergetServerBasicNumber:'hxduser/getServerBasicNumber'//当前在线的骑手数量(弃用)
    hxdusergetServerBasicNumber: 'hxduser/getServerBasicNumber',//统计当前在线骑手数量(有效长链接)

    hxdvocationFindAll: 'hxdvocation/findAll',//请假查询
    hxdfindAllByManager: '/hxdvocation/findAllByManager', // 按审批人请假查询
    hxdvocationAddVocation: 'hxdvocation/addVocation',//新增请假
    hxdvocationUpdateVocation: 'hxdvocation/updateVocation',//请假查询
    hxddeletevocationbyid: '/hxdvocation/deleteVocationById', //撤销请假

    hxdGetSomeingByPhone: '/hxdrecord/getSomeingByPhone',//按手机查询打卡信息
    hxdGetSomeing: '/hxdrecord/getSomeing',//按手机查询打卡信息

    //20230318新增
    hxdusergetUserPhone: 'hxduser/getUserPhone', //查询所有用户的电话

    hxdRecordFindAll: '/hxdrecord/findAll', //查询所有人打卡信息

    hxdrecordfindByDate: '/hxdrecord/getSomtingByDisnameDate',//查询员工打卡信息  全部
    hxdrecordfindSoloByPhone: 'hxdrecord/findSoloByPhone',//用电话号码查询单个
    getLocationDateAndDistrict: 'hxdlocation/getLocationDateAndDistrict',// 查询指定区域 指定时间段员工轨迹信息

    //20230531 添加登录接口
    hxduserHasRule: 'hxduser/login',
    hxdrecordFindByDate2: 'hxdrecord/findByDate2',//某天未打卡全部信息

    //20200601 添加时长查询
    hxdrecordGetSomting: 'hxdrecord/getSomtingByDisname'
}

//封装get请求

export function getlisting (url, data) {
    let dataParams = data ? data.params : {}
    let params = {
        ...dataParams,
        ...{ disname: apiUrl.softwafeLocation }
    }
    return new Promise((resolve, reject) => {
        axios.get(url,  { params:params,timeout: 6000000 }).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
            switch (err.response.status) {
                case 404:
                    Toast.fail('接口错误')
                    break;
                case 504:
                    Toast.fail('请求超时！')
                    break;
            }

        })
    })
}

//封装post请求
export function postlisting (url, data) {
    //  console.log('dataPost____',data)
    let params = {
        ...data, ...{ disname: apiUrl.softwafeLocation }
    }

    return new Promise((resolve, reject) => {
        axios.post(url, params, {
            data: data,
            timeout:6000000,
            headers: {
                
                'Content-Type': 'application/x-www-form-urlencoded',
                // other headers here...
            }
        }).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

export function filterTimemonth (time) { //中国标准时间转化月日时分秒
    var date = new Date(time);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    var s = date.getSeconds();
    s = s < 10 ? "0" + s : s;
    // return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + s;
    return y + "-" + m
}
export function filterTimeday (time) { //中国标准时间转化月日时分秒
    var date = new Date(time);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    var s = date.getSeconds();
    s = s < 10 ? "0" + s : s;
    // return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + s;
    return y + "-" + m + "-" + d
}


export function validatePhoneNumber (str) {
    const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
    return reg.test(str)
}

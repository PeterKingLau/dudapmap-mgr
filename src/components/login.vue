<template>
  <div>
    <div class="loginConter" :style="bg">
      <div class="logo"><img src="../assets/images/logo.png" alt="" /></div>
      <div class="logo"><img src="../assets/images/logoText.png" alt="" /></div>

      <div class="loginBox">
        <div class="vanField">
          <van-cell-group>
            <van-field
              label-width="4em"
              :colon="true"
              size="20"
              v-model="tel"
              type="tel"
              label="电话号"
              maxlength="11"
              placeholder="请输入电话号码"
            />

            <van-field
              v-model="password"
              label-width="4em"
              placeholder="请输入密码"
              type="password"
              maxlength="20"
              label="密码:"
            />
          </van-cell-group>
        </div>
        <div class="vanButton">
          <van-button class="btnWidth" type="primary" @click="loginBtn">登录</van-button>
        </div>
      </div>
      <!--/loginBox-->
    </div>

    <van-dialog
      v-model="showUseravator"
      title="用户未绑定区域信息，请完善"
      @confirm="onConfirmUseravator"
      show-cancel-button
      style="height: 250px"
    >
      <div class="vanButton">
        <van-field
          readonly
          clickable
          name="name"
          style="height: 150px; line-height: 150px"
          :value="useravator"
          label="区域"
          placeholder="点击选择区域"
          @click="showSbmc = true"
        />
        <van-popup v-model="showSbmc" position="bottom">
          <van-picker
            show-toolbar
            :columns="sbmcColumns"
            @confirm="onConfirm"
            @cancel="showSbmc = false"
          />
        </van-popup>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import {
  apiUrl,
  validatePhoneNumber,
  getlisting,
  postlisting,
  hxduserupdateUser,
} from "../utils/apiUrl";
import { Notify } from "vant";
export default {
  data() {
    return {
      bg: {
        backgroundImage: "url(" + require("../assets/images/loginBg.jpg") + ")",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      },
      password: "",
      tel: "",
      showUseravator: false,
      sbmcColumns: ["总公司", "涪城", "安州", "广汉", "射洪", "南充"],
      showSbmc: false,
      useravator: "",
      userphone: "",
    };
  },
  mounted() {
    //    let loginZj= this.$store.getters.getLogin
    //     if(loginZj){
    //        this.$router.replace({path:'/index'})
    //     }else{
    //          this.$router.replace({path:'/'})
    //     }
  },
  methods: {
    onConfirmUseravator() {
      this.setUseravator({ useravator: this.useravator, userphone: this.userphone });
    },
    onConfirm(value) {
      //设备名称
      console.log(value);
      this.useravator = value;
      this.showSbmc = false;
    },
    setUseravator(params) {
      postlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserupdateUser, params).then(
        (res) => {
          res = res.data;
          if (res === true) {
            console.log(params.useravator);
            sessionStorage.setItem("useravator", params.useravator);
            Notify({ type: "success", message: "信息绑定成功！" });
            this.$router.replace({ path: "/index" });
          }
        }
      );
    },
    loginBtn() {
      let telValid = validatePhoneNumber(this.tel);
      let data = {
        phone: this.tel,
        pwd: this.password,
      };
      if (!telValid) {
        Notify({ type: "danger", message: "请输入正确的手机号码！" });
      } else {
        getlisting(process.env.BASE_URL_HTTPS + apiUrl.hxduserHasRule, {
          params: data,
        }).then((res) => {
          console.log(res);
          this.userphone = res.data.userphone;
          if (res.data.useravator === "1") {
            this.showUseravator = true;
          } else if (res.data.useravator && res.data.useravator !== "1") {
            this.$store.commit("updateLogin", res.data);
            sessionStorage.setItem("userInfo", JSON.stringify(res.data));
            sessionStorage.setItem("useravator", res.data.useravator);
            this.$router.replace({ path: "/index" });
          } else {
            Notify({ type: "warning", message: "您无权限查看督导员的信息！" });
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
.loginConter {
  height: 100vh;
  overflow: hidden;

  .logo {
    margin: 5% 0 0 0;

    img {
      width: 162.5px;
    }
  }

  .loginBox {
    width: 90%;
    margin: 5% auto auto auto;

    .vanField {
      border-radius: 20px;
      overflow: hidden;
    }

    .vanButton {
      margin: 5% auto auto auto;
      border-radius: 20px;
      overflow: hidden;

      .btnWidth {
        width: 100%;
      }
    }
  }
}

.van-field__label,
.van-field__control,
.van-button__text {
  font-size: 16px;
}
</style>

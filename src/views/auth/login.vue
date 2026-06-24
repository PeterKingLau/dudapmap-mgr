<template>
  <div class="login-page" :style="bgStyle">
    <main class="login-shell">
      <section class="brand-panel">
        <div class="brand-stack">
          <img
            class="brand-logo"
            src="../../assets/images/brand-logo.png"
            alt="Logo"
          />
          <img
            class="brand-text"
            src="../../assets/images/brand-logo-text.png"
            alt="Huaxinda"
          />
        </div>
        <div class="brand-copy">
          <h1>华信达管理平台</h1>
          <p>督导作业、人员定位与考勤统计统一管理</p>
        </div>
        <div class="decor-circle circle-1"></div>
        <div class="decor-circle circle-2"></div>
      </section>

      <section class="auth-panel">
        <AForm class="login-card" :model="loginFormModel" @submit="submitStep">
          <div class="login-card-title">
            <h3>{{ loginStep === "phone" ? "账号登录" : "输入密码" }}</h3>
            <p>
              {{
                loginStep === "phone"
                  ? "请输入绑定的手机号码"
                  : `正在登录 ${maskedPhone}`
              }}
            </p>
          </div>

          <div class="login-fields">
            <AInput
              v-if="loginStep === 'phone'"
              v-model.trim="tel"
              size="large"
              :max-length="11"
              allow-clear
              placeholder="输入手机号码"
            >
              <template #prefix>
                <IconPhone class="field-icon" />
              </template>
            </AInput>
            <AInputPassword
              v-else
              v-model="password"
              size="large"
              :max-length="20"
              allow-clear
              placeholder="输入密码"
            >
              <template #prefix>
                <IconLock class="field-icon" />
              </template>
            </AInputPassword>
          </div>

          <div class="login-options">
            <ACheckbox v-model="rememberMe">记住我</ACheckbox>
          </div>

          <AButton
            class="submit-button"
            long
            type="primary"
            html-type="submit"
            :loading="loginLoading"
          >
            {{ loginStep === "phone" ? "下一步" : "登录" }}
          </AButton>

          <AButton
            v-if="loginStep === 'password'"
            class="back-phone"
            type="text"
            @click="backToPhone"
          >
            返回修改手机号
          </AButton>
        </AForm>
      </section>
    </main>

    <AModal
      v-model:visible="showUseravator"
      :footer="false"
      :mask-closable="false"
      class="area-popup"
      modal-class="area-modal"
      @close="closeUseravatorDialog"
    >
      <div class="area-panel">
        <div class="area-icon">
          <img src="../../assets/images/icon-location.png" alt="" />
        </div>
        <h3>完善区域信息</h3>
        <p>当前账号还没有绑定区域，请选择后继续进入系统。</p>

        <div class="area-field">
          <label>区域选择</label>
          <ASelect
            v-model="useravator"
            placeholder="点击选择区域"
            allow-clear
            size="large"
          >
            <AOption
              v-for="item in areaOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
            >
              {{ item.text }}
            </AOption>
          </ASelect>
        </div>

        <div class="area-actions">
          <AButton long shape="round" @click="showUseravator = false">
            取消
          </AButton>
          <AButton
            long
            shape="round"
            type="primary"
            :loading="bindingLoading"
            @click="onConfirmUseravator"
          >
            确定
          </AButton>
        </div>
      </div>
    </AModal>
  </div>
</template>

<script setup>
import { ROUTE_PATHS } from "../../router/paths";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { IconLock, IconPhone } from "@arco-design/web-vue/es/icon";
import { validatePhoneNumber } from "../../utils/validators";
import { login, updateLoginUser } from "../../api/auth";
import { useAppStore } from "../../store";

const router = useRouter();
const appStore = useAppStore();
const loginBg = new URL("../../assets/images/login-bg.jpg", import.meta.url)
  .href;
const REMEMBER_PHONE_KEY = "login:remembered-phone";

const password = ref("");
const tel = ref(getRememberedPhone());
const rememberMe = ref(Boolean(tel.value));
const loginStep = ref("phone");
const showUseravator = ref(false);
const useravator = ref("");
const userphone = ref("");
const pendingUser = ref(null);
const loginLoading = ref(false);
const bindingLoading = ref(false);
const areaColumns = ["总公司", "涪城", "安州", "广汉", "射洪", "南充", "成华"];

const loginFormModel = computed(() => ({
  password: password.value,
  rememberMe: rememberMe.value,
  tel: tel.value,
}));

const bgStyle = computed(() => ({
  backgroundImage: `linear-gradient(120deg, rgba(235, 246, 243, 0.95), rgba(215, 238, 232, 0.9)), url(${loginBg})`,
}));

const maskedPhone = computed(() => {
  if (!tel.value || tel.value.length < 11) {
    return tel.value;
  }
  return `${tel.value.slice(0, 3)}****${tel.value.slice(-4)}`;
});

const areaOptions = computed(() =>
  areaColumns.map((item) => ({
    text: item,
    value: item,
  })),
);

function notify(type, message) {
  const method = type === "error" ? "error" : type;
  if (typeof Message[method] === "function") {
    Message[method](message);
    return;
  }
  Message.info(message);
}

function getRememberedPhone() {
  try {
    return localStorage.getItem(REMEMBER_PHONE_KEY) || "";
  } catch (error) {
    return "";
  }
}

function syncRememberedPhone() {
  try {
    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_PHONE_KEY, tel.value);
      return;
    }

    localStorage.removeItem(REMEMBER_PHONE_KEY);
  } catch (error) {
    // Ignore storage failures, such as private browsing restrictions.
  }
}

function submitStep() {
  if (loginStep.value === "phone") {
    nextStep();
    return;
  }
  loginBtn();
}

function nextStep() {
  if (!validatePhoneNumber(tel.value)) {
    notify("error", "请输入正确的手机号码！");
    return;
  }
  syncRememberedPhone();
  loginStep.value = "password";
}

function backToPhone() {
  loginStep.value = "phone";
  password.value = "";
}

function completeLogin(userInfo) {
  syncRememberedPhone();
  appStore.updateLogin(userInfo);
  sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
  appStore.updateDisname(userInfo.useravator);
  router.replace({ path: ROUTE_PATHS.home.index });
}

function onConfirmUseravator() {
  if (!useravator.value) {
    notify("warning", "请选择区域！");
    return;
  }

  setUseravator({
    useravator: useravator.value,
    userphone: userphone.value,
  });
}

function closeUseravatorDialog() {
  useravator.value = "";
}

function setUseravator(params) {
  bindingLoading.value = true;
  updateLoginUser(params)
    .then((res) => {
      if (res.data !== true) {
        notify("warning", "信息绑定失败，请稍后重试");
        return;
      }
      const userInfo = {
        ...(pendingUser.value || {}),
        userphone: params.userphone,
        useravator: params.useravator,
      };
      notify("success", "信息绑定成功！");
      showUseravator.value = false;
      completeLogin(userInfo);
    })
    .catch(() => {
      notify("error", "信息绑定失败，请稍后重试");
    })
    .finally(() => {
      bindingLoading.value = false;
    });
}

function loginBtn() {
  if (!validatePhoneNumber(tel.value)) {
    notify("error", "请输入正确的手机号码！");
    loginStep.value = "phone";
    return;
  }
  if (!password.value) {
    notify("warning", "请输入密码！");
    return;
  }

  const params = {
    phone: tel.value,
    pwd: password.value,
  };

  loginLoading.value = true;
  login(params)
    .then((res) => {
      const userInfo = res.data || {};
      userphone.value = userInfo.userphone || tel.value;
      pendingUser.value = userInfo;

      if (userInfo.useravator === "1") {
        showUseravator.value = true;
        return;
      }
      if (userInfo.useravator && userInfo.useravator !== "1") {
        completeLogin(userInfo);
        return;
      }
      notify("warning", "您无权限查看人员的信息！");
    })
    .catch(() => {
      notify("error", "登录失败，请检查账号或密码");
    })
    .finally(() => {
      loginLoading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100vw;
  min-width: 1200px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  overflow: auto;
}

.login-shell {
  width: 100vw;
  min-width: 1200px;
  max-width: none;
  height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 480px;
  background: #ffffff;
  box-shadow: none;
}

.brand-panel {
  position: relative;
  overflow: hidden;
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #0ba360 0%, #13b996 100%);
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  pointer-events: none;
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -150px;
  right: -100px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -50px;
  left: -100px;
}

.brand-stack {
  position: absolute;
  top: 60px;
  left: 80px;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  height: 54px;
  object-fit: contain;
}

.brand-text {
  height: 28px;
  object-fit: contain;
}

.brand-copy {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: left;
  transform: translateY(-20px);

  h1 {
    margin: 0 0 20px;
    font-size: 46px;
    letter-spacing: 3px;
    font-weight: 600;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 20px;
    line-height: 1.6;
    letter-spacing: 1px;
  }
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

.login-card-title {
  margin-bottom: 40px;

  h3 {
    margin: 0;
    color: #1a1a1a;
    font-size: 28px;
    font-weight: 600;
  }

  p {
    margin: 12px 0 0;
    color: #8c8c8c;
    font-size: 14px;
  }
}

.login-fields {
  margin-bottom: 30px;

  :deep(.arco-input-wrapper) {
    height: 52px;
    padding: 0 16px;
    background: #f7f8fa;
    border: 1px solid transparent;
    border-radius: 8px;
    box-shadow: none;
    transition: all 0.3s ease;
  }

  :deep(.arco-input-wrapper:hover) {
    background: #f2f3f5;
  }

  :deep(.arco-input-wrapper.arco-input-focus) {
    background: #ffffff;
    border-color: #13b996;
    box-shadow: 0 0 0 3px rgba(19, 185, 150, 0.1);
  }

  :deep(.arco-input) {
    color: #1a1a1a;
    font-size: 15px;

    &::placeholder {
      color: #b0b4b8;
    }
  }

  :deep(.arco-input-prefix) {
    padding-right: 12px;
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: -14px 0 24px;

  :deep(.arco-checkbox) {
    color: #5f6368;
    font-size: 14px;
    line-height: 20px;
  }

  :deep(.arco-checkbox-label) {
    padding-left: 8px;
  }

  :deep(.arco-checkbox-checked .arco-checkbox-icon) {
    background-color: #13b996;
    border-color: #13b996;
  }

  :deep(.arco-checkbox:hover .arco-checkbox-icon) {
    border-color: #13b996;
  }
}

.field-icon {
  color: #13b996;
  font-size: 20px;
}

.submit-button {
  height: 52px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #18c49f 0%, #0fae8c 100%) !important;
  border: 0;
  box-shadow: 0 6px 16px rgba(15, 174, 140, 0.25);
  transition: all 0.3s ease;

  &:active {
    transform: none;
  }
}

.back-phone {
  display: block;
  margin: 20px auto 0;
  color: #8c8c8c;
  font-size: 14px;
  transition: color 0.3s;

  &:hover {
    color: #13b996;
    background: transparent;
  }
}

.area-popup {
  overflow: hidden;
}

:global(.area-modal .arco-modal) {
  width: 440px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
}

:global(.area-modal .arco-modal-body) {
  padding: 0;
}

.area-panel {
  padding: 40px 32px;
  text-align: center;

  h3 {
    margin: 16px 0 8px;
    color: #1a1a1a;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin: 0 0 24px;
    color: #8c8c8c;
    font-size: 14px;
    line-height: 1.5;
  }

  :deep(.arco-modal-close-btn) {
    top: 20px;
    right: 20px;
    color: #8c8c8c;
  }
}

.area-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 16px;
  background: rgba(19, 185, 150, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.area-field {
  text-align: left;
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 10px;
    color: #4a4a4a;
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.arco-select-view-single) {
    height: 48px;
    background: #f7f8fa;
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  :deep(.arco-select-view-single:hover) {
    background: #f2f3f5;
  }

  :deep(.arco-select-view-single.arco-select-view-focus) {
    background: #fff;
    border-color: #13b996;
    box-shadow: 0 0 0 3px rgba(19, 185, 150, 0.1);
  }
}

.area-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  :deep(.arco-btn) {
    height: 44px;
    border-radius: 8px;
    font-size: 15px;
  }

  :deep(.arco-btn-secondary),
  :deep(.arco-btn-outline),
  :deep(.arco-btn) {
    color: #4a4a4a;
    background: #f2f3f5;
    border: none;

    &:hover {
      background: #e5e6e8;
    }
  }

  :deep(.arco-btn-primary) {
    color: #fff;
    background: #13b996;
    box-shadow: 0 4px 12px rgba(19, 185, 150, 0.2);

    &:hover {
      background: #10a384;
    }
  }
}

:global(html[data-theme="dark"] .login-page) {
  background-color: #020617;
  background-image:
    linear-gradient(120deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.9)),
    url("../../assets/images/login-bg.jpg") !important;
}

:global(html[data-theme="dark"] .login-shell) {
  background: #020617;
}

:global(html[data-theme="dark"] .brand-panel) {
  background:
    radial-gradient(
      circle at 24% 22%,
      rgba(45, 212, 191, 0.24),
      transparent 30%
    ),
    linear-gradient(135deg, #052e2b 0%, #064e3b 52%, #0f172a 100%);
}

:global(html[data-theme="dark"] .decor-circle) {
  background: linear-gradient(
    135deg,
    rgba(45, 212, 191, 0.16) 0%,
    rgba(15, 23, 42, 0.02) 100%
  );
}

:global(html[data-theme="dark"] .brand-copy h1) {
  color: #f8fafc;
  text-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
}

:global(html[data-theme="dark"] .brand-copy p) {
  color: rgba(226, 232, 240, 0.86);
}

:global(html[data-theme="dark"] .auth-panel) {
  background: #0f172a;
}

:global(html[data-theme="dark"] .login-card-title h3) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .login-card-title p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .login-fields .arco-input-wrapper) {
  border-color: #2d3748;
  background: #111827;
}

:global(html[data-theme="dark"] .login-fields .arco-input-wrapper:hover) {
  background: #1f2937;
}

:global(
  html[data-theme="dark"] .login-fields .arco-input-wrapper.arco-input-focus
) {
  border-color: #13b996;
  background: #0b1220;
  box-shadow: 0 0 0 3px rgba(19, 185, 150, 0.18);
}

:global(html[data-theme="dark"] .login-fields .arco-input) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .login-fields .arco-input::placeholder) {
  color: #64748b;
}

:global(html[data-theme="dark"] .login-options .arco-checkbox) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .login-options .arco-checkbox-icon) {
  border-color: #475569;
  background: #111827;
}

:global(
  html[data-theme="dark"]
    .login-options
    .arco-checkbox-checked
    .arco-checkbox-icon
) {
  border-color: #13b996;
  background: #13b996;
}

:global(html[data-theme="dark"] .back-phone) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .back-phone:hover) {
  color: #5eead4;
  background: transparent;
}

:global(html[data-theme="dark"] .area-modal .arco-modal) {
  background: #111827;
  color: #e5e7eb;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.42);
}

:global(html[data-theme="dark"] .area-modal .arco-modal-close-btn) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .area-modal .area-panel h3) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .area-modal .area-panel p) {
  color: #94a3b8;
}

:global(html[data-theme="dark"] .area-modal .area-icon) {
  background: rgba(19, 185, 150, 0.14);
}

:global(html[data-theme="dark"] .area-modal .area-field label) {
  color: #cbd5e1;
}

:global(html[data-theme="dark"] .area-modal .arco-select-view-single) {
  border-color: #2d3748;
  background: #0f172a;
}

:global(html[data-theme="dark"] .area-modal .arco-select-view-single:hover) {
  background: #1f2937;
}

:global(
  html[data-theme="dark"]
    .area-modal
    .arco-select-view-single.arco-select-view-focus
) {
  border-color: #13b996;
  background: #0b1220;
  box-shadow: 0 0 0 3px rgba(19, 185, 150, 0.18);
}

:global(html[data-theme="dark"] .area-modal .arco-select-view-value) {
  color: #f8fafc;
}

:global(html[data-theme="dark"] .area-modal .arco-select-view-placeholder) {
  color: #64748b;
}

:global(
  html[data-theme="dark"]
    .area-modal
    .area-actions
    .arco-btn:not(.arco-btn-primary)
) {
  color: #cbd5e1;
  background: #1f2937;
}

:global(
  html[data-theme="dark"]
    .area-modal
    .area-actions
    .arco-btn:not(.arco-btn-primary):hover
) {
  color: #f8fafc;
  background: #273244;
}
</style>

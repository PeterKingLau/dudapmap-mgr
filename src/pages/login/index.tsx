import { Button, Checkbox, Form, Input, Modal, Select, message } from "antd";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, updateLoginUser } from "../../api/auth";
import { validatePhoneNumber } from "../../utils/validators";
import {
  useAppStore,
  type ReactLoginUser,
} from "../../store/useAppStore";
import brandLogo from "../../assets/images/brand-logo.png";
import brandLogoText from "../../assets/images/brand-logo-text.png";
import iconLocation from "../../assets/images/icon-location.png";
import loginBg from "../../assets/images/login-bg.jpg";
import "./index.css";

const REMEMBER_PHONE_KEY = "login:remembered-phone";
const areaColumns = ["总公司", "涪城", "安州", "广汉", "射洪", "南充", "成华"];

interface ApiResponse<T> {
  data: T;
}

function hasResponseData<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
}

function getResponseData<T>(value: unknown, fallback: T): T {
  return hasResponseData<T>(value) ? value.data : fallback;
}

function getRememberedPhone(): string {
  try {
    return localStorage.getItem(REMEMBER_PHONE_KEY) || "";
  } catch (error) {
    return "";
  }
}

function syncRememberedPhone(rememberMe: boolean, phone: string): void {
  try {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_PHONE_KEY, phone);
      return;
    }

    localStorage.removeItem(REMEMBER_PHONE_KEY);
  } catch (error) {
    // Ignore storage failures, such as private browsing restrictions.
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const updateLogin = useAppStore((state) => state.updateLogin);
  const rememberedPhone = getRememberedPhone();
  const [tel, setTel] = useState(rememberedPhone);
  const [password, setPassword] = useState("");
  const [loginStep, setLoginStep] = useState<"phone" | "password">("phone");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedPhone));
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [useravator, setUseravator] = useState("");
  const [userphone, setUserphone] = useState("");
  const [pendingUser, setPendingUser] = useState<ReactLoginUser | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [bindingLoading, setBindingLoading] = useState(false);

  const maskedPhone = useMemo(() => {
    if (!tel || tel.length < 11) {
      return tel;
    }

    return `${tel.slice(0, 3)}****${tel.slice(-4)}`;
  }, [tel]);

  const areaOptions = useMemo(
    () =>
      areaColumns.map((item) => ({
        label: item,
        value: item,
      })),
    [],
  );

  function completeLogin(userInfo: ReactLoginUser) {
    syncRememberedPhone(rememberMe, tel);
    updateLogin(userInfo);
    navigate("/dashboard", { replace: true });
  }

  function nextStep() {
    if (!validatePhoneNumber(tel)) {
      message.error("请输入正确的手机号码！");
      return;
    }

    syncRememberedPhone(rememberMe, tel);
    setLoginStep("password");
  }

  function backToPhone() {
    setLoginStep("phone");
    setPassword("");
  }

  function handleSubmit() {
    if (loginStep === "phone") {
      nextStep();
      return;
    }

    if (!validatePhoneNumber(tel)) {
      message.error("请输入正确的手机号码！");
      setLoginStep("phone");
      return;
    }

    if (!password) {
      message.warning("请输入密码！");
      return;
    }

    setLoginLoading(true);
    login({
      phone: tel,
      pwd: password,
    })
      .then((res) => {
        const userInfo = getResponseData<ReactLoginUser>(res, {});
        const phone = userInfo.userphone || tel;

        setUserphone(phone);
        setPendingUser(userInfo);

        if (userInfo.useravator === "1") {
          setShowAreaModal(true);
          return;
        }

        if (userInfo.useravator && userInfo.useravator !== "1") {
          completeLogin(userInfo);
          return;
        }

        message.warning("您无权限查看人员的信息！");
      })
      .catch(() => {
        message.error("登录失败，请检查账号或密码");
      })
      .finally(() => {
        setLoginLoading(false);
      });
  }

  function confirmArea() {
    if (!useravator) {
      message.warning("请选择区域！");
      return;
    }

    setBindingLoading(true);
    updateLoginUser({
      useravator,
      userphone,
    })
      .then((res) => {
        if (getResponseData<boolean>(res, false) !== true) {
          message.warning("信息绑定失败，请稍后重试");
          return;
        }

        const userInfo = {
          ...(pendingUser || {}),
          useravator,
          userphone,
        };

        message.success("信息绑定成功！");
        setShowAreaModal(false);
        completeLogin(userInfo);
      })
      .catch(() => {
        message.error("信息绑定失败，请稍后重试");
      })
      .finally(() => {
        setBindingLoading(false);
      });
  }

  return (
    <div
      className="react-login-page"
      style={
        {
          "--react-login-bg": `url(${loginBg})`,
        } as React.CSSProperties
      }
    >
      <main className="react-login-shell">
        <section className="react-brand-panel">
          <div className="react-brand-stack">
            <img
              className="react-brand-logo"
              src={brandLogo}
              alt="Logo"
            />
            <img
              className="react-brand-text"
              src={brandLogoText}
              alt="Huaxinda"
            />
          </div>
          <div className="react-brand-copy">
            <h1>华信达管理平台</h1>
            <p>督导作业、人员定位与考勤统计统一管理</p>
          </div>
          <div className="react-decor-circle react-circle-1" />
          <div className="react-decor-circle react-circle-2" />
        </section>

        <section className="react-auth-panel">
          <Form
            className="react-login-card"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="react-login-card-title">
              <h3>{loginStep === "phone" ? "账号登录" : "输入密码"}</h3>
              <p>
                {loginStep === "phone"
                  ? "请输入绑定的手机号码"
                  : `正在登录 ${maskedPhone}`}
              </p>
            </div>

            <div className="react-login-fields">
              {loginStep === "phone" ? (
                <Input
                  allowClear
                  maxLength={11}
                  placeholder="输入手机号码"
                  prefix={<Icon icon="ri:phone-line" />}
                  size="large"
                  value={tel}
                  onChange={(event) => setTel(event.target.value)}
                />
              ) : (
                <Input.Password
                  allowClear
                  maxLength={20}
                  placeholder="输入密码"
                  prefix={<Icon icon="ri:lock-line" />}
                  size="large"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              )}
            </div>

            <div className="react-login-options">
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              >
                记住我
              </Checkbox>
            </div>

            <Button
              block
              className="react-submit-button"
              htmlType="submit"
              loading={loginLoading}
              type="primary"
            >
              {loginStep === "phone" ? "下一步" : "登录"}
            </Button>

            {loginStep === "password" ? (
              <Button
                className="react-back-phone"
                type="link"
                onClick={backToPhone}
              >
                返回修改手机号
              </Button>
            ) : null}
          </Form>
        </section>
      </main>

      <Modal
        className="react-area-modal"
        footer={null}
        mask={{ closable: false }}
        open={showAreaModal}
        onCancel={() => {
          setShowAreaModal(false);
          setUseravator("");
        }}
      >
        <div className="react-area-panel">
          <div className="react-area-icon">
            <img src={iconLocation} alt="" />
          </div>
          <h3>完善区域信息</h3>
          <p>当前账号还没有绑定区域，请选择后继续进入系统。</p>

          <div className="react-area-field">
            <label>区域选择</label>
            <Select
              allowClear
              options={areaOptions}
              placeholder="点击选择区域"
              size="large"
              value={useravator || undefined}
              onChange={(value) => setUseravator(String(value || ""))}
            />
          </div>

          <div className="react-area-actions">
            <Button block onClick={() => setShowAreaModal(false)}>
              取消
            </Button>
            <Button
              block
              loading={bindingLoading}
              type="primary"
              onClick={confirmArea}
            >
              确定
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

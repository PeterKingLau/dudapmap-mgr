import { Button, Form, Radio, message } from "antd";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { reviewRoleChange } from "../../../api/user";
import "../shared.css";

const headerIcon = new URL(
  "../../../assets/images/nav-coordinate.png",
  import.meta.url,
).href;

export function ForRolePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [radio, setRadio] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const backTimerRef = useRef<number | null>(null);
  const changeName = searchParams.get("changeName") || "";
  const tel = searchParams.get("tel") || "";
  const [oldJob = "", newJob = ""] = useMemo(
    () => changeName.split("-"),
    [changeName],
  );

  useEffect(
    () => () => {
      if (backTimerRef.current) {
        window.clearTimeout(backTimerRef.current);
      }
    },
    [],
  );

  function submitRoleChange() {
    setSubmitting(true);
    reviewRoleChange(
      {
        userphone: tel,
        userrole: changeName,
      },
      radio === "1",
    )
      .then(() => {
        message.success("提交成功");
        backTimerRef.current = window.setTimeout(() => navigate(-1), 600);
      })
      .catch(() => {
        message.error("提交失败，请稍后重试");
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="react-admin-page">
      <section className="react-admin-header">
        <div className="react-admin-header-main">
          <div>
            <h1>职位变更审核</h1>
            <p>核对施工人员职位变更申请，并提交审核结果。</p>
          </div>
        </div>
        <div className="react-admin-header-icon">
          <img src={headerIcon} alt="" />
        </div>
      </section>

      <section className="react-admin-section">
        <div className="react-admin-section-title">
          <h2>申请信息</h2>
        </div>
        <div className="react-role-info-grid">
          <div className="react-role-info">
            <span>原职位</span>
            <strong>{oldJob || "-"}</strong>
          </div>
          <div className="react-role-info">
            <span>电话号码</span>
            <strong>{tel || "-"}</strong>
          </div>
          <div className="react-role-info">
            <span>变更职位</span>
            <strong>{newJob || "-"}</strong>
          </div>
        </div>
      </section>

      <section className="react-admin-section">
        <div className="react-admin-section-title">
          <h2>审核结果</h2>
        </div>
        <Form layout="vertical">
          <Form.Item label="处理意见">
            <Radio.Group
              optionType="button"
              value={radio}
              onChange={(event) => setRadio(event.target.value)}
            >
              <Radio.Button value="1">同意</Radio.Button>
              <Radio.Button value="2">不同意</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </section>

      <div className="react-admin-actions">
        <Button onClick={() => navigate(-1)}>取消</Button>
        <Button loading={submitting} type="primary" onClick={submitRoleChange}>
          提交
        </Button>
      </div>
    </div>
  );
}

import { Button, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  function closeCurrentTag() {
    window.dispatchEvent(
      new CustomEvent("close-current-route-tag", {
        detail: {
          fullPath,
        },
      }),
    );
  }

  function goHome() {
    closeCurrentTag();
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="react-not-found-page">
      <section className="react-not-found-panel">
        <div className="react-not-found-illustration">
          <div className="react-not-found-fallback">
            <Icon icon="ri:road-map-line" />
            <span>404</span>
          </div>
        </div>

        <div className="react-not-found-content">
          <Tag color="blue" className="react-not-found-status">
            页面不存在
          </Tag>
          <h1>找不到这个页面</h1>
          <p>当前地址可能已经失效，或者这个页面不是可直接访问的功能入口。</p>

          <div className="react-not-found-path">
            <span>访问路径</span>
            <strong>{fullPath}</strong>
          </div>

          <div className="react-not-found-actions">
            <Button
              icon={<Icon icon="ri:dashboard-3-line" />}
              size="large"
              type="primary"
              onClick={goHome}
            >
              回到工作台
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Breadcrumb } from "antd";
import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import { getBreadcrumb } from "../menu";

export function AppBreadcrumb() {
  const location = useLocation();
  const breadcrumbItems = getBreadcrumb(location.pathname);

  return (
    <Breadcrumb
      className="react-breadcrumb"
      items={breadcrumbItems.map((item) => ({
        title: (
          <span className="react-breadcrumb-item">
            {item.icon ? (
              <Icon className="react-breadcrumb-icon" icon={item.icon} />
            ) : null}
            <span>{item.title}</span>
          </span>
        ),
      }))}
    />
  );
}

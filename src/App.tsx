import { ConfigProvider, Spin, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { Suspense, useEffect, useMemo, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ROUTE_PATHS } from "./router/paths";
import { appRoutes, LoginPage, NotFoundPage } from "./router/routes";

const THEME_STORAGE_KEY = "app-theme";

function AppFallback() {
  return (
    <div className="app-route-loading">
      <Spin />
    </div>
  );
}

function getInitialDarkMode() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  } catch {
    return false;
  }
}

export function App() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const reactTheme = useMemo(
    () => ({
      algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: "#13b996",
        colorLink: "#13b996",
        borderRadius: 8,
      },
    }),
    [isDarkMode],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <ConfigProvider locale={zhCN} theme={reactTheme}>
      <HashRouter>
        <Suspense fallback={<AppFallback />}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={ROUTE_PATHS.auth.login} replace />}
            />
            <Route path={ROUTE_PATHS.auth.login} element={<LoginPage />} />
            <Route
              element={
                <AppLayout
                  isDarkMode={isDarkMode}
                  toggleTheme={() => setIsDarkMode((value) => !value)}
                />
              }
            >
              {appRoutes.map(({ Component, path }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ConfigProvider>
  );
}

# 管理平台

基于 React、Vite、Ant Design 的管理端项目，包含登录、工作台、人员、设备、考勤、地图、任务、预约、照片记录和日志等模块。

## 技术栈

- React 19
- Vite 8
- React Router
- Zustand
- Ant Design
- Axios
- 百度地图 JavaScript API

## 环境要求

```bash
node >= 20.19.0
pnpm >= 9.0.0
```

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview:production
```

开发代理和接口地址通过环境文件配置：

```env
VITE_BASE_URL_HTTPS=/api/
VITE_IMAGE_BASE_URL=/api/image/
VITE_DEV_PROXY_TARGET=http://localhost:8080/
VITE_DEV_PORT=8081
```

## 目录结构

```text
src
├─ api          # 接口封装
├─ assets       # 静态资源
├─ components   # 通用组件
├─ hooks        # 通用 Hooks
├─ layouts      # 应用布局
├─ pages        # 页面模块
├─ router       # 路由与权限
├─ store        # Zustand 状态
├─ utils        # 工具函数
├─ App.tsx      # 应用入口
└─ main.tsx     # 挂载入口
```

## 开发约定

- 路由路径统一维护在 `src/router/paths.ts`。
- 权限配置统一维护在 `src/router/permissions.ts`。
- 接口请求统一通过 `src/api/request.ts` 和 `src/api/*.ts` 调用。
- 页面异步请求建议使用 `src/hooks/useSafeAsync.ts`，避免卸载后更新状态。
- 图片资源放在 `src/assets/images`，组件内使用模块化 import。
- 百度地图通过 `src/utils/baiduMapAdapter.ts` 动态加载，不依赖 npm 地图库。

## 构建部署

项目使用单入口 `index.html`。生产构建输出到 `dist`，静态资源输出到 `dist/static`，生产环境默认使用相对路径 `./`，可直接交给后端按静态资源发布。

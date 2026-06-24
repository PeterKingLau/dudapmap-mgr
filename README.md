# 督导管理端

基于 Vue 3、Vite、Vant 和百度地图的管理端项目，用于督导人员、设备、打卡、轨迹、入户、预约、任务、请假等业务管理。

## 技术栈

- Vue 3 + `<script setup>`
- Vite
- Vue Router
- Pinia
- Vant 4
- Axios
- vue-baidu-map-3x
- ExcelJS + FileSaver
- Sass
- PostCSS px-to-viewport

## 环境要求

```bash
node >= 20.19.0
pnpm >= 9.0.0
```

## 启动与构建

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 生产构建
pnpm build
```

开发服务默认读取 `.env.development`：

```env
VITE_BASE_URL_HTTPS=/api/
VITE_IMAGE_BASE_URL=/api/image/
VITE_DEV_PROXY_TARGET=http://192.168.100.26:8081/
VITE_DEV_PORT=8081
```

生产构建默认读取 `.env.production`。

## 目录结构

```text
src
├─ api              # 按业务模块拆分的接口方法
├─ assets/images    # 静态图片资源，使用语义化 kebab-case 命名
├─ comm             # 地图覆盖物等通用业务组件
├─ components       # 可复用 UI/业务组件
├─ router           # 路由与路径常量
├─ store            # Pinia 状态
├─ utils            # 通用工具函数
└─ views            # 页面级视图，按业务模块分类
```

`src/views` 当前按模块划分：

```text
admin          人员、角色、请假
appointment    预约
attendance     打卡、考勤统计、打卡配置
auth           登录
device         设备
home           首页
indoor         入户信息
map            地图、轨迹、骑手坐标
system         系统日志
task           任务
```

## 接口约定

所有 Axios 统一封装在 `src/api/request.js`：

- `http`：统一 axios 实例
- `request(method, path, config)`：通用请求入口
- `get(path, config)`：GET 请求
- `post(path, data, config)`：POST 请求
- `put(path, data, config)`：PUT 请求
- `patch(path, data, config)`：PATCH 请求
- `deleteRequest(path, config)`：DELETE 请求
- `getImageUrl(path)`：图片地址拼接
- `getCurrentDisname()`：当前登录用户区域

业务接口按模块放在 `src/api/*.js`，页面中不要直接拼接后端地址。例如：

```js
import { get, post } from "./request";

const USER_API = {
  findAll: "hxduser/findAllByDisname",
  update: "hxduser/updateUser",
};

export function fetchAllUsers() {
  return get(USER_API.findAll);
}

export function updateUser(params) {
  return post(USER_API.update, params);
}
```

页面只调用业务方法，不直接写具体请求路径。

请求配置支持以下增强选项：

```js
get("hxduser/findAllByDisname", {
  loading: true,
  loadingText: "正在加载...",
  unwrap: true,
  dedupe: true,
  duplicateKey: "user-list",
  checkBusinessCode: true,
  showError: true,
});
```

- `unwrap`：为 `true` 时返回 `response.data`，默认保持 Axios response。
- `loading`：为 `true` 时显示统一加载提示。
- `dedupe`：重复请求取消。非 GET 请求默认开启，GET 默认关闭。
- `duplicateKey`：自定义重复请求识别 key。
- `checkBusinessCode`：校验响应体中的 `code/errCode`，默认开启。
- `showError`：是否显示统一错误提示，默认开启。
- HTTP `401` 或业务 `401/LOGIN_EXPIRED/TOKEN_EXPIRED` 会统一清理登录态并跳转登录页。

## 路由约定

路由路径集中放在 `src/router/paths.js`，路由表在 `src/router/index.js`。

页面跳转优先使用 `ROUTE_PATHS`，避免在组件中散落字符串路径。

## 静态资源约定

图片统一放在 `src/assets/images`，使用语义化 kebab-case 命名，例如：

```text
brand-logo.png
login-bg.jpg
nav-clock-config.png
icon-delete.png
marker-rider.png
empty-data.png
```

旧代码中的 `require("../assets/images/xxx.png")` 由 Vite 兼容插件转换为 `$asset("xxx.png")`。

## 工具函数

通用工具按职责拆分：

- `src/utils/date.js`：日期格式化
- `src/utils/validators.js`：表单校验
- `src/utils/dialog.js`：统一弹窗确认样式

## Excel 导出

项目使用 `src/components/DownloadExcelCompat.vue` 封装 `download-excel` 兼容组件，内部基于 ExcelJS 和 FileSaver 生成并下载 Excel 文件。

## 构建说明

生产构建使用 Terser 压缩与混淆，配置位于 `vite.config.ts`：

- 删除注释
- 移除 `debugger`
- 顶层变量混淆
- 输出目录为 `dist`
- 静态资源目录为 `dist/static`

构建后如果出现 chunk 体积提示，通常来自 Vant、百度地图或 ExcelJS 等第三方依赖，可根据业务需要继续做按需拆包。

当前项目已经对部分重依赖做了延迟加载：

- Vant 组件和样式按需注册，入口在 `src/plugins/vant.js`。
- 百度地图只在带有 `meta.requiresBaiduMap` 的路由进入前动态安装，入口在 `src/plugins/baiduMap.js`。
- ExcelJS 和 FileSaver 只在执行 Excel 导出时动态加载。

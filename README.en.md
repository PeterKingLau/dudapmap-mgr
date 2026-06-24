# Huaxinda Supervisor Management Client

A Vue 3, Vite, Vant, and Baidu Map based H5 management client for supervisor-related workflows, including staff management, devices, attendance, trajectories, indoor visits, appointments, tasks, and leave requests.

## Tech Stack

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

## Requirements

```bash
node >= 20.19.0
pnpm >= 9.0.0
```

## Development And Build

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Build for production
pnpm build
```

The development server reads `.env.development` by default:

```env
VITE_BASE_URL_HTTPS=/api/
VITE_IMAGE_BASE_URL=/api/image/
VITE_DEV_PROXY_TARGET=http://192.168.100.26:8081/
VITE_DEV_PORT=8081
```

Production builds read `.env.production`.

## Project Structure

```text
src
|-- api              # API methods grouped by business module
|-- assets/images    # Static image assets using semantic kebab-case names
|-- comm             # Shared business components such as map overlays
|-- components       # Reusable UI and business components
|-- router           # Router definitions and route path constants
|-- store            # Pinia store
|-- utils            # Shared utility functions
`-- views            # Page-level views grouped by business module
```

Current `src/views` modules:

```text
admin          Staff, roles, leave management
appointment    Appointments
attendance     Attendance, statistics, attendance configuration
auth           Login
device         Devices
home           Home page
indoor         Indoor visit records
map            Map, trajectories, rider locations
system         System logs
task           Tasks
```

## API Convention

All Axios usage is centralized in `src/api/request.js`:

- `http`: the shared Axios instance
- `request(method, path, config)`: generic request helper
- `get(path, config)`: GET request helper
- `post(path, data, config)`: POST request helper
- `put(path, data, config)`: PUT request helper
- `patch(path, data, config)`: PATCH request helper
- `deleteRequest(path, config)`: DELETE request helper
- `getImageUrl(path)`: image URL helper
- `getCurrentDisname()`: current user's district/area value

Business APIs should be grouped by module under `src/api/*.js`. Views should not directly concatenate backend URLs. Example:

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

Views should call business API methods instead of hard-coding request paths.

Request config supports the following enhanced options:

```js
get("hxduser/findAllByDisname", {
  loading: true,
  loadingText: "Loading...",
  unwrap: true,
  dedupe: true,
  duplicateKey: "user-list",
  checkBusinessCode: true,
  showError: true,
});
```

- `unwrap`: when `true`, returns `response.data`; otherwise keeps the Axios response.
- `loading`: when `true`, shows the shared loading toast.
- `dedupe`: cancels duplicated requests. Enabled by default for non-GET requests and disabled by default for GET requests.
- `duplicateKey`: custom key for duplicated request detection.
- `checkBusinessCode`: validates `code/errCode` in the response body. Enabled by default.
- `showError`: controls shared error messages. Enabled by default.
- HTTP `401` or business `401/LOGIN_EXPIRED/TOKEN_EXPIRED` clears login state and redirects to the login page.

## Routing Convention

Route paths are centralized in `src/router/paths.js`; route definitions live in `src/router/index.js`.

When navigating from views or components, prefer `ROUTE_PATHS` over scattered string literals.

## Static Asset Convention

Images are stored in `src/assets/images` and use semantic kebab-case names, for example:

```text
brand-logo.png
login-bg.jpg
nav-clock-config.png
icon-delete.png
marker-rider.png
empty-data.png
```

Legacy `require("../assets/images/xxx.png")` calls are handled by the Vite compatibility plugin and converted to `$asset("xxx.png")`.

## Utilities

Shared utilities are split by responsibility:

- `src/utils/date.js`: date formatting
- `src/utils/validators.js`: form validators
- `src/utils/dialog.js`: shared confirmation dialog styling

## Excel Export

`src/components/DownloadExcelCompat.vue` provides the `download-excel` compatible component. It uses ExcelJS and FileSaver internally to generate and download Excel files.

## Build Notes

Production builds use Terser for compression and code obfuscation. The relevant configuration is in `vite.config.ts`:

- Remove comments
- Drop `debugger`
- Mangle top-level variables
- Output directory: `dist`
- Static asset directory: `dist/static`

If Vite reports large chunks after build, they usually come from third-party dependencies such as Vant, Baidu Map, or ExcelJS. Further code splitting can be added based on business needs.

The project already lazy-loads several heavy dependencies:

- Vant components and styles are registered on demand in `src/plugins/vant.js`.
- Baidu Map is dynamically installed only before entering routes with `meta.requiresBaiduMap`; see `src/plugins/baiduMap.js`.
- ExcelJS and FileSaver are dynamically loaded only when Excel export is triggered.

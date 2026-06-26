# Management Platform

A React, Vite, and Ant Design based management client with modules for login, dashboard, staff, devices, attendance, maps, tasks, appointments, photo records, and logs.

## Tech Stack

- React 19
- Vite 8
- React Router
- Zustand
- Ant Design
- Axios
- Baidu Map JavaScript API

## Requirements

```bash
node >= 20.19.0
pnpm >= 9.0.0
```

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview:production
```

Development proxy and API paths are configured through environment files:

```env
VITE_BASE_URL_HTTPS=/api/
VITE_IMAGE_BASE_URL=/api/image/
VITE_DEV_PROXY_TARGET=http://localhost:8080/
VITE_DEV_PORT=8081
```

## Project Structure

```text
src
├─ api          # API helpers
├─ assets       # Static assets
├─ components   # Shared components
├─ hooks        # Shared hooks
├─ layouts      # App layout
├─ pages        # Page modules
├─ router       # Routes and permissions
├─ store        # Zustand state
├─ utils        # Utilities
├─ App.tsx      # App entry
└─ main.tsx     # Mount entry
```

## Conventions

- Route paths are maintained in `src/router/paths.ts`.
- Permission metadata is maintained in `src/router/permissions.ts`.
- API calls go through `src/api/request.ts` and `src/api/*.ts`.
- Page async requests should prefer `src/hooks/useSafeAsync.ts`.
- Image assets live in `src/assets/images` and should be imported as modules.
- Baidu Map is loaded dynamically through `src/utils/baiduMapAdapter.ts`.

## Build And Deployment

The app uses a single `index.html` entry. Production builds are emitted to `dist`, static assets to `dist/static`, and the production base path defaults to `./`, so the generated package can be served as static files by the backend.

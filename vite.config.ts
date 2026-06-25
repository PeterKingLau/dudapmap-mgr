import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defineConfig,
  loadEnv,
  type ProxyOptions,
  type UserConfig,
} from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DEV_PORT = 8080;
const OUTPUT_DIR = "dist";
const STATIC_ASSETS_DIR = "static";
const PRODUCTION_BASE = "./";

type AppEnv = Record<string, string>;

function normalizeBoolean(
  value: string | undefined,
  fallback = false,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function createProxy(
  env: AppEnv,
): Record<string, string | ProxyOptions> | undefined {
  const target = env.VITE_DEV_PROXY_TARGET;

  if (!target) {
    return undefined;
  }

  return {
    "/api": {
      target,
      rewrite: (requestPath: string) => requestPath.replace(/^\/api/, ""),
      changeOrigin: true,
      headers: {
        Referer: target,
      },
    },
  };
}

function createManualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  const normalizedId = id.split(path.sep).join("/");
  const normalizedPnpmId = normalizedId.replace(/\//g, "+");
  const hasPackage = (packageName: string) => {
    if (packageName.endsWith("-")) {
      return (
        normalizedId.includes(`/node_modules/${packageName}`) ||
        normalizedPnpmId.includes(`+node_modules+.pnpm+${packageName}`)
      );
    }

    return (
      normalizedId.includes(`/node_modules/${packageName}/`) ||
      normalizedPnpmId.includes(
        `+node_modules+.pnpm+${packageName.replace("/", "+")}@`,
      )
    );
  };
  const chunks = [
    {
      name: "react-vendor",
      packages: ["react", "react-dom", "react-router-dom", "zustand"],
    },
    {
      name: "antd-vendor",
      packages: ["antd", "@ant-design", "rc-", "@rc-component"],
    },
    {
      name: "icon-vendor",
      packages: ["@iconify"],
    },
    {
      name: "excel-vendor",
      packages: ["write-excel-file"],
    },
    {
      name: "utils-vendor",
      packages: ["axios", "dayjs"],
    },
  ];

  return chunks.find((chunk) =>
    chunk.packages.some((packageName) => hasPackage(packageName)),
  )?.name;
}

export default defineConfig(({ mode }): UserConfig => {
  const isProduction = mode === "production";
  const env = loadEnv(mode, __dirname, "");

  return {
    base: env.VITE_PUBLIC_BASE || (isProduction ? PRODUCTION_BASE : "/"),
    plugins: [react()],
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || "localhost",
      port: Number(process.env.PORT || env.VITE_DEV_PORT || DEFAULT_DEV_PORT),
      open: normalizeBoolean(env.VITE_DEV_OPEN),
      proxy: createProxy(env),
    },
    optimizeDeps: {
      include: [
        "@iconify/react",
        "antd",
        "axios",
        "dayjs",
        "react",
        "react-dom",
        "react-router-dom",
        "zustand",
      ],
    },
    build: {
      outDir: OUTPUT_DIR,
      assetsDir: STATIC_ASSETS_DIR,
      target: "es2018" as const,
      cssCodeSplit: true,
      minify: "terser" as const,
      sourcemap: normalizeBoolean(env.VITE_BUILD_SOURCEMAP, false),
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          manualChunks: createManualChunks,
        },
      },
      terserOptions: {
        mangle: {
          toplevel: true,
          safari10: true,
        },
        compress: {
          drop_debugger: true,
          passes: 2,
        },
        format: {
          comments: false,
        },
        keep_classnames: false,
        keep_fnames: false,
      },
    },
    css: {
      postcss: "./postcss.config.mjs",
    },
  };
});

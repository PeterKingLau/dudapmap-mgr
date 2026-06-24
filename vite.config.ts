import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defineConfig,
  loadEnv,
  type Plugin,
  type ProxyOptions,
  type UserConfig,
} from "vite";
import vue from "@vitejs/plugin-vue";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const chunks = [
    {
      name: "vue-vendor",
      packages: ["/vue/", "/vue-router/", "/pinia/"],
    },
    {
      name: "arco-vendor",
      packages: ["/@arco-design/"],
    },
    {
      name: "map-vendor",
      packages: ["/vue-baidu-map-3x/"],
    },
    {
      name: "icon-vendor",
      packages: ["/@iconify/"],
    },
    {
      name: "excel-vendor",
      packages: ["/write-excel-file/"],
    },
    {
      name: "utils-vendor",
      packages: ["/axios/", "/dayjs/"],
    },
  ];

  return chunks.find((chunk) =>
    chunk.packages.some((packageName) =>
      normalizedId.includes(`/node_modules${packageName}`),
    ),
  )?.name;
}

function requireAssetCompatPlugin(): Plugin {
  const assetRequireRE =
    /require\((['"])(\.{1,2}\/[^'"]+\.(?:png|jpe?g|gif|svg|webp))\1\)/g;

  return {
    name: "require-asset-compat",
    enforce: "pre",
    transform(code: string, id: string) {
      if (!/\.(vue|js)$/.test(id) || !assetRequireRE.test(code)) {
        return null;
      }

      assetRequireRE.lastIndex = 0;
      return {
        code: code.replace(assetRequireRE, (_match, _quote, assetPath) => {
          return `$asset('${path.basename(assetPath)}')`;
        }),
        map: null,
      };
    },
  };
}

export default defineConfig(({ mode }): UserConfig => {
  const isProduction = mode === "production";
  const env = loadEnv(mode, __dirname, "");
  const plugins = [
    normalizeBoolean(env.VITE_ENABLE_REQUIRE_ASSET_COMPAT)
      ? requireAssetCompatPlugin()
      : null,
    vue(),
  ].filter((plugin): plugin is Plugin => Boolean(plugin));

  return {
    base: env.VITE_PUBLIC_BASE || (isProduction ? "./" : "/"),
    plugins,
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || "localhost",
      port: Number(process.env.PORT || env.VITE_DEV_PORT || 8080),
      open: normalizeBoolean(env.VITE_DEV_OPEN),
      proxy: createProxy(env),
    },
    build: {
      outDir: "dist",
      assetsDir: "static",
      target: "es2018" as const,
      cssCodeSplit: true,
      minify: "terser" as const,
      sourcemap: normalizeBoolean(env.VITE_BUILD_SOURCEMAP, false),
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
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

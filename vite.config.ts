import { defineConfig, lazyPlugins } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";
import contentCollections from "@content-collections/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
  staged: { "*": "vp check --fix" },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "react/rules-of-hooks": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
      "no-restricted-imports": [
        "warn",
        // no content-collections imports (allowlist: cms/ only)
        {
          paths: [
            {
              name: "content-collections",
              message: "NEVER IMPORT FROM `content-collections`!!! EVER! (see CONTRIBUTING.md).",
            },
          ],
        },
      ],
    },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    devtools(),
    // its watcher keeps the process alive after a test run, and tests read no collections
    contentCollections({ isEnabled: (config) => config.mode !== "test" }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        // we don't need to prerender /go routes: only clients that run JavaScript need them, not search engines/LLMs
        // also don't preload the secret
        // /a/sender is a local-officer-only tool (404s outside `vp dev`, see its route file) and never ships
        filter: ({ path: routePath }) =>
          !routePath.includes("?") &&
          !routePath.startsWith("/go") &&
          !routePath.startsWith("/developer") &&
          !routePath.startsWith("/thecakeisalie") &&
          !routePath.startsWith("/a/sender"),
      },
      server: {
        build: { staticNodeEnv: true },
      },
    }),
    viteReact({ compiler: true }),
  ]),
  server: {
    allowedHosts: ["ethens-macbook-air.taild52664.ts.net"],
  },
  envPrefix: ["VITE_", "PUBLIC_"],
});

export default config;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { fileURLToPath } from "node:url";
export default defineConfig({
  base: "./",
  plugins: [{ enforce: "pre", ...mdx() }, react()],
  resolve: {
    alias: [
      { find: /^paper-ink\/icons$/, replacement: fileURLToPath(new URL("../../packages/paper-ink/src/icons/index.ts", import.meta.url)) },
      {
        find: /^paper-ink$/,
        replacement: fileURLToPath(
          new URL("../../packages/paper-ink/src/index.ts", import.meta.url),
        ),
      },
    ],
  },
  server: {
    port: 10121,
  },
});

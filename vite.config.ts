import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// `base: "./"` keeps asset URLs relative, so the same build works at the root
// of a domain and under a repo sub-path (github.io/puzzles/). Routing is hash
// based, so no server config is needed either way.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { target: "es2022", sourcemap: true },
});

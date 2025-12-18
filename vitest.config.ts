import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"], // spec をやめるのが簡単
    exclude: ["tests/**", "playwright/**", "**/node_modules/**"],
  },
  plugins: [tsconfigPaths()],
});

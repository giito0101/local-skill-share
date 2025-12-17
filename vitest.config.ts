import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // まずは node でOK（React不要ならこれで一番ラク）
  },
});

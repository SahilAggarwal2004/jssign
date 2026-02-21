import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/types.ts"],
    format: ["cjs", "es"],
    outExtensions: () => ({ dts: ".ts" }),
  },
]);

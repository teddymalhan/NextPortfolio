import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next";

export default defineConfig([
  ...nextConfig,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".web-kits/**",
    ".vercel/**",
    ".clerk/**",
    ".agents/**",
    ".openidea/**",
    ".idea/**",
    ".vscode/**",
    "analysis_screens/**",
    "test-results/**",
    "playwright-report/**",
    "**/*.har",
    "malhan.ca-recording.json",
  ]),
]);

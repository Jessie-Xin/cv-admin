import path from "node:path";
import { fileURLToPath } from "node:url";
import { codeInspectorPlugin } from "code-inspector-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@workspace/ui"],
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: "turbopack",
    }),
  },
};

export default nextConfig;

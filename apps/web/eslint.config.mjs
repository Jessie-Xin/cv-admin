import { nextJsConfig } from "@workspace/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  { ignores: ["src/generated/prisma/**"] },
  ...nextJsConfig,
  {
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];

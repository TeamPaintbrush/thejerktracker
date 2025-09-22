import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/pages/api/**", // Temporarily ignore API routes
      "src/lib/migration.ts", // Temporarily ignore migration utility
      "src/lib/config.ts", // Temporarily ignore config utility
      "src/types/api.ts", // Temporarily ignore API types
      "src/types/next-auth.d.ts", // Temporarily ignore NextAuth types
    ],
  },
];

export default eslintConfig;

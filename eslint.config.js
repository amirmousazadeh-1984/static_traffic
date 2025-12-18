import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**', 
      '**/dist/**',        
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      'no-unused-vars': 'warn', 
      '@typescript-eslint/no-unused-vars': 'warn', 
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser, 
        module: 'readonly', 
        describe: "readonly", 
        test: "readonly",     
        expect: "readonly",   
      },
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
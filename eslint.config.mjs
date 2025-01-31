import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ),
  {
    // Use the recursive pattern to ignore `dist` anywhere in the backend directory
    ignores: ['backend/dist/**', 'backend/src/migrations/**'],
  },
  // Backend configuration
  {
    files: ['backend/**/*.{js,ts}'], // Scope to backend files
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Backend-specific rules (Node.js environment)
    },
  },

  // Frontend configuration
  {
    files: ['frontend/**/*.{js,jsx,ts,tsx}'], // Scope to frontend files
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Frontend-specific rules (React/Browser environment)
    },
  },
];

import prettier from 'eslint-plugin-prettier';
import custom from 'eslint-plugin-custom';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: [
      '**/glyphs/',
      '**/node_modules/',
      'src/highlight.js/',
      'assets/DefinedCharacterList.js'
    ]
  },
  ...compat.extends('eslint:recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      prettier,
      custom
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        hljs: 'readonly'
      }
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none'
        }
      ],

      'comma-dangle': ['error', 'never'],
      'custom/no-onevent': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed']
    }
  }
];

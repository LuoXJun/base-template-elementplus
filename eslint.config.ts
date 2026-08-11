import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}']
    },
    {
        name: 'app/files-to-ignore',
        ignores: [
            '**/dist/**',
            '**/dist-ssr/**',
            '**/coverage/**',
            '**/node_modules/**',
            '**/public/**',
            'src/types/**',
            'docs',
            'scripts'
        ]
    },
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,
    {
        name: 'app/rules',
        rules: {
            'vue/multi-word-component-names': 0,
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-var': 'error',
            'vue/attribute-hyphenation': 'off',
            'vue/require-prop-types': 'off',
            curly: ['error', 'multi-line'],
            'max-lines-per-function': [
                'error',
                { max: 100, skipBlankLines: true, skipComments: true }
            ],
            // 'arrow-body-style': ['error', 'always'],
            'default-param-last': ['error'],
            'new-cap': 'off',
            'max-depth': ['error', 3],
            'max-lines': ['error', 400],
            'no-else-return': 'error',
            'no-empty-function': 'error',
            'no-inline-comments': 'error',
            'no-lone-blocks': 'error',
            'no-multi-assign': 'error',
            'no-nested-ternary': 'error',
            'no-shadow': 'error',
            'no-shadow-restricted-names': 'error',
            'no-unneeded-ternary': 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'prefer-const': 'error',
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off'
        }
    },
    {
        name: 'app/allow-unused-in-dts',
        files: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },
    skipFormatting
);

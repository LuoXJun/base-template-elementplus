import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    {
        ignores: ['dist*', 'node_modules/*'] // 忽略文件
    },

    eslint.configs.recommended, // js 推荐配置
    ...tseslint.configs.recommended, // ts 推荐配置
    ...eslintPluginVue.configs['flat/recommended'], // vue 推荐配置

    {
        languageOptions: {
            globals: {
                ...globals.browser // 浏览器全局变量
            }
        }
    },

    // 自定义规则
    {
        files: ['**/*.{js,mjs,cjs,ts,vue}'], // 设置下列配置生效的文件范围
        rules: {
            // js 规则
            eqeqeq: ['error', 'always'], // 必须使用 === 和 !==
            'no-var': 'error', // 不允许使用 var 声明变量

            // ts 规则
            '@typescript-eslint/no-unused-vars': 'warn', // 未使用变量
            '@typescript-eslint/no-explicit-any': 'on', //   any 类型检测
            '@typescript-eslint/no-unsafe-function-type': 'off', // 使用 unsafe 函数类型
            // vue 规则
            'vue/multi-word-component-names': 'off', // 组件的驼峰命名
            // 关闭非空断言检测
            '@typescript-eslint/no-non-null-assertion': 'off',
            // 允许使用ts行注释
            '@typescript-eslint/ban-ts-comment': 'off'
        }
    },

    // vue 规则
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser, // typescript项目需要用到这个
                ecmaVersion: 'latest'
            }
        }
    },

    // 当 eslint 和 prettier 冲突时，以 prettier 的配置为准 (重要)
    eslintConfigPrettier
];

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    ignores: ['dist'],
}, {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts}'],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.node,
        parserOptions: {
            project: ['./tsconfig.json'],
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                'varsIgnorePattern': '^_',
                'argsIgnorePattern': '^_',
            },
        ],
        'one-var-declaration-per-line': 'error',
        'prefer-const': 'warn',
        'quotes': ['warn', 'single', { 'avoidEscape': true }],
    },
});

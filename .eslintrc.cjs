module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  // Use vue-eslint-parser to correctly parse Vue SFCs
  parser: 'vue-eslint-parser',
  parserOptions: {
    // parser used for the contents of <script> blocks
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'vue/multi-word-component-names': 'off'
  },
  globals: {
    // Nuxt auto-imported globals
    useHead: 'readonly',
    useRoute: 'readonly',
    useRouter: 'readonly',
    navigateTo: 'readonly',
    $fetch: 'readonly',
    definePageMeta: 'readonly',
    useI18n: 'readonly',
    useSwitchLocalePath: 'readonly',
    useTheme: 'readonly',
    useState: 'readonly',
    useRuntimeConfig: 'readonly',
    // Vue auto-imports
    ref: 'readonly',
    computed: 'readonly',
    onMounted: 'readonly',
    onBeforeUnmount: 'readonly',
    // NodeJS types used in some files
    NodeJS: 'readonly'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // Allow script setup single-word components if used
      }
    }
  ]
}

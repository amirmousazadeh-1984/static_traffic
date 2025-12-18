module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'plugin:react/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off', 
    'jsx-a11y/anchor-is-valid': 'warn', 
    'no-unused-vars': 'warn', 
    '@typescript-eslint/no-unused-vars': 'warn', 
  },
  globals: {
    module: 'readonly',  
    describe: 'readonly', 
    test: 'readonly',     
    expect: 'readonly',   
  },
};

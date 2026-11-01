module.exports = {
  root: true,
  // Añadimos 'plugin:prettier/recommended' al final para integrar Prettier de forma segura
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  // Declaramos explícitamente el plugin de Prettier
  plugins: ['prettier'],

  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param

    // 1. Muestra los fallos de estilo de Prettier como advertencias de ESLint
    'prettier/prettier': [
      'warn',
      {
        // Forzamos a Prettier a tolerar las líneas largas en asignaciones complejas
        printWidth: 120,
      },
    ],

    // 2. LA CLAVE: Forzamos la regla de Airbnb/EDS para que el salto sea ANTES del operador (&&)
    // Esto anula la preferencia por defecto de Prettier en este caso específico
    'operator-linebreak': ['error', 'before'],
  },
};

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    'tailwindcss', // Use string name for ES Modules
    'autoprefixer',
  ],
};

export default config;

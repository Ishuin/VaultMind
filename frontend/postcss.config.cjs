/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    // autoprefixer was in our previous thoughtweb-navigator/postcss.config.cjs
    // and is generally good practice, so I'll keep it.
    // temp_code/postcss.config.mjs only had tailwindcss.
    autoprefixer: {}, 
  },
};

module.exports = config;

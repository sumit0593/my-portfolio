import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',//all dark mode classes will be applied
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        garnet: {
          50: '#fdf2f3',
          100: '#fce7e8',
          200: '#f9d2d5',
          300: '#f4adb2',
          400: '#ec7c85',
          500: '#df4e5a',
          600: '#cb313e',
          700: '#aa2430',
          800: '#8f001a', // Official uOttawa Garnet
          900: '#771b23',
          950: '#430a0f',
        },
        discord: {
          bg: '#313338',
          card: '#2b2d31',
          hover: '#35373c',
          text: '#dbdee1',
          muted: '#949ba4',
          header: '#f2f3f5',
          tag: '#5865f2',
        },
      },
    },
  },
  plugins: [],
};

export default config;

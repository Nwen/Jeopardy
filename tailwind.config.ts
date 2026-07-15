import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'jeopardy-blue': '#0f0523',
        'jeopardy-gold': '#c084fc',
      },
    },
  },
};

export default config;

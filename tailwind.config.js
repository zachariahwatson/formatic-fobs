/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'copula': ['Copula', 'sans-serif'],
        'n27-bold': ['n27-bold-webfont', 'sans-serif'],
        'n27-bolditalic': ['n27-bolditalic-webfont', 'sans-serif'],
        'n27-extralight': ['n27-extralight-webfont', 'sans-serif'],
        'n27-extralightitalic': ['n27-extralightitalic-webfont', 'sans-serif'],
        'n27-light': ['n27-light-webfont', 'sans-serif'],
        'n27-lightitalic': ['n27-lightitalic-webfont', 'sans-serif'],
        'n27-medium': ['n27-medium-webfont', 'sans-serif'],
        'n27-mediumitalic': ['n27-mediumitalic-webfont', 'sans-serif'],
        'n27-regular': ['n27-regular-webfont', 'sans-serif'],
        'n27-regularitalic': ['n27-regularitalic-webfont', 'sans-serif'],
        'n27-thin': ['n27-thin-webfont', 'sans-serif'],
        'n27-thinitalic': ['n27-thinitalic-webfont', 'sans-serif'],
        'waffold': ['Waffold', 'sans-serif']
      }
    },
  },
  plugins: [],
}

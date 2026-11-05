/**
 * Tailwind CSS v4 – JavaScript theme config.
 * Loaded from assets/css/style.css with `@config "../../tailwind.config.js";`
 * (v4 does not read this file automatically).
 *
 * Root font size is 62.5% (1rem = 10px). Rem-based tokens such as spacing,
 * font sizes and container widths are re-based in the `@theme` block of
 * assets/css/style.css so that Tailwind utilities keep their original pixel
 * size (e.g. p-4 = 16px = 1.6rem, text-lg = 18px = 1.8rem).
 *
 * Content scanning is declared with `@source` in style.css.
 */
module.exports = {
  theme: {
    screens: {
      xs: '390px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        // Values live in assets/css/style.css (:root) so the brand palette changes in one place.
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        brand: 'rgb(var(--c-brand) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        display: ['Figtree', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        page: '128rem', // 1280px
      },
    },
  },
  plugins: [],
};

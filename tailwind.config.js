module.exports = {
  // mode: 'jit',
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins'],
      },
      screens: {
        'print': {'raw': 'print'},
      },
      textColor: {
        light: {
          base: 'var(--color-text-base)',
          muted: 'var(--color-text-muted)',
          link: 'var(--color-text-link)',
          'link-hover': 'var(--color-text-link-hover)',
          'highlight-fg': 'var(--color-text-highlight-fg)',
        },
        dark: {
          base: 'var(--color-text-base-inverted)',
          muted: 'var(--color-text-muted-inverted)',
          link: 'var(--color-text-link-inverted)',
          'link-hover': 'var(--color-text-link-hover-inverted)',
          'highlight-fg': 'var(--color-text-highlight-fg-inverted)',
        }
      },
      backgroundColor: {
        light: {
          fill: 'var(--color-fill)',
          'highlight-bg': 'var(--color-text-highlight-bg)',
        },
        dark: {
          fill: 'var(--color-fill-inverted)',
          'highlight-bg': 'var(--color-text-highlight-bg-inverted)',
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  purge: {
    content: [
      "./src/**/*.svelte",
    ],
    enabled: 'production' // disable purge in dev
  },
}

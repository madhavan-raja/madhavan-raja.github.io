module.exports = {
  // mode: 'jit',
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'print': {'raw': 'print'},
      },
      textColor: {
        light: {
          base: 'var(--color-text-base)',
          muted: 'var(--color-text-muted)',
          link: 'var(--color-text-link)',
          'link-hover': 'var(--color-text-link-hover)',
        },
        dark: {
          base: 'var(--color-text-base-inverted)',
          muted: 'var(--color-text-muted-inverted)',
          link: 'var(--color-text-link-inverted)',
          'link-hover': 'var(--color-text-link-hover-inverted)',
        }
      },
      backgroundColor: {
        light: {
          fill: 'var(--color-fill)',
        },
        dark: {
          fill: 'var(--color-fill-inverted)',
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

module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        github: '#181717',
        linkedin: '#0077b5',
        twitter: '#1da1f2',
        polywork: '#66ba8c',
        brandBlue: {
          50: '#E5F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B8FF',
          400: '#33A0FF',
          500: '#0088FF',
          600: '#006DCC',
          700: '#005299',
          800: '#003666',
          900: '#001B33',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            a: {
              color: theme('colors.brandBlue.600'),
              '&:hover': {
                color: theme('colors.brandBlue.600'),
                textDecoration: 'underline',
              },
            },
            h1: {
              color: theme('colors.gray.600'),
              fontWeight: '700',
            },
            'h2 a': {
              color: theme('colors.gray.900'),
              textDecoration: 'none',
            },
            '.tag a': {
              textDecoration: 'none',
            },
            pre: {
              backgroundColor: '#011627',
              padding: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            },
            code: {
              backgroundColor: 'rgb(229 243 255 / 30%)',
              color: theme('colors.brandBlue.700'),
            },
            blockquote: {
              fontStyle: 'normal',
            },
            hr: {
              marginBottom: '20px',
              marginTop: '20px',
            },
            'hr ~ ul': {
              listStyle: 'none',
              fontSize: '14px',
              paddingLeft: 0,
            },
            'hr ~ ul li': {
              paddingLeft: 0,
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}


import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { yellow: '#facc15' } },
      fontFamily: { display: ['Anton','Impact','system-ui','sans-serif'] }
    }
  },
  plugins: []
}
export default config

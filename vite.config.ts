import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// GitHub Pages serves the repo at /kalka/
export default defineConfig({
  base: '/kalka/',
  plugins: [preact()],
})

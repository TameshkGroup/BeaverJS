import { defineConfig } from 'vite'
import phenomenJSX from './vite-phenomen-jsx'

export default defineConfig({
    plugins: [phenomenJSX()],
})

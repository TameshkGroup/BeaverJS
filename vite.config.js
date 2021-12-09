import { defineConfig } from 'vite'
import phenomenJSX from './vite-phenomen-jsx'
import typescript from 'vite-plugin-ts'

export default defineConfig({
    build: {
        /* rollupOptions: {
            plugins: [jsx( {factory: 'Mohamad.createElement'} )]
        } */
    },
    plugins: [typescript(), phenomenJSX()],
})

import { defineConfig } from 'vite'
import phenomenJSX from './vite-phenomen-jsx'

export default defineConfig({
    build: {
        /* rollupOptions: {
            plugins: [jsx( {factory: 'Mohamad.createElement'} )]
        } */
    },
    plugins: [phenomenJSX()],
})

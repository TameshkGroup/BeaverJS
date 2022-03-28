import { defineConfig } from 'vite'
import viteBeaverPlugin from './vite-beaver-plugin'
import path from 'path'

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'BeaverJS',
            fileName: (format) => `beaver.${format}.js`,
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['vue'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
    plugins: [
        viteBeaverPlugin(),
    ],
})

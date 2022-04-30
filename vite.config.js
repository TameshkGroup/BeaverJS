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
    },
    plugins: [viteBeaverPlugin()],
})

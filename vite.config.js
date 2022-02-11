import { defineConfig } from 'vite'
import viteBeaverPlugin from './vite-beaver-plugin'

export default defineConfig({
    plugins: [viteBeaverPlugin()],
})

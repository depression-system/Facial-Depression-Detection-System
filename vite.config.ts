import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src/")
        }
    },
    server: {
        host: '0.0.0.0',
        port: 6888,
    },
    build: {
        outDir: "dist",
        minify: "esbuild",
        // esbuild 打包更快，但是不能去除 console.log，terser打包慢，但能去除 console.log
        // minify: "terser",
        // terserOptions: {
        // 	compress: {
        // 		drop_console: viteEnv.VITE_DROP_CONSOLE,
        // 		drop_debugger: true
        // 	}
        // },
        sourcemap: false,
        // 禁用 gzip 压缩大小报告，可略微减少打包时间
        reportCompressedSize: false,
        // 规定触发警告的 chunk 大小
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                // Static resource classification and packaging
                chunkFileNames: "assets/js/[name]-[hash].js",
                entryFileNames: "assets/js/[name]-[hash].js",
                assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
            }
        }

    }
})

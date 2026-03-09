import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // GitHub Pages 部署配置
  base: '/k-traffic-map/',
  
  // iOS Safari 兼容性配置
 build: {
   target: 'es2015',
   cssTarget: 'chrome61',
   // 禁用 source map 以减小文件体积
   sourcemap: false,
   // 代码分割优化
   rollupOptions: {
     output: {
      manualChunks: {
         'vue-vendor': ['vue'],
         'map-vendor': ['@amap/amap-jsapi-loader']
       }
     }
   }
  },
  
  // 优化开发服务器
  server: {
   host: true,
   port: 5173
  }
})

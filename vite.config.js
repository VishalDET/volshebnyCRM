import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@api': path.resolve(__dirname, './src/api'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@context': path.resolve(__dirname, './src/context'),
            '@layouts': path.resolve(__dirname, './src/layouts'),
            '@redux': path.resolve(__dirname, './src/redux'),
            '@config': path.resolve(__dirname, './src/config'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@styles': path.resolve(__dirname, './src/styles'),
        }
    },
    server: {
        port: 3000,
        open: true,
        host: true,
        proxy: {
            '/api': {
                target: 'http://volcrmapi.digitaledgetech.in',
                changeOrigin: true,
                secure: false
            }
        }
    }
})

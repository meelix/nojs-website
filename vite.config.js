const { resolve } = require('path')
import htmlPurge from 'vite-plugin-html-purgecss'
import htmlImages from './vite-plugin-html-images/dist/index.js'
import { createHtmlPlugin } from 'vite-plugin-html'

export default {
    root: "src",
    plugins: [
        htmlPurge({
            content: ["src/**/*.html", "src/**/*.js"]
        }),
        htmlImages({
            tempDirname: '.tempimages',
            jpeg: {quality: 20, mozjpeg: true}
        }),
        createHtmlPlugin({
            minify: true,
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                thanks: resolve(__dirname, 'src/thanks.html'),
                not_found: resolve(__dirname, 'src/404.html'),
            }
        }
    },
}
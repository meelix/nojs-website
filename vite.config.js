import htmlPurge from 'vite-plugin-html-purgecss'
import htmlImages from './local-dep/vite-plugin-html-images/dist/index.js'
import { createHtmlPlugin } from 'vite-plugin-html'

export default {
    root: "src",
    plugins: [
        htmlPurge({
            content: ["*.html", "*.js"]
        }),
        htmlImages({
            tempDirname: '.tempimages',
            jpeg: {quality: 20, mozjpeg: true}
        }),
        createHtmlPlugin({
            minify: true,
        }),
    ],
    optimizeDeps: {
            include: ['local-dep']
      },
      build: {
        commonjsOptions: {
             include: [/local-dep/, /node_modules/]
        }
    }
}
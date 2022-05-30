import htmlPurge from 'vite-plugin-html-purgecss'
import htmlImages from './vite-plugin-html-images/dist/index.js'
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
}
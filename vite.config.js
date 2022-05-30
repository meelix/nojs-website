import htmlPurge from 'vite-plugin-html-purgecss'
import htmlImages from 'vite-plugin-html-images'

export default {
    root: "src",
    plugins: [
        htmlPurge({
            content: ["*.html"],
            // whitelist: ["my-very-special-class"],
        }),
        htmlImages({
            tempDirname: '.tempimages',
            jpeg: {quality: 20, mozjpeg: true}
        }),
    ]
}
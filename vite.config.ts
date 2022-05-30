import htmlPurge from 'vite-plugin-html-purgecss'

export default {
    plugins: [
        htmlPurge({
            content: ["*.html"],
            // whitelist: ["my-very-special-class"],
        }),
    ]
}
const baseURL = process.env.BASE_URL || "/api";

export default {
    ssr: false,
    head: {
        titleTemplate: "%s Quản lý học lại, bảo vệ lại",
        htmlAttrs: {
            lang: "vi",
        },
        meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { hid: "description", name: "description", content: "" },
            { name: "format-detection", content: "telephone=no" },
        ],
        link: [
            { rel: "icon", type: "image/x-icon", href: "/favicon.png" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap",
            },
        ],
    },

    css: [
        "@mdi/font/css/materialdesignicons.min.css",
        "@/assets/scss/main.scss",
        "@/assets/scss/colors.scss",
    ],

    styleResources: {
        scss: ["./assets/scss/*.scss"],
    },

    plugins: [
        { src: "@/plugins/common.js", mode: "client" },
        "@/plugins/api.js",
        "@/plugins/axios.js",
        "@/plugins/utils.js",
        "@/plugins/validate.js",
        "@/plugins/sort-strategy.js",
        { src: "~/plugins/persistedState.client.js" },
        { src: "@/plugins/v-currency-input.js", mode: "client" },
        { src: "~/plugins/mitt.js", mode: "client" },
    ],

    components: true,

    buildModules: [
        "@nuxtjs/eslint-module",
        "@nuxtjs/vuetify",
    ],
    loading: {
        color: "#a2212b",
    },

    modules: [
        "@nuxtjs/axios",
        "@nuxtjs/proxy", 
        "vue2-editor/nuxt",
    ],
    
    toast: {
        timeout: 2000,
    },

    // Cấu hình Axios và Proxy chuyển hướng sang backend thật
    axios: {
        baseURL,
        proxy: true, // Bật proxy của axios
    },

    proxy: {
        '/api/': {
            target: 'http://103.147.34.20:19800',
            changeOrigin: true,
            // pathRewrite: { '^/api/': '/api/' }
        }
    },

    vuetify: {
        customVariables: ["~/assets/variables.scss"],
        theme: {
            dark: false,
            themes: {
                light: {
                    primary: "#a2212b",
                    secondary: "#49BEFF",
                    info: "#539BFF",
                    success: "#13DEB9",
                    accent: "#FFAB91",
                    warning: "#FFAE1F",
                    error: "#F44336",
                    muted: "#5a6a85",
                },
            },
        },
    },

    build: {},
    env: {},
};
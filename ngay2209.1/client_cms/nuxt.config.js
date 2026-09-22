import colors from 'vuetify/es5/util/colors'

export default {
  ssr: false,

  // Cấu hình router chuyển hướng từ trang chủ "/" sang "/dang-nhap"
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '/',
        redirect: '/dang-nhap'
      })
    }
  },

  head: {
    titleTemplate: '%s - Bach Khoa CMS',
    title: 'Bach Khoa CMS – Quản lý học lại / bảo vệ lại / thi lại',
    htmlAttrs: {
      lang: 'vi'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Hệ thống Quản lý học lại, bảo vệ lại và thi lại Bách Khoa' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [],

  plugins: [
    '~/plugins/api.js',
    '~/plugins/axios.js'
  ],

  components: true,

  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
  ],

  modules: [
    '@nuxtjs/axios',
  ],

  axios: {
    baseURL: process.env.BASE_URL || 'http://103.147.34.20:19800',
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#a2212b',
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  build: {}
}
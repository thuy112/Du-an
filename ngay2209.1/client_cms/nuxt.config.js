import colors from 'vuetify/es5/util/colors'

export default {
  ssr: false,

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '/',
        redirect: '/dang-nhap',
      })
    },
  },

  head: {
    titleTemplate: '%s - Bach Khoa CMS',
    title: 'Quản lý học lại, bảo vệ lại',
    htmlAttrs: {
      lang: 'vi',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Hệ thống Quản lý học lại, bảo vệ lại và thi lại Bách Khoa',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: ['~/assets/scss/main.scss'],

  plugins: [
    { src: '~/plugins/common.js', mode: 'client' },
    '~/plugins/api.js',
    '~/plugins/axios.js',
    '~/plugins/utils.js',
    '~/plugins/validate.js',
    '~/plugins/sort-strategy.js',
    { src: '~/plugins/persistedState.client.js', mode: 'client' },
    { src: '~/plugins/v-currency-input.js', mode: 'client' },
    { src: '~/plugins/mitt.js', mode: 'client' },
    '~/plugins/nuxt-client-init.js',
  ],

  components: true,

  buildModules: ['@nuxtjs/eslint-module', '@nuxtjs/vuetify'],

  modules: ['@nuxtjs/axios', '@nuxtjs/style-resources'],

  styleResources: {
    scss: ['~/assets/scss/colors.scss', '~/assets/scss/variables.scss'],
  },

  // Đăng ký server middleware để proxy request API
  serverMiddleware: ['~/server/proxy.js'],

  // Cấu hình Axios trỏ về gốc '/' để gọi qua proxy của Nuxt server
  axios: {
    proxy: false,
    baseURL: '/',
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
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
          success: colors.green.accent3,
        },
      },
    },
  },
}

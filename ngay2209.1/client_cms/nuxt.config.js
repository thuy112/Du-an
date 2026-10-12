import colors from 'vuetify/es5/util/colors'

export default {
  // Chạy ở chế độ SPA, không SSR (Mục 1 & 9)
  ssr: false,

  // Cấu hình router chuyển hướng từ trang chủ "/" sang "/dang-nhap"
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
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // 1. Nạp SCSS global từ assets/scss/main.scss (Mục 9 & theo cây thư mục)
  css: [
    '~/assets/scss/main.scss'
  ],

  // 2. Danh sách 10 plugin theo thứ tự nạp quan trọng (Mục 5)
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
  // Tự động import component theo PascalCase (Mục 8)
  components: true,

  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
  ],

  // 3. Thêm @nuxtjs/style-resources và @nuxtjs/proxy (nếu cần)
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    '@nuxtjs/proxy', // Đã thêm module proxy
  ],

  // 4. Cấu hình styleResources nạp biến màu và biến SCSS chung
  styleResources: {
    scss: [
      '~/assets/scss/colors.scss',
      '~/assets/scss/variables.scss',
    ],
  },

  // Cấu hình Axios và Proxy để trỏ thẳng tới server backend từ xa mà không bị chặn CORS
  axios: {
    proxy: false,
    baseURL: '', 
  },

  proxy: {
    // 1. Các API chung bắt đầu bằng /api
    '/api/': {
      target: 'http://103.147.34.20:19800',
      changeOrigin: true,
    },
    // 2. Nếu có nhóm API xác thực/auth riêng ở port khác hoặc đường dẫn khác
    '/auth/': {
      target: 'http://103.147.34.20:19800', // Hoặc một domain/port khác tùy ý
      changeOrigin: true,
    },
    // 3. Nếu có nhóm API bên thứ 3 hoặc service khác
    '/service-b/': {
      target: 'https://api.servicekhac.com',
      changeOrigin: true,
      pathRewrite: { '^/service-b/': '' } // Xóa bỏ tiền tố /service-b khi gửi đi nếu server kia không cần
    }
  },

  vuetify: {
    // Override biến Sass mặc định của Vuetify ở gốc assets/ (Mục 9)
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#a2212b', // Màu đỏ Bách Khoa (Mục 9)
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

  build: {},
  serverMiddleware: [
    '~/server/proxy.js'
  ],
}
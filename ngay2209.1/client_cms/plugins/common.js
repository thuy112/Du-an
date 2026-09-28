// plugins/common.js
export default (context, inject) => {
  // Inject hàm hiển thị thông báo lỗi/cảnh báo toàn cục
  inject('showSuccess', (message = 'Thao tác thành công!') => {
    if (process.client && window.$nuxt) {
      // Gọi toast notification hoặc snackbar của Vuetify/App
      console.log('[SUCCESS]:', message)
    }
  })

  inject('showWarning', (message = 'Cảnh báo hệ thống!') => {
    if (process.client) {
      console.warn('[WARNING]:', message)
    }
  })

  inject('showError', (message = 'Có lỗi xảy ra, vui lòng thử lại!') => {
    if (process.client) {
      console.error('[ERROR]:', message)
    }
  })
}
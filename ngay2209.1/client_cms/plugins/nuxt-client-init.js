// plugins/nuxt-client-init.js
export default async (context) => {
  const { store } = context
  if (process.client && store.dispatch) {
    // Gọi action khởi tạo nếu có
    // await store.dispatch('nuxtClientInit', context)
  }
}
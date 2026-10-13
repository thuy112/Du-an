export default defineEventHandler(async (event) => {
  // Lấy ra phần path phía sau /api/ (Ví dụ: /api/student/list -> path là ['student', 'list'])
  const path = event.context.params.path || []
  const targetUrl = `http://103.147.34.20:19800/api/${path.join('/')}`
  
  // Lấy query params và method hiện tại (GET, POST, PUT, DELETE,...)
  const query = getQuery(event)
  const method = event.node.req.method
  
  let body = null
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await readBody(event)
    } catch (e) {
      // Bỏ qua nếu body trống
    }
  }

  try {
    // Chuyển tiếp request sang backend gốc (chạy server-to-server nên không bị chặn HTTPS trên Vercel)
    const response = await $fetch(targetUrl, {
      method,
      params: query,
      body: body,
    })
    return response
  } catch (error) {
    console.error(`Proxy Error for ${targetUrl}:`, error)
    return {
      success: false,
      message: error.message || 'Lỗi proxy kết nối backend',
      data: null
    }
  }
})
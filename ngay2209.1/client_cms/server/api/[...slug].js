export default defineEventHandler(async (event) => {
  const path = event.context.params.path || []
  const targetUrl = `http://103.147.34.20:19800/api/${path.join('/')}`
  
  const query = getQuery(event)
  const method = event.node.req.method
  
  let body = null
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      body = await readBody(event)
    } catch (e) {
      // Bỏ qua nếu request không có body
    }
  }

  try {
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
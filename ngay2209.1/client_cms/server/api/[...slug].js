export default defineEventHandler(async (event) => {
  const slug = event.context.params.slug
  const path = Array.isArray(slug) ? slug.join('/') : slug

  const query = getQuery(event)
  const method = getMethod(event)
  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(event) : undefined

  // Lấy header Authorization từ client truyền lên để xác thực
  const headers = getHeaders(event)
  const forwardHeaders = {
    'Content-Type': 'application/json',
  }
  if (headers.authorization) {
    forwardHeaders['Authorization'] = headers.authorization
  }

  try {
    const response = await $fetch(`http://103.147.34.20:19800/api/${path}`, {
      method,
      query,
      body,
      headers: forwardHeaders,
    })
    return response
  } catch (error) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Lỗi kết nối tới Backend gốc',
      data: error.data,
    })
  }
})
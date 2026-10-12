const axios = require('axios')

export default async function (req, res, next) {
  if (req.url.startsWith('/api/')) {
    try {
      const targetUrl = `http://103.147.34.20:19800${req.url}`
      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: { ...req.headers, host: '103.147.34.20:19800' }
      })
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(response.data))
    } catch (error) {
      res.statusCode = error.response?.status || 500
      res.end(JSON.stringify({ error: error.message }))
    }
  } else {
    next()
  }
}
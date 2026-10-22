// plugins/msw.client.js
export default async function () {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}
import Api from '~/api/Api.js'

const configPaymentPrompt = {
  async getPaymentPromptConfig() {
    return await Api.get('/api/v1/config/payment-prompt')
  },

  async savePaymentPromptConfig(data) {
    return await Api.post('/api/v1/config/payment-prompt', data)
  },
}

export default configPaymentPrompt
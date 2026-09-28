// plugins/validate.js
import * as rules from '~/utils/rules'

export default (context, inject) => {
  // Inject các rules validate form dùng chung cho Vuetify rules
  inject('rules', rules)
}
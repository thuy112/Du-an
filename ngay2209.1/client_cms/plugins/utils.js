// plugins/utils.js
import * as helpers from '~/utils/heppers'

export default (context, inject) => {
  // Inject các hàm helper từ utils/heppers.js vào Vue Context ($utils)
  inject('utils', helpers)
}
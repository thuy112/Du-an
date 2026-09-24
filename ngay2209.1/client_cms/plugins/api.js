// plugins/api.js
import Api from '~/api/Api.js'

export default ({ $axios }) => {
  Api.setAxios($axios)
}

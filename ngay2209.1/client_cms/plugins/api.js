import Api from '~/api/Api.js'

export default ({ $axios }) => {
  Api.init($axios)
}
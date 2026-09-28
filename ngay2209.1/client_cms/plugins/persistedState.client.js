// plugins/persistedState.client.js
import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    key: 'bk_cms_store',
    paths: ['auth', 'education', 'sidebar'], // Lưu các module Vuex nghiệp vụ theo Mục 4
  })(store)
}
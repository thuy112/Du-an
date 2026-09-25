// store/index.js
export const state = () => ({
  pageTitle: '',
  isLoading: false,
})

export const mutations = {
  SET_PAGE_TITLE(state, title) {
    state.pageTitle = title
  },
  SET_LOADING(state, status) {
    state.isLoading = status
  },
}

export const getters = {
  pageTitle: (state) => state.pageTitle,
  isLoading: (state) => state.isLoading
}

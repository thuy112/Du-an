// store/sidebar.js

export const state = () => ({
  drawer: true
})

export const mutations = {
  TOGGLE_SIDEBAR(state) {
    state.drawer = !state.drawer
  },
  SET_SIDEBAR(state, status) {
    state.drawer = status
  }
}

export const getters = {
  isDrawerOpen: (state) => state.drawer
}
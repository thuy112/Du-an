// store/auth.js
import Cookies from 'js-cookie'

export const state = () => ({
  user: null,
  token: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_TOKEN(state, token) {
    state.token = token
  },
  LOGOUT(state) {
    state.user = null
    state.token = null
    Cookies.remove('token')
  }
}

export const getters = {
  isAuthenticated: (state) => !!state.token || !!Cookies.get('token'),
  currentUser: (state) => state.user
}
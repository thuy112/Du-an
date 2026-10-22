export const state = () => ({
    user: {},
    roles: "",
})

export const getters = {
    user: (state) => state.user,
    roles: (state) => state.roles,
}

export const mutations = {
    SET_USER(state, user) {
        state.user = user
    },
    SET_ROLES(state, roles) {
        state.roles = roles
    },
}

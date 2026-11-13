export const state = () => ({
    list: [],
    isLoading: false,
})

export const getters = {
    items: (state) => state.list,
}

export const mutations = {
    SET_LIST(state, list) {
        state.list = list
    },
}

export const actions = {}

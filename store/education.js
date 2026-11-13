const INIT_STATE = {
    educationAddList: [],
    examSessionList: [],
    tempEducationAddIds: [],
    educationUpdateList: [],
};
export const state = {
    ...INIT_STATE,
};
export const getters = {
    listEducationAdd(state) {
        return state.educationAddList.filter(
            (education) => !state.tempEducationAddIds.includes(education.id)
        );
    },
};

export const mutations = {
    setDefault(state) {
        state.educationAddList = [];
        state.tempEducationAddIds = [];
        state.educationUpdateList = [];
    },
    filter(state, payload) {
        state.tempEducationAddIds = [...state.tempEducationAddIds, payload];
    },
    addExamSession(state, payload) {
        state.examSessionList = payload;
    },
    return(state, payload) {
        state.tempEducationAddIds = state.tempEducationAddIds.filter((id) => id !== payload);
    },
    setListAdd(state, payload) {
        state.educationAddList = payload;
    },
};

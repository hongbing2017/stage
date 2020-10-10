const state = {
  screen: {
    w: 1280,
    h: 720
  },
  endDrag: 0
}

const mutations = {
  setScreen (state, screen) {
    state.screen = screen
  },
  endDrag (state) {
    state.endDrag++
  }
}

const actions = {
  set_screen ({commit}, payload) {
    commit('setScreen', payload)
  }
}

export default {
  state,
  mutations,
  actions
}

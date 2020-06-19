const state = function () { // 注意：这里必须用函数，这样才能避免多重实例实际引用同一个对象值得问题
  return {
    zIndex: 0,
    transform: {
      x: 721,
      y: 100,
      width: 400,
      height: 200,
      rotation: 0
    }
  }
}

const mutations = {
  SET_TRANSFORM (state, info) {
    state.transform = info
  },
  SET_ZINDEX (state, zindex) {
    state.zIndex = zindex
  }
}

const actions = {
  set_transform ({commit}, payload) {
    commit('SET_TRANSFORM', payload.info)
  },
  set_zindex ({commit}, playload) {
    commit('SET_ZINDEX', playload.zIndex)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

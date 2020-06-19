const state = {
  songList: [],
  songInfo: {
    curSong: null,
    nextSong: null
  },
  transform: {
    x: 100,
    y: 100,
    width: 500,
    height: 300,
    rotation: 0
  },

  progerss: 0,
  currentTime: 0,
  currentTimeHand: 0, // 人工拖动进度条改变的时间，通过监视改变来设置，直接使用currentTime是因为会产生循环调用
  duration: 0,
  playing: false,
  loopType: 0,
  muted: false,

  playStyle: 'column'
}

const mutations = {

  SET_SONGLIST (state, list) {
    state.songList = list
  },
  SET_SONG (state, info) {
    state.songInfo = info
  },
  DEL_SONG (state, index) {
    if (index == -1)state.songList = []
    else state.songList.splice(index, 1)
  },
  SET_TRANSFORM (state, info) {
    state.transform = info
  },
  SET_PROGRESS (state, n) {
    state.progress = n
  },
  SET_PLAYING (state, bFlag) {
    console.log('set play:', bFlag)
    state.playing = bFlag
  },
  SET_MUTE (state, bFlag) {
    state.muted = bFlag
  },
  SET_CURRENTTIME (state, t) {
    state.currentTime = t
  },
  SET_CURRENTTIME_HAND (state, t) {
    state.currentTimeHand = t
  },
  SET_DURATION (state, t) {
    state.duration = t
  },
  SET_LOOP (state, type) {
    state.loopType = type
  },
  SET_PLAYSTYLE (state, type) {
    state.playStyle = type
  }
}

const actions = {
  set_song ({ commit }, payload) {
    commit('SET_SONG', payload.newInfo)
    if (payload.newInfo.curSong.url) {
      commit('SET_PLAYING', true)
    }
  },
  del_song ({commit}, payload) {
    commit('DEL_SONG', payload.index)
  },
  set_transform ({commit}, payload) {
    commit('SET_TRANSFORM', payload.info)
  },
  set_progress ({commit}, payload) {
    commit('SET_PROGRESS', payload.n)
  },
  set_playing ({commit}, payload) {
    if (payload.flag && state.songInfo) {
      commit('SET_SONG', state.songInfo)
    }
    commit('SET_PLAYING', payload.flag)
  },
  set_songlist ({commit}, payload) {
    commit('SET_SONGLIST', payload.list)
  },
  set_mute ({commit}, payload) {
    commit('SET_MUTE', payload.flag)
  },
  set_current_time ({commit}, payload) {
    commit('SET_CURRENTTIME', payload.t)
  },
  set_current_time_hand ({commit}, payload) {
    commit('SET_CURRENTTIME_HAND', payload.t)
  },
  set_duration ({commit}, payload) {
    commit('SET_DURATION', payload.t)
  },
  set_loop ({commit}, payload) {
    commit('SET_LOOP', payload.type)
  },
  set_playstyle ({commit}, payload) {
    commit('SET_PLAYSTYLE', payload.type)
  }
}

export default {
// namespaced: true,
  state,
  mutations,
  actions
}

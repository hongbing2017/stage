<template>
<div ref='desk' class="livebk" >
    <!-- <div class="titlebar"></div> -->
    <musicplayer :bManage="false" :bActiveDrage="false"></musicplayer>
</div>
</template>

<script>

import musicplayer from '~/../components/musicplayer/musicplayer'

import state from '~/../components/musicplayer/state'
import mLabel from '../components/mlabel/index.js'

const Store = require('electron-store') // 本地离线存储
const LocalStore = new Store()

export default {
  name: 'live-page',
  components: {
    musicplayer
  },
  data () {
    return {
       
    }
  },
  beforeMount () {
    this.$store.registerModule(['music'], state)
  },
  mounted () {
    document.title = '直播窗口'
       
    let songList = LocalStore.get('songList') || []
    this.$store.dispatch('set_songlist', {list: songList})

    this.$electron.ipcRenderer.on('component', (event, msg) => {
      let m = JSON.parse(msg)
      console.log('component消息：', m)
      if (m.op == 'create') {
        let label = new mLabel({
          propsData: {
            bManage: false,
            name: m.name,
            type: m.type,
            store: this.$store,
            info: m.info
          }
        })
        label.$mount()
        this.$refs.desk.appendChild(label.$el)
      } else if (m.op == 'del') {
        let label = document.getElementById(m.name)
        if (label) this.$refs.desk.removeChild(label)
      }
    })

    this.$electron.ipcRenderer.on('party3play', (event, msg) => {
      let m = JSON.parse(msg)
   
      let newInfo = {
        nextSong: {
          name: '<未设置>',
          url: ''
        },
        curSong: {
          url: m.url,
          name:m.name
        }
      }
      console.log("播放外链：",newInfo.curSong)
      this.$store.dispatch('set_song', {
        newInfo
      })
    })

  },

  destroyed () {

  },

  methods: {

  }
}
</script>

<style>
body {
    font-family: 'Source Sans Pro', sans-serif;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #000;
    color: aliceblue;
    -webkit-app-region: drag;
}

.livebk {
    position: absolute;
    left:2px;
    top:2px;
    right:2px;
    bottom: 2px;
    -webkit-app-region: no-drag;
}

.titlebar {
    height: 20px;
    width: 100%;
    z-index: 999;
    -webkit-app-region: drag;
}
</style>

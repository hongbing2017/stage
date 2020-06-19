<template>
<draggable class="bk" v-if="bManage" :minWidth="minWidth" :minHeight="minHeight" :z="1" :x="this.transform.x" :y="this.transform.y" :h="this.transform.height" :w="this.transform.width" :bManage="bManage" :active="bActiveDrage" @activated="onActivated" @deactivated="onDeactivated" @dragstop="onDrageEnd" @resizestop="onResizeEnd" @rotatestop="onRotateEnd">
    <!-- <audio ref="audio" :src="curSongUrl" preload autoplay :loop="loopTypes" controlsList="nodownload" crossorigin="anonymous"> </audio> -->
    <div class="bk" tabindex="0" hidefocus="true" @click.self="openDrage" v-on:blur="closeDrage">
        <el-row class="block-col-2">
            <el-col :span="24">
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        音频可视化样式选择<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="nothing">无</el-dropdown-item>
                        <el-dropdown-item command="column">方块</el-dropdown-item>
                        <el-dropdown-item command="line">曲线</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <span class="demonstration">当前样式：{{playStyle=='column'?'方块':(playStyle=='line'?'曲线':'无')}}</span>
            </el-col>
        </el-row>
        <div class="controll">
            <div class="audio-state">

                <div class="music-name">
                    <div>{{curSongName}}</div>
                    <div>下一首：{{nextSongName}}</div>
                </div>
                <div class="btn">
                    <i class="iconfont icon-backwardfill" @click.stop="prev"></i>
                </div>
                <div class="btn play-button">
                    <i class="iconfont" :class="{ 'icon-playfill': !playing, 'icon-stop': playing }" @click.stop="play"></i>
                </div>
                <div class="btn">
                    <i class="iconfont icon-play_forward_fill" @click.stop="next"></i>
                </div>
                <div class="progress" @click.stop="changeTime">
                    <div class="progress-bar" :style="progress"></div>
                </div>
                <div class="btn">
                    {{duration}}
                </div>
                <div class="btn mute-button">
                    <i class="iconfont" @click.stop="changeMute" :class="{'icon-notificationforbidfill': muted, 'icon-notificationfill': !muted, }"></i>
                </div>
                <div class="btn loop-button">
                    <i class="iconfont icon-repeat" @click.stop="changeLoopMode">
                        <span class="single-symbol" v-if="loopType === loopTypes.noloop">0</span>
                        <span class="single-symbol" v-else-if="loopType === loopTypes.single">1</span>
                    </i>

                </div>
            </div>
        </div>
    </div>
</draggable>
<draggable v-else id="musicplayer" :z="1" :x="this.transform.x" :y="this.transform.y" :h="this.transform.height" :w="this.transform.width" :bManage="bManage" :active="false" drag-cancel="#musicplayer">
    <audio ref="audio" :src="curSongUrl" preload autoplay :loop="loopType === loopTypes.single" controlsList="nodownload" crossorigin="anonymous"> </audio>
    <canvas ref="canvas"></canvas>
</draggable>
</template>

<script>
import styles from './lib/styles'
import stage from './lib/stage'

const Store = require('electron-store') // 本地离线存储
const LocalStore = new Store()

import VueDraggableResizableRotatable from '~/../components/draggable/vue-draggable-resizable-rotatable'

import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
// import state from './state'

// import vuex from '../../renderer/store'

// vuex.registerModule('music', state)

const loopTypes = {
  noloop: 0,
  single: 1,
  normal: 2
}

const AC = new window.AudioContext()
const analyser = AC.createAnalyser()
const gainnode = AC.createGain()
gainnode.gain.value = 1

function s_to_hs (s) {
  s = s | 0
  var h
  h = Math.floor(s / 60)
  s = s % 60
  h += ''
  s += ''
  h = (h.length == 1) ? '0' + h : h
  s = (s.length == 1) ? '0' + s : s
  return h + ':' + s
}

export default {
  name: '',
  components: {
    'draggable': VueDraggableResizableRotatable
  },
  props: {
    bManage: Boolean
  },
  data () {
    return {
      bActiveDrage: false,
      loopTypes,
      minWidth: 500,
      minHeight: 200
    }
  },
  mounted () {
    // this.$state.store.registerModule('music', state)
    if (!this.bManage) {
      this.initAudio()
      this.initCanvas()
      stage.add(this)
      this.bActiveDrage = false
    }else{
      let screenAspect = LocalStore.get('screenAspect')||0
      let data = {
        width: 500,
        height: 300,
        x: screenAspect==1?1152-510:720-510,
        y: screenAspect==1?720-310:1152-310,
        rotation: 0
      }
      this.$store.dispatch('set_transform', {
        info: data
      })
    }
  },

  destroyed () {

  },
  computed: {
    // playing(){
    //    return this.$store.state.music.playing
    // },
    ...mapState({
      'playing': state => state.music.playing,
      'currentTime': state => state.music.currentTime,
      'currentTimeHand': state => state.music.currentTimeHand,
      'duration': state => s_to_hs(state.music.duration),
      'loopType': state => state.music.loopType,
      'muted': state => state.music.muted,
      'playStyle': state => state.music.playStyle
    }),
    curSongName () {
      let song = this.$store.state.music.songInfo.curSong
      if (song) {
        return song.name
      } else return '<未设置>'
    },
    curSongUrl () {
      let song = this.$store.state.music.songInfo.curSong
      if (song) {
        return 'http://127.0.0.1:5432/file/?url=' + song.url
      } else return ''
    },
    nextSongName () {
      let song = this.$store.state.music.songInfo.nextSong
      if (song) return song.name
      else return '<未设置>'
    },
    transform () {
      let t = this.$store.state.music.transform

      return {
        height: t.height,
        width: t.width,
        x: t.x,
        y: t.y,
        rotation: t.rotation
      }
    },
    progress () {
      const currentTime = this.$store.state.music.currentTime
      const duration = this.$store.state.music.duration
      return {
        width: currentTime
          ? Math.ceil(currentTime / duration * 100) + '%' : '0'
      }
    }

  },
  watch: {
    muted: function () {
      if (this.bManage) return
      this.$refs.audio.muted = this.$store.state.music.muted
    },
    playing: function () {
      if (this.bManage) return
      console.log('playing state:', this.$store.state.music.playing)
      if (this.$store.state.music.playing) {
        this.$refs.audio.play()
      } else {
        this.$refs.audio.pause()
      }
    },
    currentTimeHand: function () {
      if (this.bManage) return
      console.log('手动改变进度条：', this.$store.state.music.currentTimeHand)
      this.$refs.audio.currentTime = this.$store.state.music.currentTimeHand
    },
    loopType: function () {
      if (this.bManage) return
      let loop = this.$store.state.music.loopType === loopTypes.single
      console.log('单曲循环：', loop)
      this.$refs.audio.loop = loop
    },
    transform: function () {
      if (!this.bManage) {
        // console.log("initCanvas")
        this.initCanvas()
      }
    },
    playStyle: function () {
      if (!this.bManage) {
        // console.log("initCanvas")
        this.initCanvas()
      }
    }

  },
  methods: {
    initAudio () {
      if (this.bManage) return

      // connect audio to the destination
      const audio = this.$refs.audio
      //console.log('audio:', audio)
      const source = AC.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(gainnode)
      gainnode.connect(AC.destination)

      let endTimeout
      const onEnd = () => {
        clearTimeout(endTimeout)
        console.log("onEnd:",this.$store.state.music.loopType)
        if (this.$store.state.music.loopType === loopTypes.normal) {
          this.next()
        } else if (this.$store.state.music.loopType === loopTypes.single) {
          audio.play()
        } else {
          audio.pause()
          this.$store.dispatch('set_current_time', {
            t: 0
          })
          this.$store.dispatch('set_playing', {
            flag: false
          })
        }
      }

      audio.onended = () => {
        onEnd()
      }

      audio.ontimeupdate = () => {
        clearTimeout(endTimeout)
        this.$store.dispatch('set_current_time', {
          t: audio.currentTime
        })
        const lessTime = this.$store.state.music.duration - audio.currentTime
        // end event would not be fired while currentTime changed
        // so use timeout to fire end event.
        if (this.$store.state.music.duration && lessTime < 5) {
          endTimeout = setTimeout(() => {
            onEnd()
          }, lessTime * 1000 + 100)
        }
      }

      audio.oncanplay = () => {
        console.log('duration:', audio.duration)
        this.$store.dispatch('set_duration', {
          t: audio.duration
        })
      }

      // audio.onplaying = () => {
      //     this.audioStatus.playing = true;
      // };

      audio.onpause = () => {
        clearTimeout(endTimeout)
        // this.audioStatus.playing = false;
      }
    },
    initCanvas () {
      const canvas = this.$refs.canvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      let playStyle = this.$store.state.music.playStyle
      if (playStyle != 'nothing') {
        styles[playStyle].init(
          canvas,
          canvas.width / 800,
          canvas.height / 600
        )
      }
    },
    animate () {
      if (this.bManage) return
      let playStyle = this.$store.state.music.playStyle
      if (playStyle == 'nothing') return
      const arrayLength = analyser.frequencyBinCount
      // get frequency from analyser node
      // frequency value is 0 ~ 255
      const array = new Uint8Array(arrayLength)
      analyser.getByteFrequencyData(array)
      styles[playStyle].update(array)
    },

    onActivated (e) {
      // console.log("activated1:") //目的是解决鼠标进入子iframe后不能释放拖动的问题
      let allFrame = document.querySelectorAll('.textbox>iframe')
      allFrame.forEach(frame => { // 禁止其它iframe的鼠标事件
        // if(frame.id != focusFrame.id){
        // console.log("禁止了ifram:", frame.id)
        frame.style = 'overflow: hidden; width: 100%; height: 100%; border: 0px; backgournd:transparent;pointer-events:none; '
        // }
      })
    },
    onDeactivated () {
      // console.log("deactivated1:")
      let allFrame = document.querySelectorAll('.textbox>iframe')
      allFrame.forEach(frame => { // 恢复所有iframe的鼠标事件
        // console.log("恢复了iframe:", frame.id)
        frame.style = 'overflow: hidden; width: 100%; height: 100%; border: 0px; backgournd:transparent;'
      })
    },
    openDrage (e) {
      // console.log('on click:',e)

      this.bActiveDrage = false
    },
    closeDrage () {
      this.bActiveDrage = false
    },
    prev () {
      let songList = this.$store.state.music.songList
      let songInfo = this.$store.state.music.songInfo
      if (!songInfo.curSong) return

      
      let p = songList.findIndex(item => item.url == songInfo.curSong.url)
      if (p == -1 || p == 0) {
        return
      }

      let curPos = p - 1
      let newInfo = {
        curSong: {
          name: songList[curPos].name,
          url: songList[curPos].url
        },
        nextSong: songInfo.curSong
      }
      this.$store.dispatch('set_song', {
        newInfo
      })
    },
    next () {
      let songList = this.$store.state.music.songList
      let songInfo = this.$store.state.music.songInfo
      if (!songInfo.nextSong) return

      let p = songList.findIndex(item => item.url == songInfo.nextSong.url)
      if (p == -1 || p == 0) {
        return
      }

      let nextPos = p + 1
      let nextSong = songList[nextPos]
      let newInfo = {
        nextSong: {
          name: nextSong ? nextSong.name : '<未设置>',
          url: nextSong ? nextSong.url : ''
        },
        curSong: songInfo.nextSong
      }
      this.$store.dispatch('set_song', {
        newInfo
      })
    },
    play () {
      if (this.$store.state.music.playing) {
        this.$store.dispatch('set_playing', {
          flag: false
        })
      } else {
        this.$store.dispatch('set_playing', {
          flag: true
        })
      }
    },

    changeTime (e) {
      if (!this.$store.state.music.songInfo.curSong) {
        return
      }

      const rect = e.currentTarget.getBoundingClientRect()
      const len = e.pageX - rect.left
      const ratio = len / rect.width

      this.$store.dispatch('set_current_time_hand', {
        t: ratio * this.$store.state.music.duration
      })
    },
    changeMute () {
      let muted = this.$store.state.music.muted
      this.$store.dispatch('set_mute', {
        flag: !muted
      })
    },
    changeLoopMode () {
      let loopType = this.$store.state.music.loopType + 1
      if (loopType == 3) loopType = 0
      this.$store.dispatch('set_loop', {
        type: loopType
      })
    },
    simple () {

    },
    onDrageEnd (x, y) {
      let t = this.$store.state.music.transform
      let data = {
        width: t.width,
        height: t.height,
        x,
        y,
        rotation: t.rotation
      }
      this.$store.dispatch('set_transform', {
        info: data
      })
    },
    onResizeEnd (left, top, width, height) {
      let t = this.$store.state.music.transform
      let data = {
        width,
        height,
        x: left,
        y: top,
        rotation: t.rotation
      }
      this.$store.dispatch('set_transform', {
        info: data
      })
    },
    onRotateEnd (rotate) {
      let t = this.$store.state.music.transform
      let data = {
        width: t.width,
        height: t.height,
        x: t.x,
        y: t.y,
        rotation: rotate
      }
      this.$store.dispatch('set_transform', {
        info: data
      })
    },
    handleCommand (command) {
      let playStyle = command
      if (playStyle == this.$store.state.music.playStyle) return
      this.$store.dispatch('set_playstyle', {
        type: playStyle
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped>
@import './btn.scss';

canvas {
    width: 100%;
    height: 100%;
    // border: 1px solid #ddd;
}

.bk {
    border: 1px solid #ddd;
    background: #ddd;
    height: 100%;
    width: 100%;
    outline: 0;
}

.controll {
    position: absolute;
    width: 100%;
    // height: 220px;
    bottom: 0;

    &:hover .audio-state {
        opacity: 1;

    }
}

.simple-mode {
    .audio-state {
        opacity: 0;
    }
}

.audio-state {
    position: absolute;
    width: 440px;
    height: 50px;
    bottom: 40px;
    left: 0;
    right: 0;
    margin: auto;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, .1);
    display: flex;
    align-items: center;
    opacity: .6;
    transition: opacity .3s;
    border: 1px solid #233;

    .music-name {
        position: absolute;
        width: 100%;
        height: 30px;
        line-height: 30px;
        top: -30px;
        color: #000;
        font-size: 14px;
        font-weight: 400%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: flex;

        div {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100px;
            flex: auto;
            height: 100%;
        }
    }

    .progress {
        position: relative;
        width: 200px;
        height: 10px;
        float: left;
        margin: 0 10px;
        cursor: pointer;

        &:before,
        .progress-bar {
            pointer-events: none;
            content: '';
            position: absolute;
            height: 3px;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            background-color: #000;
        }

        .progress-bar {
            width: 0;
            right: auto;
            background-color: #fff;
        }
    }

    .iconfont {
        display: flex;
        font-size: 20px;
        color: #333;
        transition: color .3s;
    }

    .btn {
        width: 40px;
        height: 40px;
        float: left;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;

        // &:hover .iconfont {
        //     color: rgb(9, 99, 1);
        // }
    }

    .play-button {
        border: 1px solid #000;
        border-radius: 100%;
        background-color: #000;
        color: #ddd;

        .iconfont {
            font-size: 26px;
            color: #ddd;
        }
      
        .icon-playfill {
            position: relative;
            left: 2px;
        }
    }

    .loop-button {
        position: relative;

        .single-symbol {
            margin: auto;
            position: absolute;
            left: 50%;
            color: #333;
            top: 50%;
            font-size: 12px;
            font-weight: bold;
            transform: translate(-50%, -50%);
        }
    }
}

.demonstration {
    color: #8492a6;
    font-size: 14px;
    margin: 0 20px;
}
</style>

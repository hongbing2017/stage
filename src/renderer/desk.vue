<template>
<div class="bk">
    <div class="main">
        <!-- <canvas ref="canvas"></canvas> -->
          
        <div class="desktip" >
        使用方法：点击开始直播，点击右边按钮生成各种效果，点击拖动到此虚线框内随意组合，在直播窗口观察效果，然后用OBS等推流软件捕获直播窗口
        
        </div>
        <div class="desktoolbar">
          <div class="screenbtn" @click="onChangeScreen">{{this.screen.w>=this.screen.h?'竖屏':'横屏'}}</div>  
           <el-select class="screenSelect" size="mini" v-model="curScreen" placeholder="分辨率"  @change="onSelectResolution">
          <el-option 
            v-for="item in resolutionList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
           >
          </el-option>
        </el-select>
        </div>
        <div ref='desk' class='desk' :style="{height:screen.h+'px', width:screen.w+'px'}">
          
          <musicplayer id="musicplayer" :bManage="true" :transform="transform"></musicplayer>
        </div>
       
    </div>
    <div class="toolbar">
        <!-- <div :class="{liveBtnOff:!bLiveOpen,liveBtnOn:bLiveOpen}" @click="onOpenLive">{{bLiveOpen?'结束直播':'开始直播'}}</div> -->
        <el-button type="danger" @click="onOpenLive">{{bLiveOpen?'结束直播':'开始直播'}}</el-button >

        <div v-if="sourceList.length" class="update" @click="bSelectDownload=true">有更新!</div>

        <el-button class="toolbtn" type="primary" @click="selectSong">选歌</el-button>

        <el-button class="toolbtn" type="primary"  @click="onAddLabel">添加文字</el-button>
        <el-button class="toolbtn" type="primary"  @click="onAddImage">添加图片</el-button>
        <el-button class="toolbtn" type="primary"  @click="onAddvideo">添加视频</el-button>
        <el-button class="toolbtn" type="primary"  @click="onAddPlugin">特效插件</el-button>
    </div>
    <el-drawer  title="" :visible.sync="bOpenSongList" direction="rtl" size="50%">
        <div class="songlist"> 
          <div class="toolbar">
            <el-button class="toolbtn" type="primary" @click="selectFile">文件</el-button>
            <el-button class="toolbtn" type="primary" @click="selectDir">文件夹</el-button>
            <el-button class="toolbtn" type="primary" @click="deleteSong">删除</el-button>
            <el-button class="toolbtn" type="primary" @click="deleteAllSong">全删</el-button>
          </div>
          <div class="list">
            <div class="song" v-bind:class="{curSong:index==curSelect}" v-for="(item,index) in songList" :data-index="index" :key="item.name" @click="onSelectSong">
                {{index +' '+item.name}}
            </div>
          </div>
        </div>
    </el-drawer>
    <el-dialog id="editdialog" title="输入文字" :visible.sync="bLabelEdit" center :close-on-click-modal='false'>
        <labeledit ref="edit"></labeledit>
        <span slot="footer" class="dialog-footer">
            <el-button @click="bLabelEdit = false">取 消</el-button>
            <el-button type="primary" @click="onLabelEditEnd">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog id="editdialog" title="选择图片" :visible.sync="bImageEdit" center :close-on-click-modal='false'>
        <imgedit ref='imgedit'></imgedit>
        <span slot="footer" class="dialog-footer">
            <el-button @click="bImageEdit = false">取 消</el-button>
            <el-button type="primary" @click="onImageEditEnd">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog id="editdialog" title="选择视频" :visible.sync="bvideoEdit" center :close-on-click-modal='false'>
        <videoedit ref='videoedit'></videoedit>
        <span slot="footer" class="dialog-footer">
            <el-button @click="bvideoEdit = false">取 消</el-button>
            <el-button type="primary" @click="onvideoEditEnd">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog  title="选择插件" :visible.sync="bOpenPlugin" center :close-on-click-modal='false' width="80%">
        <pluginlist  ref='pluginlist' @selectPlugin="onSelectPlugin"></pluginlist>
        <span slot="footer" class="dialog-footer">
            <el-button @click="bOpenPlugin = false">取 消</el-button>
        </span>
    </el-dialog>
    <ele-form-dialog :dialogAttrs="dialogAttrs" :formDesc="formDesc" v-model="formData" :request-fn="startPlugin" :visible.sync="bParamForm" @request-success="startPluginSuccess"></ele-form-dialog>
    <!-- <paramform :bParamForm="bParamForm"></paramform> -->

    <el-dialog  title="选择下载源" :visible.sync="bSelectDownload" center :close-on-click-modal='false' width="400px">
        <div class="sourceItem" v-for="(item,index) in sourceList " :id="index" :key="index" @click="openDownload">{{item.title}}</div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="bSelectDownload = false">取 消</el-button>
        </span>
    </el-dialog>

</div>
</template>

<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'

import Vue from 'vue'

import musicplayer from '~/../components/musicplayer/musicplayer'
import musicState from '~/../components/musicplayer/state'

import mLabel from '../components/mlabel/index.js'

import imgedit from '~/../components/imgedit/imgedit'
import labeledit from '~/../components/labeledit/labeledit'
import videoedit from '~/../components/videoedit/videoedit'

import pluginlist from '~/../components/pluginlist/pluginlist'

//import { resolve } from 'url'
//import { version } from 'punycode'

// import paramform from '~/../components/paramform/paramform'

var fs = require('fs')
var path = require('path')

var localVersion = require('../../package.json').version

const Store = require('electron-store') // 本地离线存储
const LocalStore = new Store()

console.log('view:', window.vue)

var _drageFocuseInfo = null

function isNewVersion(local,remote){
  if(local[0]=='v'||local[0]=='V')local = local.slice(1)
  if(remote[0]=='v'||remote[0]=='V')remote = remote.slice(1)

  local = local.split('.')
  remote = remote.split('.')

  if(local.length !=3 || remote.length!==3)return false

  if(parseInt(remote[0])>parseInt(local[0])) return  true
  if(parseInt(remote[1])>parseInt(local[1])) return  true
  if(parseInt(remote[2])>parseInt(local[2])) return  true
  return false
}

export default {
  name: 'desk-page',
  components: {
    musicplayer,
    imgedit,
    labeledit,
    videoedit,
    pluginlist
  },
  data () {
    return {
      sourceList:[],  //更新源
      bSelectDownload:false,

      bOpenSongList: false,
      curSelect: -1,
      curScreen:'1280*720',
      resolutionList:[
         {
          value: '1024*768',
          label: '1024*768'
        },
        {
          value: '1280*720',
          label: '1280*720'
        },  
        {
          value: '1366*768',
          label: '1366*768'
        },
        {
          value: '1440*900',
          label: '1440*900'
        },
        {
          value: '1600*1200',
          label: '1600*1200'
        },{
          value: '1920*1080',
          label: '1920*1080'
        },
        {
          value: '1920*1200',
          label: '1920*1200'
        }
        ],
      bLiveOpen: false,
      dialogVisible: false,
      transform: {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        rotation: 0
      },
      bLabelEdit: false,
      bImageEdit: false,
      bvideoEdit: false,
      bOpenPlugin: false,
      labelText: '',
      imageText: '',
      pluginList: [],

      bParamForm: false,

      pluginUrl: '', // 插件url
      pluginName: '',

      formData: {},
      formDesc: {},
      dialogAttrs: {
        'close-on-click-modal': false
      }

    }
  },
  beforeCreate () {
    console.log("分辨率：",this.$store.state.common.screen)
    this.$store.registerModule(['music'], musicState) // 只能在这个节点注入，不然computed和watch会报错
  },
  mounted () {
    

    let songList = LocalStore.get('songList') || []
    this.$store.dispatch('set_songlist', {list: songList})


    this.$http.get('https://hongbing2017.github.io/stageplugin/version.json').then(res => {
          if (res.status != 200) {
            console.log('无法获取版本更新信息')
            return;
          }
          let versionInfo = res.data
          if(isNewVersion(localVersion,versionInfo.version)){
            console.log("新版本信息：",versionInfo)
            this.sourceList = versionInfo.sourceList                              
          }
    })

    // this.$electron.remote.getCurrentWindow().on('resize', this.onResize.bind(this))
    this.$electron.ipcRenderer.on('component', (event, msg) => {
      let m = JSON.parse(msg)
      console.log('component消息：', m)
      if (m.op == 'del') {
        let label = document.getElementById(m.name)
        this.$refs.desk.removeChild(label)
        setTimeout(() => {
          this.$store.unregisterModule(m.name)
        }, 1000)

        this.$http.get(`http://127.0.0.1:5432/plugindir/?del=1&name=${m.name}`).then(res => {
          if (res.status != 200) {
            console.log('本地服务错误:无法删除插件目录')
          }
        })
      }
    })
  },
  destroyed () {
    this.$electron.ipcRenderer.send('closeLive')
    // this.$electron.remote.getCurrentWindow().removeListener('resize', this.onResize.bind(this))
  },
  computed: {
    ...mapState({
      'songList': state => state.music.songList,
      'dragActivateInfo': state => state.common.dragActivateInfo,
      'dragDeactivateInfo': state => state.common.dragDeactivateInfo,
      "screen":state => {
        let screen = state.common.screen
        let w = Number(screen.w)
        let h = Number(screen.h)
        return {w,h}
      }
    })

  },
  watch: {
    screen:function(){
      let screen = this.$store.state.common.screen
      console.log("watch screen change:",screen)
      LocalStore.set('screenResolution',screen)
      this.$electron.ipcRenderer.send('changeScreen')
    },
    songList: function () {
      let list = this.$store.state.music.songList
      LocalStore.set('songList', list)
    },
    dragActivateInfo: function () {
      // console.log("drage active2:")
      let dragInfo = this.$store.state.common.dragActivateInfo
      if (!dragInfo) return

      var drageItem = document.querySelector('#' + dragInfo.id)
      if (!drageItem) return
      drageItem.classList.add('dragItem')
      // drageItem.style.zIndex = 1000
      // this.$refs.dragmask.style.zIndex = 999
    },
    dragDeactivateInfo: function () {
      // console.log("drage deactive2:")
      let dragInfo = this.$store.state.common.dragDeactivateInfo
      if (!dragInfo) return

      var drageItem = document.querySelector('#' + dragInfo.id)
      if (!drageItem) return

      drageItem.classList.remove('dragItem')

      // drageItem.style.zIndex = this.$store.state.common.dragActivateInfo.zindex
      // this.$refs.dragmask.style.zIndex = 0
    }

  },
  methods: {
    onSelectResolution(e){
      console.log("改变分辨率：",e)
      e = e.split('*')
      let w = e[0]
      let h = e[1]

      this.$store.dispatch('set_screen', {w,h})
      // LocalStore.set('screenResolution',{
      //   w,
      //   h
      // })
      // this.$electron.ipcRenderer.send('changeScreenResolution')
    },
    onChangeScreen(e){
        let screen = this.screen
        let w = screen.w
        screen.w = screen.h
        screen.h = w

        this.$store.dispatch('set_screen', screen)
        
    },
    openDownload(e){
       let index = e.currentTarget.id
       let source = this.sourceList[index]
       if(source){
         this.$electron.shell.openExternal(source.url);
       }
    },
    onAddLabel () {
      this.bLabelEdit = true
    },
    onAddImage () {
      this.bImageEdit = true
    },
    onAddvideo () {
      this.bvideoEdit = true
    },
    onAddPlugin () {
      this.bOpenPlugin = true
    },
    onLabelEditEnd () {
      this.bLabelEdit = false

      let info = JSON.parse(JSON.stringify(this.$refs.edit.info))

      console.log('text:', info)

      if (info.text.length) {
        // console.log(edit.fontColor, edit.curFontName)
        // let innerHTML = `<span style="font-size:${edit.curFontSize};font-family:${edit.curFontName};color:${edit.fontColor};background:${edit.fontBkColor};">${text}</span>`

        let name = 'label' + Date.now() // 同时充当state的空间命名
        let label = new mLabel({
          propsData: {
            bManage: true,
            store: this.$store,
            name,
            type: 'text',
            info
          }
        })

        label.$electron = this.$electron // 动态插入得好像不会自动注入
        label.$mount()
        this.$refs.desk.appendChild(label.$el)

        this.$electron.ipcRenderer.send('component', JSON.stringify({
          op: 'create',
          name,
          type: 'text',
          info
        }))
      }
    },
    onImageEditEnd () {
      this.bImageEdit = false
      let imgedit = this.$refs.imgedit
      let imgUrlList = imgedit.imgUrlList

      
      if (imgUrlList.length == 1) {
        let imgUrl = imgUrlList[0]
        imgUrl = `<img src="${imgUrl}" crossorigin='anonymous'>`
        let name = 'label' + Date.now() // 同时充当state的空间命名
        let label = new mLabel({
          propsData: {
            bManage: true,
            store: this.$store,
            name,
            type: 'image',
            info: {
              text: imgUrl
            }
          }
        })
        label.$electron = this.$electron // 动态插入得好像不会自动注入
        label.$mount()
        this.$refs.desk.appendChild(label.$el)

        this.$electron.ipcRenderer.send('component', JSON.stringify({
          op: 'create',
          name,
          type: 'image',
          info: {
            text: imgUrl
          }
        }))
        imgedit.imgUrl = ''
      } else if (imgUrlList.length > 1) {
         this.pluginName = 'label' + Date.now()
        this.pluginUrl = `https://hongbing2017.github.io/stageplugin/幻灯片/`
        console.log('准备使用插件：', this.pluginUrl)

        let that = this
        this.$http.get(`https://hongbing2017.github.io/stageplugin/幻灯片/schema.js`)
          .then((res) => {
            if (res.status != 200) {
              // this.$message('网络错误:无法获取插件数据')

              return
            }

            // console.log('schema data:', res.data)
            let schema = Function(res.data)
            that.formDesc = schema().formDesc
            if (Object.keys(that.formDesc).length == 0) {
              that.formDesc.imageList = imgUrlList
              that.startPlugin(that.formDesc)
            } else {
              that.bParamForm = true
            }

            // console.log('schema parse:', schema())
          })
          .catch((error) => {
            that.startPlugin({})
            console.log(error)
          })
      }
    },
    onvideoEditEnd () {
      this.bvideoEdit = false
      let videoedit = this.$refs.videoedit
      let videoList = videoedit.videoList

      if (videoList.length > 0) {
        this.pluginName = 'label' + Date.now() // 同时充当state的空间命名
        this.pluginUrl = `https://hongbing2017.github.io/stageplugin/全屏视频/`
        console.log('准备使用插件：', this.pluginUrl)

        let that = this
        this.$http.get(`https://hongbing2017.github.io/stageplugin//全屏视频/schema.js`)
          .then((res) => {
            if (res.status != 200) {
              // this.$message('网络错误:无法获取插件数据')

              return
            }

            // console.log('schema data:', res.data)
            let schema = Function(res.data)
            that.formDesc = schema().formDesc
            if (Object.keys(that.formDesc).length == 0) {
              that.formDesc.videoList = videoList
              that.startPlugin(that.formDesc)
            } else {
              that.bParamForm = true
            }

            // console.log('schema parse:', schema())
          })
          .catch((error) => {
            that.startPlugin({})
            console.log(error)
          })
      }
    },
    onSelectPlugin (data) {
      if (data.type == 'local') {
        let dir = data.info
        this.bOpenPlugin = false

        this.pluginName = 'label' + Date.now() // 同时充当state的空间命名
        this.pluginUrl = `http://127.0.0.1:5432/plugin/${this.pluginName}/`

        console.log('准备使用插件：', this.pluginUrl)
        this.$http.get(`http://127.0.0.1:5432/plugindir/?add=1&name=${this.pluginName}&dir=${dir}`).then(res => {
          if (res.status != 200) {
            this.$message('本地服务错误:无法设置插件目录')
            return
          }
          this.$http.get(`http://127.0.0.1:5432/plugin/${this.pluginName}/schema.js`)
            .then((res) => {
              if (res.status != 200) {
                this.$message('本地服务错误:无法获取插件数据')
                return
              }

              // console.log('schema data:', res.data)
              let schema = Function(res.data)
              this.formDesc = schema().formDesc
              if (Object.keys(this.formDesc).length == 0) {
                this.startPlugin(this.formDesc)
              } else {
                this.bParamForm = true
              }
              // console.log('schema parse:', schema())
            }).catch((error) => {
              this.startPlugin({})
              console.log(error)
            })
        })
      } else if (data.type == 'online') {
        let item = data.info
        console.log('get:', item)
        this.bOpenPlugin = false
        this.pluginName = 'label' + Date.now() // 同时充当state的空间命名
        this.pluginUrl = `https://hongbing2017.github.io/stageplugin/${item.name}/`
        console.log('准备使用插件：', this.pluginUrl)

        this.$http.get(`https://hongbing2017.github.io/stageplugin/${item.name}/schema.js`)
          .then((res) => {
            if (res.status != 200) {
              this.$message('网络错误:无法获取插件数据')

              return
            }

            // console.log('schema data:', res.data)
            let schema = Function(res.data)
            this.formDesc = schema().formDesc
            if (Object.keys(this.formDesc).length == 0) {
              this.startPlugin(this.formDesc)
            } else {
              this.bParamForm = true
            }

          // console.log('schema parse:', schema())
          })
          .catch((error) => {
            this.startPlugin({})
            console.log(error)
          })
      }
    },
    selectSong () {
      this.bOpenSongList = true
    },
    async selectFile () {
      let r = await this.$electron.remote.dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{
          name: '音乐',
          extensions: ['mp3', 'wav']
        }]
      })
      if (r.canceled) return
      r = r.filePaths[0]

      let p = r.lastIndexOf('\\')
      let name = r.slice(p + 1)
      console.log('song:', r)

      let songList = this.$store.state.music.songList
      if (songList.find(item => item.url == r)) return

      let newList = []

      newList.push(...songList)
      newList.push({
        name,
        url: r
      })
      this.$store.dispatch('set_songlist', {list: newList})
      // LocalStore.set('songList', songList)
    },
    async selectDir () {
      let r = await this.$electron.remote.dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory'],
        filters: [{
          name: '音乐',
          extensions: ['mp3', 'wav']
        }]
      })

      if (r.canceled) return
      let dir = r.filePaths[0]

      let songList = this.$store.state.music.songList
      let fileList = fs.readdirSync(dir)

      let newList = []
      fileList.forEach(name => {
        let url = path.join(dir, name)
        if (!songList.find(item => item.url == url)) {
          newList.push({
            name,
            url
          })
        }
      })
      newList.push(...songList)
      this.$store.dispatch('set_songlist', {list: newList})
      // LocalStore.set('songList', newList)
    },
    deleteSong () {
      if (this.curSelect == -1) return
      this.$store.dispatch('del_song', {
        index: this.curSelect
      })
    },
    deleteAllSong () {
      this.$store.dispatch('del_song', {index: -1}) // -1表示全删
    },
    onSelectSong (e) {
      let index = e.srcElement.dataset.index
      this.curSelect = this.curSelect === index ? -1 : index
      if (this.curSelect != -1) {
        let curSong = this.songList[this.curSelect]
        let nextPos = Number(this.curSelect) + 1
        if (nextPos >= this.songList.length) nextPos = 0
        var nextSong = this.songList[nextPos] || null

        this.$store.dispatch('set_song', {
          newInfo: {
            curSong,
            nextSong
          }
        })
      }
    },
    onOpenLive () {
      this.dialogVisible = true
      if (!this.bLiveOpen) {
        this.bLiveOpen = true
        // 给主进程发信息，
        this.$electron.ipcRenderer.send('openLive',this.screen)
      } else {
        this.$confirm('你确定要关闭直播窗口吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        })
          .then(() => {
            this.bLiveOpen = false
            this.$electron.ipcRenderer.send('closeLive')
          }).catch(() => {

          })
      }
    },
    startPlugin (data) {
      return new Promise(resolve => {
        data.url = this.pluginUrl
        let name = this.pluginName
        let label = new mLabel({
          propsData: {
            bManage: true,
            store: this.$store,
            name,
            type: 'iframe',
            info: data
          }
        })
        label.$electron = this.$electron // 动态插入得好像不会自动注入
        label.$mount()
        this.$refs.desk.appendChild(label.$el)

        this.$electron.ipcRenderer.send('component', JSON.stringify({
          op: 'create',
          name,
          type: 'iframe',
          info: data
        }))
        resolve(true)
      })
    },
    startPluginSuccess () {
      this.bParamForm = false
      // this.$message.success('发送成功')
    }

  }
}
</script>

<style scoped>
.bk {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.main {
    width: 100%;
    height: 400px;
    flex: auto;
    background: #333;
    color: #ddd;
    overflow: auto;
}

.desk {
    position: relative;
    left: 20px;
    width: 720px;
    height: 1152px;
    border: 3px dotted #aaa;
    background: #333;
    margin: 20px 0;
    /* z-index:0; */
}
.desk1{
  position: relative;
    left: 20px;
    height: 720px;
    width: 1152px;
    border: 3px dotted #aaa;
    background: #333;
    margin: 20px 0;
}

.main>canvas {
    height: 100%;
    width: 100%;
}

.toolbar {
    width: 100%;
    height: 60px;
    flex: none;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: #ddd;
}

.liveBtnOff {
    height: 40px;
    line-height: 40px;
    width: 120px;
    border-radius: 4px;
    color: aliceblue;
    background: rgb(107, 1, 1);
    border: 1px outset #fff;
    text-align: center;
    margin: 0 8px;
}

.liveBtnOff:hover {
    background: red;
}

.liveBtnOn {
    height: 40px;
    line-height: 40px;
    width: 120px;
    border-radius: 4px;
    border: 1px outset #fff;
    text-align: center;
    margin: 0 8px;
    background: red;
    color: aliceblue;
}

.toolbtn {
    height: 40px;
    width: 100px;
}

.update{
  height: 100%;
  width:100px;
  text-decoration:underline;
  color:blue;

}
.songlist{
  height:100%;
  width:100%;
  display: flex;
  flex-direction: column;
}

.list {
    flex:auto;
    padding: 0 8px;
    overflow: auto;
    margin: 10px 0;
    height:100px;
}

.song {
    color: #333;
    height: 30px;
    line-height: 30px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song:hover {
    background: #333;
    color: #ddd;
}

.curSong {
    color: red;
}

.toolbar>audio {
    height: 40px;
    width: 300px;
    line-height: 60px;
}

.loop {
    height: 20px;
    padding: 0 10px;
}

.sourceItem{
  height:40px;
  line-height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;

  text-align: center;
  margin: 10px auto;
}
.sourceItem:hover{
  border: 1px solid #333;
}
.desktip{
  width:4000px;
  height:20px;
  margin:4px 20px;
}
.screenbtn{
    margin:0 6px;
    width: 50px;
    height: 28px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    color: #333;
    
    text-align: center;
    line-height: 28px;
    font-size: 12px;
}

.screenbtn:hover{
  background:#666;
  color: #ddd;
  border:1px solid #333;
}
/*
.edit {
    height: 400px;
    margin-bottom: 60px;
}

#editor {
    height: 100%;
}
*/

.desktoolbar{
  margin: 10px;
  display: flex;
}
/* .screenSelect{
 margin: 6px;
    width: 150px;
    height: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #ddd;
    text-align: center;
    line-height: 20px;
    font-size: 12px;
}
.el-input {
  height: 20px;
  font-size: 12px;
} */
</style>

import Vue from 'vue'
import VueDraggableResizableRotatable from '~/../components/draggable/vue-draggable-resizable-rotatable'

import labelstate from './state'
import './label.css'

const Store = require('electron-store') // 本地离线存储
const LocalStore = new Store()

// import {
//   loadMicroApp
// } from 'qiankun'

export default Vue.extend({
  components: {
    'draggable': VueDraggableResizableRotatable
  },
  render (createElement) {
    return createElement(
      'draggable', {
        attrs: {
          id: this.name,
          'drag-cancel': this.bManage ? '' : '#' + this.name
        },
        style: {
          'z-index': this.zIndex
        },
        on: {
          'activated': this.onActivated,
          'deactivated': this.onDeactivated,
          'dragstop': this.onDrageEnd,
          'resizestop': this.onResizeEnd,
          'rotatestop': this.onRotateEnd
        },
        props: {
          active: this.bDragActived,
          x: this.transform.x,
          y: this.transform.y,
          h: this.transform.height,
          w: this.transform.width,
          'minHeight': this.minHeight,
          'minWidth': this.minWidth
        }
      },
      [
        createElement(
          'div', {
            attrs: {
              tabindex: 0
            },
            style: {
              width: '100%',
              height: '100%',
              border: this.bManage ? '1px solid #ddd' : '',
              outline: 0,
              color: '#fff',
              display: 'flex',
              'flex-direction': 'column'
            },
            on: {
              // 'click': this.openDrage,
              // 'blur': this.closeDrage
            }
          },
          [
            createElement(this.bManage ? 'div' : '', // 工具条
              {
                style: {
                  height: '20px',
                  width: '100%',
                  'border-bottom': '1px solid #ddd',
                  'font-size': '12px',
                  'line-height': '20px',
                  'flex': 'none',
                  'background': '#333'
                }
              }, [
                createElement('i', // 关闭按钮
                  {
                    class: 'el-icon-close',
                    style: {
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      right: 0,
                      'line-height': '20px'
                    },
                    on: {
                      'click': this.delLabel
                    }
                  }),
                createElement('i', // 全屏
                  {
                    class: 'el-icon-full-screen',
                    style: {
                      height: '20px',
                      width: '20px',
                      'margin': '0 4px'
                    },
                    on: {
                      'click': this.fullScreeen
                    }
                  }),
                createElement('i', {
                  class: 'el-icon-minus',
                  style: {
                    height: '20px',
                    width: '20px',
                    'margin': '0 8px'
                  },
                  on: {
                    'click': this.zindexminus
                  }
                }),
                '层级' + this.zIndex,
                createElement('i', {
                  class: 'el-icon-plus',
                  style: {
                    height: '20px',
                    width: '20px',
                    'margin': '0 8px'
                  },
                  on: {
                    'click': this.zindexplus
                  }
                })
              ]
            ),
            createElement('div', // 实际内容
              {
                class: 'textbox',
                style: {
                  overflow: 'hidden'
                },
                attrs: {
                  id: 'plugin-' + this.name
                },
                on: {
                  'click': this.closeDrage
                  // 'blur': this.closeDrage
                },
                domProps: {
                  innerHTML: this.type == 'iframe' ? '':this.info.text
                }
              })
          ]
        )
      ]
    )
  },

  created () {
    this.store.registerModule([this.name], labelstate)
  },
  mounted () {
    if (this.type == 'plugin') {
      window[this.name] = {
        bootstrap: () => {
          console.log('default bootstrap：', this)
          return Promise.resolve()
        },
        mount: () => {
          console.log('default mount：', this)
          return Promise.resolve()
        },
        unmount: () => {
          console.log('default unmount：', this)
          return Promise.resolve()
        }
      }
      this.$message('微前端功能不可用')
      // this.pluginApp = loadMicroApp({
      //   name: this.name,
      //   entry: this.info.url,
      //   container: '#plugin-' + this.name
      // }, {
      //   sandbox: {
      //     strictStyleIsolation: true
      //   }
      // })
    } else if (this.type == 'iframe') {
      this.info.pluginName = this.name
      this.info.bManage = this.bManage
      let param = JSON.stringify(this.info)

      let url = this.info.url + 'index.html?param=' + encodeURIComponent(param)
      console.log('url:', url)
      let innerHTML = `<iframe 
      scrolling="no"
      style=" overflow: hidden;
      width: 100%;
      height: 100%;
      border: 0px;
      pointer-events:none; 
      backgournd:transparent;"
      src="${url}">
      </iframe>`

      var iframe = document.createElement('iframe')
      iframe.id = this.name
      iframe.scrolling = 'no'
      iframe.allow = 'microphone;camera;midi;encrypted-media;'
      iframe.style = 'overflow: hidden; width: 100%; height: 100%; border: 0px; backgournd:transparent;'
      iframe.src = url

      setTimeout(() => {
        var el = document.querySelector('#plugin-' + this.name)
        el.appendChild(iframe)
      })
    } else if (this.type == 'text') {
      let innerHTML = `<div style="font-size:${this.info.fontSize};font-family:${this.info.fontName};color:${this.info.fontColor};background:${this.info.fontBkColor};">${this.info.text}</div>`
      this.info.text = innerHTML
    } 
  },
  computed: {
    zIndex () {
      let t = this.store.state[this.name]
      if (!t) return 0
      return t.zIndex
    },
    transform () {
      let t = this.store.state[this.name]
      if (!t) {
        return {
          x: 0,
          y: 0,
          height: 50,
          width: 50,
          rotation: 0
        }
      }
      t = t.transform
      // console.log(this.name, t)
      return {
        height: t.height,
        width: t.width,
        x: t.x,
        y: t.y,
        rotation: t.rotation
      }
    },
    endDrag () {
      return this.store.state.common.endDrag
    }

  },
  watch: {
    endDrag () {
      if (this.bDragActived) {
        console.log('watch')
        this.bDragActived = false
        this.onDeactivated()
      }
    }
  },
  methods: {
    openDrage (e) {
      if (!this.bManage) return
      this.bDragActived = true
      e.stopPropagation()
    },
    closeDrage (e) {
      this.store.commit('endDrag')
      e.stopPropagation()
    },
    delLabel (e) {
      console.log('删除贴纸')
      this.$electron.ipcRenderer.send('component', JSON.stringify({
        op: 'del',
        type: this.type,
        name: this.name
      }))
    },
    fullScreeen (e) {
      let t = this.store.state[this.name]
      if (!t) return
      t = t.transform
      console.log("fullscreen click")
      let screenAspect = LocalStore.get('screenAspect')||0

      if (t.width == 720 && t.height == 1152) {
        let transform = {
          width: 400,
          height: 300,
          x: 721,
          y: 0,
          rotation: 0
        }

        this.store.dispatch(this.name + '/set_transform', {info: transform})
      }else if(t.width== 1152 && t.height==720){
        let transform = {
          width: 400,
          height: 300,
          x: 1153,
          y: 0,
          rotation: 0
        }

        this.store.dispatch(this.name + '/set_transform', {info: transform})
      } 
      else {
        let transform = {
          width: screenAspect?1152:720,
          height:screenAspect?720:1152,
          x: 0,
          y: 0,
          rotation: 0
        }
        this.store.dispatch(this.name + '/set_transform', {info: transform})
      }
    },
    zindexplus () {
      let zIndex = this.store.state[this.name].zIndex + 1
      this.store.dispatch(this.name + '/set_zindex', {zIndex})
    },
    zindexminus () {
      let zIndex = this.store.state[this.name].zIndex
      if (zIndex < 1) return
      this.store.dispatch(this.name + '/set_zindex', {zIndex: zIndex - 1})
    },

    onActivated (e) {
      this.bDragActived = true
      let allFrame = document.querySelectorAll('.textbox>iframe')
      allFrame.forEach(frame => { // 禁止其它iframe的鼠标事件
        frame.style = 'overflow: hidden; width: 100%; height: 100%; border: 0px; backgournd:transparent;pointer-events:none; '
      })
    },
    onDeactivated () {
      console.log('deactivated1:')

      let allFrame = document.querySelectorAll('.textbox>iframe')
      allFrame.forEach(frame => { // 恢复所有iframe的鼠标事件
        frame.style = 'overflow: hidden; width: 100%; height: 100%; border: 0px; backgournd:transparent;'
      })
    },
    onDrageEnd (x, y) {
      let t = this.store.state[this.name]
      if (!t) return
      t = t.transform
      let data = {
        width: t.width,
        height: t.height,
        x,
        y,
        rotation: t.rotation
      }
      this.store.dispatch(this.name + '/set_transform', {info: data})
    },
    onResizeEnd (left, top, width, height) {
      let t = this.store.state[this.name]
      if (!t) return
      t = t.transform
      let data = {
        width,
        height,
        x: left,
        y: top,
        rotation: t.rotation
      }
      this.store.dispatch(this.name + '/set_transform', {info: data})
    },
    onRotateEnd (rotate) {
      let t = this.store.state[this.name]
      if (!t) return
      t = t.transform
      let data = {
        width: t.width,
        height: t.height,
        x: t.x,
        y: t.y,
        rotation: rotate
      }
      this.store.dispatch(this.name + '/set_transform', {info: data})
    }
  },
  data () {
    return {
      bDragActived: false,
      minHeight: 40,
      minWidth: 100,
      fontSize: '20px',
      fontColor: 'red',
      pluginApp: null
    }
  },
  props: {
    bManage: {
      type: Boolean,
      required: true
    },
    store: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    info: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  }
})

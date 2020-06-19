import {
  app,
  Menu,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  session
} from 'electron'
'use strict'

console.log("版本：",process.versions)
const Store = require('electron-store') // 本地离线存储
const LocalStore = new Store()

const path = require('path')
var version = require('../../package.json').version

const { registerVuexHub } = require('../renderer/store/vuex-electron-ipc.js')

registerVuexHub()

// import '../renderer/store'
const appDir = app.getPath('home')

const localServer = require('./localServer.js')
localServer(appDir)

const server = 'http://127.0.0.1:5432'
const feed = `${server}/queryversion/update/${process.platform}/${version}`
console.log('更新url:', feed)



// autoUpdater.checkForUpdates()
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const liveURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#live`
  : `file://${__dirname}/index.html#live`

const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/logo.png'))

async function createWindow () {
  /**
   * Initial window options
   */

  // console.log('ico:', icon)
  //const appIcon = new Tray(icon)
  mainWindow = new BrowserWindow({
    title: '控制台: ' + version,
    height: 1024,
    width: 1000,
    minHeight: 600,
    minWidth: 600,
    icon: icon,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.on('did-frame-finish-load', () => {
      mainWindow.webContents.once('devtools-opened', () => {
        mainWindow.focus()
      })
      mainWindow.webContents.openDevTools()
    })
  } else {
    // mainWindow.webContents.openDevTools() // 打包后的调试
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    if (LiveWindow) {
      LiveWindow.close()
      LiveWindow = null
    }
  })

  Menu.setApplicationMenu(null)

 // const ext = await session.defaultSession.loadExtension('C:/Users/ADMIN/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.3_1')
 // console.log("插件安装结果：",ext)
  // let r = BrowserWindow.addDevToolsExtension('C:/Users/ADMIN/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.3_1');
  // console.log('安装插件结果：',BrowserWindow.getDevToolsExtensions());
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

var LiveWindow = null
ipcMain.on('openLive', () => {
  let screenAspect = LocalStore.get('screenAspect')||0
  console.log("screenAspect:",screenAspect)

  let height = screenAspect==0?1152:720
  let width = screenAspect==0?720:1152

  LiveWindow = new BrowserWindow({
    // parent:mainWindow,
    title: '直播窗口',
    width,
    height,
    minWidth:width,
    minHeight:height,
    resizable: false,
    useContentSize: true,
    alwaysOnTop: false,
    disableAutoHideCursor: true,
    backgroundColor: '#000',
    icon: icon,
    frame: process.env.NODE_ENV === 'development',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: process.env.NODE_ENV === 'development'
    }
  })
  ipcMain.on('changeScreenAspect',()=>{
      if(!LiveWindow)return;
      
      let screenAspect = LocalStore.get('screenAspect')

      let height = screenAspect==0?1152:720
      let width = screenAspect==0?720:1152
    
      LiveWindow.setMinimumSize(width,height)
      LiveWindow.setSize(width,height)
  })
  // LiveWindow.webContents.setFrameRate(30)

  LiveWindow.on('close',()=>{
    console.log("关闭live view")
  })
  LiveWindow.on('closed', () => {
    LiveWindow = null
  })
  LiveWindow.show()
  LiveWindow.loadURL(liveURL)
  if (process.env.NODE_ENV === 'development') {
    LiveWindow.webContents.on('did-frame-finish-load', () => {
      LiveWindow.webContents.once('devtools-opened', () => {
        LiveWindow.focus()
      })
      LiveWindow.webContents.openDevTools()
    })
  } else {
    // LiveWindow.webContents.openDevTools()
  }
})

ipcMain.on('closeLive', () => {
  if (LiveWindow) {
    console.log('close live')
    LiveWindow.destroy()
    LiveWindow = null
  }
})

ipcMain.on('component', (e, m) => {
  let cmd = JSON.parse(m)
  if (cmd.op == 'create') {
    if (LiveWindow) {
      LiveWindow.webContents.send('component', m)
    }
  } else if (cmd.op == 'del') {
    console.log('主进程收到：', cmd)
    mainWindow.webContents.send('component', m)
    if (LiveWindow) {
      LiveWindow.webContents.send('component', m)
    }
  }
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

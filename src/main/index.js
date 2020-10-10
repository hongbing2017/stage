'use strict'

import {
  app,
  Menu,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  session,
  ipcRenderer
} from 'electron'

console.log("版本：", process.versions)
const Store = require('electron-store') // 本地离线存储
const LocalStore = new Store()

const path = require('path')
var version = require('../../package.json').version

const {
  registerVuexHub
} = require('../renderer/store/vuex-electron-ipc.js')

registerVuexHub()

// import '../renderer/store'
const appDir = app.getPath('home')

import localServer from './localServer.js'
localServer(appDir)

const server = 'http://127.0.0.1:5432'
const feed = `${server}/queryversion/update/${process.platform}/${version}`
console.log('更新url:', feed)


//const tempPath = app.getPath('temp')

// autoUpdater.checkForUpdates()
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

const liveURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080/#live` :
  `file://${__dirname}/index.html#live`

const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/logo.png'))

function hack_referer_header(details) {

  let replace_referer = true;
  let replace_origin = true;
  let add_referer = true;
  let add_origin = true;
  var referer_value = '';

  if (details.url.indexOf("://music.163.com/") != -1) {
    referer_value = "http://music.163.com/";
  }
  if (details.url.indexOf("://gist.githubusercontent.com/") != -1) {
    referer_value = "https://gist.githubusercontent.com/";
  }

  if (details.url.indexOf("api.xiami.com/") != -1 || details.url.indexOf('.xiami.com/song/playlist/id/') != -1) {
    referer_value = "https://www.xiami.com/";
  }

  if ((details.url.indexOf("y.qq.com/") != -1) ||
    (details.url.indexOf("qqmusic.qq.com/") != -1) ||
    (details.url.indexOf("music.qq.com/") != -1) ||
    (details.url.indexOf("imgcache.qq.com/") != -1)) {
    referer_value = "http://y.qq.com/";
  }
  if (details.url.indexOf(".kugou.com/") != -1) {
    referer_value = "http://www.kugou.com/";
  }
  if (details.url.indexOf(".kuwo.cn/") != -1) {
    referer_value = "http://www.kuwo.cn/";
  }
  if (details.url.indexOf(".bilibili.com/") != -1) {
    referer_value = "http://www.bilibili.com/";
    replace_origin = false;
    add_origin = false;
  }
  if (details.url.indexOf('.migu.cn') !== -1) {
    referer_value = 'http://music.migu.cn/v3/music/player/audio?from=migu';
  }

  var isRefererSet = false;
  var isOriginSet = false;
  var headers = details.requestHeaders,
    blockingResponse = {};

  for (var i = 0, l = headers.length; i < l; ++i) {
    if (replace_referer && (headers[i].name == 'Referer') && (referer_value != '')) {
      headers[i].value = referer_value;
      isRefererSet = true;
    }
    if (replace_origin && (headers[i].name == 'Origin') && (referer_value != '')) {
      headers[i].value = referer_value;
      isOriginSet = true;
    }
  }

  if (add_referer && (!isRefererSet) && (referer_value != '')) {
    headers["Referer"] = referer_value;
  }

  if (add_origin && (!isOriginSet) && (referer_value != '')) {
    headers["Origin"] = referer_value;
  }

  details.requestHeaders = headers;
};


async function createWindow() {
  /**
   * Initial window options
   */
  const filter = {
    urls: ["*://music.163.com/*", "*://*.xiami.com/*", "*://i.y.qq.com/*", "*://c.y.qq.com/*", "*://*.kugou.com/*", "*://*.kuwo.cn/*", "*://*.bilibili.com/*", "*://*.migu.cn/*", "*://*.githubusercontent.com/*",
      "https://listen1.github.io/listen1/callback.html?code=*"
    ]
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, function (details, callback) {
    console.log("hack header")
    hack_referer_header(details);
    callback({
      cancel: false,
      requestHeaders: details.requestHeaders
    });
  });

  // console.log('ico:', icon)
  //const appIcon = new Tray(icon)
  mainWindow = new BrowserWindow({
    title: '控制台: ' + version,
    height: 1024,
    width: 1280,
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
ipcMain.on('openLive', (event, screen) => {
  
  let height = screen.h
  let width = screen.w

  LiveWindow = new BrowserWindow({
    // parent:mainWindow,
    title: '直播窗口',
    width,
    height,
    minWidth: width,
    minHeight: height,
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
  // ipcMain.on('changeScreen', () => {
  //   if (!LiveWindow) return
           
  //   let screenAspect = LocalStore.get('screenAspect')
    
  //   let screen = LocalStore.get('screenResolution')
           
    
  //   let height = screenAspect == 0 ? 1152 : 720
  //   let width = screenAspect == 0 ? 720 : 1152

  //   LiveWindow.setMinimumSize(width, height)
  //   LiveWindow.setSize(width, height)
  // })
  ipcMain.on('changeScreen', () => {
    if (!LiveWindow) return
    let screen = LocalStore.get('screenResolution')
    console.log("change livewindow size:",screen)
    screen.w = Number(screen.w)
    screen.h = Number(screen.h)
    LiveWindow.setMinimumSize(screen.w, screen.h)
    LiveWindow.setSize(screen.w, screen.h)
  })
  // LiveWindow.webContents.setFrameRate(30)

  LiveWindow.on('close', () => {
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
ipcMain.on('party3', (e, m) => {
  let param = JSON.parse(m)
  if (param.cmd == 'play') {
    if (LiveWindow) {
      LiveWindow.webContents.send('party3play', param)
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
/*
引用项目： vuex-electron-ipc
来源： npm
原作者：Yousef Sultan <yousef.su.2000@gmail.com

修改了一点，就是把subscribe改为subscribeAction，同时把commit改为dispatch, 这样才适用多module的情况
*/

const VUEX_MUTATION = 'VUEX_MUTATION'

function registerVuexHub () {
  const { BrowserWindow, ipcMain } = require('electron')

  ipcMain.on(VUEX_MUTATION, (event, mutation) => {
    const originWindow = event.sender.getOwnerBrowserWindow()
    const windows = BrowserWindow.getAllWindows()

    for (let win of windows)
    // Loose equals is intended, idk why Electron does this uh.
    {
      if (win.id != originWindow.id) { win.webContents.send(VUEX_MUTATION, mutation) }
    }
  })
}

function registerVuexNode (store) {
  const { ipcRenderer } = require('electron')

  store.subscribeAction((mutation) => {
    if (!mutation.payload || !mutation.payload.__IPC_MUTATION) { ipcRenderer.send(VUEX_MUTATION, mutation) }
  })

  ipcRenderer.on(VUEX_MUTATION, (event, mutation) => {
    store.dispatch(mutation.type, {
      ...mutation.payload || [],
      __IPC_MUTATION: true
    })
  })
}
export {
  registerVuexHub,
  registerVuexNode
}

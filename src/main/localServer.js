
var fs = require('fs')
const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const WebSocket = require('ws')

var app = express()

const ms = require('mediaserver')

var _LinkerList = []

process.on('uncaughtException', error => {
  console.log(error)
})

function startMusicServer (appDir) {
  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*') // 开发用，因为本地开发时这个地址
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
  }
  app.use(allowCrossDomain)

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  app.use('/file', function (req, res) { // 播放本地媒体
    var filePath = req.url
    filePath = decodeURIComponent(filePath)

    filePath = filePath.split('=')[1]
    console.log('准备文件：', filePath)

    if (!filePath) return

    if (!fs.existsSync(filePath)) {
      return res.end({
        code: 0,
        msg: 'no find file'
      })
    }

    ms.pipe(req, res, filePath)
  })

  app.use('/plugindir', function (req, res) {
    if (req.query.add) {
      let name = req.query.name
      let dir = decodeURIComponent(req.query.dir)
      console.log('本地插件地址:', name, dir)
      app.use('/plugin/' + name, express.static(dir))
      res.send('add ok')
    } else if (req.query.del) {
      let path = '/plugin/' + req.query.name
      app._router.stack.some((item, index) => {
        if (item.name == 'serveStatic' && item.regexp.test(path)) {
          app._router.stack.splice(index, 1)
          console.log('删除本地插件路由：', path)
          return true
        }
      })
      res.send('del ok')
    }
  })

  console.log('启动本地服务器：', 5432)
  var server = http.createServer(app)
  const wss = new WebSocket.Server({
    server
  })

  function getUrlkey (url) {
    var params = {}
    var urls = url.split('?')
    var arr = urls[1].split('&')
    for (var i = 0, l = arr.length; i < l; i++) {
      var a = arr[i].split('=')
      params[a[0]] = a[1]
    }
    return params
  }

  wss.on('connection', function connection (ws, req) {
    //console.log('connection:', req.url)

    let query = getUrlkey(req.url)

    if (query.bManage != undefined && query.name != undefined) {
      let has = _LinkerList.some(item => {
        if (item.name == query.name) {
          //console.log('添加链接:', query)
          if (query.bManage == 'true') {
            item.manager = ws
          } else {
            item.client = ws
          }
          return true
        }
      })
      if (!has) {
        //console.log('插入链接:', query)
        _LinkerList.push({
          name: query.name,
          manager: query.bManage == 'true' ? ws : null,
          client: query.bManage == 'true' ? null : ws
        })
      }
    }

    ws.on('message', function incoming (message) {
      let msg = JSON.parse(message)
       console.log("ws 服务器收到信息：", msg)
      _LinkerList.some(item => {
        if (msg.name == item.name) {
          if (msg.bManage) {
            console.log("转发给client:",!!item.client)
            if (item.client)item.client.send(message) // 管理发来的消息直接转发给客户
          } else {
            console.log("转发给manage:",!!item.manager)
            if (item.manager)item.manager.send(message) // 反之客户发来的消息直接转发给管理
          }
        }
      })
    })

    ws.on('close', (code) => {
      _LinkerList.some((item, index) => {
        if (item.manager == ws) { // 只要一端关闭，则另一端也主动关闭
          item.manager = null
          // item.client.close()
          _LinkerList.splice(index, 1)
          console.log('ws 链接关闭：', item.name, _LinkerList.length)
          return true
        } else if (item.client == ws) {
          item.client = null
          // item.manager.close()
          _LinkerList.splice(index, 1)
          console.log('ws 链接关闭：', item.name, _LinkerList.length)
          return true
        }
      })
    })
  })

  server.listen(5432, () => {
    console.log('Express server listening on port: %s', 5432)
  })
  return server
}

export default startMusicServer

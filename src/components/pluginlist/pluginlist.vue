<template>
<div class="pluginbk">
    <div class="plugintoolbar">
        <el-button class="btntitle" @click="onImportPlugin">本地插件</el-button>
    </div>
    <el-row id="pluginview" style="overflow:auto;">
        <el-col :span="8" v-for="(item,index) in pluginList" :key="item.name" :xs=12 :md=6>
            <el-card :style="{ margin: '0 4px' }">
                <el-image class="image" :src="item.image" fit="contain"></el-image>

                <div style="padding: 10px;">
                    <div class="bottom clearfix">
                        <span class="name">{{ item.name}}</span>
                        <el-button type="text" :id="index" class="button" @click="onSelect(index)">选用</el-button>
                    </div>
                    <span style="color:#999;">{{item.comment}}</span>
                </div>
            </el-card>
        </el-col>
    </el-row>
</div>
</template>

<script>
var fs = require('fs')
import { Loading } from 'element-ui';
export default {
  name: 'pluginlist',
  data () {
    return {
      currentRow: null,
      pluginList: []
    }
  },
  mounted () {
    let loading = Loading.service({
      target:"#pluginview",
      text:"正拉取插件列表(可能被墙）",
      background:"rgba(0, 0, 0, 0.8)"
    })
    this.$http.get('https://hongbing2017.github.io/stageplugin/pluginlist.json')
      .then((res) => {
        loading.close()
        if (res.status == 200) {
          //console.log('pluginlist:', res.data)
          let list = res.data
          this.pluginList = list.map(item => {
            return {
              name: item.name,
              comment: item.comment,
              image: `https://hongbing2017.github.io/stageplugin/${item.name}/cover.png`
            }
          })
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  watch: {

  },
  methods: {
    async onImportPlugin () {
      let r = await this.$electron.remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      if (r.canceled) return
      let dir = r.filePaths[0]

      r = fs.existsSync(dir + '/index.html')
      if (!r) {
        this.$message('无效插件：没有发现index.html')
        return
      }
      console.log('本地插件目录：', dir)
      this.$emit('selectPlugin', {
        type: 'local',
        info: dir
      })
      // LocalStore.set('songList', newList)
    },
    onSelect (id) {
      console.log('select plugin:', id)
      let item = this.pluginList[id]
      if (item) {
        this.$emit('selectPlugin', {
          type: 'online',
          info: item
        })
      }
    }
  }
}
</script>

<style scoped>
.image {
    width: 200px;
    height: 150px;
}

.pluginbk {
    border: 1px solid ddd;
    height: 600px;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.plugintoolbar {
    height: 40px;
    width: 100%;
    font-size: 12px;
    line-height: 40px;
    flex: none;
    display: flex;
    margin: 8px 0;
}

.btntitle {
    width: 120px;
    height: 40px;
    flex: none;
    margin-left: 4px;
}

.listview {
    width: 100%;
    flex: auto;
    overflow: auto;
}

.name {
    font-weight: bold;
}
</style>

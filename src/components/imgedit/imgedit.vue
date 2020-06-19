<template>
<div class="imgbk">
    <div class="imgtoolbar">
        <el-button class="imgtitle" icon="el-icon-picture-outline" @click="onSelecImg">图片</el-button>
        <!-- <el-select class='imgtitle' v-model="curEffect" placeholder="特效">
            <el-option v-for="item in effectList" :key="item" :label="item" :value="item">
            </el-option>
        </el-select> -->
         <el-button class="imgtitle" icon="el-icon-picture-outline" @click="imgUrlList=[]">清除</el-button>
         <div style="padding:0 10px;">如果一次选择多张照片将自动以幻灯片形式展示</div>
    </div>

    <div class='imgedit'>
        <img v-for="item in imgUrlList" :src="item" :key="item" crossorigin="anonymous">
    </div>
</div>
</template>

<script>
export default {
  name: 'imgedit',
  data () {
    return {
      imgUrlList: [],
      curEffect: '',
      effectList: ['无特效', '幻灯片']
    }
  },
  computed: {

  },
  watch: {

  },
  methods: {
    async onSelecImg () {
      let r = await (this.$electron.remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
          name: '图片',
          extensions: ['jpg', 'png', 'gif', 'bmp', 'svg']
        }]
      }))
      if (r.canceled) return
      r = r.filePaths[0]
      let p = r.lastIndexOf('\\')
      let name = r.slice(p + 1)

      this.imgUrlList.push('http://127.0.0.1:5432/file/?url=' + r)
      console.log('图片:', this.imgUrlList)
    }
  }
}
</script>

<style scoped>
.imgbk {
    border: 1px solid #ddd;
    height: 300px;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.imgtoolbar {
    height: 40px;
    width: 100%;
    font-size: 12px;
    line-height: 40px;
    flex: none;
    display: flex;

}


.imgtitle {
    width: 80px;
    height: 40px;
    flex: none;
    margin-left: 4px;
}

.imgedit {
    width: 100%;
    flex: auto;
    overflow: auto;
}
</style>

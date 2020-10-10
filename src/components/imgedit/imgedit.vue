<template>
  <div class="imgbk">
    <div class="imgtoolbar">
      <el-button class="imgtitle" icon="el-icon-picture-outline" @click="onSelecImg">图片</el-button>
      <!-- <el-select class='imgtitle' v-model="curEffect" placeholder="特效">
            <el-option v-for="item in effectList" :key="item" :label="item" :value="item">
            </el-option>
      </el-select>-->
      <el-button class="imgtitle" icon="el-icon-picture-outline" @click="imgUrlList=[]">清除</el-button>
      <div style="padding:0 10px;">如果一次选择多张照片将自动以幻灯片形式展示</div>
    </div>

    <div class="imgedit" @onpaste="onPaste">
      <img v-for="item in imgUrlList" :src="item" :key="item" crossorigin="anonymous" />
    </div>
  </div>
</template>

<script>
const fs = require('fs')
var os = require('os');
var tempDir = os.tmpdir();
console.log("tempDir:",tempDir)
export default {
  name: "imgedit",
  data() {
    return {
      imgUrlList: [],
      curEffect: "",
      effectList: ["无特效", "幻灯片"]
    };
  },
  mounted:function(){
    document.querySelector('.imgedit').addEventListener('paste',this.onPaste)

  },
  computed: {},
  watch: {},
  methods: {
    onPaste(event) {
      console.log("onpaste")
      var items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];

        if (item.type.indexOf("image") != -1) {
          var file = item.getAsFile();
          console.log(file);
          let filePath = tempDir+ '\\'+ Date.now()+file.name
          console.log("filePath:",filePath)
          
          var reader = new FileReader();  
          reader.onload=()=>{
            fs.writeFileSync(filePath,Buffer.from(reader.result));
            this.imgUrlList.push("http://127.0.0.1:5432/file/?url=" + filePath);
          }
          reader.readAsArrayBuffer(file); 
             
        }
      }
    },
    async onSelecImg() {
      let r = await this.$electron.remote.dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "图片",
            extensions: ["jpg", "png", "gif", "bmp", "svg"]
          }
        ]
      });
      if (r.canceled) return;
      r = r.filePaths[0];
      let p = r.lastIndexOf("\\");
      let name = r.slice(p + 1);

      this.imgUrlList.push("http://127.0.0.1:5432/file/?url=" + r);
      console.log("图片:", this.imgUrlList);
    }
  }
};
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

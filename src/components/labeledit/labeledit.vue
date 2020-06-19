<template>
<div class="labelbk" :style="info.bNeonEffect?'height:500px;':''">
    <div class="toolbar">
        <el-select class="fontSize" v-model="info.fontSize" placeholder="字号">
            <el-option v-for="item in fontSizeList" :key="item" :label="item" :value="item">
            </el-option>
        </el-select>
        <el-select class='fontName' v-model="info.fontName" placeholder="字体">
            <el-option v-for="item in fontFamilyList" :key="item" :value="item">
            </el-option>
        </el-select>
        <div class="fontColor">
            <span for="fontColor">字符色</span>
            <el-color-picker name="fontColor" v-model="info.fontColor" :predefine="predefineColors"></el-color-picker>
        </div>

        <div class="fontBKColor"><span for="fontBKColor">背景色</span>
            <el-color-picker name="fontBKColor" 　v-model="info.fontBkColor" :predefine="predefineColors"></el-color-picker>
        </div>

    </div>
    
    <div contenteditable="true" class="edit" id='edit' placeholder="请输入文字" :style="{'font-size':info.fontSize,'font-family':info.fontName,'color':info.fontColor}"> </div>
    
</div>
</template>

<script>

export default {
  name: 'labeledit',
  data () {
    return {
      info: {
        text: '',
        fontSize: '28px',
        fontName: '微软雅黑',
        fontColor: '#FFF',
        fontBkColor: ''
      },

      fontSizeList: [
        '18px',
        '22px',
        '28px',
        '32px',
        '42px',
        '56px'
      ],
      fontFamilyList: [
        '微软雅黑',
        '宋体',
        '楷体',
        '黑体',
        '华文彩云',
        '方正舒体',
        '方正姚体',
        '华文琥珀',
        '华文隶书',
        '华文行楷',
        '华文新魏'
      ],
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ]
    }
  },
  mounted () {
    let el = document.querySelector('#edit')

    el.addEventListener('DOMSubtreeModified', (e) => {
      // console.log('编辑内容：', e.currentTarget.innerHTML)
      let text = e.currentTarget.innerHTML.replace(/^\s+|\s+$/g, '')
      this.info.text = text
    })
  },
  computed: {

  },
  watch: {

    fontBkColor () {
      document.getElementById('edit').focus()
      document.execCommand('selectAll')
      document.execCommand('backColor', false, this.fontBkColor)
      document.execCommand('unselect')
    }
  },
  methods: {

  }
}
</script>

<style scoped>
.labelbk {
    border: 1px solid ddd;
    height: 300px;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.toolbar {
    height: 40px;
    width: 100%;
    font-size: 12px;
    line-height: 40px;
    flex: none;
    display: flex;
    margin: 5px 0;

}

.toolbar span {
    height: 40px;
    vertical-align: top;
    display: inline-block;

}

.fontSize,
.fontColor,
.fontBKColor {
    width: 100px;
    height: 100%;
    flex: none;
}

.fontName {
    width: 40px;
    height: 100%;
    flex: auto;
    margin: 0 10px;
}

.title {
    width: 40px;
    height: 40px;
    flex: none;
    margin-left: 4px;
}

.edit {
    width: 100%;
    height: 200px;
    flex: auto;
    overflow: auto;
    background: #333;
    padding: 4px;
}

.effectview {
    width: 100%;
    border: 1px solid #ddd;
    flex: auto;
    overflow: auto;
}

.effectview span {
    padding-right: 10px;
    display: inline-block;
    width: 200px;
    padding: 4px 0;
}

.paramrow {
    width: 100%;
    margin: 5px 10px;
}

.glow {
    width: 400px;
}
</style>

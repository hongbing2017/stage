<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'musiclive'
  }
</script>

<style lang="scss">

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html{
  height:100%;
  width: 100%;
  min-width: 1000px;
  min-height: 600px;
}
body {
    font-family: 'Source Sans Pro', sans-serif;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

#app{
  height:100%;
}
  /* CSS */
</style>

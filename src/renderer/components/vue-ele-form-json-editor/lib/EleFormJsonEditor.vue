<template>
  <v-jsoneditor
    :class="desc.class"
    :style="desc.style"
    @input="handleChange"
    v-bind="attrs"
    v-model="newValue"
    v-on="desc.on"
  />
</template>

<script>
//import VJsoneditor from '~/components/v-jsoneditor/dist/v-jsoneditor.min.js'
import VJsoneditor from 'v-jsoneditor'
import formMixin from 'vue-ele-form/lib/mixins/formMixin'

export default {
  name: 'json-editor',
  mixins: [formMixin],
  props: {
    value: [Array, Object]
  },
  data () {
    return {
      defaultAttrs: {
        plus: false,
        height: '400px'
      }
    }
  },
  components: {
    VJsoneditor
  }
}
</script>

<style>
.jsoneditor-container.min-box {
  min-width: auto !important;
}
</style>

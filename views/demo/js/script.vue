<template>
  <div>{{ message }}</div>
  <Demo />
</template>

<script>
export default {
  import Demo from './demo.vue'

  const app = new Vue({
    el: '#app',
    components: {
      Demo,
    },
    data: {
      message: 'Hello Vue!'
    }
  })
}
</script>
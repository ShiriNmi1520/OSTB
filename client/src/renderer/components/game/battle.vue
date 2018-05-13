<template>
  <b-container>
    <p>battle test</p>
    <b-btn primary @click="backToMain">back to main</b-btn>
  </b-container>
</template>

<script>
  export default {
    name: 'battle',
    data() {
      return {
        view: 'battle',
      };
    },
    methods: {
      backToMain() {
        const vm = this;
        vm.view = 'main';
        vm.$emit('updateViewStatus', vm.view);
      },
    },
  };
</script>

<style scoped>

</style>
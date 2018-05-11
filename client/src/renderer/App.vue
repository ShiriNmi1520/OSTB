<template>
  <div id="app">
    <el-row>
      <el-button round @click="test">Round</el-button>
      <el-button type="primary" round>Primary</el-button>
      <el-button type="success" round>Success</el-button>
      <el-button type="info" round>Info</el-button>
      <el-button type="warning" round>Warning</el-button>
      <el-button type="danger" round>Danger</el-button>
    </el-row>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'my-project',
    sockets: {
      connect() {
        console.log('測試成功');
      },
      test(data) {
        console.log(data);
      },
    },
    methods: {
      test() {
        const vm = this;
        vm.$socket.emit('test', '測試');
      },
    },
  };
</script>

<style>
  /* CSS */
</style>

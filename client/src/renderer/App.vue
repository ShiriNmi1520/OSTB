<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'vplu',
    sockets: {
      connect() {
        console.log('login success');
      },
    },
  };
</script>

<style>
  /* CSS */
  .main-block {
    position: absolute;
    height: 30rem;
    width: 20rem;
    background-color: rgba(27, 27, 27, 0.5);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .btn-red {
    background-color: #FF6773;
    border-color: #FF6773;
  }

  .btn-red:hover {
    background-color: #903940;
    border-color: #903940;
  }

  .darkTheme {
    background-color: #303133;
    color: #F0F8FF;
  }
</style>

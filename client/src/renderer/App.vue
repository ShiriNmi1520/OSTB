<template>
  <div id="app" class="body darkTheme">
    <router-view :login-message="loginStatus"></router-view>
  </div>
</template>

<script>
  export default {
    name: 'vplu',
    sockets: {
      connect() {
        console.log('login success');
      },
      test(data) {
        console.log(data);
      },
      auth(data) {
        const vm = this;
        vm.loginStatus = data;
      },
    },
    data() {
      return {
        res: '',
        view: 'login',
        loginStatus: {},
      };
    },
    methods: {
      signOut() {
        const vm = this;
        vm.login = false;
      },
    },
  };
</script>

<style lang="less">
  @mainRed: #ffa767;
  @hoverRed: #936236;
  @mainBlack: #303133;
  body {
    height: 100%;
    width: 100%;
  }
  /* CSS */
  .main-block {
    position: absolute;
    height: 30rem;
    width: 20rem;
    background-color: rgba(27, 27, 27, 0.5);
    border-radius: 7px;
    box-shadow: 0 .5px 15px 1px rgba(0,0,0,0.2);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .body {
    height: 100%;
    width: 100%;
    position: fixed;
  }
  .btn-red {
    background-color: @mainRed;
    border-color: @mainRed;
  }

  .btn-red:hover {
    background-color: @hoverRed;
    border-color: @hoverRed;
  }

  .darkTheme {
    background-color: @mainBlack;
    color: #F0F8FF;
  }
</style>

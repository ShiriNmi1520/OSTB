<template>
  <div class="body darkTheme">
    <div class="main-block container">
      <h1 class="text-center mt-4">登入</h1>
      <b-row>
        <b-col sm="8" offset="2" class="mt-4">
          <b-btn class="btn-red" style=" width:100%;" @click="signUp">新玩家？請註冊ㄛ</b-btn>
        </b-col>
      </b-row>
      <b-row class="mt-4">
        <b-col sm="12" class="text-center">- or -</b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2" class="mt-4 mb-4">
          <b-form-input class="darkTheme" placeholder="請輸入帳號" v-model="account"></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2" class="mb-2">
          <b-form-input class="darkTheme" placeholder="請輸入密碼" v-model="password"></b-form-input>
        </b-col>
        <b-col sm="8" offset="2" class="mb-2">
          <p class="text-center text-danger">{{logErr}}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2">
          <b-btn class="mb-4 btn-red" style=" width:100%;" @click="login">登入</b-btn>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2" class="mb-4">
          <b-btn style="width: 100%;" class="mb-4">忘記密碼</b-btn>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'login',
    props: ['test'],
    data() {
      return {
        view: 'login',
        account: '',
        password: '',
        logErr: '',
      };
    },
    methods: {
      login() {
        const vm = this;
        vm.$socket.emit('auth', { email: vm.account, password: vm.password });
        vm.$emit('updateViewStatus', 'main');
      },
      signUp() {
        const vm = this;
        vm.view = 'signUp';
        vm.$emit('updateViewStatus', vm.view);
      },
    },
  };
</script>

<style scoped>
  * {
    position: relative;
  }

  .body {
    height: 100%;
    width: 100%;
    position: fixed;
  }

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
<template>
  <div class="body darkTheme">
    <div class="main-block container">
      <h1 class="text-center mt-4">註冊</h1>
      <b-row>
        <b-col sm="8" offset="2" class="mt-4 mb-4">
          <b-form-input class="darkTheme" placeholder="請輸入Email" v-model="account"></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2" class="mb-4">
          <b-form-input type="password" class="darkTheme" placeholder="請輸入密碼" v-model="password"></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2">
          <b-form-input type="password" class="darkTheme mb-2" placeholder="請再輸入一次密碼" v-model="passwordSec"></b-form-input>
        </b-col>
        <b-col sm="8" offset="2" class="mb-4">
          <p class="text-center text-danger">{{secIncorrect}}</p>
          <p class="text-center text-danger">{{regErr}}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2">
          <b-btn class="mb-4 btn-red" style=" width:100%;" @click="signIn">加入我們！</b-btn>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" offset="2" class="mb-4">
          <b-btn style="width: 100%;" @click="backToLogin">已經有帳號？</b-btn>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  const EMAILRULE = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  export default {
    name: 'signup',
    data() {
      return {
        account: '',
        password: '',
        passwordSec: '',
        view: '',
        regErr: '',
      };
    },
    methods: {
      signIn() {
        const vm = this;
        const success = vm.account.search(EMAILRULE);
        if (success !== -1) {
          vm.$socket.emit('register', { email: vm.account, password: vm.password });
        } else {
          vm.regErr = 'email 格式有誤';
        }
      },
      backToLogin() {
        const vm = this;
        vm.view = 'login';
        vm.$emit('updateViewStatus', vm.view);
      },
    },
    computed: {
      secIncorrect() {
        const vm = this;
        if (vm.passwordSec !== '') {
          if (vm.password !== vm.passwordSec) {
            return '兩次的密碼不一樣。';
          }
        }
        return '';
      },
    },
  };
</script>

<style scoped>
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

  .body {
    height: 100%;
    width: 100%;
    position: fixed;
  }
</style>
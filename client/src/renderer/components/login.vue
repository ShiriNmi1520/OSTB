<template>
  <div class="body">
    <fade-transition>
      <div class="main-block container" v-if="view === 'login'">
        <h1 class="text-center mt-4">ログイン</h1>
        <b-row>
          <b-col sm="8" offset="2" class="mt-4">
            <b-btn class="btn-red" style=" width:100%;" @click="gotoSignUp">新しい方？</b-btn>
          </b-col>
        </b-row>
        <b-row class="mt-4">
          <b-col sm="12" class="text-center">- それとも -</b-col>
        </b-row>
        <b-row>
          <b-col sm="8" offset="2" class="mt-4 mb-4">
            <b-form-input class="darkTheme" placeholder="アカウントを入力" v-model="account"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="8" offset="2" class="mb-2">
            <b-form-input type="password" class="darkTheme" placeholder="パスワードを入力" v-model="password"></b-form-input>
          </b-col>
          <b-col sm="8" offset="2" class="mb-2">
            <p class="text-center text-danger">{{logErr}}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="8" offset="2">
            <b-btn class="mb-4 btn-red" style=" width:100%;" @click="login">ログイン</b-btn>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="8" offset="2" class="mb-4">
            <b-btn style="width: 100%;" class="mb-4">パスワードを忘れ？</b-btn>
          </b-col>
        </b-row>
      </div>
    </fade-transition>
    <fade-transition>
      <div class="main-block container" v-if="view === 'signUp'">
        <h1 class="text-center mt-4">サインアップ</h1>
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
            <b-form-input type="password" class="darkTheme mb-2" placeholder="請再輸入一次密碼"
                          v-model="passwordSec"></b-form-input>
          </b-col>
          <b-col sm="8" offset="2" class="mb-4">
            <p class="text-center text-danger">{{secIncorrect}}</p>
            <p class="text-center text-danger">{{regErr}}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="8" offset="2">
            <b-btn class="mb-4 btn-red" style=" width:100%;" @click="signUp">我々にジョイン！</b-btn>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="8" offset="2" class="mb-4">
            <b-btn style="width: 100%;" @click="backToLogin">アカウント持つ方？</b-btn>
          </b-col>
        </b-row>
      </div>
    </fade-transition>
  </div>

</template>

<script>
  const EMAILRULE = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  export default {
    name: 'login',
    data() {
      return {
        view: 'login',
        account: '',
        password: '',
        logErr: '',
        regErr: '',
        passwordSec: '',
      };
    },
    props: {
      loginMessage: {
        type: Object,
        default: () => ({
          type: 'default',
          code: 'default',
        }),
      },
    },
    methods: {
      login() {
        const vm = this;
        vm.$socket.emit('auth', { email: vm.account, password: vm.password });
        vm.$emit('updateLoading', true);
        const loginPromise = new Promise((res, rej) => {
          setTimeout(() => {
            if (vm.loginMessage.type !== 'default') {
              res();
            } else if (vm.loginMessage.type === 'default') {
              rej();
            }
          }, 2000);
        });
        loginPromise
          .then(() => {
            if (vm.loginMessage.type === 'success') {
              vm.$emit('updateLoading', false);
              vm.$router.push({ name: 'main' });
              vm.loginMessage = {};
            } else if (vm.loginMessage.type === 'error' && vm.loginMessage.code === 'invalid-email') {
              vm.logErr = 'mail 格式不正。';
            }
          })
          .catch((err) => { console.log(err); });
      },
      gotoSignUp() {
        const vm = this;
        vm.view = 'signUp';
      },
      signUp() {
        const vm = this;
        const success = vm.account.search(EMAILRULE);
        if (success !== -1) {
          vm.$socket.emit('register', { email: vm.account, password: vm.password });
          vm.view = 'login';
          vm.$emit('updateViewStatus', vm.view);
        } else {
          vm.regErr = 'email 格式有誤';
        }
      },
      backToLogin() {
        const vm = this;
        vm.view = 'login';
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
    border-radius: 7px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
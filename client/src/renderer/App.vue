<template>
<div id="app" class="body darkTheme">
  <transition name="router-anim" mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
    <router-view :class='{"blur": loading}' @backToMain="getLoginStatus" @updateLoading="getLoadingStatus" @exitRoom="getRoomStatus" :loginStatus="loginStatus" :roomData="roomData" :chatAll="chat" :roomList="roomIdList" :game-id="inGameId" :clientId="socketId"
      :userStatus="userData"></router-view>
  </transition>
  <fade-transition>
    <div class="loading" v-if="loading">
      <b-btn v-if="test" @click="testLogin">test</b-btn>
      <div class="loadingBox">
        <div class="loadingItem-1"></div>
      </div>
    </div>
    <div class="loading" v-if="error">
      <h1 class="text-white">{{errorData}}</h1>
    </div>
    <div class="loading" v-if="battleLoading">
      <h1 class="text-white">等待防禦事件處理中</h1>
    </div>
    <b-btn class="test" v-if="test" @click="battleLifeTest()">lifeTest</b-btn>
  </fade-transition>
</div>
</template>

<script>

export default {
  name: 'vplu',
  sockets: {
    connect() {
      const vm = this;
      vm.loading = false;
      vm.$socket.emit('userStatus');
      vm.socketId = vm.$socket.io.engine.id;
    },
    error(data) {
      const vm = this;
      vm.error = true;
      vm.errorData = data;
    },
    test(data) {
      if (typeof (data) !== 'object') {
        console.log(data);
      } else {
        Object.keys(data).forEach((key) => {
          console.log(data[key]);
        });
      }
    },
    auth(data) {
      const vm = this;
      vm.loginStatus = data;
    },
    logout(data) {
      const vm = this;
      vm.loginStatus = data;
    },
    userStatus(data) {
      const vm = this;
      vm.userData = data.data;
      vm.socketIdTest = data.id;
    },
    createRoom(data) {
      const vm = this;
      console.log(data, 'createRoom');
      vm.roomData = data;
    },
    joinRoom(data) {
      const vm = this;
      console.log(data, 'joinRoom');
      vm.$set(vm.roomData, data);
    },
    InGameChat(data) {
      const vm = this;
      vm.chat.push(data);
    },
    getRoomList(data) {
      const vm = this;
      vm.roomIdList = data;
    },
    getGameId(data) {
      const vm = this;
      vm.inGameId = data;
    },
    updateRoomerStatus(data) {
      const vm = this;
      console.log(data.player, 'updateRoomerStatus');
      if (data.type === 'join') {
        vm.roomData = Object.assign({}, vm.roomData, {
          player: data.player,
        });
      } else if (data.type === 'exit') {
        console.dir(data);
        vm.roomData = Object.assign({}, vm.roomData, {
          player: data.player,
        });
      }
    },
    gameStart(data) {
      const vm = this;
      vm.$set(vm.roomData, 'battle', data);
      vm.$router.push({ name: 'battle' });
    },
    getBattleStatus(data) {
      const vm = this;
      vm.$set(vm.roomData, 'battle', data);
      // TODO: 接收戰鬥資料（玩家血量、手卡數量）
    },
    battleLoading() {
      const vm = this;
      vm.battleLoading = !vm.battleLoading;
    },
    disconnect() {
      const vm = this;
      vm.loading = true;
    },
  },
  data() {
    return {
      res: '',
      battleLoading: false,
      socketId: '',
      view: 'login',
      loginStatus: {},
      error: false,
      loading: true,
      userData: {},
      roomData: {
        battle: {
          playerStatus: [{}, {}, {}, {}],
        },
        host: false,
        id: '',
        nickName: '',
        player: {},
        readyStatus: false,
        room: '',
      },
      errorData: {},
      chat: [],
      roomIdList: [],
      test: false,
      inGameId: 0,
      socketIdTest: '',
    };
  },
  computed: {
    getLoggedStatus() {
      const vm = this;
      return (vm.userData.login === false && vm.$router.name !== 'login') || (vm.roomData === null && vm.$router.name !== 'login');
    },
  },
  methods: {
    signOut() {
      const vm = this;
      vm.login = false;
    },
    getLoginStatus(data) {
      const vm = this;
      vm.loginStatus = { type: data.type, code: data.code };
    },
    getLoadingStatus(data) {
      const vm = this;
      vm.loading = data;
    },
    getRoomStatus(data) {
      const vm = this;
      vm.roomData = data;
    },
    testLogin() {
      const vm = this;
      vm.$router.push({ name: 'main' });
      vm.loading = false;
    },
    battleLifeTest() {
      const vm = this;
      Object.keys(vm.roomData.battle.playerStatus).forEach((key) => {
        vm.roomData.battle.playerStatus[key].life = 1;
      });
    },
  },
};
  </script>

  <style lang="less">
    @import  '../../node_modules/animate.css/animate.css';
    @mainRed: #78C2C4;
    @hoverRed: #6699A1;
    @mainBlack: #303133;
    * {
      transition: .2s ease-in-out;
      text-decoration: none !important;
    }
    *::-webkit-scrollbar{
      width: 0 !important;
      height: 0 !important;
    }
    body {
      height: 100%;
      width: 100%;
    }
    .blur {
      filter: blur(5px);
    }
    .blockTheme() {
      border-radius: 7px;
      box-shadow: 0 .5px 15px 1px rgba(0, 0, 0, 0.2);
    }
    /* CSS */
    .main-block {
      position: absolute;
      height: 30rem;
      width: 20rem;
      background-color: rgba(27, 27, 27, 0.5);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .blockTheme();
    }

    .body {
      height: 100%;
      width: 100%;
      position: absolute;
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
      border: .2px;
    }
    .darkTheme:focus {
      background-color: @mainBlack;
      color: aliceblue;
    }
    .jumbotron {
      .blockTheme();
    }

    .center (@a, @b) {
      position: @a;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: @b;
      width: @b;
    }
    .loading {
      position: fixed;
      height: 100%;
      width: 100%;
      background-color: rgba(0,0,0,0.2);
    }
    .loadingBox {
      .center(fixed, 7rem);
      .blockTheme();
      background-color: rgba(255, 255, 255, 0.3);
      z-index: 99999;
    }

    .loadingItem-1 {
      .center(fixed, 4rem);
      background-color: transparent;
      border: 3px #F0F8FF solid;
      border-radius: 50%;
      border-right: 0;
      border-bottom: 0;
      margin: 0rem -2rem;
      top: calc(50% - 2rem);
      animation: loading .5s ease-in-out infinite alternate;
    }
    .list-group-item {
      color: #000;
    }
    @keyframes loading {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .test{
      position: fixed;
      z-index: 9999999999999;
    }
  </style>

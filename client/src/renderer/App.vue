<template>
  <div id="app" class="body darkTheme">
    <router-view :class='{"blur": loading}' @backToMain="getLoginStatus" @updateLoading="getLoadingStatus" @exitRoom="getRoomStatus" :loginStatus="loginStatus"
                 :roomData="roomData" :chatAll="chat" :roomList="roomIdList" :game-id="inGameId" :clientId="socketId" :userStatus="userData"></router-view>
    <fade-transition>
      <div class="loading" v-if="loading">
        <b-btn v-if="test" @click="testLogin">test</b-btn>
        <div class="loadingBox">
          <div class="loadingItem-1"></div>
          <b-button @click="testLogin">回家</b-button>
        </div>
      </div>
      <div class="loading" v-if="error">
        <h1 class="text-white">{{errorData}}</h1>
      </div>
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
          console.log(data);
          vm.roomData = data;
        },
        joinRoom(data) {
          const vm = this;
          console.log(data);
          vm.roomData = data;
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
          console.log(data.player);
          if (data.type === 'join') {
            vm.roomData.player = data.player;
          } else if (data.type === 'exit') {
            console.log(Object.keys(data.player));
            delete vm.roomData.player[Object.keys(data.player)];
          }
        },
        gameStart() {
          const vm = this;
          vm.$router.push({ name: 'battle' });
        },
        getBattleStatus(data) {
          console.log(data);
          // TODO: 接收戰鬥資料（玩家血量、手卡數量）
        },
        disconnect() {
          const vm = this;
          vm.loading = true;
        },
      },
      data() {
        return {
          res: '',
          socketId: '',
          view: 'login',
          loginStatus: {},
          error: false,
          loading: true,
          userData: {},
          roomData: {},
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
      },
    };
  </script>

  <style lang="less">
    @mainRed: #ffa767;
    @hoverRed: #936236;
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
  </style>

<template>
  <div id="app" class="body darkTheme">
    <router-view @backToMain="getLoginStatus" @updateLoading="getLoadingStatus" @exitRoom="getRoomStatus" :login-message="loginStatus"
                 :room-id="roomID" :chatAll="chat" :roomList="roomIdList"></router-view>
    <fade-transition>
      <div class="loadingBox" v-if="loading">
        <div class="loadingItem-1"></div>
      </div>
    </fade-transition>
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
        create_room(data) {
          const vm = this;
          vm.roomID = data;
        },
        InGameChat(data) {
          const vm = this;
          vm.chat.push(data);
        },
        getRoomId(data) {
          const vm = this;
          vm.roomIdList = data;
        },
      },
      data() {
        return {
          res: '',
          view: 'login',
          loginStatus: {},
          loading: false,
          roomID: '',
          chat: [],
          roomIdList: [],
        };
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
          vm.roomId = data;
        },
      },
    };
  </script>

  <style lang="less">
    @mainRed: #C05C48;
    @hoverRed: #86430E;
    @mainBlack: #474747;
    * {
      transition: .2s ease-in-out;
    }
    body {
      height: 100%;
      width: 100%;
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

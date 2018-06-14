<template>
  <div class="customContainer">
    <b-row class="justify-content-md-center">
      <b-col md="12">
        <div style="margin-top: -.5px" class="topContainer mb-5 p-3">
          <b-row>
            <b-col>
              <h1>{{getRoomData.room}}</h1>
            </b-col>
              <b-btn class="darkTheme" style="margin-left: -5rem;" lg @click="exitRoom">Exit</b-btn>
          </b-row>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="12" class="mt-3">
        <b-list-group>
          <b-list-group-item class="mainContainer mb-2" v-for="obj of getRoomData.player">{{obj.uid}}
          <span class="float-right" v-if="">🙆‍</span></b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6" class="mt-3">
        <div class="chatContainer p-3">
        <div class="chatContainer p-3">
          <div class="chatTextArea">
            <p v-for="message of chatAll">{{message.name}}: {{message.content}}</p>
          </div>
          <b-row class="chatFunctionArea justify-content-md-center">
            <b-col md="9">
              <b-form-input class="chatInputBox darkTheme" v-model="content"></b-form-input>
            </b-col>
            <b-col md="3">
              <b-button class="chatButton" @click="chat">Send</b-button>
            </b-col>
          </b-row>
        </div>
        </div>
      </b-col>
      <b-col md="6" class="mt-3">
        <div class="chatContainer">
          <b-jumbotron v-if="selfId.object.host === true" class="nav-red btn-click" @click="gameStart">
            <h1 class="text-center p-4">Game Start From<br><span class="asobu">Here</span></h1>
          </b-jumbotron>
          <b-jumbotron v-if="selfId.object.host === false" class="nav-red btn-click">
            <h1 class="text-center p-4">Ready for<br><span class="asobu">Game</span></h1>
          </b-jumbotron>
        </div>
      </b-col>
    </b-row>
    <div v-if="checkRoomIdIsEmptyOrNot">
      <b-btn @click="backToLogin()">back to login</b-btn>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'room',
    props: {
      chatAll: {
        type: Array,
      },
      roomData: {
        type: Object,
      },
      loginStatus: {
        type: Object,
      },
      clientId: {
        type: String,
      },
    },
    data() {
      return {
        content: '',
        getRoomData: {},
        selfId: {},
      };
    },
    methods: {
      chat() {
        const vm = this;
        vm.$socket.emit('InGameChat', { senderName: 'test', content: vm.content });
      },
      exitRoom() {
        const vm = this;
        vm.$socket.emit('exitRoom', { host: vm.selfId.object.host, roomId: vm.getRoomData.id, index: vm.selfId.key });
        vm.$emit('exitRoom', '');
        vm.$router.push({ name: 'main' });
      },
      ready() {
        const vm = this;
        vm.$socket.emit('inRoom_ready', 'uid');
      },
      gameStart() {
        const vm = this;
        vm.$socket.emit('gameStart', { host: vm.selfId.object.host, roomId: vm.getRoomData.id });
      },
      backToLogin() {
        const vm = this;
        vm.$router.push({ name: 'login' });
      },
    },
    computed: {
      checkRoomIdIsEmptyOrNot() {
        const vm = this;
        return vm.getRoomData.id === undefined;
      },
    },
    async created() {
      const vm = this;
      vm.$emit('updateLoading', true);
      function checkRoomDataIsEnterOrNot() {
        return new Promise((res) => {
          if (vm.getRoomData !== undefined) {
            res();
          } else {
            setTimeout(() => {
              checkRoomDataIsEnterOrNot();
            }, 1000);
          }
        });
      }
      await checkRoomDataIsEnterOrNot().then(() => {
        vm.getRoomData = vm.roomData;
        Object.keys(vm.getRoomData.player).forEach((key) => {
          if (vm.getRoomData.player[key].uid === vm.loginStatus.uid) {
            vm.selfId = { key, object: vm.getRoomData.player[key] };
            return { key, object: vm.getRoomData.player[key] };
          }
          return '';
        });
        vm.$emit('updateLoading', false);
      });
    },
    watch: {
      getRoomStatus() {
        const vm = this;
        vm.getRoomData = vm.roomData;
      },
    },
  };
</script>

<style lang="less" scoped>
  @mainRed: #ffa767;
  @hoverRed: #936236;
  @mainBlack: #303133;
  @mainBlackTrans: rgba(0,0,0,0.3);
  .blockTheme() {
    border-radius: 7px;
    box-shadow: 0 .5px 15px 1px rgba(0, 0, 0, 0.2);
  }
  * {
    position: relative;
  }
  .jumbotron {
    height: 100%;
  }
  .customContainer{
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
    position: relative;
  }
  .topContainer {
    margin-top: 2rem;
    position: relative;
    top: 20%;
    height: 10rem;
    width: 100%;
    background-color: rgba(0,0,0,0.3);
    .blockTheme();
  }
  .mainContainer {
    .blockTheme();
    background-color: @mainRed;
  }
  .chatContainer {
    .blockTheme();
    height: 20rem;
    background-color: @mainBlackTrans;
    position: relative;
  }
  .chatTextArea {
    position: absolute;
    height: 70%;
    width: 100%;
    overflow-y: scroll;
  }
  .chatTextArea::-webkit-scrollbar {
    width: 0 !important;
  }

    .chatFunctionArea {
    position: absolute;
    width: 100%;
    bottom: 10%;
  }
  .chatInputBox {
    .blockTheme();
  }
  .chatButton {
    .blockTheme();
    background-color: @mainRed;
    border-color: @mainRed;
    width: 100%;
    margin-left: -5px;
  }
  .asobu {
    font-size: 5rem;
  }
  .btn-click{
    background-color: @mainRed;
    transition: .2s ease-in-out;
  }
  .btn-click:active {
    background-color: @hoverRed;
    border-color: @hoverRed;
  }
</style>
<template>
  <div class="customContainer">
    <b-row class="justify-content-md-center">
      <b-col md="12">
        <div
          style="margin-top: -.5px"
          class="topContainer mb-5 p-3"
        >
          <b-row>
            <b-col>
              <h1>Room List</h1>
            </b-col>
            <b-btn
              class="darkTheme"
              style="margin-left: -5rem;"
              lg
              @click="backToMain"
            >
              back to main
            </b-btn>
          </b-row>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col
        v-for="(obj, index) in roomList"
        md="12"
        class="mt-3"
      >
        <b-btn
          v-b-toggle="'room' + index"
          block
          href="#"
          class="btn-click"
        >
          {{ obj.room }}
        </b-btn>
        <b-collapse
          :id="`room${index}`"
          accordion="my-accordion"
          role="tabpanel"
        >
          <b-btn
            class="btn-info mt-3 btn-lg"
            @click="joinRoom(index)"
          >
            Join
          </b-btn>
        </b-collapse>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  function waitForTwoSec(x) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(x);
      }, 3000);
    });
  }
  export default {
    name: 'RoomList',
    props: {
      roomList: {
        type: Object,
      },
      loginStatus: {
        type: Object,
      },
      clientId: {
        type: String,
      },
    },
    // data: () => ({
    //   join: '',
    // }),
    methods: {
      backToMain() {
        const vm = this;
        vm.$router.push({ name: 'main' });
      },
      async joinRoom(data) {
        const vm = this;
        vm.$socket.emit('joinRoom', { roomId: data, userId: vm.loginStatus.uid, socketId: vm.clientId });
        vm.$emit('updateLoading', true);
        vm.$emit('update');
        await waitForTwoSec(vm).then(() => {
          vm.$router.push({ name: 'game-room' });
          vm.$emit('updateLoading', false);
        });
      },
    },
  };
</script>

<style lang="less" scoped>
  @mainRed: #78C2C4;
  @hoverRed: #6699A1;
  @mainBlack: #2E294E;
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
    border-color: @mainRed;
    transition: .2s ease-in-out;
  }
  .btn-click:active {
    background-color: @hoverRed;
    border-color: @hoverRed;
  }
</style>

<template>
  <div class="customContainer">
    <b-row class="justify-content-md-center">
      <b-col md="12">
        <div style="margin-top: -.5px" class="topContainer mb-5 p-3">
          <b-row>
            <b-col>
              <h1>GAME_ROOM_NAME</h1>
            </b-col>
              <b-btn class="darkTheme" style="margin-left: -5rem;" lg @click="leaveRoom">退席</b-btn>
          </b-row>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="12" class="mt-3">
        <b-list-group>
          <b-list-group-item class="mainContainer mb-2">PLAYER1_NAME</b-list-group-item>
          <b-list-group-item class="mainContainer mb-2">PLAYER2_NAME</b-list-group-item>
          <b-list-group-item class="mainContainer mb-2">PLAYER3_NAME</b-list-group-item>
          <b-list-group-item class="mainContainer mb-2">PLAYER4_NAME</b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="6" class="mt-3">
        <div class="chatContainer p-3">123
          <b-row class="chatFunctionArea justify-content-md-center">
            <b-col md="9">
              <b-form-input class="chatInputBox darkTheme"></b-form-input>
            </b-col>
            <b-col md="3">
              <b-button class="chatButton">送信</b-button>
            </b-col>
          </b-row>
        </div>
      </b-col>
      <b-col md="6" class="mt-3">
        <div class="chatContainer">
          <b-jumbotron class="nav-red btn-click">
            <h1 class="text-center p-4">ゲームはここから<br><span class="asobu">開始</span></h1>
          </b-jumbotron>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'room',
    methods: {
      leaveRoom() {
        const vm = this;
        vm.$socket.emit('GameOver');
        vm.$router.push({ name: 'main' });
      },
    },
  };
</script>

<style lang="less" scoped>
  @mainRed: #C05C48;
  @hoverRed: #86430E;
  @mainBlack: #474747;
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
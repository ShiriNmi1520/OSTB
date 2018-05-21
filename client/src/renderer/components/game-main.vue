<template>
  <div class="body">
    <b-navbar class="nav-red" toggleable>
        <b-navbar-nav>
          <b-nav-item right href="#" @click="backToMain">登出</b-nav-item>
        </b-navbar-nav>
    </b-navbar>
    <fade-transition>
    <b-container>
      <b-row class="mt-5">
        <b-col sm="6">
          <b-jumbotron class="nav-red btn-click" @click="gotoRoomList">
          <h1 class="text-center">ゲームルーム<br><span class="asobu">探す</span></h1>
          </b-jumbotron>
        </b-col>
        <b-col sm="6">
          <b-jumbotron class="nav-red btn-click" @click="createRoom">
          <h1 class="text-center">プレーヤーと<br><span class="asobu">遊ぶ</span></h1>
        </b-jumbotron>
      </b-col>
      </b-row>
    </b-container>
    </fade-transition>
  </div>
</template>

<script>
  const waitForTwoSec = () => {
    setTimeout(() => {}, 2000);
  };
  export default {
    name: 'game-main',
    data() {
      return {
        view: 'main',
      };
    },
    props: {
      roomId: {
        type: String,
      },
    },
    methods: {
      gotoRoomList() {
        const vm = this;
        vm.$socket.emit('getRoomId');
        vm.$router.push({ name: 'game-room-list' });
      },
      backToMain() {
        const vm = this;
        vm.$emit('backToMain', { type: '', code: '' });
        vm.$router.push({ name: 'login' });
      },
      async createRoom() {
        const vm = this;
        const test = await waitForTwoSec();
        vm.$socket.emit('create_room');
        vm.$router.push({ name: 'game-room' });
        return test;
      },
    },
    watched: {},
  };
</script>
<style lang="less" scoped>
  @mainRed: #ffa767;
  @hoverRed: #936236;
  @mainBlack: #303133;
  .nav-red {
    background-color: @mainRed;
    border-color: @mainRed;
    color: #F0F8FF;
  }
  .btn-click{
    transition: .2s ease-in-out;
  }
  .btn-click:active {
    background-color: @hoverRed;
    border-color: @hoverRed;
  }
  .body {
    height: 100%;
    width: 100%;
    position: fixed;
    background-color: #303133;
    color: #F0F8FF;
  }
  .asobu {
    font-size: 5rem;
  }
</style>
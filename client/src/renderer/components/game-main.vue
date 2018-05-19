<template>
  <div class="body">
    <b-navbar class="nav-red" toggleable>
        <b-navbar-nav>
          <b-nav-item right href="#" @click="backToMain">登出</b-nav-item>
        </b-navbar-nav>
    </b-navbar>
    <b-container>
      <b-row class="mt-5">
        <b-col sm="6">
          <b-jumbotron class="nav-red btn-click" @click="gotoComBattle">
          <h1 class="text-center">コンピュータと<br><span class="asobu">遊ぶ</span></h1>
          </b-jumbotron>
        </b-col>
        <b-col sm="6">
          <b-jumbotron class="nav-red btn-click" @click="createRoom">
          <h1 class="text-center">プレーヤーと<br><span class="asobu">遊ぶ</span></h1>
        </b-jumbotron>
      </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  const waitForTwoSec = new Promise((res) => {
    setTimeout(() => {
      res();
    }, 2000);
  });
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
      gotoComBattle() {
        const vm = this;
        vm.$router.push({ name: 'battle' });
      },
      backToMain() {
        const vm = this;
        vm.$emit('backToMain', { type: '', code: '' });
        vm.$router.push({ name: 'login' });
      },
      createRoom() {
        const vm = this;
        vm.$socket.emit('create_room');
        waitForTwoSec.then(() => {
          if (vm.roomId !== '') {
            vm.$router.push({ name: 'game-room' });
          }
        });
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
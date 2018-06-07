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
          <b-jumbotron class="nav-red btn-click" v-b-modal.modal1>
          <h1 class="text-center">プレーヤーと<br><span class="asobu">遊ぶ</span></h1>
        </b-jumbotron>
          <b-modal class="text-dark" id="modal1" title="請輸入房間名稱？" @ok="createRoom">
            <b-form-input v-model="roomName" placeholder="房間名稱"></b-form-input>
          </b-modal>
      </b-col>
      </b-row>
      <b-btn @click="gotoBattle">test</b-btn>
      <h1 style="font-size: 5rem; color: #2490A9; margin: 15px;">早安窩ㄉ朋友 天氣一好， 天空就是藍ㄉ 認同請分享</h1>
    </b-container>
    </fade-transition>
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
    name: 'game-main',
    data() {
      return {
        view: 'main',
        loading: false,
        roomName: '',
      };
    },
    props: {
      roomId: {
        type: Object,
      },
      userStatus: {
        type: Object,
      },
      clientId: {
        type: String,
      },
    },
    methods: {
      async gotoRoomList() {
        const vm = this;
        vm.$socket.emit('getRoomId', { id: vm.clientId });
        vm.$emit('updateLoading', true);
        const wait = await waitForTwoSec().then(() => {
          vm.$emit('updateLoading', false);
          vm.$router.push({ name: 'game-room-list' });
        });
        return wait;
      },
      async createRoom() {
        const vm = this;
        vm.$emit('updateLoading', true);
        if (vm.roomName !== '') {
          vm.$socket.emit('createRoom', { roomId: vm.roomName, uid: vm.userStatus.uid });
          await waitForTwoSec().then(() => {
            vm.$emit('updateLoading', false);
            vm.$router.push({ name: 'game-room' });
          });
        }
      },
      backToMain() {
        const vm = this;
        vm.$emit('backToMain', { type: '', code: '' });
        vm.$socket.emit('logout');
        waitForTwoSec().then(() => {
          vm.$socket.emit('userStatus');
          vm.$router.push({ name: 'login' });
        });
      },
      gotoBattle() {
        const vm = this;
        vm.$router.push({ name: 'battle' });
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
  .darkTheme {
    background-color: @mainBlack;
    color: #F0F8FF;
    border: .2px;
  }
  .darkTheme:focus {
    background-color: @mainBlack;
    color: aliceblue;
  }
</style>
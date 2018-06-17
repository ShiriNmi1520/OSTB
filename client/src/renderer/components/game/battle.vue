<template>
<div class="body darkTheme">
  <h1>Now it's {{playerTurn}}'s turn</h1>
  <div class="main-block-battle">
    <div class="char">{{self}}</div>
    <div class="char char--p1">{{getPlayerId.p1}}</div>
    <div class="char char--p2">{{getPlayerId.p2}}</div>
    <div class="char char--p3">{{getPlayerId.p3}}</div>
    <b-btn primary @click="backToMain">back to main</b-btn>
    <b-btn @click="drawCard(5)">draw test</b-btn>
    <b-btn @click="turnEnd()">turn end</b-btn>
    <b-btn @click="showDefence">123</b-btn>
  </div>
  <b-row class="CardContainer justify-content-center">
    <b-col class="ml-2" sm="1" center v-for="(data, index) in roomData.battle.playerStatus[self].handCard">
      <b-dropdown dropup variant="link" size="lg" no-caret>
        <template slot="button-content" style="text-decoration: none !important;">
            <div class="mainCard" style="text-decoration: none !important;" :id="`Card${index}`">{{data}}</div>
          </template>
        <b-dropdown-item @click="getItemID(index)">more</b-dropdown-item>
        <b-dropdown-item @click="useCard(data)">use the card</b-dropdown-item>
      </b-dropdown>
    </b-col>
  </b-row>
  <b-row class="CardContainer CardContainer--p3 justify-content-center">
    <b-col sm="1" center>
      <div class="mainCard">カード<br><span class="text-warning h1">x{{roomData.battle.playerStatus[getPlayerId.p1].handCard.length}}</span></div>
    </b-col>
  </b-row>
  <b-row class="CardContainer CardContainer--p2 justify-content-center">
    <div class="mainCard">カード<br><span class="text-warning h1">x{{roomData.battle.playerStatus[getPlayerId.p2].handCard.length}}</span></div>
  </b-row>
  <b-row class="CardContainer CardContainer--p1 justify-content-center">
    <div class="mainCard">カード<br><span class="text-warning h1">x{{roomData.battle.playerStatus[getPlayerId.p3].handCard.length}}</span></div>
  </b-row>
  <div>
    <div>
      <b-modal header-class="text-dark" ref="selectPlayer" hide-footer title="Select Player">
        <div class="d-block text-center">
          <div class="block text-white" @click="selectPlayer(0)">Player 1</div>
          <div class="block text-white" @click="selectPlayer(1)">Player 2</div>
          <div class="block text-white" @click="selectPlayer(2)">Player 3</div>
          <div class="block text-white" @click="selectPlayer(3)">Player 4</div>
        </div>
      </b-modal>
    </div>
    <div>
      <b-modal header-class="text-dark" ref="useDefence" title="Battle Message">
        <div class="d-block text-center">
          <h1 class="text-dark">You have been hit! Do you want to use defence card?</h1>
        </div>
        <div slot="modal-footer" class="w-100">
          <b-btn success class="float-right">Yes</b-btn>
          <b-btn danger class="float-right">No</b-btn>
        </div>
      </b-modal>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'battle',
  props: {
    roomData: {
      type: Object,
    },
    loginStatus: {
      type: Object,
    },
  },
  data() {
    return {
      show: false,
      view: 'battle',
      self: 2,
    };
  },
  methods: {
    backToMain() {
      const vm = this;
      vm.$router.push({
        name: 'main',
      });
    },
    getItemID(data) {
      console.log(data);
    },
    useCard(data) {
      const vm = this;
      this.$refs.selectPlayer.show();
      vm.$socket.emit('useCard', data);
    },
    drawCard(data) {
      const vm = this;
      vm.$socket.emit('drawCard', data);
    },
    selectPlayer(data) {
      const vm = this;
      vm.$socket.emit('attack', data);
      this.$refs.selectPlayer.hide();
    },
    showDefence() {
      const vm = this;
      vm.$refs.useDefence.show();
    },
    turnEnd() {
      const vm = this;
      vm.$socket.emit('turnEnd');
    },
  },
  computed: {
    playerTurn() {
      const vm = this;
      let turn = '';
      Object.keys(vm.roomData.battle.playerStatus).forEach((key) => {
        if (vm.roomData.battle.playerStatus[key].turn === true) {
          turn = key;
        }
      });
      return turn;
    },
    getPlayerId() {
      const vm = this;
      const p1 = vm.self + 1 > 3 ? (vm.self - 4) + 1 : vm.self + 1;
      const p2 = vm.self + 2 > 3 ? (vm.self - 4) + 2 : vm.self + 2;
      const p3 = vm.self + 3 > 3 ? (vm.self - 4) + 3 : vm.self + 3;
      return {
        p1,
        p2,
        p3,
      };
    },
    test() {
      const vm = this;
      return typeof (vm.roomData.battle.playerStatus);
    },
    isSelfTurnOrNot() {},
  },
  created() {
    const vm = this;
    vm.$emit('updateLoading', true);
    function checkRoomDataIsResOrNot() {
      return new Promise((res) => {
        if (vm.roomData.battle !== undefined && vm.roomData.battle !== null) {
          res();
        } else {
          setTimeout(() => checkRoomDataIsResOrNot(), 1000);
        }
      });
    }
    async function getId() {
      await checkRoomDataIsResOrNot().then(() => {
        Object.keys(vm.roomData.battle.playerStatus).forEach((key) => {
          if (vm.roomData.battle.playerStatus[key].uid === vm.loginStatus.uid) {
            if (typeof (key) === 'string') {
              vm.self = parseInt(key, 0);
              vm.$emit('updateLoading', false);
            } else {
              vm.self = key;
              vm.$emit('updateLoading', false);
            }
          }
        });
      });
    }
    getId().catch((err) => {
      console.log(err);
      console.log(typeof (vm.roomData.battle.playerStatus));
    });
  },
};
</script>

<style lang="less" scoped>
@mainRed: #ffa767;
@hoverRed: #936236;
@mainBlack: #303133;
*::-webkit-scrollbar {
    width: 0;
}
.main-block-battle {
    position: absolute;
    height: 30rem;
    width: 50rem;
    background-color: rgba(0,0,0,0.3);
    border: 5px #FF6773 solid;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.char {
    position: absolute;
    height: 10rem;
    width: 6rem;
    bottom: 0;
    left: 50%;
    background-color: #fff;
    transform: translateX(-50%);
    color: #000;
}
.CardContainer {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 50%;
    transform: translateX(-53%);
}
.mainCard {
    height: 10rem;
    width: 6rem;
    margin-left: 10px;
    background-color: #fff;
    color: #000;
    transition: 0.2s ease-in;
}
.mainCard:hover {
    transform: scale(1.2);
}
.mainCardMenu {
    position: absolute;
    width: 6rem;
    height: 10rem;
    top: -100%;
    background-color: @mainRed;
}
.char--p3 {
    top: 50%;
    left: 4%;
    transform: translateY(-50%) rotate(-270deg);
}
.CardContainer--p3 {
    position: absolute;
    height: 100%;
    width: unset;
    top: calc(50% - 2px);
    bottom: unset;
    right: unset;
    left: 0;
    transform: translate(-280%, -56%) rotate(-270deg);
}
.char--p2 {
    top: 0;
    left: 50%;
    transform: translateX(-50%) rotate(-180deg);
}
.CardContainer--p2 {
    position: absolute;
    width: 100%;
    bottom: unset;
    top: 0;
    left: 50%;
    right: unset;
    transform: translate(-48%, -50%) rotate(-180deg);
}
.char--p1 {
    top: 50%;
    left: unset;
    right: 0;
    transform: translate(-35%,-50%) rotate(-90deg);
}
.CardContainer--p1 {
    height: 100%;
    width: unset;
    top: 50%;
    left: unset;
    right: 0;
    transform: translate(345%, -50%) rotate(-90deg);
}
.block {
    height: 100px;
    width: 100px;
    background-color: #000;
    display: inline-flex;
}
</style>

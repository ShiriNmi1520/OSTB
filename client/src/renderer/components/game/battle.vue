<template>
<div class="body darkTheme">
  <div class="turnBorad">
    <h1>Now it's {{playerTurn}}'s turn</h1>
  </div>
  <div class="main-block-battle">
    <div class="lifeContainer lifeContainer-self">
      <div class="life life-self" :style="{width: getSelfLife / 4 * 100 + '%',}">{{self}}</div>
    </div>
    <div class="lifeContainer lifeContainer-p1">
      <div class="life life-p1" :style="{height: getPOneLife / 4 * 100 + '%',}">{{getPlayerId.p1}}</div>
    </div>
    <div class="lifeContainer lifeContainer-p2">
      <div class="life life-p2" :style="{width: getPTwoLife / 4 * 100 + '%',}">{{getPlayerId.p2}}</div>
    </div>
    <div class="lifeContainer lifeContainer-p3">
      <div class="life life-p3" :style="{height: getPThreeLife / 4 * 100 + '%',}">{{getPlayerId.p3}}</div>
    </div>
  </div>
  <b-row class="CardContainer justify-content-center">
    <b-col class="ml-2" sm="1" center v-for="(data, index) in roomData.battle.playerStatus[self].handCard">
      <b-dropdown dropup variant="link" size="lg" no-caret>
        <template slot="button-content" style="text-decoration: none !important;">
            <div :class="'card_' + data" class="mainCard" style="text-decoration: none !important;" :id="`Card${index}`">{{data}}</div>
          </template>
        <b-dropdown-item @click="getItemID(index)">more</b-dropdown-item>
        <b-dropdown-item @click="useCard(data)">use the card</b-dropdown-item>
      </b-dropdown>
    </b-col>
  </b-row>
  <b-row class="CardContainer CardContainer--p3 justify-content-center">
    <b-col sm="1" center>
      <div class="mainCard">Player {{getPlayerId.p3}} <br>Card<br><span class="text-warning h1">x{{roomData.battle.playerStatus[getPlayerId.p3].handCard.length}}</span></div>
    </b-col>
  </b-row>
  <b-row class="CardContainer CardContainer--p2 justify-content-center">
    <div class="mainCard">Player {{getPlayerId.p2}} <br>Card<br><span class="text-warning h1">x{{roomData.battle.playerStatus[getPlayerId.p2].handCard.length}}</span></div>
  </b-row>
  <b-row class="CardContainer CardContainer--p1 justify-content-center">
    <div class="mainCard">Player {{getPlayerId.p1}} <br>Card<br><span class="text-warning h1">x{{roomData.battle.playerStatus[getPlayerId.p1].handCard.length}}</span></div>
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

    <div v-if="test" class="testBorad">
      <b-btn @click="lifeTest()">全體-1血量</b-btn>
      <b-btn primary @click="backToMain">back to main</b-btn>
      <b-btn @click="drawCard(5)">draw test</b-btn>
      <b-btn @click="turnEnd()">turn end</b-btn>
      <b-btn @click="showDefence">123</b-btn>
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
      test: false,
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
    lifeTest() {
      const vm = this;
      Object.keys(vm.roomData.battle.playerStatus).forEach((key) => {
        if (vm.roomData.battle.playerStatus[key] !== undefined) {
          vm.roomData.battle.playerStatus[key].life = 2;
        }
      });
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
    getSelfLife() {
      const vm = this;
      return vm.roomData.battle.playerStatus[`${vm.self}`].life;
    },
    getPOneLife() {
      const vm = this;
      return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p1}`].life;
    },
    getPTwoLife() {
      const vm = this;
      return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p2}`].life;
    },
    getPThreeLife() {
      const vm = this;
      return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p3}`].life;
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
@atk: #1b998b;
@def: #f5c93c;
@life: #D7263D;
.blockTheme() {
  box-shadow: 0 .5px 15px 1px rgba(0, 0, 0, 0.2);
}
*::-webkit-scrollbar {
  border-radius: 5px;
  background-color: rgba(255,255,255, 0.2);
  width: 0;
}
.main-block-battle {
  position: absolute;
  height: 30rem;
  width: 50rem;
  background-color: rgba(0,0,0,0.3);
  border: 5px @mainRed solid;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.life {
    position: absolute;
    bottom: 0;
    height: 3rem;
    width: 6rem;
    left: 50%;
    background-color: @life;
    transform: translateX(-50%);
    color: #000;
}
.life-self {
  width: 100%;
}
.life-p1 {
  left: unset;
  top: 50%;
  transform: translate(-157%, -50%);
  height: 100%;
}
.life-p2 {
  width: 100%;
}
.life-p3 {
  height: 100%;
  top: 50%;
  transform: translate(25%, -50%);
}
.lifeContainer {
  position: absolute;
}
.lifeContainer-self {
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  bottom: 0% !important;
}
.lifeContainer-p1 {
  height: 70%;
  right: -7% !important;
  left: unset;
  top: 50%;
  transform: translate(-157%, -50%);
}

.lifeContainer-p2 {
  width: 70%;
  top: 10% !important;
  left: 50%;
  transform: translateX(-50%);
}

.lifeContainer-p3 {
  height: 70%;
  left: -2.7% !important;
  top: 50%;
  transform: translate(24%, -50%);
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
  border-radius: 3px;
  .blockTheme();
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
.CardContainer--p2 {
  position: absolute;
  width: 100%;
  bottom: unset;
  top: 0;
  left: 50%;
  right: unset;
  transform: translate(-48%, -50%) rotate(-180deg);
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
.card_0{
  background-color: @atk !important;
}
.card_1{
  background-color: @def !important;
}
.turnBorad{
  position: relative;
  top: 0;
  left: 0;
  width: 30%;
  border-left: transparent;
  border-top: transparent;
  border-radius: 3px;
  background: @mainRed;
  padding: 15px;
  z-index: 0;
  .blockTheme();
  h1 {
    font-size: 2.5rem;
  }
}
.testBorad{
  z-index: 199999;
  button{
    z-index: 2000000;
  }
}
</style>

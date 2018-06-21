<template>
<div class="body darkTheme" v-if="roomData.battle.playerStatus">
  <div class="turnBorad">
    <h1>Now it's {{playerTurn}}'s turn</h1>
  </div>
  <div class="main-block-battle">
    <b-btn v-if="isSelfTurnOrNot" @click="turnEnd()">turn end</b-btn>
    <div class="lifeContainer lifeContainer-self">
      <div class="life life-self" :style="{width: getSelfLife / 4 * 100 + '%',}"><span>{{getSelfLife}}</span></div>
    </div>
    <div class="lifeContainer lifeContainer-p1">
      <div class="life life-p1" :style="{height: getPOneLife / 4 * 100 + '%',}"><span>{{getPOneLife}}</span></div>
    </div>
    <div class="lifeContainer lifeContainer-p2">
      <div class="life life-p2" :style="{width: getPTwoLife / 4 * 100 + '%',}"><span>{{getPTwoLife}}</span></div>
    </div>
    <div class="lifeContainer lifeContainer-p3">
      <div class="life life-p3" :style="{height: getPThreeLife / 4 * 100 + '%',}"><span>{{getPThreeLife}}</span></div>
    </div>
  </div>
  <b-row class="CardContainer justify-content-center">
    <b-col class="ml-2" sm="1" center v-for="(data, index) in roomData.battle.playerStatus[self].handCard">
      <b-dropdown dropup variant="link" size="lg" no-caret>
        <template slot="button-content" style="text-decoration: none !important;">
            <div :class="'card_' + data" class="mainCard" style="text-decoration: none !important;" :key="`Card${index}`"><span class="cardText">{{data === 0 ? 'ATK' : 'DEF'}}</span></div>
          </template>
        <b-dropdown-item @click="getItemID(index)">more</b-dropdown-item>
        <b-dropdown-item v-if="data === 0 && isSelfTurnOrNot === true" @click="showSelectPlayer(index)">use the card</b-dropdown-item>
      </b-dropdown>
    </b-col>
  </b-row>
<b-row class="CardContainer CardContainer--p3 justify-content-center">
  <b-col sm="1" center>
    <div class="mainCard">Player {{getPlayerId.p3}} <br>Card<br><span class="text-warning h1" v-if="roomData.battle.playerStatus[getPlayerId.p3].handCard">x{{getPOneHandCardCount}}</span></div>
  </b-col>
</b-row>
<b-row class="CardContainer CardContainer--p2 justify-content-center">
  <div class="mainCard">Player {{getPlayerId.p2}} <br>Card<br><span class="text-warning h1" v-if="roomData.battle.playerStatus[getPlayerId.p3].handCard">x{{getPTwoHandCardCount}}</span></div>
</b-row>
<b-row class="CardContainer CardContainer--p1 justify-content-center">
  <div class="mainCard">Player {{getPlayerId.p1}} <br>Card<br><span class="text-warning h1" v-if="roomData.battle.playerStatus[getPlayerId.p3].handCard">x{{getPThreeHandCardCount}}</span></div>
</b-row>
  <div>
    <div>
      <b-modal header-class="text-dark" ref="selectPlayer" hide-footer title="Select Player">
        <div class="d-block text-center">
          <b-btn class="block text-white" @click="useCard(getPlayerId.p1)">Player {{roomData.battle.playerStatus[getPlayerId.p1].nickName}}</b-btn>
          <b-btn class="block text-white" @click="useCard(getPlayerId.p2)">Player {{roomData.battle.playerStatus[getPlayerId.p2].nickName}}</b-btn>
          <b-btn class="block text-white" @click="useCard(getPlayerId.p3)">Player {{roomData.battle.playerStatus[getPlayerId.p3].nickName}}</b-btn>
        </div>
      </b-modal>
    </div>
    <div>
      <b-modal header-class="text-dark" ref="useDefence" title="Battle Message">
        <div class="d-block text-center">
          <h1 class="text-dark">You have been hit! Do you want to use defence card?</h1>
        </div>
        <div slot="modal-footer" class="w-100">
          <b-btn success class="float-right" @click="useDefenceCard({ans: true})">Yes</b-btn>
          <b-btn danger class="float-right" @click="useDefenceCard({ans: false})">No</b-btn>
        </div>
      </b-modal>
    </div>
    <div>
      <b-modal header-class="text-dark" ref="useDefence" title="Battle Message" ok-only @ok="backToMain">
        <div class="d-block text-center">
          <h1 class="text-dark">Dead!, we will bring you to the main page.</h1>
        </div>
      </b-modal>
    </div>
  </div>

    <div v-if="test" class="testBorad">
      <b-btn @click="lifeTest()">全體-1血量</b-btn>
      <b-btn primary @click="backToMain">back to main</b-btn>
      <b-btn @click="drawCard(5)">draw test</b-btn>
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
      usingCard: 0,
      turn: 0,
    };
  },
  sockets: {
    def() {
      const vm = this;
      vm.$refs.useDefence.show();
    },
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
    showSelectPlayer(data) {
      const vm = this;
      vm.$refs.selectPlayer.show();
      vm.usingCard = data;
    },
    useCard(data) {
      const vm = this;
      vm.$socket.emit('useCard', { roomId: vm.roomData.id,
        cardUserId: vm.roomData.battle.playerStatus[`${vm.self}`].uid,
        cardUserInGameId: vm.roomData.battle.playerStatus[`${vm.self}`].id,
        usingCard: vm.usingCard,
        targetUserId: vm.roomData.battle.playerStatus[`${data}`].uid,
        targetUserInGameId: vm.roomData.battle.playerStatus[`${data}`].id,
      });
      vm.$refs.selectPlayer.hide();
    },
    useDefenceCard(data) {
      const vm = this;
      const index = vm.roomData.battle.playerStatus[`${vm.self}`].handCard.indexOf(1);
      vm.usingCard = index;
      vm.$socket.emit('defAns', { roomId: vm.roomData.id,
        userInGameId: vm.roomData.battle.playerStatus[`${vm.self}`].id,
        usingCard: vm.usingCard,
        ans: data.ans,
      });
      vm.$refs.useDefence.hide();
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
      vm.$socket.emit('turnEnd', { roomId: vm.roomData.id,
        inGameId: vm.self,
      });
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
      if (vm.roomData.battle.playerStatus.length) {
        let turn = '';
        Object.keys(vm.roomData.battle.playerStatus).forEach((key) => {
          if (vm.roomData.battle.playerStatus[key].turn === true) {
            turn = key;
          }
        });
        return turn;
      }
      return 'error';
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
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.self}`].life;
      }
      return 'error';
    },
    getSelfNickname() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.self}`].nickName;
      }
      return 'error';
    },
    getPOneLife() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p1}`].life;
      }
      return 'error';
    },
    getPTwoLife() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p2}`].life;
      }
      return 'error';
    },
    getPThreeLife() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p3}`].life;
      }
      return 'error';
    },
    isSelfTurnOrNot() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[vm.self].turn;
      }
      return 'error';
    },
    getSelfHandCardCount() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.self}`].handCard.length;
      }
      return 'error';
    },
    getPOneHandCardCount() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p1}`].handCard.length;
      }
      return 'error';
    },
    getPTwoHandCardCount() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p2}`].handCard.length;
      }
      return 'error';
    },
    getPThreeHandCardCount() {
      const vm = this;
      if (vm.roomData.battle.playerStatus) {
        return vm.roomData.battle.playerStatus[`${vm.getPlayerId.p3}`].handCard.length;
      }
      return 'error';
    },
    getSelfDeadOrNot() {
      const vm = this;
      if (vm.roomData.battle.playerStatus[vm.self].life === 0) {
        return true;
      }
      return true;
    },
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
@mainRed: #78C2C4;
@hoverRed: #6699A1;
@mainBlack: #303133;
@atk: #A28C37;
@def: #E79460;
@life: #64363C;
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
  .blockTheme();
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
    border-radius: 3px;
    span{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #FFF;
      font-size: 2rem;
    }
    .blockTheme();
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
  position: relative;
  height: 10rem;
  width: 6rem;
  margin-left: 10px;
  background-color: #fff;
  color: #000;
  transition: 0.2s ease-in;
  border-radius: 3px;
  .blockTheme();
  .cardText{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #2E294E;
  }
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

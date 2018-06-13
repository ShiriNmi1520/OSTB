<template>
  <div class="body darkTheme">
    <h1>現在是{{playerTurn}}的回合</h1>
    <div class="main-block-battle">
      <div class="char">{{n}}</div>
      <div class="char char--p1">{{n + 1 > 4 ? n - 4 + 1 : n + 1}}</div>
      <div class="char char--p2">{{n + 2 > 4 ? n - 4 + 2 : n + 2}}</div>
      <div class="char char--p3">{{n + 3 > 4 ? n - 4 + 3 : n + 3}}</div>
      <b-btn primary @click="backToMain">back to main</b-btn>
      <b-btn @click="drawCard(5)">ドローテスト</b-btn>
      <b-btn @click="showDefence">123</b-btn>
    </div>
    <b-row class="CardContainer justify-content-center">
      <b-col class="ml-2" sm="1" center v-for="(data, index) in test">
        <b-dropdown dropup variant="link" size="lg" no-caret>
          <template slot="button-content" style="text-decoration: none !important;">
            <div class="mainCard" style="text-decoration: none !important;" :id="`Card${index}`">{{data}}</div>
          </template>
          <b-dropdown-item @click="getItemID(index)">詳細</b-dropdown-item>
          <b-dropdown-item @click="useCard(data)">出牌</b-dropdown-item>
        </b-dropdown>
      </b-col>
    </b-row>
    <b-row class="CardContainer CardContainer--p3 justify-content-center">
      <b-col sm="1" center>
        <div class="mainCard">カード<br><span class="text-warning h1">x{{test.length}}</span></div>
      </b-col>
    </b-row>
    <b-row class="CardContainer CardContainer--p2 justify-content-center">
      <div class="mainCard">カード<br><span class="text-warning h1">x{{test.length}}</span></div>
    </b-row>
    <b-row class="CardContainer CardContainer--p1 justify-content-center">
      <div class="mainCard">カード<br><span class="text-warning h1">x{{test.length}}</span></div>
    </b-row>
    <div>
      <div>
        <b-modal header-class="text-dark" ref="selectPlayer" hide-footer title="選擇玩家">
          <div class="d-block text-center">
            <div class="block text-white" @click="selectPlayer(0)">玩家一</div>
            <div class="block text-white" @click="selectPlayer(1)">玩家二</div>
            <div class="block text-white" @click="selectPlayer(2)">玩家三</div>
            <div class="block text-white" @click="selectPlayer(3)">玩家四</div>
          </div>
        </b-modal>
      </div>
      <div>
        <b-modal header-class="text-dark" ref="useDefence" title="戰鬥訊息">
          <div class="d-block text-center">
            <h1 class="text-dark">被攻擊了！是否使用防禦卡？</h1>
          </div>
          <div slot="modal-footer" class="w-100">
            <b-btn success class="float-right">是</b-btn>
            <b-btn danger  class="float-right">否</b-btn>
          </div>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'battle',
    data() {
      return {
        show: false,
        view: 'battle',
        n: 1,
        test: [1, 2, 3, 4, 5],
        player: [{
          id: 0,
          handCard: [],
          turn: false,
          uid: '',
          life: 4,
        }, {
          id: 1,
          handCard: [],
          turn: true,
          uid: '',
          life: 4,
        }, {
          id: 2,
          handCard: [],
          turn: false,
          uid: '',
          life: 4,
        }, {
          id: 3,
          handCard: [],
          turn: false,
          uid: '',
          life: 4,
        }],
      };
    },
    methods: {
      backToMain() {
        const vm = this;
        vm.$router.push({ name: 'main' });
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
    },
    computed: {
      playerTurn() {
        const vm = this;
        let turn = '';
        vm.player.forEach((item) => {
          if (item.turn === true) {
            turn = item.id;
          }
        });
        return turn;
      },
      isSelfTurnOrNot() {
      },
    },
    created() {},
  };
</script>

<style lang="less" scoped>
  @mainRed: #ffa767;
  @hoverRed: #936236;
  @mainBlack: #303133;
  *::-webkit-scrollbar{
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
    transition: .2s ease-in;
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
  .block{
    height: 100px;
    width: 100px;
    background-color: #000;
    display: inline-flex;
  }
</style>
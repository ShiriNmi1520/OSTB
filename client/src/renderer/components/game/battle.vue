<template>
  <div class="body darkTheme">
    <div class="main-block-battle">
      <div class="char">MAIN</div>
      <div class="char char--p1">P1</div>
      <div class="char char--p2">P2</div>
      <div class="char char--p3">P3</div>
      <b-btn primary @click="backToMain">back to main</b-btn>
    </div>
    <b-row class="CardContainer">
      <b-col class="ml-2" sm="1" center v-for="data in test">
        <div class="mainCard">{{data}}</div>
      </b-col>
    </b-row>
    <b-row class="CardContainer CardContainer--p1">
      <b-col sm="1" center>
        <div class="mainCard">カード<br><span class="text-warning h1">x{{test.length}}</span></div>
      </b-col>
    </b-row>
    <b-row class="CardContainer CardContainer--p2">
      <div class="mainCard">カード<br><span class="text-warning h1">x{{test.length}}</span></div>
    </b-row>
    <b-row class="CardContainer CardContainer--p3">
      <div class="mainCard">カード<br><span class="text-warning h1">x{{test.length}}</span></div>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'battle',
    data() {
      return {
        view: 'battle',
        test: [1, 2, 3, 4, 5, 6],
      };
    },
    methods: {
      backToMain() {
        const vm = this;
        vm.view = 'main';
        vm.$emit('updateViewStatus', vm.view);
      },
    },
  };
</script>

<style scoped>
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
    transform: translateX(-26%);
  }
  .mainCard {
    height: 10rem;
    width: 6rem;
    margin-left: 10px;
    background-color: #fff;
    color: #000;
  }
  .char--p1 {
    top: 50%;
    left: 4%;
    transform: translateY(-50%) rotate(-270deg);
  }
  .CardContainer--p1 {
    height: 100%;
    width: unset;
    top: 50%;
    bottom: unset;
    right: unset;
    left: 0;
    transform: translate(-280%, -50%) rotate(-270deg);
  }
  .char--p2 {
    top: 0;
    left: 50%;
    transform: translateX(-50%) rotate(-180deg);
  }
  .CardContainer--p2 {
    width: 100%;
    bottom: unset;
    top: 0;
    left: 50%;
    right: unset;
    transform: translate(-96%, -50%) rotate(-180deg);
  }
  .char--p3 {
    top: 50%;
    left: unset;
    right: 0;
    transform: translate(-35%,-50%) rotate(-90deg);
  }
  .CardContainer--p3 {
    height: 100%;
    width: unset;
    top: 50%;
    left: unset;
    right: 0;
    transform: translate(345%, -50%) rotate(-90deg);
  }
</style>
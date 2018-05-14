<template>
  <div class="body darkTheme">
    <div class="main-block-battle">
      <div class="main-char">MAIN</div>
      <div class="p1-char">P1</div>
      <div class="p2-char">P2</div>
      <div class="p3-char">P3</div>
      <b-btn primary @click="backToMain">back to main</b-btn>
    </div>
    <b-row class="mainCardContainer">
      <div v-for="data in test" class="mainCard">{{data}}</div>
    </b-row>
    <b-row class="p1CardContainer">
      <div v-for='data in test' class="mainCard text-right">{{data}}</div>
    </b-row>
    <b-row class="p2CardContainer">
      <div v-for="data in test" class="mainCard">{{data}}</div>
    </b-row>
    <b-row class="p3CardContainer">
      <div v-for="data in test" class="mainCard">{{data}}</div>
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
  .main-char {
    position: absolute;
    height: 10rem;
    width: 6rem;
    bottom: 0;
    left: 50%;
    background-color: #fff;
    transform: translateX(-50%);
    color: #000;
  }
  .mainCardContainer {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 50%;
    transform: translateX(-25%);
  }
  .mainCard {
    height: 10rem;
    width: 6rem;
    margin-left: 10px;
    background-color: #fff;
    color: #000;
  }
  .p1-char {
    position: absolute;
    height: 10rem;
    width: 6rem;
    top: 50%;
    left: 4%;
    background-color: #fff;
    transform: translateY(-50%) rotate(-270deg);
    color: #000;
  }
  .p1CardContainer {
    position: absolute;
    height: 100%;
    top: 50%;
    left: 0;
    transform: translate(-99%, -50%) rotate(-270deg);
  }
  .p2-char {
    position: absolute;
    height: 10rem;
    width: 6rem;
    top: 0;
    left: 50%;
    background-color: #fff;
    transform: translateX(-50%) rotate(-180deg);
    color: #000;
  }
  .p2CardContainer {
    position: absolute;
    width: 100%;
    top: 0;
    left: 50%;
    transform: translate(-70%, -70%) rotate(-180deg);
  }
  .p3-char {
    position: absolute;
    height: 10rem;
    width: 6rem;
    top: 50%;
    right: 4%;
    background-color: #fff;
    transform: translateY(-50%) rotate(-90deg);
    color: #000;
  }
  .p3CardContainer {
    position: absolute;
    height: 100%;
    top: 50%;
    right: 0;
    transform: translate(99%, -50%) rotate(-90deg);
  }
</style>
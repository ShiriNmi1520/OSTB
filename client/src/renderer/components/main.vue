<template>
  <div>
    <loginPage @updateViewStatus="getViewStatus" v-if="view === 'login'"></loginPage>
    <signUp @updateViewStatus="getViewStatus" v-if="view === 'signUp'"></signUp>
    <firstTimeLogin @updateViewStatus="getViewStatus" v-if="view === 'firstTimeLogin'"></firstTimeLogin>
    <gameMain @updateViewStatus="getViewStatus" v-if="view === 'main'"></gameMain>
    <gameBattle @updateViewStatus="getViewStatus" v-if="view === 'battle'"></gameBattle>
  </div>
</template>

<script>
  import loginPage from './login';
  import gameMain from './game-main';
  import gameBattle from './game/battle';
  import firstTimeLogin from './firstTimeLogin';
  import signUp from './signup';
  export default {
    name: 'main',
    components: { loginPage, gameMain, gameBattle, signUp, firstTimeLogin },
    data() {
      return {
        res: '',
        view: 'login',
      };
    },
    computed: {},
    methods: {
      getViewStatus(status) {
        const vm = this;
        vm.view = status;
      },
      signOut() {
        const vm = this;
        vm.login = false;
      },
    },
  };
</script>

<style scoped>

</style>
<template>
  <div class="body">
    <b-navbar class="nav-red" toggleable>
        <b-navbar-nav>
          <b-nav-item right href="#"><router-link :to="'/'">登出</router-link></b-nav-item>
        </b-navbar-nav>
    </b-navbar>
    <b-container>
      <b-row class="mt-5">
        <b-col sm="6"><b-jumbotron class="nav-red btn-click">
          <h1 class="text-center">コンピュータと<br><span class="asobu">遊ぶ</span></h1>
        </b-jumbotron>
        </b-col>
        <b-col sm="6"><b-jumbotron class="nav-red btn-click">
          <h1 class="text-center">プレーヤーと<br><span class="asobu">遊ぶ</span></h1>
        </b-jumbotron>
      </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  export default {
    name: 'game-main',
    data() {
      return {
        view: 'main',
      };
    },
    methods: {},
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
    transition: .2s ease;
  }
  .btn-click:active {
    background-color: @mainRed;
    border-color: @mainRed;
  }
  .body {
    height: 100%;
    width: 100%;
    position: fixed;
    background-color: #303133;
    color: #F0F8FF;
  }
  .asobu {
    font-size: 6rem;
  }
</style>
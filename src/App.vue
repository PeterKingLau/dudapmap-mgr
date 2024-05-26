<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
*{padding: 0; margin: 0;}
ul,li{list-style: none;}
iframe{display: block;}
/* body{padding-bottom:  env(safe-area-inset-bottom);} */
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center; margin: auto;

}
/* @supports (bottom: env(safe-area-inset-bottom)) {
  div {
  margin-bottom:  env(safe-area-inset-bottom);
  }
}  */

</style>




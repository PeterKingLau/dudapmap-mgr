<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <AppLayout v-if="route.meta.requiresAuth">
        <component :is="Component" />
      </AppLayout>
      <component :is="Component" v-else />
    </router-view>
  </div>
</template>

<script setup>
import AppLayout from "./layouts/AppLayout.vue";
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}

body {
  overflow: hidden;
}

ul,
li {
  list-style: none;
}

iframe {
  display: block;
}

#app {
  font-family:
    "Inter",
    "PingFang SC",
    "Microsoft YaHei",
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>

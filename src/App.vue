<template>
  <div id="app">
    <nav>
      <router-link to="/">记录</router-link>
      <router-link to="/leaderboard">排行榜</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
// Component logic goes here
</script>

<style scoped>
#app {
  text-align: center;
  color: var(--text-color);
  margin-top: 60px;
}

nav {
  padding: 30px;
  background-color: var(--secondary-color);
  border-radius: 10px;
  margin-bottom: 30px;
}

nav a {
  font-weight: bold;
  color: white;
  text-decoration: none;
  margin: 0 15px;
  padding: 10px 20px;
  border-radius: 20px;
  transition: background-color 0.3s ease;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

nav a.router-link-exact-active {
  background-color: var(--primary-color);
}
</style>
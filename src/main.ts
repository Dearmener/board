import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import InputPage from './components/InputPage.vue'
import LeaderboardPage from './components/LeaderboardPage.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InputPage },
    { path: '/leaderboard', component: LeaderboardPage }
  ]
})

createApp(App).use(router).mount('#app')
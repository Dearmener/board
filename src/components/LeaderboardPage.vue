<template>
  <div class="leaderboard-page">
    <h1><i class="fas fa-trophy"></i> Exercise Leaderboard</h1>
    <div class="month-selector">
      <input v-model="selectedMonth" type="month" @change="fetchLeaderboard" />
    </div>
    <div class="leaderboard">
      <div v-for="(user, index) in leaderboard" :key="user.name" class="user-entry" :class="getRankClass(index)">
        <div class="rank">{{ index + 1 }}</div>
        <div class="name">
          <i :class="getRankIcon(index)"></i>
          {{ user.name }}
        </div>
        <div class="count">{{ user.count }} exercises</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { getLeaderboard } from '../utils/database'

interface LeaderboardEntry {
  name: string
  count: number
}

const selectedMonth = ref(format(new Date(), 'yyyy-MM'))
const leaderboard = ref<LeaderboardEntry[]>([])

const fetchLeaderboard = async () => {
  try {
    leaderboard.value = await getLeaderboard(selectedMonth.value)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
  }
}

const getRankClass = (index: number) => {
  if (index === 0) return 'first'
  if (index === 1) return 'second'
  if (index === 2) return 'third'
  return ''
}

const getRankIcon = (index: number) => {
  if (index === 0) return 'fas fa-crown'
  if (index === 1) return 'fas fa-medal'
  if (index === 2) return 'fas fa-award'
  return 'fas fa-user'
}

onMounted(fetchLeaderboard)
</script>

<style scoped>
.leaderboard-page {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.month-selector {
  margin-bottom: 2rem;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-entry {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.user-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.rank {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1rem;
  width: 40px;
}

.name {
  flex-grow: 1;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.name i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.count {
  font-weight: bold;
  color: var(--primary-color);
}

.first {
  background-color: #ffd700;
  color: var(--secondary-color);
}

.second {
  background-color: #c0c0c0;
  color: var(--secondary-color);
}

.third {
  background-color: #cd7f32;
  color: var(--secondary-color);
}

.first .count, .second .count, .third .count {
  color: var(--secondary-color);
}

h1 {
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 i {
  margin-right: 10px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.first {
  animation: pulse 2s infinite;
}
</style>
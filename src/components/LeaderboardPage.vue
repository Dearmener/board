<template>
  <div 
    ref="leaderboardPage" 
    class="leaderboard-page"
    :class="{ 'fullscreen': isFullscreen }"
  >
    <h1 v-if="!isFullscreen" class="title"><i class="fas fa-trophy"></i> 运动排行榜</h1>
    
    <div class="control-bar">
      <!-- 月份选择器 -->
      <div class="month-selector">
        <input v-model="selectedMonth" type="month" @change="fetchLeaderboard" />
      </div>
      <div v-if="isFullscreen" class="fullscreen-title">
        <i class="fas fa-trophy"></i> 运动排行榜
      </div>
      <!-- 控制面板 - 只在需要滚动时显示 -->
      <div v-if="needsScroll" class="controls">
        <button 
          @click="adjustSpeed(5)"
          class="control-btn"
          title="减慢速度"
        >
          <i class="fas fa-backward"></i>
        </button>
        
        <button 
          @click="togglePause"
          class="control-btn"
        >
          <i :class="isPaused ? 'fas fa-play' : 'fas fa-pause'"></i>
        </button>
        
        <button 
          @click="handleReset"
          class="control-btn"
          title="重置"
        >
          <i class="fas fa-redo"></i>
        </button>
        
        <button 
          @click="adjustSpeed(-5)"
          class="control-btn"
          title="加快速度"
        >
          <i class="fas fa-forward"></i>
        </button>

        <button 
          @click="toggleFullscreen"
          class="control-btn"
          title="全屏"
        >
          <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
        
        <div class="speed-display">
          速度: {{ speed }}秒/循环
        </div>
      </div>
      <!-- 全屏按钮始终显示 -->
      <div v-else class="controls">
        <button 
          @click="toggleFullscreen"
          class="control-btn"
          title="全屏"
        >
          <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
      </div>
    </div>

    <!-- 排行榜容器 -->
    <div class="leaderboard-container" ref="containerRef">    
      <div class="leaderboard-wrapper" ref="wrapperRef">
        <div 
          ref="leaderboardRef"
          class="leaderboard" 
          :class="{ 'paused': isPaused, 'scrolling': needsScroll }"
          :style="scrollStyle"
        >
          <template v-if="needsScroll">
            <!-- 需要滚动时显示3份数据 -->
            <template v-for="n in 3" :key="n">
              <div 
                v-for="(user, index) in leaderboard" 
                :key="`${n}-${user.name}`"
                class="user-entry"
                :class="getRankClass(index)"
              >
                <div class="rank">{{ index + 1 }}</div>
                <div class="name">
                  <i :class="getRankIcon(index)"></i>
                  {{ user.name }}
                </div>
                <div class="count">{{ user.count }} 次运动</div>
              </div>
            </template>
          </template>
          <template v-else>
            <!-- 不需要滚动时只显示1份数据 -->
            <div 
              v-for="(user, index) in leaderboard" 
              :key="user.name"
              class="user-entry"
              :class="getRankClass(index)"
            >
              <div class="rank">{{ index + 1 }}</div>
              <div class="name">
                <i :class="getRankIcon(index)"></i>
                {{ user.name }}
              </div>
              <div class="count">{{ user.count }} 次运动</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { format } from 'date-fns'
import { getLeaderboard } from '../utils/database'

interface LeaderboardEntry {
  name: string
  count: number
}

const leaderboardPage = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const leaderboardRef = ref<HTMLElement | null>(null)
const leaderboard = ref<LeaderboardEntry[]>([])
const isFullscreen = ref(false)
const selectedMonth = ref(format(new Date(), 'yyyy-MM'))
const isPaused = ref(false)
const speed = ref(50) // 默认20秒一次循环
const needsScroll = ref(false)

const calculateScrollNeed = async () => {
  // 等待 DOM 更新
  await nextTick()
  
  if (!wrapperRef.value || !leaderboardRef.value || leaderboard.value.length === 0) {
    needsScroll.value = false
    return
  }

  // 计算单个条目的高度
  const singleEntryHeight = 80 // 预估的单个条目高度(可以根据实际调整)
  const totalContentHeight = singleEntryHeight * leaderboard.value.length
  const wrapperHeight = wrapperRef.value.clientHeight

  console.log('Wrapper Height:', wrapperHeight)
  console.log('Total Content Height:', totalContentHeight)
  
  // 如果内容高度超过容器高度，则需要滚动
  needsScroll.value = totalContentHeight > wrapperHeight

  console.log('Needs Scroll:', needsScroll.value)
}

// 监听窗口大小变化
const handleResize = () => {
  // 使用 requestAnimationFrame 来优化性能
  window.requestAnimationFrame(() => {
    calculateScrollNeed()
  })
}

// 全屏切换
const toggleFullscreen = async () => {
  if (!leaderboardPage.value) return

  try {
    if (!isFullscreen.value) {
      if (leaderboardPage.value.requestFullscreen) {
        await leaderboardPage.value.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  } catch (err) {
    console.error('全屏切换失败:', err)
  }
}

// 监听全屏状态变化
onMounted(() => {
  // 全屏状态变化监听
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
    // 全屏状态改变时重新计算，添加延时确保DOM更新完成
    setTimeout(calculateScrollNeed, 200)
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('resize', handleResize)
  
  // 初始化
  fetchLeaderboard()
})

// 移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', () => {})
})

// 获取排行榜数据
const fetchLeaderboard = async () => {
  try {
    leaderboard.value = await getLeaderboard(selectedMonth.value)
    // 数据更新后重新计算是否需要滚动
    setTimeout(calculateScrollNeed, 200)
  } catch (error) {
    console.error('获取排行榜数据出错:', error)
  }
}

// 计算滚动样式
const scrollStyle = computed(() => ({
  animationDuration: needsScroll.value ? `${speed.value}s` : '0s',
  animationPlayState: needsScroll.value ? (isPaused.value ? 'paused' : 'running') : 'paused'
}))

// 获取排名样式
const getRankClass = (index: number) => {
  if (index === 0) return 'first'
  if (index === 1) return 'second'
  if (index === 2) return 'third'
  return ''
}

// 获取排名图标
const getRankIcon = (index: number) => {
  if (index === 0) return 'fas fa-crown'
  if (index === 1) return 'fas fa-medal'
  if (index === 2) return 'fas fa-award'
  return 'fas fa-user'
}

// 控制暂停/继续
const togglePause = () => {
  isPaused.value = !isPaused.value
}

// 控制速度
const adjustSpeed = (change: number) => {
  const newSpeed = speed.value + change
  speed.value = Math.min(Math.max(newSpeed, 10), 60) // 限制速度范围在5-40秒之间
}

// 重置
const handleReset = () => {
  speed.value = 20
  isPaused.value = false
  if (leaderboardRef.value) {
    leaderboardRef.value.style.transform = 'translateX(-50%) translateY(0)'
  }
}

// 监听数据变化
watch(() => leaderboard.value, () => {
  nextTick(() => {
    calculateScrollNeed()
  })
}, { deep: true })
</script>
<style scoped>
/* 基础布局 */
.leaderboard-page {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
h1.title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color, #333);
}

h1.title i {
  margin-right: 10px;
}

.fullscreen-title {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: absolute;
  left: 0;
  white-space: nowrap;
  font-size: 60px;
  color: var(--primary-color, #333);
}

.fullscreen-title i {
  margin-right: 0.5rem;
}

/* 控制栏样式 */
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
}

.control-btn {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #e3f2fd;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.control-btn:hover {
  background-color: #bbdefb;
  transform: translateY(-1px);
}

.speed-display {
  font-size: 0.875rem;
  color: #666;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 月份选择器 */
.month-selector {
  margin-bottom: 0;
  z-index: 2;
}

.month-selector input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
}

/* 排行榜容器 */
.leaderboard-container {
  position: relative;
  flex-grow: 1;
  height: calc(100vh - 200px); /* 动态调整容器高度 */
  min-height: 29rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  box-sizing: border-box;
}

.leaderboard-wrapper {
  position: relative;
  height: 100%; /* 使用全高 */
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

/* 列表样式 */
.leaderboard {
  position: absolute;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  box-sizing: border-box;
  left: 50%;
  transform: translateX(-50%);
}

.leaderboard.scrolling {
  animation: scroll linear infinite;
  will-change: transform;
}

.leaderboard.scrolling.paused {
  animation-play-state: paused;
}

/* 条目样式 */
.user-entry {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  box-sizing: border-box;
  width: 100%;
  max-width: calc(100% - 4rem);
  margin-left: auto;
  margin-right: auto;
  height: 80px; /* 固定高度，与 script 中的预估高度对应 */
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
  flex-shrink: 0;
}

.name {
  flex-grow: 1;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin: 0 1rem;
}

.name i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.count {
  font-weight: bold;
  color: var(--primary-color);
  flex-shrink: 0;
}

/* 排名样式 */
.first {
  background-color: #ffd700;
  color: var(--secondary-color);
  animation: pulse 2s infinite;
}

.second {
  background-color: #c0c0c0;
  color: var(--secondary-color);
}

.third {
  background-color: #cd7f32;
  color: var(--secondary-color);
}

.first .count,
.second .count,
.third .count {
  color: var(--secondary-color);
}

/* 动画定义 */
@keyframes scroll {
  0% {
    transform: translateX(-50%) translateY(0);
  }
  100% {
    transform: translateX(-50%) translateY(calc(-33.33% - 1px));
  }
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

/* 全屏模式样式 */
.leaderboard-page.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 2rem;
  border-radius: 0;
  background-color: white;
  z-index: 9999;
}

.leaderboard-page.fullscreen .control-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(248, 249, 250, 0.95);
  margin: 0;
  padding: 1rem 2rem;
  backdrop-filter: blur(10px);
  height: 60px;
  display: flex;
  align-items: center;
}

.leaderboard-page.fullscreen .leaderboard-container {
  height: calc(100vh - 80px);
  margin-top: 80px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .control-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .controls {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .month-selector {
    width: 100%;
  }

  .leaderboard-page.fullscreen .control-bar {
    flex-direction: row;
    height: auto;
    padding: 0.5rem;
  }

  .fullscreen-title {
    font-size: 1.2rem;
    margin-right: 1rem;
  }
  
  .leaderboard-page.fullscreen .leaderboard {
    padding: 0 1rem;
  }
  
  .leaderboard-page.fullscreen .user-entry {
    max-width: calc(100% - 2rem);
    padding: 0.75rem;
  }

  .user-entry {
    height: 70px; /* 移动端稍微降低高度 */
  }
}

/* 优化文字渲染 */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
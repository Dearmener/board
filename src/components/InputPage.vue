<template>
  <div class="input-page">
    <h1><i class="fas fa-dumbbell"></i> 运动记录</h1>
    <div class="input-container">
      <div class="autocomplete">
        <input
          v-model="name"
          @input="searchUsers"
          placeholder="输入姓名"
        />
        <ul v-if="suggestions.length > 0" class="suggestions">
          <li
            v-for="suggestion in suggestions"
            :key="suggestion"
            @click="selectUser(suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
  
      </div>
      <Datepicker 
        v-model="inputDate" 
        :enable-time-picker="false"
        :clearable="true"
        placeholder="选择日期（可选）"
        :format-locale="zhCN"
        :text-input-options="{ format: 'yyyy-MM-dd' }"
      /> 
      <button @click="recordExercise">
        <i class="fas fa-plus"></i> 记录运动
      </button>
    </div>
    <div class="search-container">
      <input v-model="searchName" placeholder="搜索用户" />
      <Datepicker 
        v-model="searchDate" 
        :enable-time-picker="false"
        :clearable="true"
        placeholder="选择日期（可选）"
        :format-locale="zhCN"
        :text-input-options="{ format: 'yyyy-MM-dd' }"
      />
      <button @click="searchRecords">
        <i class="fas fa-search"></i> 搜索
      </button>
    </div>
    <div v-if="searchResults.length > 0" class="search-results">
      <h2>搜索结果</h2>
      <div class="results-header">
        <span>找到 {{ searchResults.length }} 条记录</span>
        <button @click="exportResults" class="export-btn">
          <i class="fas fa-download"></i> 导出CSV
        </button>
      </div>
      <ul>
        <li v-for="result in searchResults" :key="result.id">
          {{ result.name }} - {{ result.date }}
          <button @click="deleteRecord(result.id)" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </li>
      </ul>
    </div>
    <div v-if="message" class="message" :class="{ success: isSuccess, error: !isSuccess }">
      <i :class="isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { zhCN } from 'date-fns/locale'
import { recordExerciseInDB, searchExerciseRecords, deleteExerciseRecord, getAllUsers, exportToCSV } from '../utils/database'
import { format } from 'date-fns'
import type { ExerciseRecord } from '../types'

const name = ref('')
const searchName = ref('')
const searchDate = ref<Date | null>(null)
const inputDate = ref<Date | null>(null)
const message = ref('')
const isSuccess = ref(true)
const searchResults = ref<ExerciseRecord[]>([])
const suggestions = ref<string[]>([])

const recordExercise = async () => {
  if (name.value.trim()) {
    try {
      // const currentDate = new Date()
      const formattedDate = inputDate.value ? format(inputDate.value, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      await recordExerciseInDB(name.value.trim(),formattedDate)
      message.value = '运动记录添加成功！'
      isSuccess.value = true
      name.value = ''
    } catch (error) {
      message.value = error instanceof Error ? error.message === 'You have already recorded an exercise today' 
        ? '今天已经记录过运动了' 
        : error.message 
        : '记录运动时出错，请重试。'
      isSuccess.value = false
    }
  } else {
    message.value = '请输入姓名。'
    isSuccess.value = false
  }
}

const searchRecords = async () => {
  try {
    const formattedDate = searchDate.value ? format(searchDate.value, 'yyyy-MM-dd') : undefined
    const results = await searchExerciseRecords(searchName.value, formattedDate)
    searchResults.value = results
    message.value = results.length > 0 ? `找到 ${results.length} 条记录。` : '未找到记录。'
    isSuccess.value = true
  } catch (error) {
    message.value = '搜索记录时出错，请重试。'
    isSuccess.value = false
  }
}

const exportResults = () => {
  try {
    const csvContent = exportToCSV(searchResults.value)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `运动记录-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.value = '记录导出成功！'
    isSuccess.value = true
  } catch (error) {
    message.value = '导出记录时出错，请重试。'
    isSuccess.value = false
  }
}

const deleteRecord = async (id: number) => {
  try {
    await deleteExerciseRecord(id)
    message.value = '记录删除成功！'
    isSuccess.value = true
    searchRecords()
  } catch (error) {
    message.value = '删除记录时出错，请重试。'
    isSuccess.value = false
  }
}

const searchUsers = async () => {
  if (name.value.trim().length > 0) {
    const users = await getAllUsers()
    suggestions.value = users.filter(user => 
      user.toLowerCase().startsWith(name.value.toLowerCase())
    )
  } else {
    suggestions.value = []
  }
}

const selectUser = (user: string) => {
  name.value = user
  suggestions.value = []
}
</script>

<style scoped>

.input-page {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.autocomplete {
  position: relative;
  display: inline-block;
  
}

.suggestions {
  position: absolute;
  border: 1px solid #ddd;
  border-top: none;
  z-index: 99;
  top: 100%;
  left: 0;
  right: 0;
  padding: 0;
  margin: 0;
  list-style-type: none;
  background-color: white;
  max-height: 150px;
  overflow-y: auto;
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
}

.suggestions li:hover {
  background-color: #f1f1f1;
}

.search-results {
  margin-top: 20px;
  text-align: left;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.export-btn {
  background-color: #28a745;
  padding: 0.5rem 1rem;
}

.export-btn:hover {
  background-color: #218838;
}

.search-results ul {
  list-style-type: none;
  padding: 0;
}

.search-results li {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.delete-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #a30000;
}

.input-container, .search-container {
  display: flex;
  justify-content: center; 
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 10px;
  /* max-width: 900px; */
}

input, .dp__main {
  margin-right: 0;
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}
.input-container, .search-container {
  display: flex;
  justify-content: center; 
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: nowrap; /* 确保不换行 */
  gap: 10px; /* 控制元素间距 */
}
input, .dp__main {
  width: 250px; /* 设置宽度一致 */
  height: 40px; /* 设置高度一致 */
  padding: 0 10px; /* 内边距 */
}

button {
  width: 150px; /* 设置按钮宽度一致 */
  height: 40px; /* 设置按钮高度一致 */
  padding: 0; /* 去掉内边距，保持高度一致 */
  display: flex;
  justify-content: center;
  align-items: center;
}
@media (max-width: 900px) {
  .input-container, .search-container {
  display: flex;
  justify-content: flex-start; 
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: nowrap; /* 确保不换行 */
  gap: 10px; /* 控制元素间距 */
}

input, .dp__main, button {
  flex: 1; /* 使输入框和按钮平分空间 */
  min-width: 150px; /* 设置最小宽度 */
}
}
</style>
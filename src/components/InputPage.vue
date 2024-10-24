<template>
  <div class="input-page">
    <h1><i class="fas fa-dumbbell"></i> Exercise Input</h1>
    <div class="input-container">
      <div class="autocomplete">
        <input
          v-model="name"
          @input="searchUsers"
          placeholder="Enter your name"
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
      <button @click="recordExercise">
        <i class="fas fa-plus"></i> Record Exercise
      </button>
    </div>
    <div class="search-container">
      <input v-model="searchName" placeholder="Search user" />
      <Datepicker v-model="searchDate" :enable-time-picker="false" />
      <button @click="searchRecords">
        <i class="fas fa-search"></i> Search
      </button>
    </div>
    <div v-if="searchResults.length > 0" class="search-results">
      <h2>Search Results</h2>
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
import { recordExerciseInDB, searchExerciseRecords, deleteExerciseRecord, getAllUsers } from '../utils/database'
import { format } from 'date-fns'

const name = ref('')
const searchName = ref('')
const searchDate = ref(new Date())
const message = ref('')
const isSuccess = ref(true)
const searchResults = ref([])
const suggestions = ref([])

const recordExercise = async () => {
  if (name.value.trim()) {
    try {
      await recordExerciseInDB(name.value.trim())
      message.value = 'Exercise recorded successfully!'
      isSuccess.value = true
      name.value = ''
    } catch (error) {
      message.value = 'Error recording exercise. Please try again.'
      isSuccess.value = false
    }
  } else {
    message.value = 'Please enter a name.'
    isSuccess.value = false
  }
}

const searchRecords = async () => {
  try {
    const results = await searchExerciseRecords(searchName.value, format(searchDate.value, 'yyyy-MM-dd'))
    searchResults.value = results
    message.value = results.length > 0 ? `Found ${results.length} record(s).` : 'No records found.'
    isSuccess.value = true
  } catch (error) {
    message.value = 'Error searching records. Please try again.'
    isSuccess.value = false
  }
}

const deleteRecord = async (id: number) => {
  try {
    await deleteExerciseRecord(id)
    message.value = 'Record deleted successfully!'
    isSuccess.value = true
    searchRecords() // Refresh the search results
  } catch (error) {
    message.value = 'Error deleting record. Please try again.'
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
/* 调整输入框样式以使其更美观 */
input {
  width: 100%;
  max-width: 400px;
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.dp__main {
  max-width: 400px;
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.dp__main:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

button {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
  background-color: #ff5733;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

button:active {
  background-color: #c7412f;
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
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestions li:hover {
  background-color: #f1f1f1;
}

.search-results {
  margin-top: 20px;
  text-align: left;
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
}

.delete-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
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
  gap: 15px;
}

input, .dp__main {
  margin-right: 0;
  width: 100%;
  max-width: 400px;
}

@media (max-width: 768px) {
  .input-container, .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  input, .dp__main, button {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>

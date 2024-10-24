import { openDB } from 'idb'
import { format } from 'date-fns'

const dbPromise = openDB('ExerciseDB', 1, {
  upgrade(db) {
    db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true })
  },
})

export const recordExerciseInDB = async (name: string) => {
  const db = await dbPromise
  const date = format(new Date(), 'yyyy-MM-dd')
  await db.add('exercises', { name, date })
}

export const searchExerciseRecords = async (name: string, date: string) => {
  const db = await dbPromise
  const allRecords = await db.getAll('exercises')
  return allRecords.filter(record => 
    (!name || record.name.toLowerCase().includes(name.toLowerCase())) &&
    (!date || record.date === date)
  )
}

export const deleteExerciseRecord = async (id: number) => {
  const db = await dbPromise
  await db.delete('exercises', id)
}

export const getAllUsers = async () => {
  const db = await dbPromise
  const allRecords = await db.getAll('exercises')
  const uniqueUsers = new Set(allRecords.map(record => record.name))
  return Array.from(uniqueUsers)
}

export const getLeaderboard = async (month: string) => {
  const db = await dbPromise
  const allRecords = await db.getAll('exercises')
  const filteredRecords = allRecords.filter(record => record.date.startsWith(month))
  
  const countMap = new Map()
  filteredRecords.forEach(record => {
    countMap.set(record.name, (countMap.get(record.name) || 0) + 1)
  })

  return Array.from(countMap, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
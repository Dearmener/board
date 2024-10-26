import { openDB } from 'idb'
import { format } from 'date-fns'
import type { ExerciseRecord } from '../types'

const dbPromise = openDB('ExerciseDB', 1, {
  upgrade(db) {
    db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true })
  },
})

export const checkDailyRecord = async (name: string): Promise<boolean> => {
  const db = await dbPromise
  const today = format(new Date(), 'yyyy-MM-dd')
  const allRecords = await db.getAll('exercises')
  return allRecords.some(record => 
    record.name.toLowerCase() === name.toLowerCase() && 
    record.date === today
  )
}

export const recordExerciseInDB = async (name: string) => {
  const hasRecordedToday = await checkDailyRecord(name)
  if (hasRecordedToday) {
    throw new Error('You have already recorded an exercise today')
  }
  
  const db = await dbPromise
  const date = format(new Date(), 'yyyy-MM-dd')
  await db.add('exercises', { name, date })
}

export const searchExerciseRecords = async (name: string, date?: string): Promise<ExerciseRecord[]> => {
  const db = await dbPromise
  const allRecords = await db.getAll('exercises')
  return allRecords.filter(record => 
    (!name || record.name.toLowerCase().includes(name.toLowerCase())) &&
    (!date || record.date === date)
  )
}

export const exportToCSV = (records: ExerciseRecord[]): string => {
  const headers = ['Name', 'Date']
  const csvContent = [
    headers.join(','),
    ...records.map(record => `${record.name},${record.date}`)
  ].join('\n')
  return csvContent
}

export const deleteExerciseRecord = async (id: number): Promise<void> => {
  const db = await dbPromise
  await db.delete('exercises', id)
}

export const getAllUsers = async (): Promise<string[]> => {
  const db = await dbPromise
  const allRecords: ExerciseRecord[] = await db.getAll('exercises')
  const uniqueUsers = new Set(allRecords.map(record => record.name))
  return Array.from(uniqueUsers)
}

export const getLeaderboard = async (month: string): Promise<Array<{ name: string, count: number }>> => {
  const db = await dbPromise
  const allRecords: ExerciseRecord[] = await db.getAll('exercises')
  const filteredRecords = allRecords.filter(record => record.date.startsWith(month))
  
  const countMap = new Map<string, number>()
  filteredRecords.forEach(record => {
    countMap.set(record.name, (countMap.get(record.name) || 0) + 1)
  })

  return Array.from(countMap, ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
import { db } from '@/database/db'
import { Bill as DbBill, Goal as DbGoal } from '@/types'
import { Bill as AppBill, Goal as AppGoal } from '@/lib/types'

const MIGRATION_FLAG = 'spark-migration-done'
const BILLS_KEY = 'financeai-bills'
const GOALS_KEY = 'financeai-goals'
const LANGUAGE_KEY = 'app-language'

interface LegacyData {
  bills: AppBill[]
  goals: AppGoal[]
  language: string | null
}

/**
 * Reads legacy data from localStorage
 */
function readLegacyData(): LegacyData {
  const bills: AppBill[] = []
  const goals: AppGoal[] = []
  let language: string | null = null

  try {
    const billsData = localStorage.getItem(BILLS_KEY)
    if (billsData) {
      const parsed = JSON.parse(billsData)
      if (Array.isArray(parsed)) {
        bills.push(...parsed)
      }
    }
  } catch (error) {
    console.error('Failed to read legacy bills:', error)
  }

  try {
    const goalsData = localStorage.getItem(GOALS_KEY)
    if (goalsData) {
      const parsed = JSON.parse(goalsData)
      if (Array.isArray(parsed)) {
        goals.push(...parsed)
      }
    }
  } catch (error) {
    console.error('Failed to read legacy goals:', error)
  }

  try {
    language = localStorage.getItem(LANGUAGE_KEY)
  } catch (error) {
    console.error('Failed to read legacy language:', error)
  }

  return { bills, goals, language }
}

/**
 * Converts App Bill to DB Bill format
 */
function convertBill(bill: AppBill): Omit<DbBill, 'id'> {
  return {
    description: bill.description,
    amount: bill.amount,
    dueDate: new Date(bill.dueDate),
    status: bill.status,
    recurrence: bill.recurrence,
    createdAt: new Date(bill.createdAt || new Date()),
    updatedAt: new Date(),
  }
}

/**
 * Converts App Goal to DB Goal format
 */
function convertGoal(goal: AppGoal): Omit<DbGoal, 'id'> {
  return {
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: new Date(goal.deadline),
    type: goal.type,
    createdAt: new Date(goal.createdAt || new Date()),
    updatedAt: new Date(),
  }
}

/**
 * Migrates data from localStorage to Dexie
 */
async function migrateData(data: LegacyData): Promise<void> {
  console.log('Starting migration:', {
    billsCount: data.bills.length,
    goalsCount: data.goals.length,
    hasLanguage: !!data.language,
  })

  // Migrate bills
  if (data.bills.length > 0) {
    for (const bill of data.bills) {
      try {
        await db.bills.add(convertBill(bill))
        console.log('Migrated bill:', bill.description)
      } catch (error) {
        console.error('Failed to migrate bill:', bill.description, error)
      }
    }
  }

  // Migrate goals
  if (data.goals.length > 0) {
    for (const goal of data.goals) {
      try {
        await db.goals.add(convertGoal(goal))
        console.log('Migrated goal:', goal.description)
      } catch (error) {
        console.error('Failed to migrate goal:', goal.description, error)
      }
    }
  }

  // Migrate language setting
  if (data.language) {
    try {
      await db.settings.add({
        key: LANGUAGE_KEY,
        value: data.language,
        updatedAt: new Date(),
      })
      console.log('Migrated language:', data.language)
    } catch (error) {
      console.error('Failed to migrate language:', error)
    }
  }
}

/**
 * Cleans up legacy localStorage data
 */
function cleanupLegacyData(): void {
  try {
    localStorage.removeItem(BILLS_KEY)
    console.log('Removed legacy bills from localStorage')
  } catch (error) {
    console.error('Failed to remove legacy bills:', error)
  }

  try {
    localStorage.removeItem(GOALS_KEY)
    console.log('Removed legacy goals from localStorage')
  } catch (error) {
    console.error('Failed to remove legacy goals:', error)
  }

  try {
    localStorage.removeItem(LANGUAGE_KEY)
    console.log('Removed legacy language from localStorage')
  } catch (error) {
    console.error('Failed to remove legacy language:', error)
  }
}

/**
 * Checks if migration has already been completed
 */
function isMigrationComplete(): boolean {
  try {
    return sessionStorage.getItem(MIGRATION_FLAG) === 'true'
  } catch {
    return false
  }
}

/**
 * Marks migration as complete
 */
function markMigrationComplete(): void {
  try {
    sessionStorage.setItem(MIGRATION_FLAG, 'true')
    console.log('Migration marked as complete')
  } catch (error) {
    console.error('Failed to mark migration as complete:', error)
  }
}

/**
 * Main migration function - executes once per session
 */
export async function migrateLocalStorageToDexie(): Promise<{
  success: boolean
  error?: Error
  migrated: { bills: number; goals: number; language: boolean }
}> {
  // Check if migration already done in this session
  if (isMigrationComplete()) {
    console.log('Migration already completed in this session')
    return {
      success: true,
      migrated: { bills: 0, goals: 0, language: false },
    }
  }

  try {
    // Read legacy data
    const legacyData = readLegacyData()

    // Check if there's anything to migrate
    const hasData =
      legacyData.bills.length > 0 ||
      legacyData.goals.length > 0 ||
      legacyData.language !== null

    if (!hasData) {
      console.log('No legacy data found to migrate')
      markMigrationComplete()
      return {
        success: true,
        migrated: { bills: 0, goals: 0, language: false },
      }
    }

    // Perform migration
    await migrateData(legacyData)

    // Clean up old data
    cleanupLegacyData()

    // Mark as complete
    markMigrationComplete()

    console.log('Migration completed successfully')
    return {
      success: true,
      migrated: {
        bills: legacyData.bills.length,
        goals: legacyData.goals.length,
        language: !!legacyData.language,
      },
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown migration error'),
      migrated: { bills: 0, goals: 0, language: false },
    }
  }
}

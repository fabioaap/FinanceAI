/**
 * Migration Script: localStorage to Dexie
 * 
 * This script migrates data from localStorage (used by adapters) to Dexie (IndexedDB).
 * It handles:
 * - Bills: from 'financeai-bills' localStorage key to Dexie bills table
 * - Goals: from 'financeai-goals' localStorage key to Dexie goals table
 * - Language: from 'app-language' localStorage key to Dexie settings table
 * 
 * Usage:
 * import { runMigration } from '@/scripts/migrate-to-dexie'
 * await runMigration()
 */

import { billRepository } from '@/repositories/BillRepository';
import { goalRepository } from '@/repositories/GoalRepository';
import { settingsRepository } from '@/repositories/SettingsRepository';
import { Bill as AppBill, Goal as AppGoal } from '@/lib/types';
import { Bill, Goal } from '@/types';

const BILLS_KEY = 'financeai-bills';
const GOALS_KEY = 'financeai-goals';
const LANGUAGE_KEY = 'app-language';

interface MigrationResult {
  success: boolean;
  billsMigrated: number;
  goalsMigrated: number;
  languageMigrated: boolean;
  errors: string[];
}

/**
 * Migrate bills from localStorage to Dexie
 */
async function migrateBills(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const stored = localStorage.getItem(BILLS_KEY);
    if (!stored) {
      return { count: 0, errors: [] };
    }

    const bills: AppBill[] = JSON.parse(stored);
    
    for (const bill of bills) {
      try {
        const dbBill: Omit<Bill, 'id'> = {
          description: bill.description,
          amount: bill.amount,
          dueDate: new Date(bill.dueDate),
          status: bill.status,
          recurrence: bill.recurrence,
          createdAt: new Date(bill.createdAt),
          updatedAt: new Date(),
        };
        
        await billRepository.create(dbBill);
        count++;
      } catch (error) {
        errors.push(`Failed to migrate bill "${bill.description}": ${error}`);
      }
    }

    // Backup old data before removing
    localStorage.setItem(`${BILLS_KEY}-backup`, stored);
    localStorage.removeItem(BILLS_KEY);
    
  } catch (error) {
    errors.push(`Failed to parse bills from localStorage: ${error}`);
  }

  return { count, errors };
}

/**
 * Migrate goals from localStorage to Dexie
 */
async function migrateGoals(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const stored = localStorage.getItem(GOALS_KEY);
    if (!stored) {
      return { count: 0, errors: [] };
    }

    const goals: AppGoal[] = JSON.parse(stored);
    
    for (const goal of goals) {
      try {
        const dbGoal: Omit<Goal, 'id'> = {
          description: goal.description,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: new Date(goal.deadline),
          type: goal.type,
          createdAt: new Date(goal.createdAt),
          updatedAt: new Date(),
        };
        
        await goalRepository.create(dbGoal);
        count++;
      } catch (error) {
        errors.push(`Failed to migrate goal "${goal.description}": ${error}`);
      }
    }

    // Backup old data before removing
    localStorage.setItem(`${GOALS_KEY}-backup`, stored);
    localStorage.removeItem(GOALS_KEY);
    
  } catch (error) {
    errors.push(`Failed to parse goals from localStorage: ${error}`);
  }

  return { count, errors };
}

/**
 * Migrate language preference from localStorage to Dexie
 */
async function migrateLanguage(): Promise<{ migrated: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    const language = localStorage.getItem(LANGUAGE_KEY);
    if (!language) {
      return { migrated: false, errors: [] };
    }

    await settingsRepository.setByKey(LANGUAGE_KEY, language);
    
    // Backup old data before removing
    localStorage.setItem(`${LANGUAGE_KEY}-backup`, language);
    localStorage.removeItem(LANGUAGE_KEY);
    
    return { migrated: true, errors: [] };
  } catch (error) {
    errors.push(`Failed to migrate language: ${error}`);
    return { migrated: false, errors };
  }
}

/**
 * Run the complete migration
 */
export async function runMigration(): Promise<MigrationResult> {
  console.log('Starting migration from localStorage to Dexie...');

  const billsResult = await migrateBills();
  console.log(`Migrated ${billsResult.count} bills`);

  const goalsResult = await migrateGoals();
  console.log(`Migrated ${goalsResult.count} goals`);

  const languageResult = await migrateLanguage();
  console.log(`Language migrated: ${languageResult.migrated}`);

  const allErrors = [
    ...billsResult.errors,
    ...goalsResult.errors,
    ...languageResult.errors,
  ];

  if (allErrors.length > 0) {
    console.error('Migration completed with errors:', allErrors);
  } else {
    console.log('Migration completed successfully!');
  }

  return {
    success: allErrors.length === 0,
    billsMigrated: billsResult.count,
    goalsMigrated: goalsResult.count,
    languageMigrated: languageResult.migrated,
    errors: allErrors,
  };
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  return (
    localStorage.getItem(BILLS_KEY) !== null ||
    localStorage.getItem(GOALS_KEY) !== null ||
    localStorage.getItem(LANGUAGE_KEY) !== null
  );
}

/**
 * Restore from backup (in case migration fails)
 */
export function restoreFromBackup(): void {
  const billsBackup = localStorage.getItem(`${BILLS_KEY}-backup`);
  if (billsBackup) {
    localStorage.setItem(BILLS_KEY, billsBackup);
  }

  const goalsBackup = localStorage.getItem(`${GOALS_KEY}-backup`);
  if (goalsBackup) {
    localStorage.setItem(GOALS_KEY, goalsBackup);
  }

  const languageBackup = localStorage.getItem(`${LANGUAGE_KEY}-backup`);
  if (languageBackup) {
    localStorage.setItem(LANGUAGE_KEY, languageBackup);
  }

  console.log('Restored from backup');
}

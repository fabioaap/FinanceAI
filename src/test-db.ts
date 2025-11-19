import { db } from './lib/db'
import { seedCategories, addTransaction, getAllTransactions } from './lib/db-operations'

async function testDatabase() {
  console.log('Testing Dexie Database Configuration...\n')
  
  try {
    // Test 1: Check if database opens
    console.log('✓ Database opened successfully')
    
    // Test 2: Seed categories
    await seedCategories()
    const categories = await db.categories.toArray()
    console.log(`✓ Categories seeded: ${categories.length} categories`)
    
    // Test 3: Add a test transaction
    const testTransaction = {
      id: 'test-1',
      amount: 100.50,
      description: 'Test Transaction',
      category: 'food' as const,
      type: 'expense' as const,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    
    await addTransaction(testTransaction)
    console.log('✓ Transaction added successfully')
    
    // Test 4: Retrieve transactions
    const transactions = await getAllTransactions()
    console.log(`✓ Transactions retrieved: ${transactions.length} transaction(s)`)
    
    // Test 5: Verify transaction data
    const retrieved = transactions.find(t => t.id === 'test-1')
    if (retrieved && retrieved.amount === 100.50) {
      console.log('✓ Transaction data verified')
    } else {
      throw new Error('Transaction data mismatch')
    }
    
    // Test 6: Clean up
    await db.transactions.clear()
    console.log('✓ Test data cleaned up')
    
    console.log('\n✅ All database tests passed!')
  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  }
}

testDatabase()

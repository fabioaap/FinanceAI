import { addTransaction, getAllTransactions, getTransactionsByType } from '@financeai/infra-db';

/**
 * Example usage of the @financeai/infra-db package
 * 
 * This example demonstrates how to:
 * - Add transactions to the database
 * - Retrieve all transactions
 * - Filter transactions by type
 */

async function runExample() {
  try {
    console.log('=== FinanceAI Database Example ===\n');

    // Add some sample transactions
    console.log('Adding transactions...');
    
    const expense1Id = await addTransaction({
      amount: 45.50,
      description: 'Grocery shopping at Supermarket',
      category: 'Food',
      date: new Date('2024-01-15'),
      type: 'expense'
    });
    console.log(`Added expense transaction with ID: ${expense1Id}`);

    const income1Id = await addTransaction({
      amount: 2500.00,
      description: 'Monthly salary',
      category: 'Salary',
      date: new Date('2024-01-01'),
      type: 'income'
    });
    console.log(`Added income transaction with ID: ${income1Id}`);

    const expense2Id = await addTransaction({
      amount: 85.00,
      description: 'Electric bill',
      category: 'Utilities',
      date: new Date('2024-01-10'),
      type: 'expense'
    });
    console.log(`Added expense transaction with ID: ${expense2Id}`);

    // Retrieve all transactions
    console.log('\n=== All Transactions ===');
    const allTransactions = await getAllTransactions();
    console.log(`Total transactions: ${allTransactions.length}`);
    allTransactions.forEach(t => {
      console.log(`- [${t.type}] ${t.description}: $${t.amount} (${t.category})`);
    });

    // Get expenses only
    console.log('\n=== Expenses Only ===');
    const expenses = await getTransactionsByType('expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    console.log(`Total expenses: $${totalExpenses.toFixed(2)}`);
    expenses.forEach(t => {
      console.log(`- ${t.description}: $${t.amount}`);
    });

    // Get income only
    console.log('\n=== Income Only ===');
    const income = await getTransactionsByType('income');
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    console.log(`Total income: $${totalIncome.toFixed(2)}`);
    income.forEach(t => {
      console.log(`- ${t.description}: $${t.amount}`);
    });

    // Calculate balance
    console.log('\n=== Financial Summary ===');
    console.log(`Total Income: $${totalIncome.toFixed(2)}`);
    console.log(`Total Expenses: $${totalExpenses.toFixed(2)}`);
    console.log(`Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}`);

  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}

export { runExample };

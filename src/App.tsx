import { useTransactions, useCategories } from './hooks';

function App() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();

  if (transactionsLoading || categoriesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Finance AI</h1>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <p className="text-gray-600">
              Total Categories: {categories.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Transactions</h2>
            <p className="text-gray-600">
              Total Transactions: {transactions.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

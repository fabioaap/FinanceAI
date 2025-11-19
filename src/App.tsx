import { useState } from 'react';
import { useTransactions, useCategories } from './hooks';

function App() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('');
  
  const { 
    transactions, 
    loading: transactionsLoading, 
    createTransaction,
    deleteTransaction,
    getTotalByType 
  } = useTransactions();
  
  const { 
    categories, 
    loading: categoriesLoading,
    createCategory,
    deleteCategory 
  } = useCategories();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    try {
      await createCategory({
        name: categoryName,
        type: 'expense',
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setCategoryName('');
    } catch (error) {
      alert(error);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || categories.length === 0) return;
    
    try {
      await createTransaction({
        description,
        amount: parseFloat(amount),
        type: 'expense',
        categoryId: categories[0].id!,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setDescription('');
      setAmount('');
      
      // Update totals
      const income = await getTotalByType('income');
      const expense = await getTotalByType('expense');
      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (error) {
      alert(error);
    }
  };

  if (transactionsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Finance AI</h1>
          <p className="text-gray-600">
            Demonstração do Repository Pattern com Dexie e React Hooks
          </p>
        </header>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Categorias</h3>
            <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Transações</h3>
            <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Saldo</h3>
            <p className="text-3xl font-bold text-green-600">
              R$ {(totalIncome - totalExpense).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Adicionar Categoria</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Nome da categoria"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Adicionar Categoria
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <button
                    onClick={() => deleteCategory(category.id!)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Adicionar Transação</h2>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Valor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={categories.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                Adicionar Transação
              </button>
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">
                  Crie uma categoria primeiro
                </p>
              )}
            </form>

            <div className="mt-4 space-y-2">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-600">
                      R$ {transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(transaction.id!)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Sobre esta implementação
          </h3>
          <p className="text-blue-800 mb-3">
            Este aplicativo demonstra o <strong>Repository Pattern</strong> isolando completamente 
            a lógica do Dexie (IndexedDB) dos componentes React através de:
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li><strong>Repositories</strong>: Classes que encapsulam acesso aos dados</li>
            <li><strong>Custom Hooks</strong>: useTransactions, useCategories, etc.</li>
            <li><strong>Separação de Responsabilidades</strong>: UI não conhece Dexie</li>
            <li><strong>Testabilidade</strong>: Fácil mockar em testes unitários</li>
          </ul>
          <p className="text-blue-800 mt-3">
            Consulte <code className="bg-blue-100 px-2 py-1 rounded">REPOSITORY_PATTERN.md</code> para documentação completa.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

import AuthButton from '@/components/AuthButton'
import { authOptions } from './api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Gestão Financeira Inteligente
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Controle suas finanças com inteligência artificial e sincronize seus dados em tempo real
          </p>
        </div>

        {session?.user ? (
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Bem-vindo, {session.user.name}!
              </h3>
              <p className="text-gray-600 mb-6">
                Sua conta está sincronizada e pronta para uso. Seus dados financeiros estão seguros e acessíveis de qualquer lugar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Sincronização</h4>
                  <p className="text-sm text-blue-700">Dados sincronizados automaticamente</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Segurança</h4>
                  <p className="text-sm text-green-700">OAuth 2.0 para máxima proteção</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Acesso</h4>
                  <p className="text-sm text-purple-700">Disponível em qualquer dispositivo</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Comece Agora
              </h3>
              <p className="text-gray-600 mb-6">
                Faça login com sua conta Google ou GitHub para começar a usar o FinanceAI e sincronizar seus dados financeiros.
              </p>
              <div className="flex justify-center">
                <AuthButton />
              </div>
            </div>
          </div>
        )}

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Recursos Principais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Dashboard Intuitivo</h4>
              <p className="text-sm text-gray-600">Visualize suas finanças de forma clara e objetiva</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-3xl mb-3">🔄</div>
              <h4 className="font-semibold text-gray-900 mb-2">Sincronização em Tempo Real</h4>
              <p className="text-sm text-gray-600">Seus dados sempre atualizados em todos os dispositivos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-3xl mb-3">🤖</div>
              <h4 className="font-semibold text-gray-900 mb-2">IA Integrada</h4>
              <p className="text-sm text-gray-600">Insights inteligentes sobre seus gastos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-3xl mb-3">🔒</div>
              <h4 className="font-semibold text-gray-900 mb-2">Segurança Total</h4>
              <p className="text-sm text-gray-600">Autenticação OAuth para máxima proteção</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

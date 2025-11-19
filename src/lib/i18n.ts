export type Language = 'en' | 'pt-BR'

export interface Translations {
  app: {
    title: string
    subtitle: string
  }
  navigation: {
    dashboard: string
    history: string
    settings: string
  }
  summary: {
    income: string
    expenses: string
    balance: string
  }
  categories: {
    shopping: string
    home: string
    transport: string
    food: string
    health: string
    work: string
    education: string
    entertainment: string
    other: string
  }
  bills: {
    title: string
    noBills: string
    addBill: string
    dueDate: string
    paid: string
    pending: string
    overdue: string
    markAsPaid: string
    markAsUnpaid: string
  }
  goals: {
    title: string
    noGoals: string
    addGoal: string
    progress: string
    deadline: string
    savings: string
    debt: string
    reserve: string
  }
  transactions: {
    title: string
    noTransactions: string
    addTransaction: string
    income: string
    expense: string
    amount: string
    description: string
    category: string
    date: string
    type: string
    delete: string
    deleteConfirm: string
    deleted: string
  }
  modals: {
    cancel: string
    save: string
    add: string
  }
  insights: {
    title: string
    generating: string
    error: string
    retry: string
  }
  categoryBreakdown: {
    title: string
    noExpenses: string
  }
  settings: {
    title: string
    language: string
    languageDescription: string
    appearance: string
    currency: string
    notifications: string
  }
}

const en: Translations = {
  app: {
    title: 'FinanceAI',
    subtitle: 'Personal Finance Dashboard',
  },
  navigation: {
    dashboard: 'Dashboard',
    history: 'History',
    settings: 'Settings',
  },
  summary: {
    income: 'Income',
    expenses: 'Expenses',
    balance: 'Balance',
  },
  categories: {
    shopping: 'Shopping',
    home: 'Home',
    transport: 'Transport',
    food: 'Food & Dining',
    health: 'Health',
    work: 'Work',
    education: 'Education',
    entertainment: 'Entertainment',
    other: 'Other',
  },
  bills: {
    title: 'Upcoming Bills',
    noBills: 'No bills scheduled',
    addBill: 'Add Bill',
    dueDate: 'Due',
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    markAsPaid: 'Mark as paid',
    markAsUnpaid: 'Mark as unpaid',
  },
  goals: {
    title: 'Savings Goals',
    noGoals: 'No goals yet',
    addGoal: 'Add Goal',
    progress: 'progress',
    deadline: 'Deadline',
    savings: 'Savings',
    debt: 'Debt Payment',
    reserve: 'Emergency Reserve',
  },
  transactions: {
    title: 'Transaction History',
    noTransactions: 'No transactions yet',
    addTransaction: 'Add Transaction',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    date: 'Date',
    type: 'Type',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this transaction?',
    deleted: 'Transaction deleted',
  },
  modals: {
    cancel: 'Cancel',
    save: 'Save',
    add: 'Add',
  },
  insights: {
    title: 'AI Insights',
    generating: 'Generating insights...',
    error: 'Failed to generate insights',
    retry: 'Try Again',
  },
  categoryBreakdown: {
    title: 'Spending by Category',
    noExpenses: 'No expenses yet',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    languageDescription: 'Choose your preferred language',
    appearance: 'Appearance',
    currency: 'Currency',
    notifications: 'Notifications',
  },
}

const ptBR: Translations = {
  app: {
    title: 'FinanceAI',
    subtitle: 'Painel de Finanças Pessoais',
  },
  navigation: {
    dashboard: 'Painel',
    history: 'Histórico',
    settings: 'Configurações',
  },
  summary: {
    income: 'Receitas',
    expenses: 'Despesas',
    balance: 'Saldo',
  },
  categories: {
    shopping: 'Compras',
    home: 'Casa',
    transport: 'Transporte',
    food: 'Alimentação',
    health: 'Saúde',
    work: 'Trabalho',
    education: 'Educação',
    entertainment: 'Entretenimento',
    other: 'Outros',
  },
  bills: {
    title: 'Contas a Pagar',
    noBills: 'Nenhuma conta agendada',
    addBill: 'Adicionar Conta',
    dueDate: 'Vencimento',
    paid: 'Paga',
    pending: 'Pendente',
    overdue: 'Atrasada',
    markAsPaid: 'Marcar como paga',
    markAsUnpaid: 'Marcar como não paga',
  },
  goals: {
    title: 'Metas de Economia',
    noGoals: 'Nenhuma meta ainda',
    addGoal: 'Adicionar Meta',
    progress: 'progresso',
    deadline: 'Prazo',
    savings: 'Economia',
    debt: 'Pagamento de Dívida',
    reserve: 'Reserva de Emergência',
  },
  transactions: {
    title: 'Histórico de Transações',
    noTransactions: 'Nenhuma transação ainda',
    addTransaction: 'Adicionar Transação',
    income: 'Receita',
    expense: 'Despesa',
    amount: 'Valor',
    description: 'Descrição',
    category: 'Categoria',
    date: 'Data',
    type: 'Tipo',
    delete: 'Excluir',
    deleteConfirm: 'Tem certeza que deseja excluir esta transação?',
    deleted: 'Transação excluída',
  },
  modals: {
    cancel: 'Cancelar',
    save: 'Salvar',
    add: 'Adicionar',
  },
  insights: {
    title: 'Insights de IA',
    generating: 'Gerando insights...',
    error: 'Falha ao gerar insights',
    retry: 'Tentar Novamente',
  },
  categoryBreakdown: {
    title: 'Gastos por Categoria',
    noExpenses: 'Nenhuma despesa ainda',
  },
  settings: {
    title: 'Configurações',
    language: 'Idioma',
    languageDescription: 'Escolha seu idioma preferido',
    appearance: 'Aparência',
    currency: 'Moeda',
    notifications: 'Notificações',
  },
}

export const translations: Record<Language, Translations> = {
  en,
  'pt-BR': ptBR,
}

export const getTranslation = (language: Language): Translations => {
  return translations[language]
}

export const getLanguageName = (language: Language): string => {
  const names: Record<Language, string> = {
    en: 'English',
    'pt-BR': 'Português (Brasil)',
  }
  return names[language]
}

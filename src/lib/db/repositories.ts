import { db, DBTransaction, Bill, Goal, Category } from './schema';

// Transaction Repository
export const transactionRepository = {
  async add(transaction: Omit<DBTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    return db.transactions.add({
      ...transaction,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getAll(): Promise<DBTransaction[]> {
    return db.transactions.orderBy('date').reverse().toArray();
  },

  async getById(id: number): Promise<DBTransaction | undefined> {
    return db.transactions.get(id);
  },

  async update(id: number, changes: Partial<DBTransaction>): Promise<number> {
    return db.transactions.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: number): Promise<void> {
    await db.transactions.delete(id);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<DBTransaction[]> {
    return db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async getByCategory(category: string): Promise<DBTransaction[]> {
    return db.transactions.where('category').equals(category).toArray();
  },

  async clear(): Promise<void> {
    await db.transactions.clear();
  },
};

// Bill Repository
export const billRepository = {
  async add(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    return db.bills.add({
      ...bill,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getAll(): Promise<Bill[]> {
    return db.bills.orderBy('dueDate').toArray();
  },

  async getById(id: number): Promise<Bill | undefined> {
    return db.bills.get(id);
  },

  async update(id: number, changes: Partial<Bill>): Promise<number> {
    return db.bills.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: number): Promise<void> {
    await db.bills.delete(id);
  },

  async getUnpaid(): Promise<Bill[]> {
    return db.bills.where('isPaid').equals(0).toArray();
  },

  async clear(): Promise<void> {
    await db.bills.clear();
  },
};

// Goal Repository
export const goalRepository = {
  async add(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    return db.goals.add({
      ...goal,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getAll(): Promise<Goal[]> {
    return db.goals.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: number): Promise<Goal | undefined> {
    return db.goals.get(id);
  },

  async update(id: number, changes: Partial<Goal>): Promise<number> {
    return db.goals.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: number): Promise<void> {
    await db.goals.delete(id);
  },

  async clear(): Promise<void> {
    await db.goals.clear();
  },
};

// Category Repository
export const categoryRepository = {
  async add(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    return db.categories.add({
      ...category,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getAll(): Promise<Category[]> {
    return db.categories.orderBy('name').toArray();
  },

  async getById(id: number): Promise<Category | undefined> {
    return db.categories.get(id);
  },

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    return db.categories.where('type').equals(type).toArray();
  },

  async update(id: number, changes: Partial<Category>): Promise<number> {
    return db.categories.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: number): Promise<void> {
    await db.categories.delete(id);
  },

  async clear(): Promise<void> {
    await db.categories.clear();
  },
};

// Settings Repository
export const settingsRepository = {
  async set<T>(key: string, value: T): Promise<string> {
    return db.settings.put({
      key,
      value: JSON.stringify(value),
    });
  },

  async get<T>(key: string): Promise<T | undefined> {
    const setting = await db.settings.get(key);
    if (!setting) return undefined;
    try {
      return JSON.parse(setting.value) as T;
    } catch {
      return undefined;
    }
  },

  async delete(key: string): Promise<void> {
    await db.settings.delete(key);
  },

  async getAll(): Promise<Record<string, unknown>> {
    const settings = await db.settings.toArray();
    const result: Record<string, unknown> = {};
    settings.forEach((setting) => {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    });
    return result;
  },

  async clear(): Promise<void> {
    await db.settings.clear();
  },
};

import { Table } from 'dexie';

export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | undefined>;
  create(item: Omit<T, 'id'>): Promise<number>;
  update(id: number, item: Partial<T>): Promise<number>;
  delete(id: number): Promise<void>;
}

export abstract class BaseRepository<T extends { id?: number }> implements IRepository<T> {
  constructor(protected table: Table<T>) {}

  async getAll(): Promise<T[]> {
    return await this.table.toArray();
  }

  async getById(id: number): Promise<T | undefined> {
    return await this.table.get(id);
  }

  async create(item: Omit<T, 'id'>): Promise<number> {
    const now = new Date();
    const itemWithTimestamps = {
      ...item,
      createdAt: now,
      updatedAt: now,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await this.table.add(itemWithTimestamps as any);
  }

  async update(id: number, item: Partial<T>): Promise<number> {
    const updatedItem = {
      ...item,
      updatedAt: new Date(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await this.table.update(id, updatedItem as any);
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id);
  }
}

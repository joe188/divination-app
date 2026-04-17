// react-native-quick-sqlite API 适配器
// 提供与旧代码兼容的 API

import { DB } from 'react-native-quick-sqlite';
import { getDatabase } from './Database';

export class DatabaseAdapter {
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  // 执行 SQL 语句（不返回结果）
  async executeSql(sql: string, params: any[] = []): Promise<void> {
    this.db.run(sql, params);
  }

  // 执行查询（返回结果）
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = this.db.execute(sql, params);
    return result.rows?._array || [];
  }

  // 执行单个查询
  async querySingle<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = this.db.execute(sql, params);
    return result.rows?._array?.[0] || null;
  }

  // 执行事务
  async executeTransaction(callback: (tx: TransactionAdapter) => Promise<void>): Promise<void> {
    // react-native-quick-sqlite 不支持事务，直接执行回调
    const tx = new TransactionAdapter(this.db);
    await callback(tx);
  }
}

export class TransactionAdapter {
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async executeSql(sql: string, params: any[] = []): Promise<void> {
    this.db.run(sql, params);
  }
}

// 辅助函数
export const adaptDatabase = (db: DB): DatabaseAdapter => {
  return new DatabaseAdapter(db);
};

// 全局适配器实例
let adapter: DatabaseAdapter | null = null;

export const getAdapter = (): DatabaseAdapter => {
  if (!adapter) {
    adapter = new DatabaseAdapter(getDatabase());
  }
  return adapter;
};

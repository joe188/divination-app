/**
 * 数据库适配器 - 基于 @op-engineering/op-sqlite
 */

import { getDatabase } from './Database';

export class DatabaseAdapter {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // 执行 SQL 语句（不返回结果）
  async executeSql(sql: string, params: any[] = []): Promise<void> {
    await this.db.execute(sql, params);
  }

  // 执行查询（返回结果）
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return result as T[];
  }

  // 同步执行（用于兼容旧代码）
  executeSync(sql: string, params: any[] = []): any {
    return this.db.execute(sql, params);
  }

  // 同步查询
  querySync<T = any>(sql: string, params: any[] = []): T[] {
    return this.db.query(sql, params) as T[];
  }

  // 事务
  async transaction(fn: (tx: any) => Promise<void>): Promise<void> {
    await this.db.transaction(fn);
  }

  // 关闭数据库
  async close(): Promise<void> {
    await this.db.close();
  }
}

// 导出类型
export type Scalar = string | number | boolean | null;

export default DatabaseAdapter;

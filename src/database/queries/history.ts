// 历史记录数据库操作
import { getDatabase } from '../Database';
import { DivinationRecord, DivinationRecordSummary } from '../models/DivinationRecord';

// 字段映射
const FIELD_MAP: Record<string, string> = {
  id: 'id',
  createdAt: 'created_at',
  baziType: 'bazi_type',
  solarDate: 'solar_date',
  lunarDate: 'lunar_date',
  timePeriod: 'time_period',
  yearGanzhi: 'year_ganzhi',
  monthGanzhi: 'month_ganzhi',
  dayGanzhi: 'day_ganzhi',
  hourGanzhi: 'hour_ganzhi',
  wuxingData: 'wuxing_data',
  shishenData: 'shishen_data',
  location: 'location',
  timeCorrection: 'time_correction',
  aiInterpretation: 'ai_interpretation',
  userNotes: 'user_notes',
  isFavorite: 'is_favorite',
};

// 记录转数据库字段
function recordToDbFields(record: Partial<DivinationRecord>): any {
  const fields: any = {};
  for (const [key, dbField] of Object.entries(FIELD_MAP)) {
    if (key === 'id') continue; // id 不插入
    const value = (record as any)[key];
    if (value !== undefined && value !== null) {
      fields[dbField] = value;
    }
  }
  return fields;
}

// 数据库行转记录
function rowToRecord(row: any): DivinationRecord {
  const record: any = {};
  for (const [key, dbField] of Object.entries(FIELD_MAP)) {
    if (row[dbField] !== undefined) {
      record[key] = row[dbField];
    }
  }
  return record as DivinationRecord;
}

/**
 * 插入新记录
 */
export async function insertRecord(record: DivinationRecord): Promise<number> {
  const db = getDatabase();
  const fields = recordToDbFields(record);
  const columns = Object.keys(fields).join(', ');
  const placeholders = Object.keys(fields).map(() => '?').join(', ');

  const result = db.executeSync(
    `INSERT INTO divination_history (${columns}) VALUES (${placeholders})`,
    Object.values(fields)
  );

  return result.insertId || 0;
}

/**
 * 批量插入记录
 */
export async function insertRecords(records: DivinationRecord[]): Promise<void> {
  if (records.length === 0) return;

  const db = getDatabase();
  for (const record of records) {
    const fields = recordToDbFields(record);
    const columns = Object.keys(fields).join(', ');
    const placeholders = Object.keys(fields).map(() => '?').join(', ');
    db.executeSync(
      `INSERT INTO divination_history (${columns}) VALUES (${placeholders})`,
      Object.values(fields)
    );
  }
}

/**
 * 查询单条记录
 */
export async function getRecordById(id: number): Promise<DivinationRecord | null> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM divination_history WHERE id = ?`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }
  return rowToRecord(result.rows[0]);
}

/**
 * 获取最近记录（用于首页列表）
 */
export async function getRecentRecords(
  limit: number = 10,
  offset: number = 0
): Promise<DivinationRecord[]> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM divination_history
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return result.rows.map(row => rowToRecord(row));
}

/**
 * 获取收藏记录
 */
export async function getFavoriteRecords(
  limit: number = 50,
  offset: number = 0
): Promise<DivinationRecord[]> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM divination_history
     WHERE is_favorite = 1
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return result.rows.map(row => rowToRecord(row));
}

/**
 * 按类型查询记录
 */
export async function getRecordsByType(
  type: string,
  limit: number = 50,
  offset: number = 0
): Promise<DivinationRecord[]> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM divination_history
     WHERE bazi_type = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [type, limit, offset]
  );

  return result.rows.map(row => rowToRecord(row));
}

/**
 * 搜索记录（按八字或农历日期）
 */
export async function searchRecords(
  query: string,
  limit: number = 50
): Promise<DivinationRecord[]> {
  const db = getDatabase();
  const pattern = `%${query}%`;
  const result = db.executeSync(
    `SELECT * FROM divination_history
     WHERE lunar_date LIKE ?
        OR year_ganzhi LIKE ?
        OR month_ganzhi LIKE ?
        OR day_ganzhi LIKE ?
        OR hour_ganzhi LIKE ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [pattern, pattern, pattern, pattern, pattern, limit]
  );

  return result.rows.map(row => rowToRecord(row));
}

/**
 * 更新记录
 */
export async function updateRecord(
  id: number,
  updates: Partial<DivinationRecord>
): Promise<void> {
  const db = getDatabase();
  const fields = recordToDbFields(updates);
  const setClause = Object.keys(fields)
    .map(col => `${col} = ?`)
    .join(', ');
  const params: any[] = [...Object.values(fields), id];

  db.executeSync(
    `UPDATE divination_history SET ${setClause} WHERE id = ?`,
    params
  );
}

/**
 * 切换收藏状态
 */
export async function toggleFavorite(id: number): Promise<boolean> {
  const record = await getRecordById(id);
  if (!record) {
    throw new Error(`Record ${id} not found`);
  }

  const db = getDatabase();
  const newStatus = record.isFavorite ? 0 : 1;
  db.executeSync(
    `UPDATE divination_history SET is_favorite = ? WHERE id = ?`,
    [newStatus, id]
  );

  return newStatus === 1;
}

/**
 * 删除记录
 */
export async function deleteRecord(id: number): Promise<void> {
  const db = getDatabase();
  db.executeSync(`DELETE FROM divination_history WHERE id = ?`, [id]);
}

/**
 * 清空所有记录
 */
export async function clearAllRecords(): Promise<void> {
  const db = getDatabase();
  db.executeSync(`DELETE FROM divination_history`);
}

/**
 * 获取统计信息
 */
export async function getStatistics(): Promise<{
  total: number;
  byType: Record<string, number>;
  recent7Days: number;
  favoriteCount: number;
}> {
  const db = getDatabase();

  // 总数
  const totalResult = db.executeSync(
    `SELECT COUNT(*) as count FROM divination_history`
  );
  const total = totalResult.rows[0]?.count || 0;

  // 按类型分组
  const typeResult = db.executeSync(
    `SELECT bazi_type, COUNT(*) as count
     FROM divination_history
     GROUP BY bazi_type`
  );
  const byType: Record<string, number> = {};
  for (const item of typeResult.rows?.[0] ? typeResult.rows : []) {
    byType[item.bazi_type as string] = Number(item.count) || 0;
  }

  // 最近7天
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentResult = db.executeSync(
    `SELECT COUNT(*) as count FROM divination_history WHERE created_at > ?`,
    [weekAgo]
  );
  const recent7Days = Number(recentResult.rows[0]?.count) || 0;

  // 收藏数
  const favResult = db.executeSync(
    `SELECT COUNT(*) as count FROM divination_history WHERE is_favorite = 1`
  );
  const favoriteCount = Number((favResult.rows?.[0] as any)?.count) || 0;

  return { 
    total: Number(total) || 0, 
    byType, 
    recent7Days: Number(recent7Days) || 0, 
    favoriteCount: Number(favoriteCount) || 0 
  };
}

export default {
  getRecentRecords,
  getRecordById,
  insertRecord,
  updateRecord,
  toggleFavorite,
  deleteRecord,
  getStatistics,
};

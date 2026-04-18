/**
 * 设置相关数据库查询
 */

import Database, { getDatabase } from '../Database';

/**
 * 获取设置值
 */
export async function getSetting<T>(key: string): Promise<T | null> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT value FROM settings WHERE key = ?`,
    [key]
  );
  
  if (result.rows && result.rows.length > 0) {
    return JSON.parse(result.rows[0].value as string);
  }
  
  return null;
}

/**
 * 保存设置值
 */
export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = getDatabase();
  db.executeSync(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    [key, JSON.stringify(value), Date.now()]
  );
}

/**
 * 获取 AI 配置
 */
export async function getAIConfig(): Promise<any> {
  return await getSetting('ai_config');
}

/**
 * 保存 AI 配置
 */
export async function setAIConfig(config: any): Promise<void> {
  await setSetting('ai_config', config);
}

/**
 * 设置主题模式
 */
export async function setThemeMode(mode: 'light' | 'dark' | 'auto'): Promise<void> {
  await setSetting('theme_mode', mode);
}

/**
 * 获取主题模式
 */
export async function getThemeMode(): Promise<'light' | 'dark' | 'auto' | null> {
  return await getSetting<'light' | 'dark' | 'auto'>('theme_mode');
}

export default {
  getSetting,
  setSetting,
  getAIConfig,
  setAIConfig,
  setThemeMode,
  getThemeMode,
};

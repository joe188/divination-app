// 应用设置数据库操作
import { getDatabase } from '../Database';
import { SettingKeys, type SettingKey } from '../models/Setting';

const SETTINGS_TABLE = 'app_settings';

/**
 * 获取设置值
 */
export async function getSetting<T = string>(
  key: SettingKey
): Promise<T | null> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT value FROM ${SETTINGS_TABLE} WHERE key = ?`,
    [key]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const value = result.rows[0].value as string;
  // 尝试解析 JSON
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

/**
 * 保存设置
 */
export async function setSetting(
  key: SettingKey,
  value: any
): Promise<void> {
  const db = getDatabase();
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  const now = Date.now();

  db.executeSync(
    `INSERT OR REPLACE INTO ${SETTINGS_TABLE} (key, value, updated_at) VALUES (?, ?, ?)`,
    [key, stringValue, now]
  );
}

/**
 * 获取所有设置
 */
export async function getAllSettings(): Promise<Record<string, any>> {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT key, value FROM ${SETTINGS_TABLE}`
  );

  const settings: Record<string, any> = {};
  for (const item of result.rows) {
    try {
      settings[item.key as string] = JSON.parse(item.value as string);
    } catch {
      settings[item.key as string] = item.value;
    }
  }
  return settings;
}

/**
 * 删除设置
 */
export async function deleteSetting(key: SettingKey): Promise<void> {
  const db = getDatabase();
  db.executeSync(`DELETE FROM ${SETTINGS_TABLE} WHERE key = ?`, [key]);
}

/**
 * 清除所有设置
 */
export async function clearAllSettings(): Promise<void> {
  const db = getDatabase();
  db.executeSync(`DELETE FROM ${SETTINGS_TABLE}`);
}

// 便捷函数 ---------------------------------------------------------

/**
 * 保存 API Key
 */
export async function saveApiKey(provider: 'openrouter' | 'gemini' | 'openai', key: string): Promise<void> {
  await setSetting('ai_api_key', { provider, key });
}

/**
 * 获取 API Key
 */
export async function getApiKey(): Promise<{ provider: string; key: string } | null> {
  return await getSetting('ai_api_key');
}

/**
 * 保存主题模式
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

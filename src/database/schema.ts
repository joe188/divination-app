// 数据库表结构和索引定义

export const Schema = {
  // 历史记录表
  CREATE_HISTORY_TABLE: `
    CREATE TABLE IF NOT EXISTS divination_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at INTEGER NOT NULL,
      bazi_type TEXT NOT NULL,
      solar_date TEXT,
      lunar_date TEXT,
      time_period TEXT,
      year_ganzhi TEXT,
      month_ganzhi TEXT,
      day_ganzhi TEXT,
      hour_ganzhi TEXT,
      wuxing_data TEXT,
      shishen_data TEXT,
      location TEXT,
      time_correction INTEGER,
      ai_interpretation TEXT,
      user_notes TEXT,
      is_favorite INTEGER DEFAULT 0
    )
  `,

  // 应用设置表
  CREATE_SETTINGS_TABLE: `
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `,

  // 索引
  CREATE_INDEXES: `
    CREATE INDEX IF NOT EXISTS idx_history_date ON divination_history(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_history_type ON divination_history(bazi_type);
    CREATE INDEX IF NOT EXISTS idx_history_favorite ON divination_history(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
  `,
};

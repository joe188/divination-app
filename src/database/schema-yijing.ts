// 易经知识库表结构

export const YijingSchema = {
  // 八卦表（经卦）
  CREATE_EIGHT_GA: `
    CREATE TABLE IF NOT EXISTS eight_ga (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,          -- 卦名：乾、坤、震、巽、坎、离、艮、兑
      symbol TEXT NOT NULL,        -- 符号：☰、☷、☳、☴、☵、☲、☶、☱
      gua_xing TEXT,              -- 卦象（三画）
      nature TEXT,                -- 性质：天、地、雷、风、水、火、山、泽
      wuxing TEXT,                -- 五行：金、木、水、火、土
      direction TEXT,             -- 方位：西北、西南、东、东南、北、南、东北、西
      family_relation TEXT,       -- 家庭关系：父、母、长男、长女、中男、中女、少男、少女
      attribute TEXT,             -- 特性：健、顺、动、入、陷、丽、止、悦
      description TEXT            -- 简要描述
    )
  `,

  // 六十四卦表
  CREATE_HEXAGRAMS: `
    CREATE TABLE IF NOT EXISTS hexagrams (
      id INTEGER PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,  -- 卦序 1-64
      name TEXT NOT NULL,               -- 卦名（如：乾为天）
      pinyin TEXT NOT NULL,             -- 拼音（如：qián）
      upper_ga TEXT NOT NULL,           -- 上卦（八卦名）
      lower_ga TEXT NOT NULL,           -- 下卦（八卦名）
      gua_ci TEXT NOT NULL,             -- 卦辞
      tuan_ci TEXT NOT NULL,            -- 彖辞
      xiang_ci_upper TEXT,              -- 象辞（上）
      xiang_ci_lower TEXT,              -- 象辞（下）
      xiang_ci_full TEXT,               -- 象辞（完整版）
      related_hexagrams TEXT,           -- 相关卦（综、错、互，JSON 数组）
      wuxing_nature TEXT,               -- 卦的五行属性
      is_double INTEGER DEFAULT 0,      -- 是否纯卦（上下卦相同）
      is_same_upper_lower INTEGER AS (CASE WHEN upper_ga = lower_ga THEN 1 ELSE 0 END) STORED
    )
  `,

  // 爻辞表
  CREATE_YAO: `
    CREATE TABLE IF NOT EXISTS yao_shi (
      id INTEGER PRIMARY KEY,
      hexagram_id INTEGER NOT NULL,     -- 所属卦 ID
      yao_index INTEGER NOT NULL,       -- 爻位（1-6，1 初爻，6 上爻）
      yao_name TEXT NOT NULL,           -- 爻名（初九、九二、... 上九/上六）
      yao_ci TEXT NOT NULL,             -- 爻辞
      yao_xiang TEXT,                  -- 爻象辞
      is_yang INTEGER NOT NULL,         -- 是否阳爻（1=九，0=六）
      position TEXT,                    -- 位置：初、二、三、四、五、上
      special_note TEXT,                -- 特殊说明（如：用九、用六）
      FOREIGN KEY (hexagram_id) REFERENCES hexagrams(id)
    )
  `,

  // 六爻解读表（外部库）
  CREATE_LIUYAO_INTERPRETATION: `
    CREATE TABLE IF NOT EXISTS liuyao_interpretation (
      id TEXT PRIMARY KEY,
      hexagram_name TEXT NOT NULL,
      scenario TEXT NOT NULL,
      target TEXT NOT NULL,
      yao_condition TEXT,
      content TEXT NOT NULL,
      search_text TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `,

  // 索引
  CREATE_INDEXES: `
    CREATE INDEX IF NOT EXISTS idx_hexagram_number ON hexagrams(number);
    CREATE INDEX IF NOT EXISTS idx_hexagram_name ON hexagrams(name);
    CREATE INDEX IF NOT EXISTS idx_yao_hexagram ON yao_shi(hexagram_id);
    CREATE INDEX IF NOT EXISTS idx_yao_index ON yao_shi(hexagram_id, yao_index);
    CREATE INDEX IF NOT EXISTS idx_liuyao_hexagram ON liuyao_interpretation(hexagram_name);
    CREATE INDEX IF NOT EXISTS idx_liuyao_scenario ON liuyao_interpretation(scenario);
    CREATE INDEX IF NOT EXISTS idx_liuyao_target ON liuyao_interpretation(target);
    CREATE INDEX IF NOT EXISTS idx_liuyao_search ON liuyao_interpretation(search_text);
  `,
};

export const YijingTables = {
  EIGHT_GA: 'eight_ga',
  HEXAGRAMS: 'hexagrams',
  YAO_SHI: 'yao_shi',
  LIUYAO_INTERPRETATION: 'liuyao_interpretation',
};

export { YijingTables as Tables };

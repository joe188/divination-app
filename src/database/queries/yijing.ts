// 易经知识库查询
import { getDatabase } from '../Database';
import { YijingTables } from '../schema-yijing';

/**
 * 获取八卦列表
 */
export async function getAllEightGa() {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.EIGHT_GA} ORDER BY id`
  );
  return result.rows;
}

/**
 * 根据名称查询八卦
 */
export async function getEightGaByName(name: string) {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.EIGHT_GA} WHERE name = ?`,
    [name]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 获取六十四卦列表
 */
export async function getAllHexagrams() {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS} ORDER BY number`
  );
  return result.rows;
}

/**
 * 根据卦序号查询卦
 */
export async function getHexagramByNumber(number: number) {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS} WHERE number = ?`,
    [number]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 根据卦名查询卦
 */
export async function getHexagramByName(name: string) {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS} WHERE name LIKE ?`,
    [`%${name}%`]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * 获取卦的完整信息（包括爻辞）
 */
export async function getHexagramWithYao(hexagramId: number) {
  const db = getDatabase();
  const hexagramResult = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS} WHERE id = ?`,
    [hexagramId]
  );

  if (hexagramResult.rows.length === 0) return null;

  const hexagram = hexagramResult.rows[0];

  const yaoResult = db.executeSync(
    `SELECT * FROM ${YijingTables.YAO_SHI}
     WHERE hexagram_id = ?
     ORDER BY yao_index`,
    [hexagramId]
  );

  return {
    ...hexagram,
    yao_shi: yaoResult.rows,
  };
}

/**
 * 搜索卦（按卦名或卦辞）
 */
export async function searchHexagrams(query: string) {
  const db = getDatabase();
  const pattern = `%${query}%`;
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS}
     WHERE name LIKE ? OR gua_ci LIKE ? OR tuan_ci LIKE ?
     ORDER BY number`,
    [pattern, pattern, pattern]
  );
  return result.rows;
}

/**
 * 获取卦的爻辞（单独查询）
 */
export async function getYaoByHexagram(hexagramId: number) {
  const full = await getHexagramWithYao(hexagramId);
  return full ? full.yao_shi : [];
}

/**
 * 全文搜索易经内容（卦名、卦辞、彖辞、象辞）
 */
export async function searchYijing(query: string, limit: number = 20) {
  const results = await searchHexagrams(query);
  return results.slice(0, limit);
}

/**
 * 根据上下卦查询
 */
export async function getHexagramsByUpperLower(upper: string, lower: string) {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS}
     WHERE upper_ga = ? AND lower_ga = ?
     ORDER BY number`,
    [upper, lower]
  );
  return result.rows;
}

/**
 * 获取纯卦（上下卦相同）
 */
export async function getDoubleHexagrams() {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS}
     WHERE is_double = 1
     ORDER BY number`
  );
  return result.rows;
}

/**
 * 获取随机一卦（用于占卜）
 */
export async function getRandomHexagram() {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM ${YijingTables.HEXAGRAMS}
     ORDER BY RANDOM()
     LIMIT 1`
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

const yijingQueries = {
  getAllEightGa,
  getEightGaByName,
  getAllHexagrams,
  getHexagramByName,
  getHexagramByNumber,
  getYaoByHexagram,
  searchYijing,
  getRandomHexagram,
};

export default yijingQueries;

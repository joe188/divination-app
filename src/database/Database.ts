import { open, DB } from '@op-engineering/op-sqlite';
import { Schema } from './schema';
import { YijingSchema } from './schema-yijing';
import { EightGaData } from './seeds/eight-ga';
import { getHexagramSeeds } from './seeds/hexagram-seeds';
import { LiuyaoInterpretationSeeds } from './seeds/liuyao-interpretation-seeds';

let db: DB | null = null;

export const initDatabase = async (): Promise<void> => {
  if (db) {
    console.log('✅ Database already initialized');
    return;
  }

  console.log('📝 Opening database: lingshu_paipan.db');
  try {
    db = open({ name: 'lingshu_paipan.db' });
    console.log('✅ Database opened');
    await createTables();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database init failed:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not available');

  try {
    db.executeSync(Schema.CREATE_HISTORY_TABLE);
    db.executeSync(Schema.CREATE_SETTINGS_TABLE);
    db.executeSync(YijingSchema.CREATE_EIGHT_GA);
    db.executeSync(YijingSchema.CREATE_HEXAGRAMS);
    db.executeSync(YijingSchema.CREATE_YAO);
    db.executeSync(YijingSchema.CREATE_LIUYAO_INTERPRETATION);
    db.executeSync(Schema.CREATE_INDEXES);
    console.log('✅ Tables created');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }

  await seedData();
};

const seedData = async (): Promise<void> => {
  if (!db) throw new Error('Database not available');

  // Seed Eight Ga data
  const eightGaData = EightGaData;
  for (const ga of eightGaData) {
    try {
      db.executeSync(
        `INSERT OR IGNORE INTO eight_ga (name, symbol, gua_xing, nature, wuxing, direction, family_relation, attribute, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ga.name, ga.symbol, ga.gua_xing, ga.nature, ga.wuxing, ga.direction, ga.family_relation, ga.attribute, ga.description]
      );
    } catch (error) {
      console.error('❌ Error seeding eight_ga:', error);
    }
  }
  console.log('✅ Eight Ga data seeded');

  // Seed Hexagram data
  const hexagramSeeds = getHexagramSeeds();
  for (const hex of hexagramSeeds) {
    try {
      db.executeSync(
        `INSERT OR IGNORE INTO hexagrams (number, name, pinyin, upper_ga, lower_ga, gua_ci, tuan_ci, xiang_ci_upper)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [hex.number, hex.name, hex.pinyin, hex.upper_ga, hex.lower_ga, hex.gua_ci, hex.tuan_ci, hex.xiang_ci_upper]
      );
    } catch (error) {
      console.error('❌ Error seeding hexagrams:', error);
    }
  }
  console.log('✅ Hexagram data seeded');

  // Seed Liuyao Interpretation data
  for (const interp of LiuyaoInterpretationSeeds) {
    try {
      db.executeSync(
        `INSERT OR IGNORE INTO liuyao_interpretation (hexagram_name, scenario, target, yao_condition, content)
         VALUES (?, ?, ?, ?, ?)`,
        [interp.hexagram_name, interp.scenario, interp.target, JSON.stringify(interp.yao_condition), interp.content]
      );
    } catch (error) {
      console.error('❌ Error seeding liuyao_interpretation:', error);
    }
  }
  console.log('✅ Liuyao Interpretation data seeded');
};

export const getDatabase = (): DB => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database closed');
  }
};

export default {
  init: initDatabase,
  get: getDatabase,
  close: closeDatabase,
};

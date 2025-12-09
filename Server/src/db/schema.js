const db = require('./db');
const _columns = {};

async function init() {
  const [rows] = await db.pool.query(`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
  `);

  rows.forEach(r => {
    (_columns[r.TABLE_NAME] ??= new Set()).add(r.COLUMN_NAME);
  });
}

const hasColumn = (t, c) => _columns[t]?.has(c) || false;

module.exports = { init, hasColumn };

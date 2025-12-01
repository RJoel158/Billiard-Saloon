const db = require('./db');

// Internal cache of columns per table
const _columns = {};

async function init() {
  // Get list of columns for current database
  const rows = await db.pool.query(
    `SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()`
  );
  // mysql2 returns [rows, fields] when using pool.query with promise wrapper
  const resultRows = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
  resultRows.forEach((r) => {
    const t = r.TABLE_NAME;
    const c = r.COLUMN_NAME;
    _columns[t] = _columns[t] || new Set();
    _columns[t].add(c);
  });
}

function hasColumn(table, column) {
  if (!_columns) return false;
  const set = _columns[table];
  return !!(set && set.has(column));
}

module.exports = { init, hasColumn };

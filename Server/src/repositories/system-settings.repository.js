const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT id, setting_key, setting_value, setting_type, description, updated_at FROM system_settings ORDER BY setting_key');
  return rows;
}

async function findByKey(key) {
  const rows = await db.query('SELECT id, setting_key, setting_value, setting_type, description, updated_at FROM system_settings WHERE setting_key = ?', [key]);
  return rows[0] || null;
}

async function findByKeys(keys) {
  if (!keys || keys.length === 0) return [];
  const placeholders = keys.map(() => '?').join(',');
  const rows = await db.query(`SELECT id, setting_key, setting_value, setting_type, description, updated_at FROM system_settings WHERE setting_key IN (${placeholders})`, keys);
  return rows;
}

async function update(key, value) {
  const result = await db.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
  return result.affectedRows > 0;
}

async function updateMultiple(settings) {
  const promises = settings.map(({ key, value }) => 
    db.query('UPDATE system_settings SET setting_value = ? WHERE setting_key = ?', [value, key])
  );
  await Promise.all(promises);
  return true;
}

async function create(setting) {
  await db.query(
    'INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)',
    [setting.setting_key, setting.setting_value, setting.setting_type || 'string', setting.description || null]
  );
  return await findByKey(setting.setting_key);
}

async function deleteByKey(key) {
  const result = await db.query('DELETE FROM system_settings WHERE setting_key = ?', [key]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findByKey,
  findByKeys,
  update,
  updateMultiple,
  create,
  deleteByKey
};

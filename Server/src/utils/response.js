function success(res, data, meta) {
  return res.json({ success: true, data, meta });
}

function error(res, code, message, status = 400) {
  return res.status(status).json({ success: false, error: { code, message } });
}

module.exports = { success, error };

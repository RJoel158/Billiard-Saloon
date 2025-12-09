/**
 * Extrae y valida los parámetros de paginación de la query string
 * @param {Object} query - req.query object
 * @returns {Object} - { page, limit, offset }
 */
function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Formatea la respuesta paginada
 * @param {Array} data - Datos de la página actual
 * @param {Number} total - Total de registros
 * @param {Number} page - Página actual
 * @param {Number} limit - Límite por página
 * @returns {Object} - Respuesta paginada formateada
 */
function formatPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

/**
 * Genera la cláusula SQL LIMIT para paginación
 * @param {Number} limit - Límite de registros
 * @param {Number} offset - Offset desde donde empezar
 * @returns {String} - Cláusula SQL LIMIT
 */
function getLimitClause(limit, offset) {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
  getLimitClause
};

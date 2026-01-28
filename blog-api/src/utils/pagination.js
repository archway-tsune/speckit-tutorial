const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function normalizePaginationParams(page, limit) {
  const normalizedPage = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  let normalizedLimit = parseInt(limit, 10) || DEFAULT_LIMIT;
  normalizedLimit = Math.min(Math.max(1, normalizedLimit), MAX_LIMIT);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  };
}

function createPaginationResponse(page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  normalizePaginationParams,
  createPaginationResponse,
};

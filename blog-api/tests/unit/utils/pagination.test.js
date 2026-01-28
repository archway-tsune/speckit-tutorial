const {
  normalizePaginationParams,
  createPaginationResponse,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require('../../../src/utils/pagination');

describe('Pagination Utils', () => {
  describe('normalizePaginationParams', () => {
    it('should return default values when no params provided', () => {
      const result = normalizePaginationParams();

      expect(result.page).toBe(DEFAULT_PAGE);
      expect(result.limit).toBe(DEFAULT_LIMIT);
      expect(result.offset).toBe(0);
    });

    it('should normalize valid page and limit', () => {
      const result = normalizePaginationParams(2, 20);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(20);
    });

    it('should enforce minimum page of 1', () => {
      const result = normalizePaginationParams(0, 10);

      expect(result.page).toBe(1);
    });

    it('should use default limit when 0 is provided', () => {
      const result = normalizePaginationParams(1, 0);

      // 0 is falsy, so default limit is used
      expect(result.limit).toBe(DEFAULT_LIMIT);
    });

    it('should enforce minimum limit of 1 for negative values', () => {
      const result = normalizePaginationParams(1, -5);

      expect(result.limit).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = normalizePaginationParams(1, 200);

      expect(result.limit).toBe(MAX_LIMIT);
    });

    it('should handle string inputs', () => {
      const result = normalizePaginationParams('3', '15');

      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
      expect(result.offset).toBe(30);
    });

    it('should handle invalid inputs', () => {
      const result = normalizePaginationParams('invalid', 'invalid');

      expect(result.page).toBe(DEFAULT_PAGE);
      expect(result.limit).toBe(DEFAULT_LIMIT);
    });
  });

  describe('createPaginationResponse', () => {
    it('should create pagination response with correct values', () => {
      const result = createPaginationResponse(1, 10, 42);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(42);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    });

    it('should calculate hasNext correctly', () => {
      const resultHasNext = createPaginationResponse(1, 10, 20);
      const resultNoNext = createPaginationResponse(2, 10, 20);

      expect(resultHasNext.hasNext).toBe(true);
      expect(resultNoNext.hasNext).toBe(false);
    });

    it('should calculate hasPrev correctly', () => {
      const resultNoPrev = createPaginationResponse(1, 10, 20);
      const resultHasPrev = createPaginationResponse(2, 10, 20);

      expect(resultNoPrev.hasPrev).toBe(false);
      expect(resultHasPrev.hasPrev).toBe(true);
    });

    it('should handle zero total', () => {
      const result = createPaginationResponse(1, 10, 0);

      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it('should calculate totalPages correctly', () => {
      expect(createPaginationResponse(1, 10, 1).totalPages).toBe(1);
      expect(createPaginationResponse(1, 10, 10).totalPages).toBe(1);
      expect(createPaginationResponse(1, 10, 11).totalPages).toBe(2);
      expect(createPaginationResponse(1, 10, 100).totalPages).toBe(10);
    });
  });
});

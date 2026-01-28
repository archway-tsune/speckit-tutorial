const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const RefreshToken = require('../../../src/models/RefreshToken');
const { testUsers } = require('../../fixtures/testData');

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register(testUsers.validUser);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUsers.validUser.email);
      expect(result.user.name).toBe(testUsers.validUser.name);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error when email already exists', async () => {
      await authService.register(testUsers.validUser);

      await expect(authService.register(testUsers.validUser))
        .rejects
        .toThrow('このメールアドレスは既に登録されています');
    });

    it('should hash password before storing', async () => {
      await authService.register(testUsers.validUser);

      const user = User.findByEmail(testUsers.validUser.email);
      expect(user.passwordHash).not.toBe(testUsers.validUser.password);
      expect(user.passwordHash).toMatch(/^\$2[aby]?\$\d+\$/);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register(testUsers.validUser);
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login({
        email: testUsers.validUser.email,
        password: testUsers.validUser.password,
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUsers.validUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid email', async () => {
      await expect(authService.login({
        email: 'wrong@example.com',
        password: testUsers.validUser.password,
      }))
        .rejects
        .toThrow('メールアドレスまたはパスワードが正しくありません');
    });

    it('should throw error with invalid password', async () => {
      await expect(authService.login({
        email: testUsers.validUser.email,
        password: 'wrongpassword',
      }))
        .rejects
        .toThrow('メールアドレスまたはパスワードが正しくありません');
    });
  });

  describe('refresh', () => {
    let tokens;

    beforeEach(async () => {
      const result = await authService.register(testUsers.validUser);
      tokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };
    });

    it('should refresh tokens with valid refresh token', async () => {
      const result = await authService.refresh(tokens.refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(tokens.refreshToken);
    });

    it('should throw error with invalid refresh token', async () => {
      await expect(authService.refresh('invalid-token'))
        .rejects
        .toThrow('無効なリフレッシュトークンです');
    });

    it('should invalidate old refresh token after use', async () => {
      await authService.refresh(tokens.refreshToken);

      await expect(authService.refresh(tokens.refreshToken))
        .rejects
        .toThrow('無効なリフレッシュトークンです');
    });
  });

  describe('logout', () => {
    let tokens;

    beforeEach(async () => {
      const result = await authService.register(testUsers.validUser);
      tokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };
    });

    it('should logout and invalidate refresh token', async () => {
      const result = await authService.logout(tokens.refreshToken);

      expect(result.success).toBe(true);

      await expect(authService.refresh(tokens.refreshToken))
        .rejects
        .toThrow('無効なリフレッシュトークンです');
    });

    it('should return success false for non-existent token', async () => {
      const result = await authService.logout('non-existent-token');
      expect(result.success).toBe(false);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const { accessToken } = await authService.register(testUsers.validUser);

      const decoded = authService.verifyAccessToken(accessToken);

      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe(testUsers.validUser.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => authService.verifyAccessToken('invalid-token'))
        .toThrow('無効なアクセストークンです');
    });
  });
});

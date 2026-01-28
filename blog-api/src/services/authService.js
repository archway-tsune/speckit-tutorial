const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const SALT_ROUNDS = 10;

class AuthService {
  async register({ email, password, name }) {
    // Check if email already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('このメールアドレスは既に登録されています', [
        { field: 'email', message: 'このメールアドレスは既に登録されています' },
      ]);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = User.create({ email, passwordHash, name });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async login({ email, password }) {
    // Find user by email
    const user = User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken) {
    // Find refresh token in database
    const storedToken = RefreshToken.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('無効なリフレッシュトークンです');
    }

    // Check if token is expired
    if (new Date(storedToken.expiresAt) < new Date()) {
      RefreshToken.deleteByToken(refreshToken);
      throw new UnauthorizedError('リフレッシュトークンの有効期限が切れています');
    }

    // Find user
    const user = User.findById(storedToken.userId);
    if (!user) {
      RefreshToken.deleteByToken(refreshToken);
      throw new UnauthorizedError('ユーザーが見つかりません');
    }

    // Delete old refresh token
    RefreshToken.deleteByToken(refreshToken);

    // Generate new tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async logout(refreshToken) {
    const deleted = RefreshToken.deleteByToken(refreshToken);
    return { success: deleted };
  }

  generateTokens(user) {
    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    // Generate refresh token
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store refresh token in database
    RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('アクセストークンの有効期限が切れています');
      }
      throw new UnauthorizedError('無効なアクセストークンです');
    }
  }
}

module.exports = new AuthService();

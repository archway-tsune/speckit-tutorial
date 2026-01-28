const { ValidationError } = require('../utils/errors');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRegister(req, _res, next) {
  const { email, password, name } = req.body;
  const details = [];

  if (!email || typeof email !== 'string') {
    details.push({ field: 'email', message: 'メールアドレスは必須です' });
  } else if (!validateEmail(email)) {
    details.push({ field: 'email', message: '有効なメールアドレスを入力してください' });
  }

  if (!password || typeof password !== 'string') {
    details.push({ field: 'password', message: 'パスワードは必須です' });
  } else if (password.length < 8) {
    details.push({ field: 'password', message: 'パスワードは8文字以上で入力してください' });
  }

  if (!name || typeof name !== 'string') {
    details.push({ field: 'name', message: 'ユーザー名は必須です' });
  } else if (name.length < 1 || name.length > 100) {
    details.push({ field: 'name', message: 'ユーザー名は1文字以上100文字以下で入力してください' });
  }

  if (details.length > 0) {
    return next(new ValidationError('入力内容に誤りがあります', details));
  }

  next();
}

function validateLogin(req, _res, next) {
  const { email, password } = req.body;
  const details = [];

  if (!email || typeof email !== 'string') {
    details.push({ field: 'email', message: 'メールアドレスは必須です' });
  }

  if (!password || typeof password !== 'string') {
    details.push({ field: 'password', message: 'パスワードは必須です' });
  }

  if (details.length > 0) {
    return next(new ValidationError('入力内容に誤りがあります', details));
  }

  next();
}

function validateRefresh(req, _res, next) {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== 'string') {
    return next(new ValidationError('リフレッシュトークンは必須です', [
      { field: 'refreshToken', message: 'リフレッシュトークンは必須です' },
    ]));
  }

  next();
}

function validateCreatePost(req, _res, next) {
  const { title, content, status } = req.body;
  const details = [];

  if (!title || typeof title !== 'string') {
    details.push({ field: 'title', message: 'タイトルは必須です' });
  } else if (title.length < 1 || title.length > 200) {
    details.push({ field: 'title', message: 'タイトルは1文字以上200文字以下で入力してください' });
  }

  if (!content || typeof content !== 'string') {
    details.push({ field: 'content', message: '本文は必須です' });
  } else if (content.length < 1) {
    details.push({ field: 'content', message: '本文を入力してください' });
  }

  if (status !== undefined && !['draft', 'published'].includes(status)) {
    details.push({ field: 'status', message: 'ステータスはdraftまたはpublishedを指定してください' });
  }

  if (details.length > 0) {
    return next(new ValidationError('入力内容に誤りがあります', details));
  }

  next();
}

function validateUpdatePost(req, _res, next) {
  const { title, content, status } = req.body;
  const details = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.length < 1 || title.length > 200) {
      details.push({ field: 'title', message: 'タイトルは1文字以上200文字以下で入力してください' });
    }
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || content.length < 1) {
      details.push({ field: 'content', message: '本文を入力してください' });
    }
  }

  if (status !== undefined && !['draft', 'published'].includes(status)) {
    details.push({ field: 'status', message: 'ステータスはdraftまたはpublishedを指定してください' });
  }

  if (details.length > 0) {
    return next(new ValidationError('入力内容に誤りがあります', details));
  }

  next();
}

function validateQueryParams(req, _res, next) {
  const { page, limit, status, sort } = req.query;
  const details = [];

  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      details.push({ field: 'page', message: 'ページ番号は1以上の整数を指定してください' });
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      details.push({ field: 'limit', message: '件数は1以上100以下の整数を指定してください' });
    }
  }

  if (status !== undefined && !['draft', 'published'].includes(status)) {
    details.push({ field: 'status', message: 'ステータスはdraftまたはpublishedを指定してください' });
  }

  const validSorts = ['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title'];
  if (sort !== undefined && !validSorts.includes(sort)) {
    details.push({ field: 'sort', message: '無効なソート順が指定されました' });
  }

  if (details.length > 0) {
    return next(new ValidationError('クエリパラメータに誤りがあります', details));
  }

  next();
}

function validateUUID(paramName) {
  return (req, _res, next) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
      return next(new ValidationError('無効なIDが指定されました', [
        { field: paramName, message: '有効なUUID形式で指定してください' },
      ]));
    }

    next();
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateCreatePost,
  validateUpdatePost,
  validateQueryParams,
  validateUUID,
};

const postService = require('../services/postService');

async function create(req, res, next) {
  try {
    const { title, content, status } = req.body;
    const post = await postService.create({ title, content, status }, req.user);

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const { page, limit, status, sort } = req.query;
    const result = await postService.getAll({ page, limit, status, sort }, req.user);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const post = await postService.getById(id, req.user);

    res.json(post);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;
    const post = await postService.update(id, { title, content, status }, req.user);

    res.json(post);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await postService.delete(id, req.user);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};

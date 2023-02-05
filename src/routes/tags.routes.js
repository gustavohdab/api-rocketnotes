const { Router } = require('express');

const TagsController = require('../controllers/TagsController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const tagsRouter = Router();

const tagsController = new TagsController();

tagsRouter.use(ensureAuthenticated);

tagsRouter.get('/', tagsController.index);

module.exports = tagsRouter;
const express = require('express');
const postController = require('./controllers/postController');

const app = express();
const router = express.Router();

app.use(express.json());

router.get('/', postController.list);
router.get('/:id', postController.get);
router.post('/', postController.create);
router.put('/:id', postController.update);
router.patch('/:id', postController.update);
router.delete('/:id', postController.remove);

app.use('/posts', router);

app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  return next(error);
});

module.exports = app;

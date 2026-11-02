// A Prisma implementation can replace this Map and its ID generation while
// keeping these operations and their return shapes stable for callers.
const posts = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

function findAll() {
  return Array.from(posts.values(), (post) => ({ ...post }));
}

function findById(id) {
  const post = posts.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const post = { ...fields, id: nextId++ };
  posts.set(post.id, post);
  return { ...post };
}

function update(id, patch) {
  const key = Number(id);
  const post = posts.get(key);
  if (!post) return null;

  const updatedPost = { ...post, ...patch, id: post.id };
  posts.set(key, updatedPost);
  return { ...updatedPost };
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };

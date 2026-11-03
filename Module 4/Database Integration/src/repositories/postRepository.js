const { Prisma } = require('@prisma/client');
const prisma = require('../db/prisma');

const postFields = {
  id: true,
  title: true,
  body: true,
  authorId: true,
};

async function findAll() {
  return prisma.post.findMany({
    select: postFields,
    orderBy: { id: 'asc' },
  });
}

async function findById(id) {
  const postId = normalizeId(id);
  if (postId === null) return null;

  return prisma.post.findUnique({
    where: { id: postId },
    select: postFields,
  });
}

async function create(fields) {
  if (!Number.isInteger(fields.authorId)) {
    throw Object.assign(new Error('A valid author ID is required'), { statusCode: 400 });
  }

  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: fields.authorId,
      },
      select: postFields,
    });
  } catch (error) {
    throw translateConstraintError(error);
  }
}

async function update(id, patch) {
  const postId = normalizeId(id);
  if (postId === null) return null;

  try {
    return await prisma.post.update({
      where: { id: postId },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.body !== undefined && { body: patch.body }),
      },
      select: postFields,
    });
  } catch (error) {
    if (isKnownRequestError(error) && error.code === 'P2025') return null;
    throw translateConstraintError(error);
  }
}

async function remove(id) {
  const postId = normalizeId(id);
  if (postId === null) return false;

  try {
    await prisma.post.delete({ where: { id: postId } });
    return true;
  } catch (error) {
    if (isKnownRequestError(error) && error.code === 'P2025') return false;
    throw translateConstraintError(error);
  }
}

function normalizeId(id) {
  const postId = Number(id);
  return Number.isInteger(postId) ? postId : null;
}

function isKnownRequestError(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function translateConstraintError(error) {
  if (!isKnownRequestError(error)) return error;

  if (error.code === 'P2002') {
    return Object.assign(new Error('A record with these values already exists'), { statusCode: 409 });
  }

  if (error.code === 'P2003' || error.code === 'P2011' || error.code === 'P2012') {
    return Object.assign(new Error('The request references invalid or missing related data'), { statusCode: 400 });
  }

  return error;
}

module.exports = { findAll, findById, create, update, remove };

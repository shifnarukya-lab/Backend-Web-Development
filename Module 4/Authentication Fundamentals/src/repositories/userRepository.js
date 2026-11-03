const prisma = require('../db/prisma');

class DuplicateEmailError extends Error {
  constructor() {
    super('Email already exists');
    this.name = 'DuplicateEmailError';
  }
}

async function createUser({ email, name, passwordHash }) {
  try {
    return await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, name: true, email: true, passwordHash: true },
    });
  } catch (error) {
    if (error.code === 'P2002') throw new DuplicateEmailError();
    throw error;
  }
}

function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
}

async function emailExists(email) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return Boolean(user);
}

module.exports = { createUser, emailExists, findUserByEmail, DuplicateEmailError };

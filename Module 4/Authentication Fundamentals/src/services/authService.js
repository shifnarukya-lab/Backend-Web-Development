const { randomBytes } = require('node:crypto');
const bcrypt = require('bcryptjs');
const AppError = require('../errors/AppError');
const userRepository = require('../repositories/userRepository');

const costFactor = Number(process.env.BCRYPT_COST || 12);
if (!Number.isInteger(costFactor) || costFactor < 4 || costFactor > 31) {
  throw new Error('BCRYPT_COST must be an integer between 4 and 31');
}

const dummyHashPromise = bcrypt.hash(randomBytes(32).toString('hex'), costFactor);

function requireFields(input, fields) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError(400, 'INVALID_INPUT', 'Request body must be an object');
  }

  for (const field of fields) {
    const value = input[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new AppError(400, 'INVALID_INPUT', `${field} must be a non-empty string`);
    }
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(input) {
  requireFields(input, ['name', 'email', 'password']);

  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  if (await userRepository.emailExists(email)) {
    throw duplicateEmail();
  }

  const passwordHash = await bcrypt.hash(input.password, costFactor);

  try {
    const user = await userRepository.createUser({ email, name, passwordHash });
    return toPublicUser(user);
  } catch (error) {
    if (error instanceof userRepository.DuplicateEmailError) {
      throw duplicateEmail();
    }
    throw error;
  }
}

async function login(input) {
  requireFields(input, ['email', 'password']);

  const user = await userRepository.findUserByEmail(normalizeEmail(input.email));
  if (!user) {
    await bcrypt.compare(input.password, await dummyHashPromise);
    throw invalidCredentials();
  }

  if (!(await bcrypt.compare(input.password, user.passwordHash))) {
    throw invalidCredentials();
  }

  return toPublicUser(user);
}

function invalidCredentials() {
  return new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
}

function duplicateEmail() {
  return new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
}

module.exports = { login, register };

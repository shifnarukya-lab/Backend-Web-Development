const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

process.env.BCRYPT_COST = '4';
const app = require('../src/app');
const prisma = require('../src/db/prisma');

const email = `auth-test-${Date.now()}@example.com`;
const password = 'correct horse battery staple';
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function post(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('registers a bcrypt hash and returns only safe identity fields', async () => {
  const response = await post('/auth/register', {
    name: 'Sam',
    email: ` ${email.toUpperCase()} `,
    password,
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(Object.keys(body.data).sort(), ['email', 'id', 'name']);
  assert.equal(body.data.email, email);

  const storedUser = await prisma.user.findUnique({ where: { email } });
  assert.ok(storedUser.passwordHash.startsWith('$2'));
  assert.notEqual(storedUser.passwordHash, password);
  assert.equal(await bcrypt.compare(password, storedUser.passwordHash), true);
});

test('returns 409 for a duplicate normalized email', async () => {
  const response = await post('/auth/register', { name: 'Sam', email: email.toUpperCase(), password });
  assert.equal(response.status, 409);
});

test('logs in with valid credentials and returns a safe identity', async () => {
  const response = await post('/auth/login', { email: email.toUpperCase(), password });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(body.data).sort(), ['email', 'id', 'name']);
  assert.equal(body.data.email, email);
});

test('returns byte-for-byte identical generic failures for either invalid credential', async () => {
  const wrongPassword = await post('/auth/login', { email, password: 'wrong-password' });
  const unknownEmail = await post('/auth/login', { email: `unknown-${email}`, password });
  const wrongPasswordBody = await wrongPassword.text();
  const unknownEmailBody = await unknownEmail.text();

  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownEmail.status, 401);
  assert.equal(wrongPasswordBody, unknownEmailBody);
  assert.deepEqual(JSON.parse(wrongPasswordBody), {
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  });
});

test('rejects missing and malformed input with 400', async () => {
  const missingInput = await post('/auth/register', { name: 'Sam', email, password: '' });
  const malformedInput = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });

  assert.equal(missingInput.status, 400);
  assert.equal(malformedInput.status, 400);
});

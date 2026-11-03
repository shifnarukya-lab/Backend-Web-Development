# Authentication Fundamentals Starter

## Setup

Create `.env` from `.env.example` first. On PowerShell, run
`Copy-Item .env.example .env`; on macOS/Linux, run `cp .env.example .env`.

```bash
npm install
npm run db:generate
npm run db:push
npm test
npm start
```

The SQLite datasource keeps local setup self-contained. Do not commit `.env`
or `prisma/dev.db`.

## Endpoints

- `POST /auth/register`
- `POST /auth/login`

Registration accepts a non-empty `name`, `email`, and `password`, normalizes
the email, and stores only an asynchronous bcrypt hash. Login accepts a
non-empty `email` and `password`, and returns the same
`INVALID_CREDENTIALS` response for an unknown email or a wrong password.
Successful responses expose only `id`, `name`, and `email`.

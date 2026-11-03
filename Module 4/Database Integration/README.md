# Database Integration

Replace the in-memory repository implementation with PostgreSQL through Prisma. The starter already uses an asynchronous repository contract so services and controllers can remain stable during the swap.

## Setup

```bash
npm install
copy .env.example .env
```

Edit `.env` with a PostgreSQL connection URL for a local development database.
Do not commit `.env` or put credentials in the Prisma schema.

## Database setup

The migration is the versioned schema history. To create and apply a new local
migration during development:

```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm start
```

For an existing migration history, apply committed migrations with
`npm run prisma:deploy`, then generate the client. The seed can be run repeatedly;
it creates the sample user and posts only when they are absent. It does not erase
or reset application data. Avoid `migrate reset` for databases containing data.

The posts API keeps its original response fields (`id`, `title`, `body`, and
`authorId`). Missing posts still produce 404 responses. Duplicate and invalid
foreign-key writes return safe 409 and 400 errors; database details are not
returned to API clients.
